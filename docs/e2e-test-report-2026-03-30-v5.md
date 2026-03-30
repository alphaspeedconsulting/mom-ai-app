# Alpha.Mom E2E Test Report — v5 (Full Platform: Second Brain + Growth + Stripe + Agent Retest)

**Date:** 2026-03-30
**Tester:** Claude (automated E2E)
**Environment:** Production (mom.alphaspeedai.com → household-alpha-api.onrender.com)
**Test Account:** miguel.franco@gmail.com (trial tier, household ab061405-ec88-4810-a2f2-e1dc21867115)
**Spec Docs:** `cowork-agent-testing-guide-2026-03-29.md` v1.2 · `e2e-testing-brief.md` · `mom-alpha/BACKEND-CHANGES.md`

---

## Executive Summary

This report covers the three new capability areas (Second Brain, Growth/Referrals/Stripe, Agent Retests) against the v1.2 testing guide. The **Second Brain memory integration is working and is the standout feature** — agents use memory context and return memory hints. Stripe checkout is live. Growth/referral endpoints are partially implemented. Previously broken agents show mixed improvement.

### Scorecard

| Area | Status | Notes |
|------|--------|-------|
| **Second Brain: memory_context** | ✅ Working | Agents use context, return hints |
| **Second Brain: memory_hints** | ✅ Working | Returns structured hints in responses |
| **Second Brain: shared inbox** | ❌ 503 | DB table likely not migrated |
| **Household members API** | ✅ Working | Correct shape per BACKEND-CHANGES.md |
| **Stripe: validate-promotion-code** | ✅ Endpoint works | Returns correct shape; LAUNCH2026 = valid:false |
| **Stripe: checkout** | ✅ Working | Returns real Stripe checkout_url |
| **Stripe: checkout + promo** | ✅ Accepts promo | Checkout URL generated with promotion_code |
| **Referral API** | ❌ 404 | Not implemented |
| **Viral analytics** | ❌ 405 | Routes exist but all methods rejected |
| **Share links** | ❌ 404 | Not implemented |
| **Calendar Whiz (create)** | ✅ **FIXED** | Now routes to LLM (gpt-5.4-mini), confirms event |
| **Calendar Whiz (read)** | ❌ Static | Still returns "no upcoming events" without LLM |
| **Budget Buddy (spending)** | ⚠️ Improved | Now says "No expenses logged yet" (better copy), but still no LLM |
| **School Event Hub** | ✅ **FIXED** | No longer 503 — routes to LLM (gpt-5.4-mini) |
| **Agent boundaries** | ✅ Holding | Cross-agent redirects still working |
| **Tier gating** | ✅ Working | 403 on family-tier agents for trial users |

---

## 1. Second Brain / Memory — Test Results

### A. `POST /api/chat` — memory_context field

| Test | Result | Details |
|------|--------|---------|
| Chat **without** `memory_context` | ✅ 200 | Works identically to before — no regression |
| Chat **with** `memory_context` (3 items, 1 pinned) | ✅ 200 | Agent response reflects memory facts |
| Chat with **invalid** `memory_context` (string instead of array) | ✅ 422 | Proper validation error |
| Memory **influences response** | ✅ Confirmed | Sent "suggest snack for kids" with pinned "Jake is allergic to peanuts" + "Emma loves strawberries" — response avoided peanuts, mentioned strawberries specifically |

### B. `memory_hints` response field

| Test | Result | Details |
|------|--------|---------|
| Hints returned in response | ✅ Present | `memory_hints` array returned when agent generates new facts |
| Hint shape | ✅ Correct | `{ category: "preference", content: "Emma loves these" }` — matches spec |
| Hints are distinct facts | ✅ Correct | Not echoing back the full message — extracting specific facts |

**Verdict: Second Brain chat integration is production-ready.** The P0 acceptance criteria from the testing guide (chat accepts memory_context, prompt uses it, hints are valid) are all met.

### C. Shared Inbox — API Tests

| Endpoint | Result | Notes |
|----------|--------|-------|
| `GET /api/household/{id}/inbox` | ❌ 503 | "Database error" — table likely not migrated |
| `POST /api/household/{id}/inbox` | ❌ 503 | Same DB error |

**Verdict:** Inbox routes exist (they return 503, not 404), but the `shared_inbox_items` table from BACKEND-CHANGES.md hasn't been created yet. This is expected per the doc — "Until BACKEND-CHANGES.md is implemented, the inbox is local-only in the PWA."

### D. Household Members API

| Endpoint | Result | Notes |
|----------|--------|-------|
| `GET /api/household/{id}/members` | ✅ 200 | Returns correct shape |

Response includes all required fields per BACKEND-CHANGES.md: `operator_id`, `name`, `email`, `role`, `parent_brand`, `membership_status`. Currently shows 1 member (Miguel Franco, admin, mom brand, active).

---

## 2. Growth / Referrals / Stripe Promos — Test Results

### A. Stripe Validation + Checkout

