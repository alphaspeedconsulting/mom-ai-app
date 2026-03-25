# Enhancement Plan: Development Plan Review Fixes

**Created:** 2026-03-24
**Status:** Draft
**Author:** Claude
**Related Files:** `development-plan.md`

---

## 1. Enhancement Breakdown

### What is being changed
The `development-plan.md` is being updated to address 10 issues identified in the Development Plan Review, plus removing COPPA (not applicable) and replacing it with a privacy policy note.

### Changes summary

| # | Issue | Change | Section Affected |
|---|---|---|---|
| 1 | Hidden dependency chains | Add "Minimum Unblock" gate lists to Phases 2-5 | Phase 2, 3, 4, 5 |
| 2 | No test data strategy | Add "Test Data Creation" task to Phase 1 | Phase 1 |
| 3 | WebSocket under-specified | Break WebSocket into dedicated task in Phase 2 | Phase 2 |
| 4 | Offline/sync is a one-liner | Scope offline to read-only caching + expand description | Phase 6 |
| 5 | No error/loading states | Add "Error & Empty States" task to Phase 3 | Phase 3 |
| 6 | Daily Edit cron under-specified | Clarify as fixed-interval scanner (every 15 min) | Phase 5 |
| 7 | Apple Sign-In friction | Defer to Capacitor phase; launch Google-only | Phase 1, Phase 3, Phase 7 |
| 8 | COPPA not applicable | Remove COPPA task; add privacy policy note (18+ app, parent-managed data) | Phase 6 |
| 9 | No LLM cost monitoring | Add platform-level LLM cost dashboard task to Phase 2 | Phase 2 |
| 10 | No secrets management | Add environment & secrets management task to Phase 1 | Phase 1 |

### Why this approach
These are targeted surgical edits to the existing plan — no structural reorganization needed. The review's recommendations are practical and specific enough to apply directly.

---

## 2. Reuse vs New Code Analysis

- **Reuse as-is**: The entire existing plan structure, phasing, and effort estimates
- **What needs extension**: Specific sections within each phase get new tasks or clarifications
- **Net-new**: "Minimum Unblock" gate lists (new subsection per phase), test data task, WebSocket task, error states task, LLM cost dashboard task, secrets management task
- **Why net-new**: These are gaps identified in review — information that was missing, not information that existed elsewhere

---

## 3. Workflow Impact Analysis

- **Workflow steps affected**: None — this is a planning document update, not code
- **State transitions**: N/A
- **Regression risk level**: Low — document-only change
- **Mitigation**: Review diff to ensure no existing content is accidentally removed

---

## 4. Implementation Phases

### Phase 1: Apply all 10 fixes to development-plan.md (~30 min)

**Tasks:**

1. **Phase 1 additions:**
   - Add "Test Data Creation" task (item #2): create 500-message intent classifier dataset, 50 receipt images, 20 school email samples during Phase 1
   - Add "Environment & Secrets Management" task (item #10): Render env groups for dev/staging/prod, document all required API keys

2. **Phase 2 additions:**
   - Add "WebSocket Layer" as dedicated task (item #3): JWT auth over WS, message types, reconnection/retry, consuming pages
   - Add "LLM Cost Monitoring Dashboard" task (item #9): daily spend by model via Langfuse, alert thresholds
   - Add "Minimum Unblock" gate list (item #1)

3. **Phase 3 additions:**
   - Add "Error & Empty States" task (item #5): loading skeletons, error fallbacks, disconnected states, empty data states
   - Update Login page to Google-only (item #7): defer Apple Sign-In to Capacitor phase
   - Add "Minimum Unblock" gate list (item #1)

4. **Phase 4 additions:**
   - Add "Minimum Unblock" gate list (item #1)

5. **Phase 5 additions:**
   - Clarify Daily Edit cron (item #6): fixed-interval cron every 15 min, scan for users whose local time matches
   - Add "Minimum Unblock" gate list (item #1)

6. **Phase 6 changes:**
   - Remove COPPA section entirely (item #8)
   - Replace with privacy policy task: `/privacy` page stating app is 18+, family data managed by parent account holder, COPPA review deferred until child-facing features
   - Expand offline/sync (item #4): scope to read-only caching (calendar + grocery lists), queue deterministic ops, no conflict resolution in v1

7. **Phase 7 addition:**
   - Add Apple Sign-In as part of Capacitor native wrap (item #7)

8. **Timeline/effort updates:**
   - Reallocate COPPA 3 days → offline/sync expansion (now 3 days explicit)
   - Add ~2 days for new tasks (test data, WebSocket, error states, LLM dashboard, secrets mgmt) — absorbed into existing phase estimates by tightening overlaps
   - Update total if needed

**Dependencies:** None — single document edit.

**Success criteria:**
- Done when: All 10 review items addressed in development-plan.md; COPPA removed; privacy note added
- Verified by: Manual review of each section against the review feedback
- Risk level: Low

---

## 5. Testing Strategy

- **Unit tests**: N/A (document change)
- **Integration tests**: N/A
- **E2E tests**: N/A
- **Validation**: Diff review to confirm all 10 items addressed, no content accidentally deleted

---

## 6. Open Questions / Risks

| Item | Notes |
|---|---|
| Effort estimate impact | New tasks (WebSocket, test data, error states, LLM dashboard, secrets) add work but COPPA removal offsets ~3 days. Net impact: ~2-3 days added to overall timeline. |
| Apple Sign-In deferral | Removes a login option at launch. Google-only is standard for PWA launch; Apple Sign-In pairs better with native wrapper. |
| Offline scope reduction | Read-only caching is realistic for v1. Multi-device conflict resolution deferred to post-launch. |
