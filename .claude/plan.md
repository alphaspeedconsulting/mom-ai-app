# Enhancement Plan: AI Product Agents — Robust, State-of-the-Art, Action-Oriented for AaaS MVP

## Context

**Goal**: Transform the existing AI Product Agents MCP server from an advisory/analysis tool into a production-grade **Agents as a Service (AaaS)** MVP that customers pay for.

**PRD Reference**: `/projects/agents-as-a-service/prd.md` — defines a tiered subscription model (Basic/Advanced/Custom) with license-gated access, Stripe billing, and CLI-based activation.

**Current Gap**: The PRD describes the *delivery mechanism* (licensing, billing, tiers) but not what makes the agents themselves *worth paying for*. This plan addresses both: (1) making the agents action-oriented and robust, and (2) building the subscription infrastructure.

---

## 1. Enhancement Breakdown

### Enhancement A: Make Agents Action-Oriented (Not Just Advisory)

**What changes**: Agents currently output markdown reports. They need to output *executable artifacts* — code that runs, diffs that apply, configs that deploy.

| Agent | Current Output | Target Output |
|-------|---------------|---------------|
| Developer | Code files (unvalidated) | Validated code + passing test suite |
| Refactoring | Smell descriptions | **Git-style diffs** with before/after |
| Integration Testing | Scenario descriptions | **Executable pytest files** |
| Observability | Gap descriptions | **Instrumented code snippets** (copy-paste ready) |
| DB Migration | Schema diff narrative | **Alembic migration scripts** (up + down) |
| Tech Debt | Debt scores | **Sprint plan with estimated effort** |
| Dependency Audit | LLM-guessed CVEs | **Real CVE data** from GitHub Advisory API |
| Deployment | Stub (fake deploys) | **Working Dockerfile + docker-compose.yml** |

**Services affected**: All 8 SDLC agents, Developer agent, Deployment agent

### Enhancement B: Wire Real Integrations (Replace Stubs & LLM-Guessing)

**What changes**: Replace LLM-guessed data with real tool calls and API integrations.

| Integration | Current State | Target State |
|-------------|--------------|--------------|
| CVE scanning | LLM guesses CVEs | `pip-audit` / GitHub Advisory API |
| Code validation | Regex heuristics | `ast.parse()` + `ruff check` + test execution |
| Deployment | 100% stub | Docker-based local deploy or Render API |
| Performance | Sync-only profiler | Async-aware profiling via `pyinstrument` |
| Accessibility | Regex-based | `axe-core` integration for real WCAG testing |

**Services affected**: `dependency_audit_agent`, `developer_agent`, `deployment_agent`, `performance_profiling_agent`, `ui_ux_agent`

### Enhancement C: Add Human-in-the-Loop & Streaming to Orchestrator

**What changes**: The LangGraph pipeline runs fully automated with no checkpoints. For paying customers:
- Add `interrupt_before` on Security and Deployment nodes
- Add streaming support via `astream_events`
- Add token counting per pipeline step

**Services affected**: `orchestrator/orchestrator.py`, `orchestrator/quality_gates.py`, `orchestrator_models.py`

### Enhancement D: Build AaaS Infrastructure (From PRD)

**What changes**: Net-new subscription infrastructure per the PRD:
- License key generation/validation API
- Stripe webhook integration (subscription lifecycle)
- Tier-based tool gating and rate limiting
- JWT caching with offline fallback
- Kill switch enforcement
- CLI installer (`agentvault activate <KEY>`)

**Services affected**: New `auth/` module, extensions to `middleware/security_middleware.py`, new API routes, new CLI commands

### Enhancement E: Stabilize & Harden

**What changes**: Fix the 56 failing tests, standardize error handling, pin dependencies.

**Services affected**: `tests/`, `pyproject.toml`, all agents (error handling convergence)

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is (No Changes)

| Component | Path | Why |
|-----------|------|-----|
| Agent Registry | `agent_library/agent_registry.py` | Already supports registration, discovery, metadata |
| Base Agent | `agent_library/base_agent.py` | Abstract interface works for new agents |
| Tool Registry | `tools/tool_registry.py` | ToolDefinition + ToolRegistry pattern is solid |
| Structured Logger | `utils/structured_logger.py` | JSON output, correlation IDs, context vars |
| Error Handler | `utils/error_handler.py` | ErrorCode enum + ErrorResponse dataclass |
| Health Check | `utils/health_check.py` | Service health pattern |
| Industry Profiles | `config/base_config.py` + YAML files | Hot-loading config system |
| Quality Gates | `orchestrator/quality_gates.py` | PRD/Architecture/Code quality checks |
| Complexity Scorer | `tools/complexity_scorer.py` | Real scoring logic, no changes needed |
| RICE Scorer | `tools/rice_scorer.py` | Real RICE formula |
| Prompt System | `prompts/patterns/*.md` + `utils/prompt_loader.py` | 20+ prompt templates with variable substitution |