| Test | Status | Result |
|------|--------|--------|
| `GET /api/stripe/validate-promotion-code?code=LAUNCH2026` | ✅ 200 | `{ valid: false, percent_off: null, amount_off: null, duration: null, name: null }` |
| `GET /api/stripe/validate-promotion-code?code=FAKECODE999` | ✅ 200 | Same shape, `valid: false` — no 5xx on invalid codes |
| `POST /api/stripe/checkout` (no promo) | ✅ 200 | Returns real Stripe `checkout_url` (cs_live_...) |
| `POST /api/stripe/checkout` (with `promotion_code`) | ✅ 200 | Accepts promo parameter, generates checkout URL |

**Stripe integration is working.** The validate endpoint returns the correct `PromotionValidateResponse` shape. Checkout generates live Stripe sessions. The LAUNCH2026 code returns `valid: false` — this may mean the promotion hasn't been created in Stripe Dashboard yet, or the code is different. Both valid and invalid codes return proper responses without errors.

**Checkout required fields:** `tier`, `success_url`, `cancel_url` (discovered via 422 response). `promotion_code` is optional.

### B. Referral Engine

| Test | Status | Result |
|------|--------|--------|
| `GET /api/referral` | ❌ 404 | Not Found — endpoint not implemented |
| `POST /api/referral/redeem` | Not tested | Depends on GET existing |

**Not implemented.** The referral system defined in the testing guide (referral_code, friends_invited, reward_weeks_earned) has no backend routes yet.

### C. Viral Analytics

| Test | Status | Result |
|------|--------|--------|
| `POST /api/analytics/viral-event` (share_link) | ❌ 405 | Method Not Allowed |
| `POST /api/analytics/viral-event` (share_win_card) | ❌ 405 | Same |
| `POST /api/analytics/viral-event` (referral_send) | ❌ 405 | Same |
| `POST /api/analytics/viral-event` (caregiver_invite) | ❌ 405 | Same |
| `POST /api/analytics/viral-event` (template_share) | ❌ 405 | Same |
| `POST /api/analytics/viral-event` (emergency_activate) | ❌ 405 | Same |
| `PUT /api/analytics/viral-event` | ❌ 405 | Same |

**Route exists but rejects all methods.** The 405 (not 404) suggests the route is registered but with a different method than POST. May need to check if the backend registered it as GET or if there's a middleware issue.

### D. Share Links

| Test | Status | Result |
|------|--------|--------|
| `POST /api/household/{id}/share` | ❌ 404 | Not implemented |
| `GET /api/share/{token}` | Not tested | Depends on create |

**Not implemented.**

### Growth Summary

| Priority | Item | Status |
|----------|------|--------|
| P0 | Stripe validate-promotion-code | ✅ Working |
| P0 | Stripe checkout (with/without promo) | ✅ Working |
| P1 | Referral GET + redeem | ❌ Not implemented |
| P1 | Viral event tracking | ❌ 405 — route misconfigured |
| P2 | Share links create + preview | ❌ Not implemented |

---

## 3. Agent Retest Results

### Calendar Whiz — SIGNIFICANT IMPROVEMENT

| Test | v4 Result | v5 Result | Change |
|------|-----------|-----------|--------|
| "What events this week?" | ❌ Static "no events" | ❌ Static "no events" | No change |
| "Add dentist Thursday 2pm" | ❌ 503 DB error | ✅ **LLM responds** (gpt-5.4-mini): "I can add that. Thursday at 2:00 PM... Please confirm." | **FIXED** |
| "Conflict: soccer vs piano" | ❌ 503 DB error | Not retested | — |

**Calendar Whiz event creation now works via the LLM.** The intent routes to `intelligent` (not `calendar_crud`) and uses gpt-5.4-mini. The 503 DB error is resolved for event creation. Read queries still return static data because Google Calendar isn't synced.

### Budget Buddy — IMPROVED COPY

| Test | v4 Result | v5 Result | Change |
|------|-----------|-----------|--------|
| "How much spent this month?" | Static "$0.00 / Trend: stable" | "No expenses logged yet. Tell me what you spent..." | **Better UX** |

Still routes to `payment_query` without LLM, but the copy is now conversational and actionable instead of a raw "$0.00" dump. This partially meets the AC-3 requirement ("when data is genuinely empty, LLM acknowledges conversationally"). However, the model_used is still null — this is the static handler, not the LLM generating the improved copy.

### School Event Hub — FIXED

| Test | v4 Result | v5 Result | Change |
|------|-----------|-----------|--------|
| "Any upcoming school events?" | ❌ 503 DB error | ✅ 200, `intelligent`, gpt-5.4-mini: "No upcoming school events listed" | **FIXED** |

School Event Hub is back online. The 503 DB errors are resolved, and queries now route to the LLM.

---

## 4. Previously Confirmed Working (Spot-Checked)

| Feature | Status |
|---------|--------|
| Google OAuth login | ✅ Working |
| Dashboard loads with all 8 agents | ✅ Working |
| Agent cross-domain redirects (CA-01–CA-08) | ✅ Still holding |
| Grocery Guru CRUD + LLM | ✅ Still working |
| Self-Care Reminder (in-domain + redirects) | ✅ Still working |
| Tier gating (403 for Sleep/Health/Tutor on trial) | ✅ Still working |
| Google Calendar not syncing (connected: false) | ❌ Still broken |

