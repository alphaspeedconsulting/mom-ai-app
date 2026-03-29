# Alpha.Mom E2E Test Report — v3 (Post-Fix Retest)

**Date:** 2026-03-28
**Tester:** Claude (automated E2E)
**Environment:** Production (mom.alphaspeedai.com → household-alpha-api.onrender.com)
**Test Account:** ui-retest-20260328@alphaspeedai.com (trial tier)

---

## Executive Summary

Major improvements since v2. The two P0 blockers (auth 503, frontend localhost) are **both fixed**. Full signup → login → dashboard → agent chat flow works end-to-end in the browser with real LLM responses. Several medium-priority bugs remain.

| Metric | v1 | v2 | v3 (current) |
|--------|----|----|--------------|
| Health check | ✅ | ✅ | ✅ |
| Signup (API) | ❌ 503 | ❌ 503 | ✅ 200 |
| Login (API) | ❌ 503 | ❌ 503 | ✅ 200 |
| Signup (UI) | ❌ localhost | ❌ localhost | ✅ works |
| Login (UI) | ❌ localhost | ❌ localhost | ✅ works |
| Dashboard | ❌ blocked | ❌ blocked | ✅ loads with user name |
| Agent chat (UI) | ❌ blocked | ❌ blocked | ✅ real LLM responses |
| LLM calls verified real | n/a | n/a | ✅ gpt-5.4-nano/mini |

---

## 1. Infrastructure & Health

| Test | Result | Notes |
|------|--------|-------|
| GET /health | ✅ 200 (342ms) | Fast, no cold start |
| CORS (evil.com) | ✅ Blocked (400) | No `access-control-allow-origin` returned |
| CORS (mom.alphaspeedai.com) | ✅ Allowed (200) | Correct `allow-origin` header |
| Auth enforcement (no token) | ✅ 401 | "Authentication required" |
| OpenAPI /docs | ⚠️ HTML loads | But /openapi.json returns 500 |

---

## 2. Auth Flow — FIXED ✅

| Test | Result | Notes |
|------|--------|-------|
| POST /api/auth/signup | ✅ 200 | Returns JWT + user object |
| POST /api/auth/login | ✅ 200 | Returns JWT + user object |
| Consent dialog | ✅ | ToS, Privacy, AI Disclosure checkboxes |
| PWA install prompt | ✅ | Shows after consent, "Continue to App" works |
| Dashboard redirect | ✅ | "Good evening, [name] — your agents are ready" |
| JWT contains tier | ✅ | `tier: "trial"`, `parent_brand: "mom"` |
| Profile page | ✅ | Shows name, email, "Free Trial" badge, AI budget |
| AI Call Budget tracking | ✅ | 2/100 used after test calls |

---

## 3. Agent Tests — All 8 Agents

### Agents that trigger real LLM calls:

| Agent | Status | Model | Tokens | Response Quality |
|-------|--------|-------|--------|-----------------|
| **Self-Care Reminder** | ✅ | gpt-5.4-nano | 508 | Excellent — empathetic, structured, actionable |
| **Sleep Tracker** | ✅ | gpt-5.4-nano | 292 | Excellent — parsed sleep data, asked follow-ups |
| **School Event Hub** | ✅ | gpt-5.4-mini | 139 | Good — offered weekly check-in setup |
| **Health Hub** | ✅ | gpt-5.4-mini | 154 | Good — offered to add appointments |
| **Grocery Guru** (complex) | ✅ | LLM (model not reported) | High | Excellent — full 7-day meal plan, nut-free grocery list |

### Agents with static/CRUD handlers (no LLM):

| Agent | Status | Issue |
|-------|--------|-------|
| **Calendar Whiz** | ⚠️ P2 | Always returns "You have no upcoming events" even for planning requests — intent classifier routes everything to `calendar_crud` instead of `intelligent` |
| **Budget Buddy** | ⚠️ P2 | Always returns static "$0.00 spending" — never routes to LLM even for analysis requests |
| **Grocery Guru** (simple) | ⚠️ P2 | "Add milk, eggs, bread" returns "Your list is empty" instead of adding items |
| **Tutor Finder** | ⚠️ P2 | Returns generic "What would you like to search for?" — misclassified as `filter_search` |

