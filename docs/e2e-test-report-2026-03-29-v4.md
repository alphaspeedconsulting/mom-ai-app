# Alpha.Mom E2E Test Report — v4 (Calendar Integration + Agent Intent Retest)

**Date:** 2026-03-29
**Tester:** Claude (automated E2E)
**Environment:** Production (mom.alphaspeedai.com → household-alpha-api.onrender.com)
**Test Account:** miguel.franco@gmail.com (trial tier)

---

## Executive Summary

Significant agent-level improvements since v3. The intent classifier and agent system prompts have been updated — agents now **correctly redirect out-of-domain requests** instead of answering them. This was the #1 systemic issue from the previous assessment. However, **Google Calendar integration is not syncing** and **Calendar Whiz remains non-functional**.

| Area | v3 Status | v4 Status |
|------|-----------|-----------|
| Auth flow | ✅ Working | ✅ Working |
| Dashboard | ✅ Working | ✅ Working |
| Google Calendar sync | ❌ Empty | ❌ Still empty — not connected |
| Calendar Whiz agent | ❌ Static only | ❌ Static + 503 errors |
| Grocery Guru (CRUD) | ❌ Broken | ✅ **FIXED** — adds items via LLM |
| Grocery Guru (LLM) | ✅ Excellent | ✅ Excellent |
| Budget Buddy (CRUD) | ❌ Static $0 | ❌ Still static $0 |
| Budget Buddy (LLM) | ✅ Good | ✅ Good |
| Self-Care Reminder | ✅ Excellent | ✅ Excellent |
| School Event Hub | ❌ 503 | ❌ Still 503 |
| Tier gating | ✅ Enforced | ✅ Enforced |
| **Agent boundaries** | **❌ Broken** | **✅ FIXED — agents redirect correctly** |

---

## 1. Google Calendar Integration — NOT WORKING ❌

### Findings

| Test | Result | Notes |
|------|--------|-------|
| Google Calendar (actual) | ✅ 8 events | Verified via Google Calendar MCP — events exist for Mar 22–Apr 4 |
| GET /api/calendar | ✅ 200 | Returns `{events: [], total: 0}` — no events synced |
| POST /api/calendar/sync/google | ✅ 200 | Returns `{synced: 0}` — sync runs but finds nothing |
| GET /api/integrations/google-calendar/status | ✅ 200 | Returns `{connected: false}` |
| POST /api/integrations/google-calendar/connect | ✅ 200 | Returns `{auth_url: "..."}` — OAuth flow available |
| Settings page UI | ⚠️ Bug | Shows "Connected" for Google Calendar, but API says `connected: false` |

### Root Cause

The Google Calendar OAuth connection has **not been completed** through the app. The backend has the integration endpoints (`/connect`, `/status`, `/calendars`, `/sync/google`), but the user hasn't gone through the OAuth consent flow specifically for calendar access. The app login uses Google OAuth for **authentication only** — calendar access requires a separate authorization.

### BUG-016 (P1): Settings UI shows Google Calendar as "Connected" when it is not

The Settings page under "Connected Accounts" displays Google Calendar with a "Connected" badge, but `/api/integrations/google-calendar/status` returns `{connected: false}`. The frontend appears to be showing a hardcoded or incorrect status.

**Impact:** Users will think their calendar is connected when it isn't, and won't know they need to complete the OAuth flow.

---

## 2. Agent Intent Routing — MAJOR IMPROVEMENT ✅

### What Changed (vs. v3 Assessment)

The three systemic issues identified in the v3 agent quality assessment have been **partially resolved**:

| Issue | v3 Status | v4 Status |
|-------|-----------|-----------|
| Intent classifier is agent-blind | ❌ Global routing | ✅ **FIXED** — routes to LLM with agent context |
| Static handlers pre-empt LLM | ❌ Intercepts everything | ⚠️ **Partially fixed** — Grocery Guru fixed, Calendar/Budget still static |
| LLM doesn't respect agent boundaries | ❌ Answers anything | ✅ **FIXED** — agents redirect to correct peer |

### Cross-Agent Confusion Tests — ALL PASSING ✅

