# Mom.alpha E2E Test Report

**Date:** 2026-03-28
**Environment:** Production (Render)
**Tester:** Claude Cowork (automated)
**Reference:** `docs/e2e-testing-brief.md`

---

## Environment Tested

| Service | URL | Plan |
|---------|-----|------|
| Frontend (PWA) | https://mom.alphaspeedai.com | GitHub Pages |
| Household API | https://household-alpha-api.onrender.com | Render Starter ($7/mo) |
| License Server | https://agentvault-license-server.onrender.com | Render Free tier |
| Database | Render Postgres 16 | $6/mo, 256MB |

---

## 1. Health Check Results

| Check | Result | Notes |
|-------|--------|-------|
| Household API `/health` | PASS | `{"status":"ok"}` — instant response |
| License Server `/health/live` | PASS | `{"service":"AgentVault License Server","status":"live"}` — no cold-start delay |
| Diagnostics `/health/diagnostics` | FAIL (404) | Endpoint returns `{"detail":"Not Found"}` — either not deployed or path changed |
| OpenAPI `/docs` (Swagger UI) | PASS | HTTP 200, HTML page served |
| OpenAPI `/openapi.json` | FAIL (500) | Returns "Internal Server Error" — likely DB-dependent schema generation failing |

---

## 2. Security & Infrastructure

| Check | Result | Notes |
|-------|--------|-------|
| CORS: `mom.alphaspeedai.com` | PASS | Returns `access-control-allow-origin: https://mom.alphaspeedai.com` |
| CORS: `evil.com` (unauthorized) | PASS | No `access-control-allow-origin` header returned — correctly blocked |
| `Strict-Transport-Security` | PASS | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | PASS | `nosniff` |
| `X-Frame-Options` | PASS | `DENY` |
| `Content-Security-Policy` | PASS | Comprehensive policy with `frame-ancestors 'none'`, `connect-src 'self' https://mom.alphaspeedai.com` |
| `Permissions-Policy` | PASS | `camera=(), microphone=(self), geolocation=(), payment=()` |
| `Referrer-Policy` | PASS | `strict-origin-when-cross-origin` |
| SSL Certificate | PASS | TLSv1.3, cert valid until 2026-06-26, issued by Google Trust Services |
| 404 Error Format | PASS | Returns `{"detail":"Not Found"}` with HTTP 404 |

---

## 3. Authentication Flow

| Test | Expected | Result | Notes |
|------|----------|--------|-------|
| Signup (`POST /api/auth/signup`) | 200 + JWT | **FAIL (500)** | "Internal Server Error" — DB write likely failing |
| Login (`POST /api/auth/login`) | 200 + JWT | **FAIL (500)** | "Internal Server Error" — DB read likely failing |
| Wrong password login | 401 | **FAIL (500)** | Same 500 — never reaches password check |
| Missing `Authorization` header | 401 | PASS (422) | Returns validation error; 422 vs 401 is debatable but functional |
| Invalid/expired JWT | 401 | PASS | `{"detail":"Invalid or expired token"}` |
| Rate limiting | 429 | PASS | Returns `{"detail":"Rate limit exceeded. Try again later."}` with `retry-after: 60` |

**BLOCKER: Auth endpoints return HTTP 500.** All signup and login attempts fail with "Internal Server Error." This blocks all authenticated testing (agents, chat, household, Stripe, etc.). The `/health` endpoint returns OK, suggesting the app process is running but DB operations fail on the auth path. Possible causes: DB connection pool exhaustion, missing migration, or env var misconfiguration (e.g., `DATABASE_URL` pointing to an unreachable/full Postgres instance).

---

## 4. Protected Endpoint Auth Gates

All auth-required endpoints correctly reject requests without a valid token:

| Endpoint | HTTP Status | Behavior |
|----------|-------------|----------|
| `GET /api/agents` | 422 | Requires `authorization` header |
| `GET /api/calendar` | 422 | Requires `authorization` header |
| `GET /api/notifications` | 422 | Requires `authorization` header |
| `GET /api/consent/status` | 422 | Requires `authorization` header |
| `GET /api/consent/history` | 422 | Requires `authorization` header |
| `POST /api/stripe/checkout` | 422 | Requires `authorization` + body fields |
| `GET /api/stripe/portal` | 422 | Requires `authorization` header |