### LLM Verification:
- ✅ Confirmed calls are **real** (not mocked) — different random numbers on repeated calls, correct factual answers
- ✅ Model: `gpt-5.4-nano` (lightweight tasks), `gpt-5.4-mini` (moderate tasks)
- ✅ Token usage tracked and reported in responses
- ⚠️ User reports no cost visible on OpenAI key — verify the Render env var `OPENAI_API_KEY` is using the expected key

---

## 4. Tier Gating — BUG 🐛

| Agent | Required Tier | User Tier | Expected | Actual | Verdict |
|-------|--------------|-----------|----------|--------|---------|
| Calendar Whiz | trial | trial | ✅ Allow | ✅ Allow | Correct |
| Grocery Guru | trial | trial | ✅ Allow | ✅ Allow | Correct |
| Budget Buddy | trial | trial | ✅ Allow | ✅ Allow | Correct |
| School Event Hub | trial | trial | ✅ Allow | ✅ Allow | Correct |
| Self-Care Reminder | trial | trial | ✅ Allow | ✅ Allow | Correct |
| **Tutor Finder** | **family** | trial | ❌ Block | ✅ Allow | **BUG** |
| **Health Hub** | **family** | trial | ❌ Block | ✅ Allow | **BUG** |
| **Sleep Tracker** | **family** | trial | ❌ Block | ✅ Allow | **BUG** |

**BUG-005 (P1):** Tier gating is not enforced on the chat endpoint. Trial users can access all 8 agents including family-tier-only agents. The `/api/agents` endpoint correctly marks `is_available: false` for gated agents, but `/api/chat` doesn't check tier.

---

## 5. Data Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /api/calendar | GET | ✅ 200 | Returns `{events: [], total: 0}` |
| /api/calendar | POST | ❌ 503 | "Database error" — event creation fails |
| /api/tasks | GET | ✅ 200 | Returns `{tasks: [], active_count: 0}` |
| /api/agents | GET | ✅ 200 | All 8 agents listed with metadata |
| /api/notifications | GET | ✅ 200 | Returns `{notifications: [], unread_count: 0}` |
| /api/household/members | GET | ❌ 403 | "Forbidden" — may need household owner role |
| /api/subscription | GET | ❌ 404 | Endpoint doesn't exist |
| /api/stripe/create-checkout | POST | ❌ 404 | Endpoint doesn't exist |
| /openapi.json | GET | ❌ 500 | Internal Server Error |

**BUG-006 (P1):** Calendar event creation returns 503 — DB write operations may be failing while reads work fine.
**BUG-007 (P2):** Stripe/subscription endpoints don't exist yet — billing flow is incomplete.
**BUG-008 (P3):** OpenAPI spec generation is broken (500 error).

---

## 6. UI/UX Observations

| Area | Status | Notes |
|------|--------|-------|
| Landing page | ✅ | Clean, all sections render (hero, agents, timeline, features, privacy, pricing, FAQ, waitlist) |
| Signup form | ✅ | Google OAuth + email registration, consent flow |
| Dashboard | ✅ | Personalized greeting, agent search, agent cards with toggle |
| Agent chat | ✅ | Message input, starter prompts, agent icon + "Online" status |
| Calendar page | ✅ | Month view with member filters (All/Shared/Mom/Kids) |
| Tasks page | ✅ | Agent activity card, quick action links |
| Profile page | ✅ | User info, AI budget, family members section |
| Navigation | ✅ | Bottom nav bar (Home/Tasks/Calendar/Profile) |
| PWA install banner | ✅ | "Add Alpha.Mom to your home screen" with Install/Dismiss |
| **Agent chat header** | ⚠️ Minor | Some agents show "Agent" instead of agent name on initial load (before first message) |
| **Markdown rendering** | ⚠️ Minor | Agent responses render markdown headers as raw `###` text instead of styled headings |

