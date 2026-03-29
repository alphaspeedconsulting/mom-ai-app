# Agent Quality Assessment — Alpha.Mom

**Date:** 2026-03-28
**Method:** Real API calls with JWT-authenticated test user (trial tier)
**Verified:** LLM calls confirmed real (gpt-5.4-nano, gpt-5.4-mini, gpt-5.4)

---

## Overall Verdict

**The agents don't stay in their lanes.** There are two systemic problems:

1. **The intent classifier is agent-blind** — it classifies intent globally, not per-agent. So a grocery request sent to Budget Buddy gets classified as `list_crud` and returns "Your list is empty" from the grocery handler. A calendar request sent to Grocery Guru gets classified as `calendar_crud` and returns "You have no upcoming events."

2. **Static handlers intercept before the LLM** — For intents like `calendar_crud`, `list_crud`, and `payment_query`, a static handler runs instead of the LLM. This means even when you send Calendar Whiz a complex planning request, it gets classified as `calendar_crud` and returns the canned "no upcoming events" response.

When the intent classifier routes to `intelligent`, the LLM does a good job — but it doesn't respect agent boundaries either.

---

## Agent-by-Agent Results

### 1. Calendar Whiz ❌ BROKEN

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| CW-1 | "What events do I have this week?" | calendar_crud | none | "You have no upcoming events" |
| CW-2 | "Add a pediatrician appointment Thursday at 10am" | calendar_crud | none | "You have no upcoming events" |
| CW-3 | "Soccer Mon/Wed conflicts with piano Mon 4:30" | (empty) | none | Empty response |

**Verdict:** Calendar Whiz **never reaches the LLM**. Every message is classified as `calendar_crud` and gets the static empty-calendar response. Even explicit event creation requests don't create events — they just show "no upcoming events." The conflict detection scenario returned an empty response entirely. This agent is non-functional.

---

### 2. Grocery Guru ⚠️ MIXED

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| GG-1 | "Add milk, eggs, bread to my list" | list_crud | none | "Your list is empty" — didn't add items |
| GG-2 | "What's on my grocery list?" | list_crud | none | "Your list is empty" |
| GG-3 | "Plan 5 weeknight dinners, no shellfish" | intelligent | gpt-5.4-nano | ✅ Excellent 5-dinner plan with recipes |
| GG-4 | "Substitutes for heavy cream?" | intelligent | gpt-5.4-nano | ✅ Good — gave 5 dinners again (over-scoped but relevant) |

**Verdict:** CRUD operations (add/view list) are broken — static handler returns empty list without actually adding items. But complex requests that route to the LLM produce excellent, relevant grocery/meal content. The agent stays in its domain when using the LLM.

**Cross-agent confusion:** When asked a calendar question ("Schedule a dentist appointment"), it returned "You have no upcoming events" — the global calendar_crud handler responded instead of the grocery agent.

---

### 3. Budget Buddy ⚠️ MIXED

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| BB-1 | "How much have I spent this month?" | payment_query | none | Static "$0.00" |
| BB-2 | "I spent $85 at Costco on groceries" | intelligent | gpt-5.4 | ✅ Acknowledged expense, noted it wasn't logged yet |
| BB-3 | "Top spending categories this month?" | payment_query | none | Static "$0.00" |
| BB-4 | "Set a monthly grocery budget of $600" | payment_query | none | Static "$0.00" |

**Verdict:** Similar to Grocery Guru — most finance queries hit the static `payment_query` handler that just returns $0.00. But when a message gets classified as `intelligent`, the LLM gives a good, relevant budget response. The problem is the intent classifier is too eager to classify things as `payment_query`.

**Cross-agent confusion:** When asked "Add milk and eggs to my grocery list," it returned "Your list is empty" — the `list_crud` handler from the grocery system responded. When asked "I'm feeling stressed," the LLM responded appropriately by acknowledging the feeling AND tying it back to finances (its domain). That's actually good behavior.

---

### 4. School Event Hub ❌ DOWN (503)

All requests return `"Database error — please try again shortly"` (HTTP 503).

**Verdict:** This agent's DB table/query is broken. Earlier in testing it worked and returned LLM responses (gpt-5.4-mini), but it's intermittently failing now.

---

### 5. Self-Care Reminder ✅ BEST AGENT

| Test | Message | Intent | Model | Result |
|------|---------|--------|-------|--------|
| SC-1 | "So busy I forgot to eat lunch" | intelligent | gpt-5.4-nano | ✅ Empathetic, practical: "grab anything, sit for one bite" |
| SC-2 | "Set a 10min walk reminder" | (empty) | none | Empty response — static handler failed |
| SC-3 | "I feel guilty taking time for myself" | intelligent | gpt-5.4-nano | ✅ Excellent: addressed mom guilt, offered 2-5 min options |

**Verdict:** When it reaches the LLM, Self-Care Reminder is outstanding — warm, empathetic, actionable, mom-focused. But the "set a reminder" request hit a static handler that returned nothing.

**Cross-agent confusion (CRITICAL):**
- Asked "How much did I spend on groceries?" → Returned static "$0.00" from the `payment_query` handler. Self-Care agent never got the message.
- Asked "What's a good chicken parmesan recipe?" → LLM gave a full recipe. **This is wrong** — the Self-Care agent should have redirected to Grocery Guru, not provided cooking advice.

---