### Extend (Minor Changes)

| Component | Path | Change Needed |
|-----------|------|---------------|
| Rate Limiter | `middleware/security_middleware.py` | Add tier-based limits (Basic=100/mo, Advanced=1000/mo) |
| Metrics Collector | `utils/metrics_collector.py` | Add per-subscription usage tracking |
| CLI | `cli.py` | Add `activate`, `status`, `deactivate` commands |
| HTTP Server | `server_http.py` | Add auth middleware + subscription routes |
| Config Pattern | `chatkit/config.py` | Clone as `ServiceConfig` for AaaS settings |
| API Key Validation | `config/moltbot_security.py` | Adapt `WorkspaceRegistry` → `SubscriptionManager` |
| Orchestrator State | `models/orchestrator_models.py` | Add `token_usage` population + `interrupt_points` |
| Developer Agent | `agents/developer_agent.py` | Replace regex validation with `ast.parse()` + `ruff` |
| Dependency Agent | `agents/dependency_audit_agent.py` | Replace LLM CVE guessing with `pip-audit` subprocess |

### Net-New Code

| Component | Purpose | Est. Size |
|-----------|---------|-----------|
| `auth/stripe_client.py` | Stripe API wrapper (checkout, webhooks, subscription CRUD) | ~200 lines |
| `auth/license_manager.py` | License key generation, validation, tier lookup | ~150 lines |
| `auth/subscription_tiers.py` | Tier definitions, tool allowlists, rate limits | ~100 lines |
| `auth/jwt_handler.py` | JWT creation, validation, caching, offline fallback | ~120 lines |
| `api/routes/subscriptions.py` | FastAPI routes for subscription management | ~150 lines |
| `api/routes/billing.py` | Usage reporting, invoice endpoints | ~100 lines |
| `api/middleware/license_gate.py` | Per-request license validation middleware | ~80 lines |
| `tools/real_cve_scanner.py` | GitHub Advisory API + pip-audit wrapper | ~120 lines |
| `tools/code_executor.py` | Sandboxed code execution for developer agent validation | ~150 lines |
| Tests for all above | Unit + integration | ~800 lines |

**Total new code estimate**: ~2,000 lines
**Total modified code estimate**: ~500 lines across existing files

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

**A. MCP Tool Invocation Flow** (Most impacted)
```
Current:  Client → MCP Server → Tool Handler → Agent → Result
Target:   Client → License Gate → Rate Limiter → MCP Server → Tool Handler → Agent → Usage Tracker → Result
```
- **New steps**: License Gate (before), Rate Limiter (before), Usage Tracker (after)
- **State transition**: Tool call now has `subscription_id`, `tier`, `remaining_quota` in context
- **Side effect**: Each invocation decrements quota counter

**B. Orchestrator Pipeline** (Moderately impacted)
```
Current:  PRD → Architect → Developer → Security → Deploy (fully automated)
Target:   PRD → [human review] → Architect → Developer → Security → [human review] → Deploy
```
- **New steps**: Two interrupt points for human approval
- **State transition**: Pipeline can be `paused` (new state) awaiting approval
- **Side effect**: Streaming events emitted during each agent step

**C. Agent Execution** (Minimally impacted per agent)
- Developer agent adds `ast.parse()` + `ruff` validation step
- Dependency agent replaces LLM call with subprocess call to `pip-audit`
- Deployment agent generates Docker artifacts instead of fake Render calls
- No changes to agent interface contract (BaseAgent stays the same)

### Regression Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| License gate middleware | **Medium** | Feature flag: `ENABLE_LICENSE_GATING=false` by default |
| Orchestrator interrupts | **Medium** | Backward-compatible: `interrupt_before=[]` by default |
| Developer agent validation | **Low** | New validation is additive (after existing checks) |
| Dependency agent real CVE | **Low** | Falls back to LLM if `pip-audit` unavailable |
| Streaming support | **Medium** | Only activated when client requests it |
| Rate limiter tier integration | **Low** | Existing limiter extended, not replaced |

---

## 4. Implementation Order

### Phase 1: Stabilize Foundation (Week 1-2)
**Preconditions**: None
**Dependencies**: None