| Test | Message | Sent To | v3 Result | v4 Result |
|------|---------|---------|-----------|-----------|
| X-1 | "How much did I spend on groceries?" | Self-Care | ❌ Static "$0.00" | ✅ Redirects to Budget Buddy |
| X-2 | "Add milk and eggs to my grocery list" | Budget Buddy | ❌ "Your list is empty" | ✅ "I can't help with grocery lists...Grocery Guru!" |
| X-3 | "Schedule a dentist appointment Tuesday" | Grocery Guru | ❌ "No upcoming events" | ✅ "I can't schedule—that's Calendar Whiz" |
| X-4 | "I feel stressed and exhausted" | Grocery Guru | ❌ Gave sleep tips | ✅ Redirects to Self-Care Reminder |
| SC-2 | "Chicken parmesan recipe?" | Self-Care | ❌ Gave full recipe | ✅ "That's Grocery Guru territory" |

**This is the single biggest improvement.** Every cross-agent test now correctly identifies the request as out-of-domain and redirects the user to the appropriate agent.

---

## 3. Agent-by-Agent Results

### Calendar Whiz ❌ STILL BROKEN

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| CW-1 | "What events do I have this week?" | calendar_crud | none | "You have no upcoming events" (static) |
| CW-2 | "Add dentist appointment Thursday 2pm" | — | none | **503 Database error** |
| CW-3 | "Soccer Mon/Wed conflicts with piano Mon 4:30" | — | none | **503 Database error** |