### 6. Sleep Tracker — TIER-GATED ✅ (correctly blocked)

Returns: `"Agent 'sleep_tracker' requires a family subscription. Your current plan is trial. Upgrade at alphaspeedai.com/upgrade."`

Earlier testing (before tier gating was enforced) showed the Sleep Tracker produces excellent LLM responses when accessible.

---

### 7. Health Hub — TIER-GATED ✅ (correctly blocked)

Same tier-gate message as Sleep Tracker.

---

### 8. Tutor Finder — TIER-GATED ✅ (correctly blocked)

Same tier-gate message. Good — this was broken earlier.

---

## Cross-Agent Confusion Summary

| Test | Message | Sent To | What Happened | Correct? |
|------|---------|---------|---------------|----------|
| C-1 | "Add milk and eggs to list" | Budget Buddy | `list_crud` → "Your list is empty" | ❌ Wrong handler responded |
| C-2 | "Schedule dentist Tuesday 2pm" | Grocery Guru | `calendar_crud` → "No upcoming events" | ❌ Wrong handler responded |
| C-3 | "Feeling stressed and overwhelmed" | Budget Buddy | `intelligent` → Acknowledged + tied to finances | ✅ Good cross-domain handling |
| C-4 | "How much on groceries this month?" | Self-Care | `payment_query` → Static "$0.00" | ❌ Wrong handler responded |
| C-5 | "Chicken parmesan recipe?" | Self-Care | `intelligent` → Full recipe | ❌ Should redirect to Grocery Guru |
| C-6 | "Couldn't sleep last night" | Grocery Guru | `intelligent` → Sleep tips | ⚠️ Helpful but wrong agent |

**Root Cause:** The intent classifier runs before the agent system. It looks at the message content and classifies it globally (is this about a list? a calendar? a payment? or "intelligent"?). Whichever handler matches the intent runs — regardless of which agent the user is talking to. The agents don't have their own identity or system prompt that constrains their responses.

---

## Systemic Issues

### Issue 1: Intent Classifier is Agent-Blind (P0)
The classifier doesn't factor in which agent the user selected. A grocery question sent to Budget Buddy triggers the grocery handler. This means users will see confusing, out-of-context responses.

**Fix:** The intent classifier needs to receive the `agent_type` as context. If a message is outside an agent's domain, either:
- Route it to the LLM with the agent's system prompt (let the agent say "that's not my area, try Grocery Guru")
- Auto-redirect to the correct agent

### Issue 2: Static Handlers Pre-empt LLM (P1)
For `calendar_crud`, `list_crud`, and `payment_query` intents, a static handler runs that returns canned data. This means:
- Calendar Whiz can never plan or create events — it always says "no events"
- Grocery Guru can never add items — it always says "list is empty"
- Budget Buddy can never analyze spending — it always says "$0.00"

**Fix:** Static handlers should only run for explicit CRUD actions (view list, view calendar). Complex requests within the same domain should still route to the LLM.

### Issue 3: LLM Doesn't Respect Agent Boundaries (P2)
When the LLM does respond, it answers any question regardless of the agent context. Self-Care Reminder gives recipes. Grocery Guru gives sleep advice.

**Fix:** Each agent needs a system prompt that defines its role and boundaries, e.g.: "You are the Self-Care Reminder agent. You help with wellness, stress management, and self-care. If asked about groceries, budgets, or other topics, politely redirect the user to the appropriate agent."

### Issue 4: Intermittent 503 on Some Agents (P1)
School Event Hub and Calendar Whiz intermittently return 503 DB errors. This suggests their DB queries are hitting a table or view that doesn't exist or has a schema mismatch.

---

## Agent Quality Scores

| Agent | In-Domain LLM Quality | Stays In Lane | CRUD Works | Overall |
|-------|----------------------|---------------|------------|---------|
| Calendar Whiz | N/A (never reaches LLM) | N/A | ❌ No | ❌ Broken |
| Grocery Guru | ★★★★★ Excellent | ⚠️ No (gives sleep advice) | ❌ No | ⚠️ Partial |
| Budget Buddy | ★★★★ Good | ⚠️ Partial (ties off-topic to finance) | ❌ No | ⚠️ Partial |
| School Event Hub | ★★★★ Good (when working) | Unknown | N/A | ❌ 503 |
| Self-Care Reminder | ★★★★★ Excellent | ❌ No (gives recipes) | N/A | ⚠️ Partial |
| Sleep Tracker | ★★★★★ Excellent | Tier-gated | N/A | ✅ Gated |
| Health Hub | ★★★★ Good | Tier-gated | N/A | ✅ Gated |
| Tutor Finder | N/A | Tier-gated | N/A | ✅ Gated |

---

## Recommendations (Priority Order)

1. **Make the intent classifier agent-aware** — Pass `agent_type` to the classifier so it doesn't route grocery messages through the calendar handler
2. **Add agent system prompts** — Each agent's LLM call should include a system prompt defining its role and boundaries
3. **Fix static CRUD handlers** — "Add milk to list" should actually add milk; "Create event" should actually create the event
4. **Fix Calendar Whiz routing** — It should reach the LLM for planning, conflict detection, and smart scheduling
5. **Fix intermittent 503s** — Debug the DB queries for School Event Hub and Calendar Whiz
6. **Add agent redirect capability** — When a user asks the wrong agent, it should say "Let me hand this to Grocery Guru" rather than answering incorrectly