1. **Fix 56 failing tests** — triage eval failures, fix tool registry tests, security review tests
2. **Standardize error handling** — converge all agents on `AgentResult` pattern
3. **Pin dependency versions** — generate `uv.lock`, add to CI
4. **Populate token_usage** in orchestrator — LangChain callbacks already track this

### Phase 2: Make Agents Action-Oriented (Week 2-4)
**Preconditions**: Phase 1 (stable test suite)
**Dependencies**: None external

5. **Developer Agent** — add `ast.parse()` + `ruff check` validation
6. **Dependency Audit Agent** — integrate `pip-audit` (subprocess) with fallback to LLM
7. **Integration Testing Agent** — output executable pytest files instead of descriptions
8. **Deployment Agent** — generate working Dockerfile + docker-compose.yml
9. **Refactoring Agent** — output unified diffs instead of smell descriptions
10. **Observability Agent** — output copy-paste instrumentation code

### Phase 3: Orchestrator Upgrades (Week 3-4)
**Preconditions**: Phase 1 (stable error handling)
**Dependencies**: None

11. **Add streaming** — implement `astream_events` in orchestrator
12. **Add human-in-the-loop** — `interrupt_before` on Security and Deployment nodes
13. **Add token counting** — wire LangChain callback handler to populate `token_usage`
14. **Add cost estimation** — per-model pricing lookup for pipeline cost reporting

### Phase 4: AaaS Infrastructure (Week 4-8)
**Preconditions**: Phase 2 (agents worth paying for)
**Dependencies**: Stripe account, Render deployment

15. **Tier definitions** — Pydantic models for Basic/Advanced/Custom with tool allowlists
16. **License manager** — key generation (UUID-based), validation, tier lookup
17. **JWT handler** — short-lived tokens (24h), caching, offline fallback
18. **Stripe integration** — checkout sessions, webhooks (created/updated/cancelled/failed)
19. **License gate middleware** — per-request validation in MCP and HTTP servers
20. **Rate limiter upgrade** — tier-based quotas (100/1000/unlimited)
21. **Usage tracking** — per-subscription invocation counting with monthly reset
22. **Kill switch** — graceful deactivation message when license invalid

### Phase 5: CLI & Distribution (Week 6-8)
**Preconditions**: Phase 4 (license system working)
**Dependencies**: Private GitHub repo for agent packages

23. **CLI installer** — `agentvault activate <KEY>` command
24. **Auto-update** — monthly pull of latest agent package (subscription check first)
25. **Environment detection** — configure MCP for Cursor / Claude Code / Cowork

### Phase 6: Landing Page & Portal (Week 8-10)
**Preconditions**: Phase 4 (Stripe working)
**Dependencies**: Frontend deployment

26. **Landing page** — tier matrix, pricing, signup CTA
27. **Customer portal** — plan management, usage dashboard, cancel/upgrade

---

## 5. Testing Strategy

### Unit Tests Required (New)

| Component | Tests | Coverage Target |
|-----------|-------|-----------------|
| `auth/license_manager.py` | Key generation, validation, expiry, tier lookup, invalid keys | 90% |
| `auth/stripe_client.py` | Webhook handling (all 4 events), checkout creation, error cases | 90% |
| `auth/jwt_handler.py` | Token creation, validation, expiry, offline fallback, tampering | 95% |
| `auth/subscription_tiers.py` | Tool allowlists per tier, rate limit configs, edge cases | 90% |
| `api/middleware/license_gate.py` | Valid license pass-through, invalid rejection, expired JWT, offline mode | 95% |
| `tools/real_cve_scanner.py` | pip-audit parsing, GitHub Advisory response handling, fallback | 85% |
| `tools/code_executor.py` | Syntax validation, ruff output parsing, sandbox safety | 90% |

### Modified Agent Tests

| Agent | New Tests Needed |
|-------|-----------------|
| Developer | Test `ast.parse()` catches syntax errors; test `ruff` output parsing |
| Dependency Audit | Test real CVE data parsing; test fallback when pip-audit unavailable |
| Integration Testing | Test generated pytest files are syntactically valid |
| Deployment | Test Dockerfile generation for Flask/FastAPI/Django |
| Refactoring | Test unified diff output format |

### E2E / Workflow Tests Required

