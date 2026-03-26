# Enhancement Plan: Signup Flow, Onboarding Wizard & Beta Completion

**Created:** 2026-03-26
**Status:** Draft
**Author:** Claude
**Related Files:**
- `mom-alpha/src/app/(app)/login/page.tsx`
- `mom-alpha/src/app/(app)/install/page.tsx`
- `mom-alpha/src/app/(app)/onboarding/page.tsx`
- `mom-alpha/src/app/(app)/onboarding/household/page.tsx` (net-new)
- `mom-alpha/src/app/(app)/settings/page.tsx`
- `mom-alpha/src/app/(app)/dashboard/page.tsx`
- `mom-alpha/src/components/chat/AgentChatClient.tsx`
- `mom-alpha/src/stores/auth-store.ts`
- `mom-alpha/src/stores/household-store.ts`
- `mom-alpha/src/hooks/use-push-notifications.ts`
- `mom-alpha/tests/e2e/`
- `Cowork Basic Plugin Kit/.../app/routers/auth_router.py`
- `Cowork Basic Plugin Kit/.../app/routers/household_router.py`
- `Cowork Basic Plugin Kit/.../app/routers/notifications_router.py`
- `Cowork Basic Plugin Kit/.../app/config.py`

---

## 1. Enhancement Breakdown

### 1A) Password Security Hardening (Backend)

**What is being changed:**
The backend `auth_router.py` has explicit `# TODO: hash password with bcrypt` comments in both `POST /api/auth/signup` (plaintext stored) and `POST /api/auth/email` (no verification — any password accepted). This is a blocking security gap that must ship before any real users authenticate.

- Install `bcrypt` in backend dependencies
- Hash password with `bcrypt.hashpw()` on signup before DB insert
- Verify hash with `bcrypt.checkpw()` on email login
- Add `password_hash` column to `users` table if not present (check schema)

**Affected:** `auth_router.py`, DB schema migrations
**Why this approach:** Targeted fix to existing TODO — no architectural change, no new endpoints.

---

### 1B) Google OAuth Frontend

**What is being changed:**
`handleGoogleLogin()` in `login/page.tsx` is a stub that shows an error message. The backend `/api/auth/google` endpoint is fully implemented and ready. This is a one-sided gap.

- Install `@react-oauth/google` (or use Google Identity Services script directly)
- Initialize Google Sign-In in login page with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- On credential callback → POST to `/api/auth/google` with `id_token`
- Route response through identical consent → install flow as email signup
- On returning Google login (no new household) → skip install, go to dashboard

**Affected:** `login/page.tsx`, no backend changes needed
**Why this approach:** Backend is complete. Frontend-only change. Reuses existing consent + install redirect logic exactly.

---

### 1C) Household Onboarding Wizard

**What is being changed:**
After signup, users are redirected to `/settings?onboarding=household` which shows a small hint banner and an inline household name field deep in the settings page. This is a poor first-use experience — users land on a settings page with no clear direction.

Replace with a dedicated multi-step wizard at `/onboarding/household`:

**Step 1 — Name your household:**
- Single input: "What should we call your household?" (e.g., "The Franco Family")
- Forward button → Step 2

**Step 2 — Add family members:**
- List of member cards — each with: name (required), age (optional), color dot, role (parent/child)
- "Add another member" to grow the list
- At least 1 member required
- Forward → Step 3

**Step 3 — Invite a co-parent (optional):**
- Email input + "Send invite" (calls existing `household.invite()`)
- "Skip for now" → Step 4

**Step 4 — Done / Enter the app:**
- Confirmation screen with summary of household created
- "Let's go →" → `/dashboard`

Backend `POST /api/households` already accepts `{ name, members: [{ name, age, tags, color }] }` — the wizard will send all data in one call at step 2→3 transition.

**Affected:** New page `app/(app)/onboarding/household/page.tsx`, `household-store.ts` (minor: expose `createHousehold` with members), login redirect target changes from `/settings?onboarding=household` to `/onboarding/household`