---

## 7. Bug Summary

### P0 (Blocking) — RESOLVED ✅
| Bug | v2 Status | v3 Status |
|-----|-----------|-----------|
| BUG-001: Auth 503 | ❌ Open | ✅ Fixed |
| BUG-004: Frontend → localhost:8000 | ❌ Open | ✅ Fixed |

### P1 (High)
| Bug | Description |
|-----|-------------|
| BUG-005 | Tier gating not enforced — trial users can access family-tier agents |
| BUG-006 | Calendar POST returns 503 — DB write operations failing |

### P2 (Medium)
| Bug | Description |
|-----|-------------|
| BUG-009 | Calendar Whiz never routes to LLM — always returns static CRUD response |
| BUG-010 | Budget Buddy never routes to LLM — always returns static spending query |
| BUG-011 | Grocery Guru "add items" intent returns empty list instead of adding items |
| BUG-012 | Tutor Finder misclassifies all intents as `filter_search` |
| BUG-007 | Stripe/subscription endpoints missing — no billing flow |

### P3 (Low)
| Bug | Description |
|-----|-------------|
| BUG-008 | /openapi.json returns 500 |
| BUG-013 | Agent chat header shows "Agent" instead of agent name on initial load |
| BUG-014 | Markdown headers render as raw `###` text in chat bubbles |
| BUG-015 | Google OAuth `client_id` not set — console error on signup page |

---

## 8. What's Working Well

1. **Auth flow is solid** — signup, login, JWT, consent, profile all work
2. **LLM integration is real** — gpt-5.4-nano and gpt-5.4-mini return high-quality, contextual responses
3. **Self-Care Reminder** is the standout agent — empathetic, structured, multi-turn capable
4. **Grocery Guru meal planning** produces excellent 7-day plans with allergy awareness
5. **Sleep Tracker** does thoughtful sleep analysis with follow-up questions
6. **CORS properly configured** — blocks unauthorized origins
7. **PWA install flow** works smoothly with install prompt + continue to app
8. **Usage tracking** works — AI call budget decrements correctly
9. **Frontend deployment** is now properly connected to production API

---

## 9. Recommended Next Steps

1. **Fix tier gating** (P1) — Add tier check to `/api/chat` endpoint before processing
2. **Fix calendar writes** (P1) — Debug DB write permissions / schema for event creation
3. **Fix intent classifier** (P2) — Calendar Whiz and Budget Buddy need their classifiers updated to route complex requests to LLM instead of static handlers
4. **Implement Stripe endpoints** (P2) — Required before launch for billing
5. **Verify OpenAI API key** — Check which key is set in Render env vars to confirm billing
6. **Fix markdown rendering** in chat UI — Parse `###` as headings
7. **Fix agent name in chat header** — Load agent metadata before first message

---

## 10. Screenshots

All screenshots saved to `screenshots/` directory:

| File | Description |
|------|-------------|
| 01-landing-hero.png | Landing page hero section |
| 02-landing-full-page.png | Full landing page (all sections) |
| 03-signup-page.png | Signup form |
| 04-calendar-page.png | Calendar month view |
| 05-tasks-page.png | Tasks page with agent activity |
| 06-agent-chat.png | Agent chat empty state |
| 09-consent-dialog.png | Terms/Privacy/AI consent checkboxes |
| 10-pwa-install-prompt.png | PWA install prompt |
| 11-dashboard-logged-in.png | Dashboard after login |
| 12-calendar-whiz-response.png | Calendar Whiz static response (bug) |
| 13-selfcare-llm-response.png | Self-Care Reminder real LLM response |
| 14-grocery-guru-llm-meal-plan.png | Grocery Guru 7-day meal plan |
| 15-profile-page.png | Profile with AI budget tracking |