| Scenario | What It Tests |
|----------|---------------|
| Full subscription lifecycle | Signup → activate → use tool → quota check → lapse → kill switch |
| License gate enforcement | Tool call with valid/invalid/expired/missing license key |
| Rate limit enforcement | Exceed tier quota → get clear rate limit error |
| Offline JWT fallback | Server unreachable → cached JWT allows use → JWT expires → blocked |
| Orchestrator with interrupts | Pipeline pauses at Security gate → human approves → continues |
| Streaming pipeline | Client receives progressive events during pipeline execution |

### Existing Tests to Update

| Test File | Change |
|-----------|--------|
| `tests/test_developer_agent.py` | Add cases for `ast.parse()` validation |
| `tests/test_dependency_audit.py` | Mock `pip-audit` subprocess instead of LLM CVE call |
| `tests/integration/test_mcp_server.py` | Add license gate middleware to test harness |
| `tests/integration/test_sdlc_pipeline.py` | Update expected output formats (diffs, pytest files, etc.) |

---

## 6. Open Questions / Risks

### Open Questions

| # | Question | Impact | Default Assumption |
|---|----------|--------|--------------------|
| Q1 | Which specific tools go in each tier? | Blocks tier definitions | Basic: PRD + Architect + Pitch. Advanced: + Developer + Security + SDLC. Custom: All. |
| Q2 | Should the license server be a separate repo/service or part of this one? | Architecture decision | Same repo, separate FastAPI app on different port |
| Q3 | Stripe test vs live mode for MVP? | Billing | Test mode first, switch at launch |
| Q4 | What's the JWT expiry for offline fallback? | Security/UX tradeoff | 24 hours (per PRD) |
| Q5 | Do we need multi-seat support for MVP? | Scope | No — single seat for Basic/Advanced, defer multi-seat to post-MVP |
| Q6 | Should streaming be opt-in or default? | Client compatibility | Opt-in via `stream=true` parameter |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `pip-audit` not available on all platforms | Medium | Dependency agent degrades | Fallback to LLM-based CVE detection (current behavior) |
| Sandboxed code execution is unsafe | High | Security vulnerability | Use `subprocess` with timeout + temp directory, no network access |
| Stripe webhook reliability | Low | Missed subscription events | Idempotent handlers + daily reconciliation job |
| Large codebases timeout during analysis | Medium | Bad customer experience | Streaming + file-count limits + progress reporting |
| LangGraph interrupt_before breaks existing clients | Low | Breaking change | Feature-flagged, off by default |
| Eval test suite broken beyond repair | Medium | Can't validate agent quality | Rewrite eval framework from scratch (simpler rubric-based) |

### Architectural Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Tight coupling to OpenAI | All agents hardcoded to `ChatOpenAI` | Abstract LLM provider behind interface; support Claude via `langchain-anthropic` |
| No database for license state | PRD requires Postgres on Render | Start with SQLite for local dev, SQLAlchemy async for portability |
| Agent files too large | `architect_agent.py` (77KB), `pitch_agent.py` (79KB) | Refactor into modules before adding more complexity |
| MCP protocol limitations | MCP doesn't natively support streaming or auth | HTTP server (`server_http.py`) as alternative channel for AaaS |

---

## PRD Alignment Checklist

| PRD Requirement | Plan Coverage | Phase |
|-----------------|---------------|-------|
| FR-1: Landing page with tier matrix | Phase 6 (#26) | Week 8-10 |
| FR-2: Subscription management portal | Phase 6 (#27) | Week 8-10 |
| FR-3: License key validation API | Phase 4 (#16) | Week 4-8 |
| FR-4: Stripe webhooks | Phase 4 (#18) | Week 4-8 |
| FR-5: JWT caching with offline support | Phase 4 (#17) | Week 4-8 |
| FR-6: Rate limits per tier | Phase 4 (#20) | Week 4-8 |
| FR-7: Kill switch enforcement | Phase 4 (#22) | Week 4-8 |
| FR-8: CLI installer | Phase 5 (#23) | Week 6-8 |
| FR-9: Auto-update on subscription check | Phase 5 (#24) | Week 6-8 |
| NFR-1: License check p95 ≤ 200ms | Phase 4 (#17 — JWT caching) | Week 4-8 |
| NFR-2: HTTPS, no long-lived secrets | Phase 4 (#17 — short JWT) | Week 4-8 |
| NFR-3: Time-to-first-use < 10 min | Phase 5 (#23 — CLI installer) | Week 6-8 |
| NFR-4: Rate limiting + signed tokens | Phase 4 (#20, #17) | Week 4-8 |

**Key Insight**: Phases 1-3 (making agents worth paying for) are NOT in the PRD but are prerequisites for a successful product. No one pays for agents that only suggest — they pay for agents that do.