**Settings page cleanup:** Remove the inline household-creation form from settings. Replace with a "Set up household →" link that routes to `/onboarding/household` for users who still have no household. Keep co-parent invite and member list for existing households.

**Why this approach:** Single-call backend reuse. Dedicated page avoids the confusing settings context. Step-gated flow mirrors the mental model (name → people → invite → go).

---

### 1D) Signup → Install Flow Polish & E2E Tests

**What is being changed:**
The complete Start Free Trial → Signup → Install flow was implemented but has no automated test coverage for the full path. Also: the `install/page.tsx` has a `useEffect` exhaustive-deps lint warning (calls `handleContinue` which is not in the dep array).

- Fix the `useEffect` lint issue in `install/page.tsx` (wrap `handleContinue` in `useCallback`)
- Add Playwright E2E test covering the full signup path (email signup → consent → install page → onboarding wizard → dashboard)
- Add E2E test for invite code pre-population in settings upgrade section
- Add E2E test for install skip path
- Update `login/page.tsx` to redirect Google signups to install flow same as email signups

**Affected:** `install/page.tsx`, `tests/e2e/`
**Why:** Closes the automated test gap created by the implementation sprint.

---

### 1E) Push Notifications End-to-End

**What is being changed:**
The frontend push subscription flow is complete (`use-push-notifications.ts` → `/api/notifications/push/subscribe`). The backend stores the subscription endpoint. But nothing sends notifications — there is no backend send path.