Note: The API returns 422 (Unprocessable Entity) instead of 401 (Unauthorized) for missing auth. This is because FastAPI's dependency injection treats the missing header as a validation error. Functionally correct but non-standard — consider returning 401 for better HTTP semantics.

---

## 5. PWA Requirements

| Check | Result | Notes |
|-------|--------|-------|
| Frontend loads | PASS | HTTP 200, title: "Alpha.Mom — AI Family Assistant" |
| `manifest.json` | PASS | `name: "Alpha.Mom — AI Family Assistant"`, `display: standalone`, 2 icons (192px, 512px) |
| `theme_color` | PASS | `#32695a` (brand teal) in both manifest and `<meta>` tag |
| Viewport meta | PASS | `width=device-width, initial-scale=1, viewport-fit=cover` |
| `sw.js` (service worker) | PASS | Contains `precacheAndRoute` with 50+ cached assets, Workbox strategies configured |
| `sw-push.js` (push handler) | PASS | Handles push events, notification click → URL open |
| Caching strategies | PASS | NetworkFirst for API/pages, CacheFirst for fonts, StaleWhileRevalidate for static assets |
| Offline support | PASS (code review) | Service worker registered with offline-capable caching; banner test requires browser |

---

## 6. Agent & Chat Testing

**STATUS: BLOCKED** — Cannot test any of the 88 scenarios (64 unit + 24 multi-turn + 8 cross-agent) because auth is broken. All agent chat requires a valid JWT with `household_id`.

### What would be tested (per the brief):
- 8 agents x 8 scenarios each = 64 unit tests
- 8 agents x 3 multi-turn scenarios = 24 context-retention tests
- 8 cross-agent data-sharing scenarios
- Quality rubric scoring (accuracy, helpfulness, progressive disclosure, formatting, safety, quick actions)
- Forbidden pattern checks per agent
- Model routing verification (`model_used` field in response)

---

## 7. Stripe Subscription Testing

**STATUS: BLOCKED** — Stripe checkout and portal endpoints require auth. Cannot verify:
- Checkout session creation
- Promo code validation (`BETA2026`)
- Tier upgrade/downgrade webhooks
- Call budget enforcement

---

## 8. Feature Flags

| Flag | Expected | Verified | Notes |
|------|----------|----------|-------|
| `USE_GPT5` | `false` (default) | NOT VERIFIED | Requires authenticated chat to check `model_used` |
| `USE_TOOLS` | `false` (default) | NOT VERIFIED | Same |
| `USE_STRUCTURED_OUTPUT` | `false` (default) | NOT VERIFIED | Same |

---

## 9. Playwright Tests (Frontend)

Four test suites exist in `mom-alpha/tests/e2e/`:

| Suite | File | Status |
|-------|------|--------|
| Navigation | `navigation.spec.ts` | EXISTS (not run — requires local dev server) |
| PWA | `pwa.spec.ts` | EXISTS |
| Shared Household | `shared-household.spec.ts` | EXISTS |
| CSS Zen Garden | `css-zen-garden.spec.ts` | EXISTS |

These are UI-level tests that need a running frontend and potentially a backend. They can be run locally with `npx playwright test`.

---

## 10. Cross-Check with Agent Upgrade Plan

Per `docs/enhancement-plans/2026-03-28-agent-upgrade-and-testing-plan.md`, the upgrade plan identifies 6 critical gaps:

1. **No Claude SKILL.md for agents** — To be created in `.claude/skills/mom-agents/`
2. **Thin system prompts** — Currently ~60 chars, need XML-structured prompts
3. **No progressive disclosure** — All context dumped per call
4. **Unused frameworks** — LangGraph, Composio, pydantic-evals installed but not wired
5. **No conversation memory** — Every turn stateless
6. **Zero agent testing** — pydantic-evals installed but `.deepeval` directory empty