**Verdict:** Calendar Whiz is the worst-performing agent. View queries return the static empty response (because Google Calendar isn't synced). Create and conflict queries return 503 DB errors. This agent never reaches the LLM.

---

### Grocery Guru ✅ SIGNIFICANTLY IMPROVED

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| GG-1 | "Add milk, eggs, bread to my list" | intelligent | gpt-5.4-nano | ✅ **FIXED** — "Done—your grocery list now has: Milk, Eggs, Bread" |
| GG-2 | "Plan 5 weeknight dinners, no shellfish" | intelligent | gpt-5.4-nano | ✅ Excellent — asks about pantry items, dietary preferences |
| X-3 | "Schedule dentist appointment" | intelligent | gpt-5.4-nano | ✅ Correctly redirects to Calendar Whiz |
| X-4 | "I feel stressed and exhausted" | intelligent | gpt-5.4-nano | ✅ Correctly redirects to Self-Care Reminder |

**Verdict:** Grocery Guru is now fully functional. CRUD operations work via the LLM (no longer hitting the broken static handler). The agent stays in its lane and redirects off-topic requests appropriately. The `list_crud` intent classification issue appears to be fixed — requests now route to `intelligent`.

---

### Budget Buddy ⚠️ MIXED (improved boundaries, static handler persists)

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| BB-1 | "How much have I spent this month?" | payment_query | none | Static: "Monthly spending: $0.00, Trend: stable" |
| BB-2 | "I spent $120 at Target on household items" | intelligent | gpt-5.4 | ✅ Acknowledged and tracked expense |
| X-2 | "Add milk and eggs to my grocery list" | intelligent | gpt-5.4 | ✅ Correctly redirects to Grocery Guru |

**Verdict:** Agent boundaries are fixed — off-topic requests correctly redirect. But spending queries still hit the static `payment_query` handler returning $0.00 instead of routing to the LLM. Expense logging works when routed to LLM.

---

### Self-Care Reminder ✅ BEST AGENT (now stays in lane too)

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| SC-1 | "I feel overwhelmed and guilty" | intelligent | gpt-5.4-nano | ✅ Empathetic, actionable 3-minute reset exercise |
| SC-2 | "Chicken parmesan recipe?" | intelligent | gpt-5.4-nano | ✅ **FIXED** — redirects to Grocery Guru |
| X-1 | "How much on groceries this month?" | intelligent | gpt-5.4-nano | ✅ **FIXED** — redirects to Budget Buddy |

**Verdict:** Outstanding. Self-Care Reminder was already the best agent for in-domain quality. Now it also correctly redirects out-of-domain requests instead of answering them. Warm, empathetic, and actionable.

---

### School Event Hub ❌ STILL DOWN (503)

All requests return `"Database error — please try again shortly"` (HTTP 503). Same as v3.

---

### Tier-Gated Agents ✅ CORRECTLY BLOCKED

| Agent | Status | Response |
|-------|--------|----------|
| Sleep Tracker | 403 | "Agent 'sleep_tracker' requires a family subscription" |
| Health Hub | 403 | "Agent 'health_hub' requires a family subscription" |
| Tutor Finder | 403 | "Agent 'tutor_finder' requires a family subscription" |

All three correctly blocked for trial tier users on the `/api/chat` endpoint. This was fixed between v2 and v3 and remains working.

---

## 4. Bug Summary

### Resolved Since v3 ✅

| Bug | Description | Status |
|-----|-------------|--------|
| BUG-009 (partial) | Grocery Guru CRUD now works via LLM — "Add items" succeeds | ✅ Fixed |
| Agent-blind classifier | Cross-agent confusion eliminated — agents redirect correctly | ✅ Fixed |
| LLM boundary issue | Agents no longer answer out-of-domain questions | ✅ Fixed |

### Still Open

| Priority | Bug | Description |
|----------|-----|-------------|
| **P1** | BUG-016 | Settings UI shows Google Calendar "Connected" but API says `connected: false` |
| **P1** | BUG-006 | Calendar POST returns 503 — DB write operations failing |
| **P1** | — | Google Calendar OAuth flow not completed — events not syncing |
| **P2** | BUG-009 | Calendar Whiz still routes everything to `calendar_crud` static handler |
| **P2** | BUG-010 | Budget Buddy spending queries still hit static `payment_query` → $0.00 |
| **P2** | — | School Event Hub returns 503 on all requests |
| **P2** | BUG-007 | Stripe/subscription endpoints still missing |
| **P3** | BUG-008 | /openapi.json returns 500 |
| **P3** | BUG-014 | Markdown headers render as raw `###` in chat |

---

## 5. Agent Quality Scores (Updated)

| Agent | In-Domain LLM | Stays In Lane | CRUD Works | v3 Overall | v4 Overall |
|-------|---------------|---------------|------------|------------|------------|
| Calendar Whiz | N/A (never reaches LLM) | N/A | ❌ 503 | ❌ Broken | ❌ Broken |
| Grocery Guru | ★★★★★ | ✅ Redirects correctly | ✅ **Fixed** | ⚠️ Partial | ✅ **Working** |
| Budget Buddy | ★★★★ | ✅ Redirects correctly | ❌ Static $0 | ⚠️ Partial | ⚠️ Partial |
| School Event Hub | N/A (503) | N/A | N/A | ❌ 503 | ❌ 503 |
| Self-Care Reminder | ★★★★★ | ✅ **Fixed** — redirects | N/A | ⚠️ Partial | ✅ **Working** |
| Sleep Tracker | N/A | Tier-gated | N/A | ✅ Gated | ✅ Gated |
| Health Hub | N/A | Tier-gated | N/A | ✅ Gated | ✅ Gated |
| Tutor Finder | N/A | Tier-gated | N/A | ✅ Gated | ✅ Gated |

---

## 6. Recommended Next Steps (Priority Order)

1. **Complete Google Calendar OAuth flow** (P1) — The connect endpoint works and returns an auth_url. The UI needs to actually trigger this flow so users can authorize calendar access. Currently the Settings page falsely shows "Connected."
2. **Fix Settings page status** (P1) — Pull actual connection status from `/api/integrations/google-calendar/status` instead of showing hardcoded "Connected."
3. **Fix Calendar Whiz routing** (P2) — Like Grocery Guru was fixed, Calendar Whiz needs its intent classifier updated so planning/creation requests route to the LLM instead of the static `calendar_crud` handler.
4. **Fix Calendar DB writes** (P1) — Event creation returns 503. Debug the DB schema/permissions for calendar write operations.
5. **Fix Budget Buddy static handler** (P2) — Spending queries should route to LLM for analysis, not return static $0.00.
6. **Fix School Event Hub 503** (P2) — DB query is broken for this agent.
7. **Implement Stripe endpoints** (P2) — Required before launch.

---

## 7. What's Working Well

1. **Agent boundaries are fixed** — the biggest systemic issue from v3 is resolved. All tested agents correctly redirect out-of-domain requests.
2. **Grocery Guru is now fully functional** — both CRUD and LLM paths work correctly.
3. **Self-Care Reminder** remains outstanding and now stays in its lane.
4. **Tier gating** is correctly enforced on `/api/chat`.
5. **Auth flow** is solid — signup, login, JWT, profile all work.
6. **LLM quality** remains excellent when agents reach it (gpt-5.4-nano, gpt-5.4).
7. **Frontend deployment** is stable — properly connected to Render backend.