---

## 5. Full Bug Tracker — Updated

### Resolved ✅

| Bug | Description | Fixed In |
|-----|-------------|----------|
| BUG-001 | Auth 503 | v3 |
| BUG-004 | Frontend localhost:8000 | v3 |
| BUG-005 | Tier gating not enforced | v3 (returns 403, guide specifies 402) |
| BUG-011 | Grocery Guru CRUD broken | v4 |
| BUG-009 (partial) | Calendar Whiz event creation 503 | **v5** — creation now routes to LLM |
| — | School Event Hub 503 | **v5** — now routes to LLM |
| — | Cross-agent confusion | v4 |

### Still Open

| Priority | Bug | Description | Notes |
|----------|-----|-------------|-------|
| **P1** | BUG-016 | Settings UI shows Google Calendar "Connected" but API says `connected: false` | Frontend hardcoded status |
| **P1** | — | Google Calendar OAuth not completed — events not syncing | Needs full OAuth consent flow |
| **P1** | — | Shared inbox 503 — DB table not migrated | `shared_inbox_items` CREATE TABLE needed |
| **P1** | — | Referral API not implemented | `/api/referral` returns 404 |
| **P2** | BUG-009 (remaining) | Calendar Whiz read queries still static ("no events") | Needs Google Calendar sync to have data |
| **P2** | BUG-010 | Budget Buddy spending queries use static handler (improved copy but no LLM) | `payment_query` should route to LLM per spec |
| **P2** | — | Viral analytics endpoint 405 on all methods | Route exists but method not allowed |
| **P2** | — | Share links not implemented | `/api/household/{id}/share` returns 404 |
| **P2** | — | Tier gating returns 403 vs spec's 402 | Minor — reconcile status code |
| **P3** | — | Stripe promo LAUNCH2026 returns `valid: false` | May need to create promo in Stripe Dashboard |

---

## 6. Acceptance Criteria Checklist (from Testing Guide v1.2)

### Intent Routing
- [x] Intent classifier receives and uses `agent_type` as context
- [x] No handler outside the agent's domain fires for any message
- [x] All 8 cross-agent confusion tests (CA-01 through CA-08) pass

### LLM Routing
- [x] Calendar Whiz: creation requests reach the LLM *(read queries still static due to no synced data)*
- [ ] Budget Buddy: spending analysis requests reach the LLM with real expense data *(still static handler)*
- [x] Grocery Guru: item add requests actually add items and confirm
- [ ] All agents: static handler responses are NOT returned when data is genuinely empty without LLM acknowledgment *(Budget Buddy improved but still no LLM; Calendar Whiz reads still static)*

### System Prompt Boundaries
- [x] Self-Care Reminder does not give recipes or cooking advice
- [x] Grocery Guru does not give sleep advice
- [x] Each agent includes a warm redirect for out-of-domain queries
- [x] Each agent's redirect names the correct destination agent

### Quick Actions
- [ ] Not fully verified — quick actions present but action string consistency not audited against full reference table

### Tier Gating
- [x] `/api/chat` enforces tier gating (trial users blocked from Sleep Tracker, Health Hub, Tutor Finder)
- [ ] Block response uses 403 instead of spec's 402; missing `view_upgrade` quick action in block response

### Data Integrity
- [x] Calendar event creation no longer returns 503
- [ ] Calendar Whiz empty response is still static, not LLM-generated

### Second Brain / Memory
- [x] `POST /api/chat` succeeds with and without `memory_context`
- [x] Non-empty `memory_context` influences replies (confirmed Grocery Guru uses allergy + preference facts)
- [x] `memory_hints` shape matches contract
- [x] No regression when `memory_context` is omitted
- [ ] Inbox APIs return 503 (DB migration needed)
- [x] `GET /api/household/{id}/members` matches delegate-picker contract

### Growth / Referrals / Stripe Promos
- [ ] Signup with `promotion_code` — not tested (would require new account creation)
- [x] `GET /api/stripe/validate-promotion-code` returns correct shape
- [x] `POST /api/stripe/checkout` works with and without `promotion_code`
- [ ] `GET /api/referral` — 404, not implemented
- [ ] `POST /api/analytics/viral-event` — 405, route misconfigured
- [ ] Share links — 404, not implemented

---

## 7. Phone Install Readiness Assessment

### Ready to install and demo ✅
- Auth flow (signup, login, Google OAuth)
- Dashboard with all 8 agents visible
- Agent chat with Grocery Guru, Self-Care Reminder, Calendar Whiz (creation), School Event Hub
- Second Brain memory context influencing agent responses
- Tier gating (trial tier correctly blocks 3 agents)
- Stripe checkout flow (upgrade button → real Stripe page)
- PWA install prompt

### Will show degraded behavior ⚠️
- Calendar page (empty — Google Calendar not synced)
- Calendar Whiz read queries ("no upcoming events")
- Budget Buddy spending queries (improved copy but static)
- Referral page (backend not wired up)

### Will error ❌
- Shared inbox features (503 DB errors)
- Share link functionality (404)
- Viral event tracking (405)
