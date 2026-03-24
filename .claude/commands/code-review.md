# Code Review (4-Pass Architecture Compliance)

Act as a senior staff engineer performing a STRICT multi-pass code review.

You MUST perform **four distinct passes** and clearly separate them in your output.

CONTEXT:
- Files to review: $ARGUMENTS
- Architecture: Agent Overlay + Service-based + LangGraph
- Rules: Read `.cursorrules` and `CLAUDE.md` for project standards

## PASS 1 — Architecture & System Integrity
- Validate alignment with:
  - Agent Overlay Architecture
  - Service-based boundaries
  - Workflow engine assumptions
  - `.cursorrules`
- Identify architectural drift, leaky abstractions, or coupling
- Flag anything that could break existing workflows or agents

## PASS 2 — Correctness, Safety & Workflow Risk
- Validate logic correctness and edge cases
- Review workflow transitions, side effects, async behavior, and idempotency
- Identify failure modes that would NOT be caught by existing tests
- Explicitly call out workflow regression risks

## PASS 3 — Code Quality & Maintainability
- Naming, structure, readability
- Duplication or missed reuse opportunities
- Long-term maintainability concerns

## PASS 4 — Critical Gap Prevention
Use this pass to catch known repo failure patterns before merge.

### Agent vs Workflow Separation
- [ ] Agents only orchestrate tools, not business logic
- [ ] Tools are atomic, async, idempotent, and return structured dicts
- [ ] Database writes and business logic stay in services/workflows, not agent nodes

### Tool Contract Safety
- [ ] Tool inputs use Pydantic models with field descriptions and `extra='forbid'`
- [ ] Tools do not raise exceptions to the caller; they return structured error payloads
- [ ] Return values include `success`, `error`, and `next_action` when applicable

### Async and I/O Safety
- [ ] All I/O paths use async/await
- [ ] Blocking calls are not introduced into async flows
- [ ] File, HTTP, and database operations have explicit error handling

### Validation and Security
- [ ] External inputs are validated
- [ ] Secrets, tokens, and PII are not logged
- [ ] Queries and external calls follow safe parameter handling patterns

### Runtime Prompt and Portability Discipline
- [ ] Runtime behavior is not coupled to `.claude/` or `.cursor/` assets
- [ ] Tenant- or company-specific values are not hardcoded into reusable layers
- [ ] MCP-facing behavior remains provider-agnostic where required by `.cursorrules`

### Testing and Observability
- [ ] Tests cover happy path, edge cases, and failure paths
- [ ] Mocks reflect real data shapes rather than convenience-only fakes
- [ ] Structured logging and traceability are sufficient to debug regressions

## OUTPUT FORMAT (MANDATORY)
- **Blocking Issues** (must fix before merge)
- **Non-Blocking Issues**
- **Gap Prevention Status** (Pass 4 checklist results)
- **Workflow Risk Summary**
- **Suggested Improvements**