- Generate VAPID key pair and configure backend env vars (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`)
- Install `pywebpush` in backend dependencies
- Add `POST /api/notifications/send` internal endpoint (authenticated by service key, not JWT) to send a push notification to a household
- Wire the daily-edit background job (`daily_edit.py`) to send a push notification after generating the digest
- Add a payment-failure push notification from the existing Stripe webhook handler (currently only creates a DB notification, not a push)

**Affected:** `notifications_router.py`, `daily_edit.py`, `stripe_router.py` (minor), `config.py` (VAPID vars)
**Why this approach:** Reuses existing push subscription storage and the established `showNotification` handler in `sw-push.js`. Backend changes are additive to existing router.

---

### 1F) Agent Chat Starter Prompts from Agent Metadata

**What is being changed:**
`AgentChatClient.tsx` uses a hardcoded `getStarterPrompts()` static map. The agent metadata endpoint (`/api/agents`) returns agent objects — check if they include `starter_prompts` or similar field. If so, pass them through; if not, add the field to the agent response.

- Check `GET /api/agents` response shape for starter prompts field
- If present: pass `agent.starter_prompts` into `AgentChatClient` instead of static map
- If absent: add `starter_prompts: list[str]` to agent DB record / response model

**Affected:** `AgentChatClient.tsx`, potentially `agents_router.py`
**Why:** Removes the only remaining hardcoded content from the chat experience. Enables per-agent customization without a deploy.

---

## 2. Reuse vs New Code Analysis

### Reuse as-is
| Component | Reuse rationale |
|---|---|
| `POST /api/auth/google` | Fully implemented — backend ready for Google OAuth |
| `POST /api/households` | Accepts `name + members[]` — wizard can call as-is |
| `household.invite()` in api-client | Already wired for co-parent invite step |
| `household-store.ts` `createHousehold()`, `inviteCoParent()` | Existing store methods cover all wizard actions |
| `useInstallPrompt` hook | Already used in install page |
| Consent flow in login page | Unchanged — Google OAuth routes through same showConsent → handleConsentSubmit |
| `sw-push.js` push/notification handlers | Fully implemented — just needs backend to send |
| Stripe payment-failed webhook notification insert | Exists — just needs push dispatch added |

### Needs extension
| Component | Extension needed | Reason |
|---|---|---|
| `auth_router.py` | Add bcrypt hash/verify in signup and email login | TODO is explicit in code |
| `login/page.tsx` | Implement `handleGoogleLogin()` with real credential flow | Currently throws error string |
| `household-store.ts` | Update `createHousehold()` to accept members array | Currently sends name only |
| `install/page.tsx` | Wrap `handleContinue` in `useCallback` | Lint warning / dep array issue |
| `notifications_router.py` | Add send endpoint + pywebpush dispatch | No send path currently exists |
| `daily_edit.py` | Call push send after digest generation | Additive hook only |
| `stripe_router.py` `_handle_payment_failed` | Dispatch push alongside DB notification insert | Additive, 3 lines |
| `config.py` | Add `vapid_public_key`, `vapid_private_key`, `vapid_email` | Already has placeholder vars, need values |

### Net-new code
| Net-new item | Why necessary |
|---|---|
| `app/(app)/onboarding/household/page.tsx` | No dedicated onboarding wizard exists — settings-based flow is insufficient for beta UX |
| Backend: `POST /api/notifications/send` | No push dispatch path exists; required for all agent notification scenarios |
| E2E test: `signup-flow.spec.ts` | Full signup path has zero automated coverage |

---

## 3. Workflow Impact Analysis

### Workflow steps affected
1. **Signup path:** Login → Consent → [Install] → **Household Wizard** (new) → Dashboard. Previously: Login → Consent → Install → Settings (confusing).
2. **Google login path:** Currently errors. After: Login → Google popup → credential → `/api/auth/google` → Consent → [Install for new users] → Wizard/Dashboard.
3. **Push notification delivery:** Agent event / daily edit → DB notification (existing) + **push dispatch** (new) → device.
4. **Agent chat:** Static starter prompts → **API-sourced starter prompts** (if agent metadata supports it).

### State transitions introduced
- New user without household → `/onboarding/household` wizard (not settings)
- Wizard completion → `auth-store.updateUser({ household_id, household_role: "admin" })` (reuses existing path)
- Google OAuth success → same state path as email signup (isAuthenticated, user, token)
- Push subscription active → backend can now reach the device

### Regression risk levels
| Change | Risk | Reason |
|---|---|---|
| bcrypt password hashing | **High** | Existing email-authenticated users will have unhashed passwords — migration needed |
| Google OAuth frontend | Low | Additive; email flow unchanged |
| Household wizard (new page) | Low | New route, doesn't modify existing settings behavior |
| Settings household section cleanup | Medium | Removes inline form — must verify fallback for users who bypass wizard |
| Push send endpoint | Low | Additive endpoint; no existing callers to break |
| Chat starter prompts | Low | Fallback to static map if API field absent |

### bcrypt migration strategy (High risk item)
Existing users in the DB have plaintext passwords. Two options:
- **Option A (recommended for beta):** On login, if `password_hash` column is null/empty, fail auth and require password reset. Acceptable for beta — no real users yet.
- **Option B (production path):** Force-reset all passwords at migration boundary; send reset emails.

Since no real users exist yet in beta, Option A is sufficient. Add a column migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`.

### Mitigation strategies
- All wizard state is held client-side until final submission — no partial DB state possible
- Google OAuth reuses existing `/api/auth/google` — no new auth surface
- Push send endpoint requires internal service key (not user JWT) — no user-facing auth surface expansion
- Settings page retains "Set up household →" link as fallback; wizard is preferred path not exclusive path

---

## 4. Implementation Phases

### Phase 1: Password Security Hardening (0.5 day)
- **Tasks**
  - Add `bcrypt` to backend `requirements.txt` or `pyproject.toml`
  - Add DB migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`
  - In `POST /api/auth/signup`: hash password with `bcrypt.hashpw()` before insert; store in `password_hash` column
  - In `POST /api/auth/email`: retrieve `password_hash`; verify with `bcrypt.checkpw()`; 401 if mismatch or hash null
  - Update `scripts/migrate.py` to include the new column migration
- **Dependencies:** None — can start immediately
- **Success criteria**
  - **Done when:** New account signup hashes password; login rejects wrong password; correct password accepted
  - **Verified by:** Backend unit test — signup → wrong login → 401; signup → correct login → 200 + JWT
  - **Risk level:** High (but contained — no real users in beta DB yet)

---

### Phase 2: Google OAuth Frontend (0.5 day)
- **Tasks**
  - Install `@react-oauth/google` in `mom-alpha/` (`npm install @react-oauth/google`)
  - Wrap root layout (or login page) with `<GoogleOAuthProvider clientId={...}>`
  - Replace `handleGoogleLogin` stub in `login/page.tsx` with `useGoogleLogin` hook call
  - On credential success: POST to `/api/auth/google` with `{ id_token: credential }`
  - Route response through existing `setAuthPending` → `setShowConsent(true)` path
  - New Google users (mode implied as signup via one-tap context): redirect to `/install?next=...` after consent
  - Returning Google users (household_id exists): redirect to `/dashboard` after consent
- **Dependencies:** Phase 1 (auth hardening should precede adding new auth vectors)
- **Success criteria**
  - **Done when:** "Continue with Google" button opens Google popup; credential authenticates; user lands on consent screen
  - **Verified by:** Manual walkthrough — Google sign-in → consent → install page (new user) or dashboard (returning user)
  - **Risk level:** Low

---

### Phase 3: Household Onboarding Wizard (1.5 days)

#### Phase 3A: Wizard page (1 day)
- **Tasks**
  - Create `app/(app)/onboarding/household/page.tsx` as a 4-step wizard:
    - Step 1: Household name input with "Next" button
    - Step 2: Family member list — each member has name (required), age (number input, optional), role toggle (parent/child), color selector (6 preset swatches). "Add member" appends a new empty member card. Min 1 member.
    - Step 3: Co-parent invite email (optional) — uses `household.invite()` API. "Skip" available.
    - Step 4: Success confirmation with summary — "Let's go" → `/dashboard`
  - `POST /api/households` is called at end of Step 2 with `{ name, members: [] }`. Extend `household-store.ts` `createHousehold()` to accept optional `members` array matching `HouseholdCreateRequest`
  - After `createHousehold()` resolves: call `auth-store.updateUser({ household_id, household_role: "admin" })` (reuses existing `updateUser` method)
  - Step progress indicator (dots or numbers) at top of wizard
- **Dependencies:** None (backend `/api/households` already accepts members array)

#### Phase 3B: Settings cleanup (0.5 day)
- **Tasks**
  - In `settings/page.tsx`: replace the inline household-creation form (householdName input + Create button + inviteToken input + Join button) with a single CTA card: "Set up your household →" link to `/onboarding/household`
  - Keep the onboarding hint banner (`showHouseholdOnboardingHint`) — repurpose it to direct to the wizard
  - Keep co-parent invite section (email invite + member list) for users who already have a household — this is post-setup, not onboarding
  - Update `login/page.tsx` `handleConsentSubmit` redirect: change `"/settings?onboarding=household"` to `"/onboarding/household"` (for both email and Google signup paths)
  - Update `install/page.tsx` default `next` param: change fallback from `/settings?onboarding=household` to `/onboarding/household`
- **Dependencies:** Phase 3A complete

- **Success criteria (both 3A + 3B)**
  - **Done when:** New signup completes wizard, household with members is created, user lands on dashboard with household context active
  - **Verified by:** E2E flow test — signup → install → wizard (name + 2 members + skip invite) → dashboard shows household
  - **Risk level:** Medium (settings form removal must not break users who reach settings without going through wizard)

---

### Phase 4: Signup Flow E2E Tests & Install Polish (0.5 day)
- **Tasks**
  - Fix `install/page.tsx` lint issue: wrap `handleContinue` in `useCallback` to satisfy exhaustive-deps
  - Create `tests/e2e/signup-flow.spec.ts` with Playwright tests:
    1. Full email signup → consent → install page renders correct platform-specific content
    2. Install skip → lands on `/onboarding/household` (for new user)
    3. Invite code entered at signup → pre-populated in settings upgrade promo field
    4. Returning user login (email) → skips install → goes to dashboard directly
  - Add assertions to `tests/e2e/pwa.spec.ts`: install page accessible at `/install`
- **Dependencies:** Phase 3B (redirect targets must be final before writing E2E paths)
- **Success criteria**
  - **Done when:** All new E2E tests pass on `npm run build && npx serve out -p 3000 -s`
  - **Verified by:** `npx playwright test tests/e2e/signup-flow.spec.ts` green
  - **Risk level:** Low

---

### Phase 5: Push Notifications End-to-End (1 day)

#### Phase 5A: Backend send infrastructure (0.5 day)
- **Tasks**
  - Install `pywebpush` in backend
  - Generate VAPID key pair: `pywebpush --gen-key` → add to backend `.env` as `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`; add to `config.py` (vars already templated)
  - Add `POST /api/notifications/push/send` (internal — requires service-level auth, not user JWT):
    - Input: `household_id`, `title`, `body`, `url`, `action_type`
    - Fetches all active push subscriptions for household from DB
    - Dispatches via `pywebpush` to each endpoint
    - Handles expired/invalid subscriptions gracefully (delete on 410 Gone)
  - In `_handle_payment_failed` (stripe_router.py): after DB notification insert, call internal push send for the household
  - In `daily_edit.py`: after digest generation, call internal push send with digest summary

#### Phase 5B: Frontend VAPID wiring (0.5 day)
- **Tasks**
  - Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in frontend `.env.local` to the generated public key
  - Verify `use-push-notifications.ts` subscribes correctly end-to-end against live backend
  - Add a "Test Push" button in settings (dev/beta only, gated on `NEXT_PUBLIC_BETA_MODE`) that calls a debug endpoint to send a test notification to the current user's devices
- **Dependencies:** Phase 5A
- **Success criteria**
  - **Done when:** A daily edit job or payment failure sends a visible push notification to an Android device with the app installed
  - **Verified by:** Manual test — trigger daily edit or Stripe test payment failure → notification appears on test device
  - **Risk level:** Medium (VAPID key must match between frontend subscription and backend send)

---

### Phase 6: Agent Chat Starter Prompts from Metadata (0.25 day)
- **Tasks**
  - Check `GET /api/agents` response — if `starter_prompts: list[str]` already present in agent records: pass through to `AgentChatClient` instead of static map
  - If absent: add `starter_prompts` field to agent DB row or hardcoded agent config in `agents_router.py`; include in response model
  - Update `AgentChatClient.tsx`: accept optional `starterPrompts` prop; fall back to static map if not provided
  - Remove (or mark deprecated) the static `getStarterPrompts()` map once API source is confirmed
- **Dependencies:** None — can run in parallel with any phase
- **Success criteria**
  - **Done when:** Chat interface shows prompts sourced from API without static fallback being used
  - **Verified by:** Change one agent's prompts in DB/config → verify chat shows updated prompts without frontend deploy
  - **Risk level:** Low

---

## 5. Testing Strategy

### Unit tests required
- **Backend:**
  - `test_auth_signup_flow.py` — extend with: signup → correct login succeeds, signup → wrong login returns 401, signup → null password_hash login returns 401
  - New test: push send — mock pywebpush and assert dispatch called with correct subscription endpoint
  - New test: `_handle_payment_failed` calls push send after DB insert

- **Frontend:**
  - `household-store.ts` — test `createHousehold` with members array payload matches `HouseholdCreateRequest`
  - `install/page.tsx` — test platform detection returns correct platform for mocked user agents
  - `login/page.tsx` — test `inviteCode` saved to localStorage on consent submit; verify cleared on wrong path (login, not signup)

### Integration tests required
- Google OAuth: mock Google credential → POST `/api/auth/google` → JWT returned with correct user shape
- Household wizard: full `POST /api/households` with members → household_id returned → members stored with correct colors and roles
- Push subscription lifecycle: subscribe → store in DB → send → pywebpush dispatch invoked

### E2E / workflow tests required
New file `tests/e2e/signup-flow.spec.ts`:
1. Email signup → consent screen appears after form submit
2. Consent accepted → `/install` page renders
3. Install skip → `/onboarding/household` (no household) or `/dashboard` (has household)
4. Wizard step 1: household name required, "Next" disabled until filled
5. Wizard step 2: add 2 members → "Next" enabled
6. Wizard step 3: skip invite → step 4 confirmation
7. Wizard step 4: "Let's go" → `/dashboard` renders
8. Invite code from signup pre-fills promo field on settings page

Existing tests to update:
- `tests/e2e/pwa.spec.ts`: add `/install` route accessible check
- `tests/e2e/navigation.spec.ts`: update any hardcoded post-auth redirect expectations if they reference `/settings?onboarding=household`

### Test data requirements
- Backend: test user fixture with `password_hash = NULL` (legacy path) and with valid bcrypt hash
- Playwright: deterministic test account (email/password) that can complete signup in CI without Google OAuth
- Stripe test mode customer fixture for payment failure push test
- Agent fixture with `starter_prompts` array for chat prompt test

---

## 6. Open Questions / Risks

### Assumptions
- No real users have signed up yet — bcrypt migration (Option A) is safe
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is available in the Google Cloud Console project
- `pywebpush` is compatible with the Python version and Render deployment environment
- The `POST /api/households` endpoint's `members` field is already being persisted by the backend (confirmed in `household_router.py` — it iterates and inserts members)
- Static export (`output: "export"`) is unchanged — wizard is client-side only

### Unknowns
- Whether `GET /api/agents` currently returns `starter_prompts` (must check before Phase 6)
- Whether Google Cloud Console project has `mom.alphaspeedai.com` as an authorized JavaScript origin
- Whether Render environment supports `pywebpush` without additional build dependencies
- Whether `password_hash` column exists in production DB already (check schema before Phase 1)

### Architectural risks
| Risk | Severity | Mitigation |
|---|---|---|
| bcrypt migration breaks existing email users | High | Option A: reject null hash logins; no real users in beta yet |
| Two simultaneous auth paths (email + Google) diverge post-consent | Medium | Both route through identical `setAuthPending` → consent → install flow |
| Wizard partial-submission (user drops off between steps) | Low | All state client-side; only one API call at step 2 completion — no partial DB state |
| pywebpush sends to stale subscriptions | Low | Handle 410/404 responses by deleting subscription from DB |
| Starter prompts API addition creates schema migration | Low | Add as nullable column with default empty array; no existing data affected |

### Deployment considerations
- **Phase 1:** Requires DB migration (`ALTER TABLE users ADD COLUMN password_hash`) — must run before backend deploy. Use additive migration. No rollback needed (old column unused until code deploys).
- **Phase 3:** Wizard is a new route — no migration. Settings form removal is soft: link replaces form, existing API endpoints unchanged.
- **Phase 5:** VAPID key pair must be generated once and never rotated without re-subscribing all devices. Store in Render environment variables, not `.env` file.
- **Rollback strategy:** All phases are additive (new pages, new endpoints, new fields). Rollback = revert frontend deploy. No destructive DB operations except Phase 1 column add (which is additive and safe to leave).

---

## Estimated Effort Summary

| Phase | Description | Estimate | Risk |
|---|---|---|---|
| 1 | Password security (bcrypt) | 0.5 day | High priority |
| 2 | Google OAuth frontend | 0.5 day | Low |
| 3A | Household onboarding wizard page | 1.0 day | Medium |
| 3B | Settings cleanup + redirect updates | 0.5 day | Medium |
| 4 | E2E tests + install page lint fix | 0.5 day | Low |
| 5A | Push notifications backend (VAPID + send) | 0.5 day | Medium |
| 5B | Push notifications frontend wiring | 0.5 day | Medium |
| 6 | Chat starter prompts from API | 0.25 day | Low |
| **Total** | | **~4.25–4.75 days** | |

**Critical path:** Phase 1 → Phase 2 → Phase 3A → Phase 3B → Phase 4

**Parallelizable after Phase 1:** Phase 5 (push notifications) and Phase 6 (chat prompts) can run independently.
