# Co-Work Agent Testing Guide — Alpha.Mom

**Date:** 2026-03-30 (memory, Second Brain, viral growth & Stripe promo signup)
**Version:** 1.2
**Audience:** Cowork backend developers testing the family_platform AI layer
**Environment:** `household-alpha-api.onrender.com` (production) or `localhost:8000` (local)

**Related spec (backend work list):** `mom-alpha/BACKEND-CHANGES.md` — implement and test against that document in the Cowork repo (`family_platform/`, `mom_alpha/`).

---

## Overview

This guide defines the expected behavior for all 8 Mom.alpha agents — covering intent classification, LLM routing decisions, required system prompt constraints, expected reply patterns, quick actions, and cross-agent boundary enforcement. Use it as the acceptance criteria for every backend agent change.

The frontend sends a single `POST /api/chat` request and renders whatever comes back. It does not know or care about the agent's internal routing — it just displays `content` and renders `quick_actions` as chips. All correctness lives in the backend.

**Second Brain (2026-03):** The PWA now ships a local-first memory layer, daily brief, quick capture, shared inbox UI, and injects optional `memory_context` on every chat. The backend must accept that payload without error, fold it into prompts when present, and may return `memory_hints` for higher-quality on-device memory. Shared inbox sync requires new household inbox APIs — see `BACKEND-CHANGES.md` and [Second Brain: what Co-Work must test now](#second-brain-what-co-work-must-test-now).

**Viral growth & Stripe promos (2026-03):** The PWA includes a referral loop (`/referral`, dashboard banner), share links, weekly win sharing, and `POST /api/analytics/viral-event` tracking. Signup accepts an optional Stripe **promotion code** (`promotion_code` on `POST /api/auth/signup`), deep-linked via `/signup?promo=CODE` and persisted in `localStorage` (`mom-alpha-promo-code`) for checkout. Settings validates codes via Stripe and passes `promotion_code` into `POST /api/stripe/checkout`. See [Growth, referrals, and Stripe promo codes](#growth-referrals-and-stripe-promo-codes).

---

## Second Brain: what Co-Work must test now

Use this as the **current** acceptance layer on top of the per-agent sections below. The frontend types are canonical: `mom-alpha/src/types/api-contracts.ts` (`ChatRequest`, `ChatResponse`, `MemoryContextItem`).

### A. `POST /api/chat` — memory fields

| Area | What to verify |
|------|----------------|
| **Request tolerance** | Backend accepts requests with or without `memory_context`. Missing field = same behavior as before. Extra unknown fields should follow existing API policy (`extra` handling). |
| **`memory_context` shape** | Each item: `category` (string), `content` (string), `pinned` (boolean). Frontend caps ~20 items; backend should truncate or prioritize if more arrive. |
| **Prompt injection** | When `memory_context` is non-empty, facts appear in the model context (pinned first), and agent replies reflect them when relevant (e.g. allergy, routine). |
| **No server persistence of device memory** | Memory context is ephemeral per request — do not require DB writes for `memory_context` itself. |
| **`memory_hints` response** | Optional array of `{ "category", "content" }`. When implemented, hints should be distinct facts worth saving, not full message echo. Frontend merges hints with local regex extraction. |
| **Regression** | All existing agent tests still pass when `memory_context` is omitted. |

**Manual / integration ideas:** Send the same prompt with empty vs populated `memory_context` (e.g. pinned `"Jake is allergic to peanuts"`) and confirm the answer changes appropriately for Grocery Guru / Health Hub.

### B. Shared household inbox — APIs (when implemented)

Until `BACKEND-CHANGES.md` is implemented, the inbox is local-only in the PWA. After deploy, test:

| Endpoint | Verify |
|----------|--------|
| `GET /api/household/{household_id}/inbox` | Authz for household members; shape matches spec; ordering (active first); stale completed items filtered per spec. |
| `POST /api/household/{household_id}/inbox` | `created_by` from JWT; optional `assigned_agent`, `assigned_to`. |
| `PUT /api/household/{household_id}/inbox/{item_id}` | Status transitions, `agent_response` updates. |
| `DELETE .../inbox/{item_id}` | 204; both parents can delete per spec. |
| **Co-parent** | Two operators in one household see the same items after sync. |

### C. `GET /api/household/{household_id}/members`

Frontend uses this for delegate pickers (inbox, capture). Confirm response includes `operator_id`, `name`, `email`, `role`, `parent_brand`, `membership_status` as in `BACKEND-CHANGES.md`.

### D. Priority order for Co-Work QA

1. **P0:** Chat accepts `memory_context` without 4xx/5xx; prompt uses it when present.  
2. **P1:** `memory_hints` emitted where extraction is implemented; valid JSON shape.  
3. **P1:** Inbox CRUD + cross-user visibility (after migration + routes ship).  
4. **P2:** Push / notifications when `assigned_to` is set (if in scope).

---

## Growth, referrals, and Stripe promo codes

Canonical types: `mom-alpha/src/types/api-contracts.ts` — `AuthSignupRequest`, `PromotionValidateResponse`, `CheckoutTrialRequest`, `ReferralInfo`, `ReferralRedeemRequest`, `ViralEvent`, share link types.

### A. Signup + promo (email path)

| Area | What to verify |
|------|----------------|
| **`POST /api/auth/signup`** | Request body may include optional `promotion_code` (string). Omitted = unchanged behavior. Present = backend associates Stripe promotion / referral logic per product rules. |
| **Case normalization** | Frontend uppercases promo for signup and storage; backend should accept consistent matching (document whether codes are case-sensitive). |
| **Deep link** | `/signup?promo=LAUNCH2026` pre-fills the signup promo field (`signup/page.tsx`). |
| **`localStorage`** | After consent on signup with a code, client stores `mom-alpha-promo-code` for reuse on Settings → checkout (`AuthForm` + `settings/page.tsx`). |

**Note:** Google OAuth signup on the client does not currently send `promotion_code` in the same way as email signup — if parity is required, track as a product gap.

### B. Stripe validation + checkout

| Endpoint | What to verify |
|----------|----------------|
| `GET /api/stripe/validate-promotion-code?code=` | Returns `PromotionValidateResponse`: `valid`, `percent_off` / `amount_off`, `duration`, `name`. Invalid codes: `valid: false` without 5xx. |
| `POST /api/stripe/checkout` | Body may include optional `promotion_code`. When present, Stripe Checkout session applies discount per Stripe Dashboard promotion settings. |

### C. Referral engine

| Endpoint | What to verify |
|----------|----------------|
| `GET /api/referral` (auth) | Returns `ReferralInfo`: `referral_code`, `referral_url`, `friends_invited`, `friends_joined`, `reward_weeks_earned`, `reward_weeks_used`. Powers `/referral` (“Give 2 Weeks, Get 2 Weeks”). |
| `POST /api/referral/redeem` | Body `{ "referral_code": "..." }`. Used when a new user redeems a friend’s code; response `ReferralRedeemResponse` with `success`, `reward_weeks`, `message`. Test idempotency / duplicate redeem. |

### D. Viral analytics (fire-and-forget)

| Endpoint | What to verify |
|----------|----------------|
| `POST /api/analytics/viral-event` (auth) | Body: `event_type` ∈ `share_win_card` \| `share_link` \| `referral_send` \| `caregiver_invite` \| `template_share` \| `emergency_activate`, plus `metadata` object. Should return 2xx even if analytics pipeline is best-effort; must not block UX. |

**Frontend call sites (smoke):** referral share (`/referral`), `ShareButton`, `WinCardRenderer`, caregiver invite flow, template create, emergency sheet — all call `api.viral.track`.

### E. Share links (deep links)

| Endpoint | What to verify |
|----------|----------------|
| `POST /api/household/{household_id}/share` | Creates share for `item_type` ∈ `grocery_list` \| `calendar_event` \| `task` \| `win_card` + `item_id`; returns `share_url`, `share_token`, `expires_at`. |
| `GET /api/share/{token}` | Public or semi-public preview: `SharePreviewResponse` (`title`, `preview_data`, `household_name`, `sharer_name`, …). |

### F. Co-Work QA priority (growth)

1. **P0:** Signup with and without `promotion_code`; invalid code returns clear 4xx with message surfaced in `AuthForm`.  
2. **P0:** `validate-promotion-code` + checkout with valid Stripe promotion — discount appears on Stripe hosted page.  
3. **P1:** Referral fetch + share flow; redeem path credits both sides per business rules.  
4. **P1:** `viral-event` accepts all `event_type` values without 500.  
5. **P2:** Share create + preview token expiry and authorization.

---

## API Contract Reference

### Request — `POST /api/chat`

```json
{
  "household_id": "uuid",
  "agent_type": "calendar_whiz",
  "message": "What events do I have this week?",
  "media_urls": [],
  "memory_context": [
    { "category": "family_fact", "content": "Jake is allergic to peanuts", "pinned": true }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `household_id` | UUID string | ✅ | Identifies the family context |
| `agent_type` | `AgentType` | ✅ | One of 8 valid values — see below |
| `message` | string | ✅ | User's raw text input |
| `media_urls` | string[] | ❌ | Optional image/file attachments (OCR, receipts) |
| `memory_context` | `MemoryContextItem[]` | ❌ | On-device memory injected by PWA; see [Second Brain](#second-brain-what-co-work-must-test-now) |

### Response — `ChatResponse`

```json
{
  "message_id": "msg_abc123",
  "agent_type": "calendar_whiz",
  "content": "You have 3 events this week...",
  "intent_type": "calendar_crud",
  "model_used": "gpt-5.4-nano",
  "tokens_used": 312,
  "quick_actions": [
    { "label": "Add event", "action": "create_event", "payload": {} }
  ],
  "task_id": null,
  "memory_hints": [
    { "category": "important_date", "content": "School play is Friday 6pm" }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `message_id` | string | Unique ID for this response |
| `agent_type` | `AgentType` | Must echo back the agent that responded |
| `content` | string | The agent's reply. Supports markdown. |
| `intent_type` | `IntentType` | What the classifier decided |
| `model_used` | string \| null | `null` for deterministic ops (no LLM used) |
| `tokens_used` | number \| null | `null` for deterministic ops |
| `quick_actions` | `QuickAction[]` | 0–4 chips shown below the message |
| `task_id` | string \| null | Set if a background task was created |
| `memory_hints` | `{ category, content }[]` \| omitted | Optional; PWA persists locally. See [Second Brain](#second-brain-what-co-work-must-test-now) |

### Valid `AgentType` Values

```
calendar_whiz | grocery_guru | budget_buddy | school_event_hub
tutor_finder  | health_hub   | sleep_tracker | self_care_reminder
```

### Valid `IntentType` Values

```
calendar_crud | list_crud | reminder_set | status_query
streak_log    | payment_query | filter_search | intelligent
```

### `QuickAction` Shape

```json
{ "label": "Add to calendar", "action": "create_event", "payload": { "title": "Dentist", "start_at": "..." } }
```

The `action` string is consumed by the frontend to know which API call to make when the chip is tapped. Use consistent action names per domain (see per-agent sections below).

---

## Intent Classification Rules

The intent classifier must receive **both** `message` and `agent_type`. The agent_type gates which intents are legal for a given agent — preventing a grocery list message from triggering the calendar handler when sent to Budget Buddy.

### Intent → Handler Routing

| Intent | Handler | LLM Called? |
|--------|---------|-------------|
| `calendar_crud` | Calendar handler (fetch/create events) | **No** for simple reads; **Yes** for planning/conflict/natural language event creation |
| `list_crud` | List handler (fetch/add/remove items) | **No** for simple reads; **Yes** for meal planning and complex list requests |
| `payment_query` | Expense/budget handler | **No** for raw totals; **Yes** for analysis, advice, trends |
| `reminder_set` | Reminder handler | **No** for direct set; **Yes** for scheduling advice |
| `streak_log` | Streak handler | **No** for simple log; **Yes** for insights and coaching |
| `status_query` | Data fetch handler | **No** for simple status; **Yes** for trend analysis |
| `filter_search` | Search handler | **Yes** always — LLM formats and enriches results |
| `intelligent` | LLM only | **Yes** always |

### Critical Rule: Agent-Scoped Intent Classification

> **The intent classifier must never route a message to a handler outside the receiving agent's domain.**

If `agent_type = "budget_buddy"` and `message = "Add milk to my list"`, the classifier must:
1. Recognize this is a grocery/list intent — outside Budget Buddy's domain
2. Route to `intelligent` with Budget Buddy's system prompt
3. The LLM (using Budget Buddy's system prompt) says: _"I'm your Budget Buddy — I track spending and budgets, not grocery lists. Tap Grocery Guru to manage your list!"_

**Do NOT** fire the `list_crud` handler for a message sent to Budget Buddy.

---

## Per-Agent Specifications

---

### 1. Calendar Whiz

**`agent_type:`** `calendar_whiz`
**Tier required:** `trial`
**Domain:** Family calendar management, scheduling, conflict detection

#### System Prompt Requirements

```xml
<persona>
You are Calendar Whiz, the scheduling expert for Alpha.Mom. You help busy moms manage the family calendar, detect conflicts, plan ahead, and create events efficiently.
</persona>
<scope>
ONLY handle calendar, scheduling, and time-management topics. If asked about groceries, budgets, health, school, tutors, sleep, or self-care — acknowledge briefly and redirect: "For [topic], tap [Agent Name] on the dashboard!"
</scope>
<output_format>
- Lead with the key calendar insight or action taken
- Use bullet points for event lists
- Include exact dates and times
- Offer a quick action (add event, view week, set reminder) at the end
</output_format>
<few_shot_examples>
User: "What's on this week?"
Assistant: "Here's your week at a glance:
• Mon 3/30 – Soccer practice, 4pm (Ethan)
• Tue 3/31 – Piano lesson, 4:30pm (Emma)
• Thu 4/2 – Dentist, 10am (Mom)
No conflicts detected ✓"

User: "Add dentist Tuesday 2pm"
Assistant: "Done! I've added **Dentist** for Tuesday, April 1 at 2:00 PM. Want me to set a reminder the day before?"
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "What events do I have this week?" | `calendar_crud` | ✅ Yes | Fetches events from DB, LLM formats into readable summary |
| "Add dentist appointment Tuesday 2pm" | `calendar_crud` | ✅ Yes | LLM extracts event details, creates event via API, confirms |
| "Do I have any conflicts next week?" | `intelligent` | ✅ Yes | Fetches events, LLM analyzes overlaps |
| "Soccer Mon/Wed conflicts with piano Mon 4:30" | `intelligent` | ✅ Yes | LLM flags Mon 4pm conflict, suggests resolution |
| "Plan a week where kids have no conflicts" | `intelligent` | ✅ Yes | LLM reviews full week, identifies gaps |
| "What's on today?" | `calendar_crud` | ✅ Yes | Fetches today's events, LLM formats |
| "How much did I spend this month?" | `intelligent` | ✅ Yes | LLM responds: "That's Budget Buddy's job! Tap Budget Buddy →" |

> **Key fix from v3 report:** Calendar Whiz must reach the LLM. Do NOT return static "You have no upcoming events" for planning or creation requests.

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| After showing event list | `[{ label: "Add event", action: "create_event" }, { label: "View month", action: "view_calendar" }]` |
| After creating event | `[{ label: "Set reminder", action: "reminder_set", payload: { event_id: "..." } }, { label: "View event", action: "view_event" }]` |
| After detecting conflict | `[{ label: "Fix conflict", action: "resolve_conflict" }, { label: "View week", action: "view_calendar" }]` |
| Empty calendar | `[{ label: "Add first event", action: "create_event" }]` |

#### Known Bugs to Verify Fixed (from BUG-009)
- [ ] `POST /api/calendar` — 503 DB write error must be resolved before event creation works
- [ ] Intent classifier must not classify ALL calendar messages as `calendar_crud` static read — planning requests must reach LLM
- [ ] Conflict detection ("Soccer Mon/Wed conflicts with piano Mon 4:30") must return non-empty response

---

### 2. Grocery Guru

**`agent_type:`** `grocery_guru`
**Tier required:** `trial`
**Domain:** Grocery lists, meal planning, recipe suggestions, food substitutions

#### System Prompt Requirements

```xml
<persona>
You are Grocery Guru, Alpha.Mom's kitchen and meal planning expert. You help moms manage grocery lists, plan weekly meals, find recipes, handle dietary restrictions, and suggest substitutions.
</persona>
<scope>
ONLY handle food, groceries, recipes, meal planning, and kitchen topics. Redirect anything else to the appropriate agent with a warm handoff line.
</scope>
<output_format>
- For meal plans: use numbered days with bullet items
- For recipes: ingredients list + numbered steps
- For grocery lists: categorized (produce, dairy, pantry, meat)
- Always ask about dietary restrictions before generating a full meal plan
</output_format>
<few_shot_examples>
User: "Add milk, eggs, bread"
Assistant: "Added to your list! 🛒
• Milk
• Eggs
• Bread
Your list now has 3 items. Anything else to add?"

User: "Plan 5 weeknight dinners, no shellfish"
Assistant: "Here's your shellfish-free weeknight plan:
**Monday:** Chicken stir-fry with rice
**Tuesday:** Pasta bolognese
**Wednesday:** Sheet pan salmon + roasted veggies
**Thursday:** Turkey tacos
**Friday:** Veggie pizza night

Want me to generate the grocery list for all 5 meals?"
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "Add milk, eggs, bread to my list" | `list_crud` | ✅ Yes | LLM extracts items, calls list API to add them, confirms |
| "What's on my grocery list?" | `list_crud` | ❌ No | Fetches list from DB, formats inline (no LLM needed for simple read) |
| "Remove bread from my list" | `list_crud` | ✅ Yes | LLM identifies item, calls remove API, confirms |
| "Plan 5 weeknight dinners, no shellfish" | `intelligent` | ✅ Yes | Full LLM meal plan with allergy awareness |
| "Substitute for heavy cream?" | `intelligent` | ✅ Yes | LLM provides substitutions |
| "Schedule dentist Tuesday 2pm" | `intelligent` | ✅ Yes | LLM redirects: "That's a Calendar Whiz task!" |
| "What's a good chicken parm recipe?" | `intelligent` | ✅ Yes | LLM provides recipe (this IS in-domain for Grocery Guru) |

> **Key fix from v3 report (BUG-011):** "Add milk, eggs, bread" must actually add items to the list and confirm. Currently returns "Your list is empty" — static handler runs without the add operation.

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| After adding items | `[{ label: "View full list", action: "view_list" }, { label: "Clear checked items", action: "clear_checked" }]` |
| After meal plan | `[{ label: "Generate grocery list", action: "generate_grocery_list" }, { label: "Save meal plan", action: "save_meal_plan" }]` |
| Empty list | `[{ label: "Add items", action: "add_items" }, { label: "Plan this week's meals", action: "plan_meals" }]` |

---

### 3. Budget Buddy

**`agent_type:`** `budget_buddy`
**Tier required:** `trial`
**Domain:** Expense tracking, monthly budgets, spending analysis, receipt logging

#### System Prompt Requirements

```xml
<persona>
You are Budget Buddy, Alpha.Mom's friendly financial assistant. You help moms track expenses, analyze spending patterns, set budgets, and make sense of where the family money goes — without judgment.
</persona>
<scope>
ONLY handle money, budgets, expenses, bills, and financial topics. Redirect other questions warmly: "That's outside my budget! Try [Agent] for that."
</scope>
<output_format>
- Lead with the key financial insight
- Use currency formatting ($XX.XX)
- For spending analysis: use category breakdown
- Frame suggestions positively (opportunities, not failures)
- Never shame spending choices
</output_format>
<few_shot_examples>
User: "How much have I spent this month?"
Assistant: "Here's March so far: **$1,847.32**
Top categories:
• Groceries: $423.10 (23%)
• Gas: $187.40 (10%)
• Kids activities: $156.00 (8%)
You're 78% through the month with 22 days of data. On track!"

User: "Set a grocery budget of $400"
Assistant: "Budget set! 🎯 $400/month for groceries.
You've spent $423.10 so far this month — just $23.10 over.
Want me to send a heads-up when you hit 80% next month?"
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "How much have I spent this month?" | `payment_query` | ✅ Yes | Fetches expense summary, LLM formats with insight |
| "Top spending categories this month?" | `payment_query` | ✅ Yes | Fetches by_category data, LLM analyzes and ranks |
| "Set a monthly grocery budget of $600" | `intelligent` | ✅ Yes | LLM acknowledges, stores budget preference, confirms |
| "I spent $85 at Costco on groceries" | `intelligent` | ✅ Yes | LLM confirms, creates expense record, updates total |
| "Add milk to my list" | `intelligent` | ✅ Yes | LLM redirects: "I track spending, not lists! Tap Grocery Guru →" |
| "Am I overspending on eating out?" | `intelligent` | ✅ Yes | LLM analyzes dining vs total, gives contextual advice |

> **Key fix from v3 report (BUG-010):** `payment_query` must call the LLM with real expense data. Returning a static "$0.00" is only acceptable when the household truly has $0 in expenses AND the LLM acknowledges that ("No expenses logged yet — want to add one?").

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| After spending summary | `[{ label: "Scan receipt", action: "scan_receipt" }, { label: "Add expense", action: "add_expense" }]` |
| After expense logged | `[{ label: "View this month", action: "view_month" }, { label: "Set category budget", action: "set_budget" }]` |
| Over budget warning | `[{ label: "See breakdown", action: "view_breakdown" }, { label: "Adjust budget", action: "set_budget" }]` |

---

### 4. School Event Hub

**`agent_type:`** `school_event_hub`
**Tier required:** `trial`
**Domain:** Permission slips, school events, fee payments, school calendar, field trips

#### System Prompt Requirements

```xml
<persona>
You are School Event Hub, Alpha.Mom's school organizer. You help moms track permission slips, school fees, field trips, events, and the school year calendar so nothing falls through the cracks.
</persona>
<scope>
ONLY handle school-related topics: permission slips, school events, fees, grades, homework reminders, teacher communications. Redirect non-school topics warmly.
</scope>
<output_format>
- Lead with urgency (overdue slips first, upcoming deadlines next)
- Use due dates prominently
- Flag anything requiring payment with 💰
- Offer one-tap signing for permission slips
</output_format>
<few_shot_examples>
User: "What slips do I need to sign?"
Assistant: "You have 2 pending slips:

⚠️ **Science Museum Trip** — due Friday 4/4 (💰 $12 fee)
📋 **Spring Concert permission** — due Friday 4/11 (no fee)

Want me to sign them now?"

User: "Set up a weekly school check-in"
Assistant: "Done! I'll check in every Sunday evening for upcoming slips, events, and deadlines for the week ahead. Your first check-in is this Sunday at 7pm."
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "What slips do I need to sign?" | `status_query` | ✅ Yes | Fetches pending slips, LLM formats with urgency ordering |
| "Sign the field trip slip for Emma" | `intelligent` | ✅ Yes | LLM identifies slip, calls `slips.sign()`, confirms |
| "What school events are coming up?" | `status_query` | ✅ Yes | Fetches events from DB, LLM summarizes |
| "Set up weekly school check-in reminders" | `reminder_set` | ✅ Yes | LLM creates recurring reminder, confirms |
| "Emma has a science test Thursday" | `intelligent` | ✅ Yes | LLM creates calendar event or reminder, asks which |

> **Known issue (BUG-004 variant):** Intermittent 503 DB errors. Verify the `permission_slips` table schema matches the `PermissionSlip` type before testing.

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| Pending slips exist | `[{ label: "Sign all", action: "sign_all_slips" }, { label: "View slip", action: "view_slip", payload: { slip_id: "..." } }]` |
| Signed slip | `[{ label: "Pay fee", action: "pay_slip_fee", payload: { slip_id: "...", amount: 12 } }, { label: "View receipts", action: "view_expenses" }]` |
| No pending slips | `[{ label: "View upcoming events", action: "view_calendar" }, { label: "Set check-in reminder", action: "reminder_set" }]` |

---

### 5. Tutor Finder

**`agent_type:`** `tutor_finder`
**Tier required:** `family`
**Domain:** Finding tutors, booking sessions, subject matching, tutor reviews

#### System Prompt Requirements

```xml
<persona>
You are Tutor Finder, Alpha.Mom's education matchmaker. You help moms find qualified tutors for their kids based on subject, grade level, schedule, and budget — and help book sessions.
</persona>
<scope>
ONLY handle tutoring, academic support, learning resources, and educational services. Redirect non-education topics.
</scope>
<output_format>
- Present tutor matches in a scannable card format: name, subject, rate, rating
- Always ask for grade level and subject if not provided
- Include availability and booking info
</output_format>
<few_shot_examples>
User: "Find a math tutor for 4th grade"
Assistant: "Here are top math tutors for 4th grade near you:

**Sarah M.** — Math K-6 | $45/hr | ⭐ 4.9 (87 reviews)
Available: Mon/Wed/Fri after 3pm

**James T.** — Elementary Math | $38/hr | ⭐ 4.7 (43 reviews)
Available: Tue/Thu evenings

Want to book a trial session with either?"
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "Find a math tutor for 4th grade" | `filter_search` | ✅ Yes | LLM formats search results with tutor cards |
| "Find tutors under $50/hr near me" | `filter_search` | ✅ Yes | LLM filters and presents matches |
| "Book James T for Tuesday 5pm" | `intelligent` | ✅ Yes | LLM handles booking flow |
| "What tutors are available this week?" | `filter_search` | ✅ Yes | LLM fetches availability and formats |

> **Key fix from v3 report (BUG-012):** `filter_search` must return tutor results, NOT just "What would you like to search for?" — the LLM must both ask for context AND use whatever context is already in the message.

---

### 6. Health Hub

**`agent_type:`** `health_hub`
**Tier required:** `family`
**Domain:** Family health tracking, medical appointments, medication reminders, wellness goals

#### System Prompt Requirements

```xml
<persona>
You are Health Hub, Alpha.Mom's family health coordinator. You help moms track medical appointments, log medications, manage health goals, and keep the family's health information organized.
</persona>
<scope>
ONLY handle health, medical appointments, medications, and wellness topics. Do NOT provide medical diagnoses or replace professional medical advice — always recommend consulting a doctor for medical decisions.
</scope>
<output_format>
- Flag overdue checkups or upcoming appointments
- Use clear, non-medical language
- Always add a disclaimer for any health advice: "This is for tracking purposes — consult your doctor for medical decisions."
- Quick actions for scheduling appointments
</output_format>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "Schedule Emma's annual checkup" | `intelligent` | ✅ Yes | LLM creates calendar event, optionally sets reminder |
| "Add Ethan's allergy medication reminder" | `reminder_set` | ✅ Yes | LLM creates recurring medication reminder |
| "What health appointments are coming up?" | `status_query` | ✅ Yes | Fetches health-tagged calendar events, LLM summarizes |
| "Are Emma's vaccines up to date?" | `intelligent` | ✅ Yes | LLM checks logged records, recommends verifying with doctor |

---

### 7. Sleep Tracker

**`agent_type:`** `sleep_tracker`
**Tier required:** `family`
**Domain:** Sleep logging, sleep quality analysis, bedtime routines, patterns across family members

#### System Prompt Requirements

```xml
<persona>
You are Sleep Tracker, Alpha.Mom's rest and recovery coach. You help moms log sleep for themselves and their family, analyze patterns, and build healthier bedtime routines.
</persona>
<scope>
ONLY handle sleep, rest, bedtime routines, and fatigue topics. Redirect other questions.
</scope>
<output_format>
- Use conversational, warm tone (sleep is personal)
- Present data as patterns and trends, not just numbers
- Offer actionable bedtime routine suggestions
- Always ask which family member if the message is ambiguous
</output_format>
<few_shot_examples>
User: "I slept 6 hours last night, woke up twice"
Assistant: "Logged! 6 hours with 2 wake-ups — that puts quality at 'fair.'
Your 7-day average is 6.8 hours. You're close to the 7-hour target!
Tip: Try keeping your phone out of the bedroom for the first week — it can reduce those midnight wake-ups significantly."
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "I slept 6 hours last night" | `streak_log` | ✅ Yes | Parses sleep data, logs entry, LLM gives quality feedback |
| "Log Emma: bed 8:30pm, up 7am, great sleep" | `streak_log` | ✅ Yes | LLM extracts member + times + quality, logs entry |
| "What's my sleep pattern this week?" | `status_query` | ✅ Yes | Fetches history, LLM analyzes weekly_pattern |
| "How much does Emma usually sleep?" | `status_query` | ✅ Yes | Fetches history for Emma, LLM summarizes avg |
| "Tips for getting the kids to sleep earlier" | `intelligent` | ✅ Yes | LLM gives bedtime routine advice in context of logged patterns |

#### `SleepLogRequest` Fields to Extract from Message

```
sleep_at: ISO datetime (bedtime)
wake_at: ISO datetime (wake time)
quality: "great" | "good" | "fair" | "poor"
member_id: optional (null = the mom/user)
notes: optional
```

**Parsing rules:**
- "slept 6 hours last night" → calculate `sleep_at` as 11pm, `wake_at` as 5am (or ask for clarification)
- "went to bed at 10, up at 6:30" → `sleep_at: 22:00`, `wake_at: 06:30`
- Quality inferred: "woke up twice" → `"fair"`, "slept great" → `"great"`, "couldn't sleep" → `"poor"`

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| After logging sleep | `[{ label: "View this week", action: "view_sleep_history" }, { label: "Log another member", action: "log_sleep" }]` |
| After showing history | `[{ label: "Log tonight", action: "log_sleep" }, { label: "Set bedtime reminder", action: "reminder_set" }]` |

---

### 8. Self-Care Reminder

**`agent_type:`** `self_care_reminder`
**Tier required:** `trial`
**Domain:** Mom's personal wellness, stress management, self-care scheduling, defeating mom guilt

#### System Prompt Requirements

```xml
<persona>
You are Self-Care Reminder, Alpha.Mom's personal wellness coach. You help moms make time for themselves, manage stress, overcome mom guilt, and build sustainable self-care habits — even in just 5 minutes.
</persona>
<scope>
ONLY handle personal wellness, stress, self-care, mental health check-ins, and mindfulness. If asked about groceries, budgets, or other household logistics, redirect warmly to the appropriate agent.
</scope>
<tone>
Warm, empathetic, non-judgmental. Never dismiss how busy they are. Validate first, then suggest. Self-care is not a luxury — frame it as essential maintenance.
</tone>
<output_format>
- Validate the user's feeling in the first sentence
- Offer 2–3 concrete options at different time scales (2 min, 10 min, 30 min)
- End with one small, actionable step right now
- Never suggest things that require significant money or time
</output_format>
<few_shot_examples>
User: "I'm so busy I forgot to eat lunch"
Assistant: "Oh no — that happens so fast when you're running on all cylinders. 💛
Even a quick fix counts right now:
• **2 min:** Grab a handful of nuts or a banana, eat while you walk
• **10 min:** Make a simple toast + peanut butter, sit for even one bite
• **30 min:** Pause for a real lunch — your to-do list will still be there

What do you have on hand right now?"

User: "I feel guilty taking time for myself"
Assistant: "That feeling is so common — and so understandable. But here's the truth: you can't pour from an empty cup.
Self-care isn't selfish — it's how you stay capable for everyone who needs you.

Try this: one small act, just for you, in the next 5 minutes:
• Close your eyes and take 5 deep breaths
• Step outside for 2 minutes of sunshine
• Make your favorite tea or coffee and drink it without multitasking

Which one feels possible right now?"
</few_shot_examples>
```

#### Intent Routing Matrix

| User Message | Expected Intent | LLM Called? | Expected Behavior |
|-------------|----------------|-------------|-------------------|
| "I'm stressed and overwhelmed" | `intelligent` | ✅ Yes | Warm LLM response with concrete 2/10/30 min options |
| "I forgot to eat lunch" | `intelligent` | ✅ Yes | Empathetic response with quick actionable suggestions |
| "Set a 10-min walk reminder at 2pm" | `reminder_set` | ✅ Yes | LLM creates `SelfCareReminder`, confirms |
| "I feel guilty taking time for myself" | `intelligent` | ✅ Yes | LLM addresses mom guilt directly |
| "What self-care reminders do I have?" | `status_query` | ✅ Yes | Fetches reminders, LLM formats with context |
| "Snooze my 2pm reminder for an hour" | `reminder_set` | ✅ Yes | Updates `snoozed_until`, confirms |
| "What's a good chicken parm recipe?" | `intelligent` | ✅ Yes | LLM says: "Sounds delicious! For recipes, Grocery Guru is your go-to — tap the dashboard to find them!" **Should NOT give the recipe.** |
| "How much did I spend on groceries?" | `intelligent` | ✅ Yes | LLM redirects: "Budget Buddy tracks your spending — I keep track of *you*! 💛" |

> **Key fix from v3 report:** Self-Care MUST redirect out-of-domain queries. Giving a chicken parm recipe from Self-Care (BUG from agent quality assessment) is wrong. The agent system prompt boundary must hold.

#### `SelfCareCreateRequest` Fields to Extract

```
title: string (from message: "10-min walk", "yoga", "tea break")
category: "relaxation" | "exercise" | "social" | "hobby" | "rest" | "custom"
remind_at: ISO datetime (parse from message)
recurring: boolean (default false)
recurrence_days: int[] (0=Sun..6=Sat) if recurring
```

**Category inference:**
- "walk", "yoga", "gym", "workout" → `"exercise"`
- "tea", "bath", "reading", "nap" → `"relaxation"`
- "call mom", "lunch with friend" → `"social"`
- "painting", "gardening" → `"hobby"`
- "early bed", "rest" → `"rest"`
- Anything else → `"custom"`

#### Expected Quick Actions

| Scenario | Quick Actions |
|----------|-------------|
| After empathetic response | `[{ label: "Set reminder", action: "create_reminder" }, { label: "View my reminders", action: "view_reminders" }]` |
| After creating reminder | `[{ label: "Mark complete", action: "complete_reminder", payload: { id: "..." } }, { label: "Snooze 1hr", action: "snooze_reminder", payload: { id: "...", hours: 1 } }]` |
| After showing reminders list | `[{ label: "Add self-care time", action: "create_reminder" }, { label: "View streak", action: "view_streak" }]` |

---

## Cross-Agent Confusion Test Suite

These tests verify the agent boundary enforcement system. **Every test should pass.** If a wrong handler responds or the LLM answers out of domain, the classifier or system prompt needs fixing.

| Test ID | Message | Agent Receiving | Expected Behavior | Pass Criteria |
|---------|---------|----------------|-------------------|---------------|
| CA-01 | "Add milk and eggs to my list" | Budget Buddy | Redirects: "I track spending, not lists! Tap Grocery Guru →" | Does NOT fire `list_crud` handler |
| CA-02 | "Schedule a dentist appointment Tuesday 2pm" | Grocery Guru | Redirects: "That's a Calendar Whiz task!" | Does NOT fire `calendar_crud` handler |
| CA-03 | "How much did I spend on groceries this month?" | Self-Care Reminder | Redirects to Budget Buddy | Does NOT fire `payment_query` handler |
| CA-04 | "What's a good chicken parm recipe?" | Self-Care Reminder | Redirects to Grocery Guru | Does NOT give the recipe |
| CA-05 | "I couldn't sleep last night" | Grocery Guru | Brief empathy + redirects to Sleep Tracker | Does NOT give sleep advice beyond the redirect |
| CA-06 | "Feeling stressed and overwhelmed" | Budget Buddy | Acknowledges feeling, ties to finances if relevant, does NOT give full self-care coaching | LLM response mentions Budget Buddy domain |
| CA-07 | "Add soccer practice every Monday at 4pm" | Grocery Guru | Redirects to Calendar Whiz | Does NOT fire `calendar_crud` or `list_crud` handler |
| CA-08 | "Find a math tutor for Emma" | Budget Buddy | Redirects to Tutor Finder | Does NOT fire `filter_search` handler |

---

## Tier Gating Enforcement

The `POST /api/chat` endpoint must check the user's tier **before** routing to any agent handler.

| Agent | Required Tier | Trial User | Family User | Family Pro User |
|-------|--------------|------------|-------------|-----------------|
| Calendar Whiz | `trial` | ✅ Allow | ✅ Allow | ✅ Allow |
| Grocery Guru | `trial` | ✅ Allow | ✅ Allow | ✅ Allow |
| Budget Buddy | `trial` | ✅ Allow | ✅ Allow | ✅ Allow |
| School Event Hub | `trial` | ✅ Allow | ✅ Allow | ✅ Allow |
| Self-Care Reminder | `trial` | ✅ Allow | ✅ Allow | ✅ Allow |
| Tutor Finder | `family` | ❌ Block (402) | ✅ Allow | ✅ Allow |
| Health Hub | `family` | ❌ Block (402) | ✅ Allow | ✅ Allow |
| Sleep Tracker | `family` | ❌ Block (402) | ✅ Allow | ✅ Allow |

**Block Response (402):**
```json
{
  "message_id": "msg_...",
  "agent_type": "sleep_tracker",
  "content": "Sleep Tracker is available on the Family plan. Upgrade at alphaspeedai.com/upgrade to unlock all 8 agents.",
  "intent_type": "status_query",
  "model_used": null,
  "tokens_used": null,
  "quick_actions": [{ "label": "View plans", "action": "view_upgrade" }]
}
```

> **Bug to fix (BUG-005 from v3 report):** Currently trial users can access all 8 agents via `/api/chat`. The `/api/agents` endpoint correctly returns `is_available: false` but the chat endpoint does not enforce this.

---

## Quick Action Action Names — Reference

Use these consistent action strings across all agents so the frontend can handle them:

| Action | Handler | Notes |
|--------|---------|-------|
| `create_event` | Calendar page | Opens event creation modal |
| `view_calendar` | Calendar page | Opens calendar view |
| `view_event` | Calendar page | Opens specific event |
| `resolve_conflict` | Calendar page | Opens conflict resolution UI |
| `reminder_set` | Reminder handler | Creates a push notification reminder |
| `view_list` | Grocery list page | Opens shared list |
| `add_items` | Grocery list | Opens add-item input |
| `clear_checked` | Grocery list | Removes checked items |
| `generate_grocery_list` | Grocery Guru | Creates list from meal plan |
| `save_meal_plan` | Grocery Guru | Saves generated meal plan |
| `plan_meals` | Grocery Guru | Starts meal planning flow |
| `scan_receipt` | Budget Buddy | Opens OCR camera |
| `add_expense` | Budget Buddy | Opens manual expense entry |
| `view_month` | Budget Buddy | Opens monthly expense view |
| `view_breakdown` | Budget Buddy | Opens category breakdown |
| `set_budget` | Budget Buddy | Opens budget setting modal |
| `sign_slip` | School Event Hub | Signs specific permission slip |
| `sign_all_slips` | School Event Hub | Bulk-signs pending slips |
| `view_slip` | School Event Hub | Views slip details |
| `pay_slip_fee` | School Event Hub | Opens payment flow |
| `log_sleep` | Sleep Tracker | Opens sleep log entry |
| `view_sleep_history` | Sleep Tracker | Opens 30-day sleep chart |
| `create_reminder` | Self-Care | Opens reminder creation |
| `view_reminders` | Self-Care | Opens reminders list |
| `complete_reminder` | Self-Care | Marks reminder complete |
| `snooze_reminder` | Self-Care | Snoozes reminder |
| `view_streak` | Self-Care | Opens streak view |
| `view_upgrade` | Subscription page | Opens pricing/upgrade page |
| `view_analytics` | Analytics page | Opens Family Pro analytics |

---

## Test Fixtures

### Test Accounts

| Account | Tier | Household ID | Purpose |
|---------|------|-------------|---------|
| `trial-test@alphaspeedai.com` | `trial` | `hh_trial_01` | All trial-tier agent tests |
| `family-test@alphaspeedai.com` | `family` | `hh_family_01` | All family-tier agent tests (Sleep, Health Hub, Tutor) |
| `pro-test@alphaspeedai.com` | `family_pro` | `hh_pro_01` | Analytics + all agents |

### Sample Chat Requests (Copy-Paste Ready)

**Calendar Whiz — event creation:**
```bash
curl -X POST https://household-alpha-api.onrender.com/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"household_id":"hh_trial_01","agent_type":"calendar_whiz","message":"Add a dentist appointment for Emma on Thursday at 10am"}'
```

**Grocery Guru — add items:**
```bash
curl -X POST https://household-alpha-api.onrender.com/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"household_id":"hh_trial_01","agent_type":"grocery_guru","message":"Add milk, eggs, and bread to my grocery list"}'
```

**Budget Buddy — spending analysis:**
```bash
curl -X POST https://household-alpha-api.onrender.com/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"household_id":"hh_trial_01","agent_type":"budget_buddy","message":"How much have I spent on groceries this month?"}'
```

**Self-Care — stress check-in:**
```bash
curl -X POST https://household-alpha-api.onrender.com/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"household_id":"hh_trial_01","agent_type":"self_care_reminder","message":"I am so overwhelmed today, I have not stopped since 6am"}'
```

**Cross-agent confusion test (should redirect):**
```bash
curl -X POST https://household-alpha-api.onrender.com/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"household_id":"hh_trial_01","agent_type":"budget_buddy","message":"Add milk and eggs to my grocery list"}'
```

---

## Acceptance Criteria Summary

Before any agent changes are considered complete, all of the following must pass:

### Intent Routing
- [ ] Intent classifier receives and uses `agent_type` as context
- [ ] No handler outside the agent's domain fires for any message
- [ ] All 8 cross-agent confusion tests (CA-01 through CA-08) pass

### LLM Routing
- [ ] Calendar Whiz: planning / creation / conflict requests reach the LLM
- [ ] Budget Buddy: spending analysis requests reach the LLM with real expense data
- [ ] Grocery Guru: item add requests actually add items and confirm (not return empty list)
- [ ] All agents: static handler responses are NOT returned when user data is genuinely empty without LLM acknowledgment

### System Prompt Boundaries
- [ ] Self-Care Reminder does not give recipes or cooking advice
- [ ] Grocery Guru does not give sleep advice
- [ ] Each agent includes a warm redirect for out-of-domain queries
- [ ] Each agent's redirect names the correct destination agent

### Quick Actions
- [ ] All quick actions use standardized `action` strings from the reference table
- [ ] `payload` is populated with relevant IDs and values wherever applicable
- [ ] No response returns more than 4 quick actions

### Tier Gating
- [ ] BUG-005 fixed: `/api/chat` enforces tier gating (trial users cannot access Sleep Tracker, Health Hub, Tutor Finder)
- [ ] Block response shape matches the defined structure with `view_upgrade` quick action

### Data Integrity
- [ ] BUG-006 fixed: `POST /api/calendar` returns 200 (not 503) for event creation
- [ ] Calendar Whiz's empty calendar response is LLM-generated ("No events yet — want to add one?"), not a hardcoded string

### Second Brain / memory (see `mom-alpha/BACKEND-CHANGES.md`)
- [ ] `POST /api/chat` succeeds with and without `memory_context`
- [ ] Non-empty `memory_context` influences replies when facts are relevant (spot-check 2+ agents)
- [ ] `memory_hints` shape matches contract when feature is enabled; omit or empty when disabled
- [ ] No regression when `memory_context` is omitted (existing eval scenarios)
- [ ] After inbox APIs ship: `GET/POST/PUT/DELETE` inbox routes + two-parent visibility
- [ ] `GET /api/household/{id}/members` matches delegate-picker contract

### Growth / referrals / Stripe promos
- [ ] `POST /api/auth/signup` with optional `promotion_code` (valid / invalid / omitted)
- [ ] `GET /api/stripe/validate-promotion-code` returns `PromotionValidateResponse` shape
- [ ] `POST /api/stripe/checkout` applies `promotion_code` when provided
- [ ] `GET /api/referral` + `POST /api/referral/redeem` match contract and product rules (2-week reward copy on PWA)
- [ ] `POST /api/analytics/viral-event` for each `ViralEventType` — no 500s
- [ ] `POST /api/household/{id}/share` + `GET /api/share/{token}` preview

---

## Related Backend Files (Cowork Repo)

| File | What to Change |
|------|---------------|
| `family_platform/ai/intent_classifier.py` | Add `agent_type` parameter; add agent-scope guard |
| `family_platform/ai/llm_router.py` | Load prompts from files; add GPT-5.4 config; **inject `memory_context` into prompt path** |
| `family_platform/ai/prompts/` | 8 XML-structured system prompt files (new) |
| `family_platform/ai/skills/*.py` | Progressive disclosure context loading |
| `family_platform/chat/router.py` | Pass `agent_type` to classifier; add tier check; **parse optional `memory_context`; return optional `memory_hints`** |
| `family_platform/agents/catalog.py` | Verify `required_tier` matches this guide |
| **New per `BACKEND-CHANGES.md`** | Inbox router + `shared_inbox_items` migration; members response shape QA |
| Auth / Stripe / growth routers | `promotion_code` on signup; `validate-promotion-code`; checkout promotions; `GET/POST /api/referral`; `POST /api/analytics/viral-event`; household `share` + public share preview |

---

*This document is the source of truth for agent behavior. Update it when requirements change — do not let tests diverge from this spec.*

**Changelog:** v1.2 — Growth, referrals, Stripe promo signup + validation + checkout, viral-event and share-link testing (2026-03-30). v1.1 — Second Brain section, `memory_context` / `memory_hints` contract updates, inbox + members testing notes, checklist rows (2026-03-30).