**These upgrades have NOT been deployed yet** — the plan is in "Draft" status. The current production deployment is pre-upgrade. Testing the post-upgrade features (GPT-5-4 routing, structured output, tool calling) will require deploying the upgrade first.

---

## Summary

| Category | Total Checks | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| Health Checks | 5 | 3 | 2 | 0 |
| Security/Infrastructure | 10 | 10 | 0 | 0 |
| Auth Flow | 6 | 2 | 4 | 0 |
| Protected Endpoint Gates | 7 | 7 | 0 | 0 |
| PWA Requirements | 8 | 8 | 0 | 0 |
| Agent Scenarios (88) | 88 | 0 | 0 | 88 |
| Stripe | 7 | 0 | 0 | 7 |
| Feature Flags | 3 | 0 | 0 | 3 |
| **TOTAL** | **134** | **30** | **6** | **98** |

---

## Bugs Found

### BUG-001: Auth Endpoints Return 500 (CRITICAL — BLOCKER)
- **Severity:** P0 — blocks all authenticated functionality
- **Endpoints:** `POST /api/auth/signup`, `POST /api/auth/login`
- **Repro:** `curl -X POST https://household-alpha-api.onrender.com/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"TestPass123!","name":"Test"}'`
- **Expected:** 200 with JWT, or 400/409 for duplicate email
- **Actual:** HTTP 500 "Internal Server Error"
- **Impact:** No user can sign up or log in on production. All 98 blocked tests depend on this.
- **Likely cause:** Database connectivity issue — `/health` passes (no DB check) but all DB-write/read operations fail. Check Render Postgres dashboard for connection limits, disk usage (256MB cap), or expired credentials.

### BUG-002: `/health/diagnostics` Returns 404
- **Severity:** P2 — monitoring gap
- **Repro:** `curl https://household-alpha-api.onrender.com/health/diagnostics`
- **Expected:** JSON with DB connectivity status, dependency health
- **Actual:** `{"detail":"Not Found"}`
- **Impact:** Cannot programmatically verify DB health, which would help diagnose BUG-001.
- **Likely cause:** Endpoint not yet implemented or not included in current deployment.

### BUG-003: `/openapi.json` Returns 500
- **Severity:** P3 — development tooling
- **Repro:** `curl https://household-alpha-api.onrender.com/openapi.json`
- **Expected:** JSON OpenAPI spec
- **Actual:** HTTP 500 "Internal Server Error"
- **Impact:** Cannot auto-generate client types or inspect API schema programmatically. Swagger UI at `/docs` loads (serves static HTML) but likely can't render the spec.
- **Note:** May be related to BUG-001 if schema generation touches the DB.

### OBSERVATION-001: Auth Returns 422 Instead of 401 for Missing Token
- **Severity:** P4 — standards compliance
- **Endpoints:** All auth-required endpoints
- **Expected:** HTTP 401 Unauthorized
- **Actual:** HTTP 422 Unprocessable Entity with FastAPI validation error
- **Impact:** Non-standard but functional. API consumers expecting 401 may mishandle this.

---

## Recommended Next Steps

1. **Fix BUG-001 immediately** — Check Render Postgres dashboard: connection count, disk usage, credentials. Run `SELECT 1` from the Render shell to verify connectivity. Check application logs on Render for the actual exception traceback.
2. **Implement `/health/diagnostics`** — Add a health endpoint that verifies DB connectivity, checks table existence, and reports environment config (minus secrets). This would have caught BUG-001 proactively.
3. **Re-run this test suite** once auth is fixed — The 98 blocked tests cover the core agent functionality, Stripe flow, and feature flag verification.
4. **Deploy the agent upgrade plan** — The enhancement plan is still in Draft. Once deployed, re-test with `USE_GPT5=true`, `USE_STRUCTURED_OUTPUT=true`, and `USE_TOOLS=true` flags.
5. **Run Playwright tests locally** — The 4 frontend test suites (`navigation`, `pwa`, `shared-household`, `css-zen-garden`) should be run against a local dev environment with a working backend.
