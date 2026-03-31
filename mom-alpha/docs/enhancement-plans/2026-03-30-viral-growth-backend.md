# Enhancement Plan: Viral Growth Backend Features

**Created:** 2026-03-30
**Status:** In Progress (Phases 1-6 complete, Phase 7 pending)
**Author:** Claude
**Source Spec:** `BACKEND-CHANGES-VIRAL.md`
**Related Files:**
- `platform files/family_platform/` — all new business logic routers + handlers
- `platform files/mom_alpha/database/migrations/` — 4 new migration files
- `platform files/mom_alpha/app/main.py` — router registration
- `platform files/family_platform/middleware/security.py` — rate limit rules
- `mom-alpha/src/types/api-contracts.ts` — frontend type sync
- `mom-alpha/src/lib/api-client.ts` — frontend API client sync
- `dad-alpha/src/types/api-contracts.ts` — sibling app sync
- `dad-alpha/src/lib/api-client.ts` — sibling app sync

---

## 1. Enhancement Breakdown

### What's Being Added

27 new REST endpoints across 7 feature domains supporting 4 viral growth phases:

| Domain | Endpoints | Priority | Tables |
|--------|-----------|----------|--------|
| Referrals | 3 (GET, POST redeem, POST viral-event) | P0 | `referrals`, `referral_redemptions`, `viral_events` |
| Sharing | 2 (POST share, GET share/{token}) | P0 | `share_tokens` |
| Weekly Wins | 1 (GET wins/weekly) | P0 | None (aggregation over existing tables) |
| Emergency Mode | 3 (POST activate, GET status, POST deactivate) | P1 | `emergency_events` |
| Caregivers | 4 (GET list, POST create, DELETE revoke, GET public view) | P1 | `caregiver_access` |
| Balance | 1 (GET balance) | P1 | None (aggregation; requires `tasks.assigned_to` column) |
| Templates | 5 (GET list, GET detail, POST create, POST clone, POST rate) | P2 | `family_templates`, `template_ratings` |
| Seasonal Packs | 1 (GET current) | P2 | `seasonal_packs` |
| Goals | 3 (GET list, POST create, PUT update) | P2 | `family_goals` |
| Voice Brief | 1 (GET brief) | P2 | None (LLM generation) |
| Village Feed | 7 (GET feed, GET post, POST post, POST react, POST report, GET comments, POST comment) | P3 | `village_posts`, `village_reactions`, `village_comments`, `village_reports` |

### Services/Workflows Affected

- **Auth layer** — 2 public (no-auth) endpoints need bypass in JWT middleware
- **Billing/subscription** — referral rewards extend `trial_expires_at` on `households`
- **Tasks table** — needs `assigned_to` + `completed_by` columns for emergency delegation and balance
- **Push notifications** — 4 new notification triggers (emergency, goals, delegation)
- **Rate limiting** — 5 new rate limit rules
- **Background jobs** — need cron infrastructure (does not exist today)
- **Email** — caregiver invite emails (no email service exists today)

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is

| Existing | Used By |
|----------|---------|
| `family_platform/auth/dependencies.py` (`require_household`, `get_current_user`) | All 25 authenticated endpoints |
| `family_platform/auth/jwt_handler.py` (JWT decode + `JWTClaims`) | All endpoints |
| `family_platform/database.py` (`TenantScopedPool`, `household_transaction`) | All DB queries |
| `family_platform/notifications/push.py` (`push_to_household`) | Emergency, goals, delegation |
| `family_platform/middleware/security.py` (`_RATE_LIMITS` dict) | New rate limit rules |
| `households.trial_expires_at` column | Referral reward extension |
| `tasks` table (status, household_id, agent_type) | Wins aggregation, balance |
| `calendar_events` table | Wins aggregation, emergency pause |
| `expenses` table | Wins dollars_saved |
| `chat_messages` table | Wins agent_interactions |
| RLS policies + `app.current_household_id` pattern | All new household-scoped tables |

### Needs Extension

| Component | Change |
|-----------|--------|
| `tasks` table | ADD `assigned_to UUID REFERENCES users(id)`, ADD `completed_by UUID REFERENCES users(id)` |
| `mom_alpha/app/main.py` | Register 6 new routers |
| `family_platform/middleware/security.py` | Add rate limit entries for referral, templates, village |
| `mom_alpha/app/database.py` (`_REQUIRED_TABLES`) | Add new table names to health check |

### Net-New Code

| Component | Justification |
|-----------|---------------|
| **6 new routers** in `family_platform/routers/` | Each viral domain is a distinct feature — no existing router covers referrals, templates, village, etc. |
| **4 handler modules** in `family_platform/handlers/` | Pure DB operations for emergency_ops, referral_ops, village_ops, template_ops — follows existing `calendar_ops.py`, `streak_ops.py` pattern |
| **1 email service** (`family_platform/email/service.py`) | No email capability exists. Caregiver invites require transactional email. Recommend Resend (simple HTTP API, free tier = 100/day) |
| **1 cron module** (`family_platform/jobs/`) | No background job infra exists. Need: emergency auto-deactivation, goal period resets, share token cleanup. Recommend APScheduler (in-process, no external dependency) |
| **4 migration files** | New tables, schema changes, RLS policies |
| **1 LLM helper** (`family_platform/ai/brief_generator.py`) | Voice brief + weekly win highlight generation — isolated from existing agent pipeline |

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

| Workflow | Impact | Risk |
|----------|--------|------|
| **Signup flow** | New optional `?ref=` param → `POST /referral/redeem` after account creation | Low — additive, no existing flow changes |
| **Task completion** | Must now update `completed_by` column + check goal auto-progress | Medium — touches hot path |
| **Calendar event creation** | Emergency mode may prefix `[PAUSED]` to titles | Low — write-time only, read path unchanged |
| **Push notification dispatch** | 4 new trigger points calling existing `push_to_household()` | Low — additive |
| **JWT auth middleware** | 2 endpoints bypass auth entirely (public share + caregiver views) | Medium — must ensure no auth header leaks private data |

### State Transitions Introduced

- **Emergency Mode**: `inactive → active → deactivated` (lifecycle on `emergency_events`)
- **Village Posts**: `visible → hidden` (auto-moderation at 3 reports)
- **Goals**: `active → completed` (when `current_value >= target_value`)
- **Caregiver Access**: `active → revoked` (soft delete)

### Regression Risk

| Area | Risk Level | Mitigation |
|------|-----------|------------|
| Task completion path | **Medium** | New `assigned_to`/`completed_by` columns default NULL — existing code unaffected unless it `SELECT *` and breaks on new columns |
| Auth bypass for public endpoints | **Medium** | Mount public routes on separate router with no `Depends(require_household)` — never mix with authenticated routes |
| RLS on new tables | **Low** | Follows identical pattern to migration 008/011 — copy-paste + test |
| Push notification volume | **Low** | New triggers are low-frequency (emergency, goal completion) |

---

## 4. Implementation Phases

### Phase 1: Schema Foundation + Tasks Extension (~2 days)

**Migration 013: `tasks` table extension + P0 tables**

Tasks:
1. Write migration `013_viral_p0_schema.sql`:
   - `ALTER TABLE tasks ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL`
   - `ALTER TABLE tasks ADD COLUMN completed_by UUID REFERENCES users(id) ON DELETE SET NULL`
   - `CREATE TABLE referrals` (with `referrer_user_id` — spec says `operator_id` but our DB uses `users.id`)
   - `CREATE TABLE referral_redemptions` (new — spec is missing this; needed to track who redeemed)
   - `CREATE TABLE viral_events`
   - `CREATE TABLE share_tokens`
   - RLS policies on all new tables
   - Indexes per spec
2. Update `_REQUIRED_TABLES` in `mom_alpha/app/database.py`
3. Run migration locally and verify

**Spec-to-Schema Corrections:**
- Spec references `operators(id)` — our DB uses `users(id)`. All FKs must reference `users(id)`.
- Spec has `referrals.referrer_operator_id` → use `referrals.referrer_user_id`
- Add `referral_redemptions` table: `(id, referral_id FK, redeemer_user_id FK, created_at)` with UNIQUE on `redeemer_user_id` to prevent double-redeem
- Drop redundant `CREATE UNIQUE INDEX idx_share_token` (column already has `UNIQUE` constraint)

Dependencies: None
Success criteria: Migration applies cleanly; `SELECT` from all new tables returns empty; existing queries unaffected

---

### Phase 2: P0 Endpoints — Referrals, Sharing, Wins (~3 days)

Tasks:
1. **`family_platform/handlers/referral_ops.py`** — pure DB functions:
   - `get_or_create_referral(pool, user_id) -> ReferralRow`
   - `redeem_referral(pool, code, redeemer_user_id) -> RedemptionResult`
   - `record_viral_event(pool, user_id, event_type, metadata) -> None`
   - Referral code generation: `MOM-` + 6 uppercase alphanumeric (parent_brand-aware via JWT claims)
2. **`family_platform/handlers/share_ops.py`**:
   - `create_share_token(pool, household_id, user_id, item_type, item_id) -> ShareToken`
   - `resolve_share_token(pool, token) -> SharePreview | None`
3. **`family_platform/handlers/wins_ops.py`**:
   - `compute_weekly_wins(pool, household_id) -> WeeklyWins`
   - LLM `personal_highlight` via Gemini Flash (cheapest model), cached 24h in-memory dict with TTL
4. **`family_platform/routers/referral_router.py`** — 3 endpoints:
   - `GET /` → get/create referral
   - `POST /redeem` → redeem code (anti-fraud checks)
   - Rate limit: `/api/referral/redeem` → `(1, 3600)` (1/hour per IP)
5. **`family_platform/routers/share_router.py`** — 2 endpoints:
   - `POST /api/household/{household_id}/share` (authenticated)
   - `GET /api/share/{token}` (**public**, no auth dependency)
6. **`family_platform/routers/wins_router.py`** — 1 endpoint:
   - `GET /api/wins/{household_id}/weekly`
7. **`family_platform/routers/viral_analytics_router.py`** — 1 endpoint:
   - `POST /api/analytics/viral-event` (fire-and-forget, never fails)
8. Wire 4 routers in `mom_alpha/app/main.py`
9. Add rate limit entries in `security.py`

Dependencies: Phase 1 (tables must exist)
Success criteria: `GET /api/referral` returns a code; `POST /redeem` extends trial; share tokens generate and resolve; weekly wins aggregate correctly

---

### Phase 3: P1 Endpoints — Emergency, Caregivers, Balance (~4 days)

**Migration 014: `014_viral_p1_schema.sql`**

Tasks:
1. Write migration:
   - `CREATE TABLE emergency_events` (with `activated_by UUID REFERENCES users(id)`)
   - `CREATE TABLE caregiver_access`
   - RLS policies for both
2. **`family_platform/handlers/emergency_ops.py`**:
   - `activate_emergency(pool, household_id, user_id, duration_days, message) -> EmergencyStatus`
     - Transaction: reassign tasks, pause calendar events, insert emergency row
   - `deactivate_emergency(pool, household_id) -> EmergencyStatus`
     - Unprefix calendar events, set `deactivated_at`
   - `get_emergency_status(pool, household_id) -> EmergencyStatus | None`
3. **`family_platform/handlers/caregiver_ops.py`**:
   - `create_caregiver(pool, household_id, name, email, role, permissions) -> CaregiverAccess`
   - `list_caregivers(pool, household_id) -> list[CaregiverAccess]`
   - `revoke_caregiver(pool, caregiver_id, household_id) -> None`
   - `resolve_caregiver_token(pool, token) -> CaregiverView | None` (no RLS — public)
4. **`family_platform/handlers/balance_ops.py`**:
   - `compute_household_balance(pool, household_id, user_id) -> HouseholdBalance`
   - Requires tasks to have `completed_by` populated — gracefully degrade if NULL
5. **`family_platform/routers/emergency_router.py`** — 3 endpoints under `/api/household/{household_id}/emergency`
6. **`family_platform/routers/caregiver_router.py`** — 4 endpoints:
   - 3 under `/api/household/{household_id}/caregivers` (authenticated)
   - 1 at `/api/caregiver/{access_token}` (**public**)
7. **`family_platform/routers/balance_router.py`** — 1 endpoint
8. Wire routers, add rate limits (caregiver public: `(30, 60)`)
9. Push notifications on emergency activate/deactivate (calls existing `push_to_household`)

**Email Service Decision:**
- Caregiver invites need transactional email. Options:
  - **Resend** (recommended): simple HTTP API, free 100/day, `pip install resend`
  - **SendGrid**: heavier SDK, generous free tier
  - **Skip email for now**: return the share link in API response, let frontend copy/paste it
- Recommendation: implement without email first (return link), add email in a follow-up. This unblocks the feature without a new dependency.

Dependencies: Phase 1 (tasks.assigned_to column), Phase 2 (viral_events for tracking)
Success criteria: Emergency mode reassigns tasks and pauses events atomically; caregiver token returns scoped view; balance computes correctly for 1 and 2 parent households

---

### Phase 4: Background Jobs Infrastructure (~2 days)

Tasks:
1. **`family_platform/jobs/__init__.py`** + **`scheduler.py`**:
   - Use `apscheduler` (AsyncIOScheduler) — in-process, no external deps
   - Start scheduler in `lifespan` startup hook
   - Register jobs:
     - `emergency_auto_deactivate`: every hour
     - `goal_period_reset`: every Monday 00:00 UTC (weekly), 1st of month 00:00 UTC (monthly)
     - `share_token_cleanup`: daily 03:00 UTC
2. **`family_platform/jobs/emergency_job.py`**:
   - Query + deactivate expired emergencies
   - Unpause calendar events
   - Push notification
3. **`family_platform/jobs/goal_reset_job.py`**:
   - Reset `current_value = 0` for incomplete weekly/monthly goals
4. **`family_platform/jobs/cleanup_job.py`**:
   - Delete expired share tokens
5. Wire scheduler in `mom_alpha/app/main.py` lifespan
6. Add `apscheduler` to `requirements.txt`

**Alternative**: If APScheduler adds too much complexity, use Render Cron Jobs (external HTTP trigger hitting admin endpoints). This keeps the app stateless but requires Render config.

Dependencies: Phase 3 (emergency + goals tables)
Success criteria: Emergency auto-deactivates after `duration_days`; goals reset on schedule; expired share tokens are cleaned up

---

### Phase 5: P2 Endpoints — Templates, Goals, Seasonal, Voice Brief (~3 days)

**Migration 015: `015_viral_p2_schema.sql`**

Tasks:
1. Write migration:
   - `CREATE TABLE family_templates`
   - `CREATE TABLE template_ratings`
   - `CREATE TABLE seasonal_packs`
   - `CREATE TABLE family_goals`
   - RLS: templates + seasonal packs are **cross-tenant** (no household_id isolation) — use `FORCE ROW LEVEL SECURITY` bypass or query via elevated pool
   - Goals are household-scoped — standard RLS
2. **`family_platform/handlers/template_ops.py`**:
   - CRUD + clone + rate (with upsert for ratings)
   - Full-text search via `ILIKE` (good enough at current scale; migrate to `tsvector` if needed)
3. **`family_platform/handlers/goal_ops.py`**:
   - CRUD + auto-complete check on update
   - Goal auto-progress hooks: export `increment_goal(pool, household_id, goal_type, amount)` for other handlers to call
4. **`family_platform/ai/brief_generator.py`**:
   - `generate_voice_brief(pool, household_id, user_name) -> str`
   - Uses Gemini Flash (cheapest LLM)
   - In-memory cache: `{household_id}:{date}` → result, TTL 1 hour
5. **`family_platform/routers/template_router.py`** — 5 endpoints under `/api/templates`
6. **`family_platform/routers/goal_router.py`** — 3 endpoints under `/api/household/{household_id}/goals`
7. **`family_platform/routers/seasonal_router.py`** — 1 endpoint at `/api/seasonal/current`
8. **`family_platform/routers/voice_brief_router.py`** — 1 endpoint at `/api/household/{household_id}/voice-brief`
9. Wire routers, add rate limits (`POST /api/templates` → `(5, 86400)`)
10. Seed initial seasonal packs via migration or admin script

Dependencies: Phase 4 (goal reset cron)
Success criteria: Templates searchable and cloneable; goals track progress and auto-complete; voice brief generates and caches; seasonal packs return current packs

---

### Phase 6: P3 Endpoints — Village Community Feed (~3 days)

**Migration 016: `016_viral_p3_village.sql`**

Tasks:
1. Write migration:
   - `CREATE TABLE village_posts`
   - `CREATE TABLE village_reactions`
   - `CREATE TABLE village_comments`
   - `CREATE TABLE village_reports`
   - These are **cross-tenant** (community feed) — NO RLS. Author identity tracked via `author_user_id`.
2. **`family_platform/handlers/village_ops.py`**:
   - Feed query with cursor pagination + category filter
   - Post creation with content moderation (PII regex: phone, email, URL patterns)
   - Reaction toggle (upsert/delete + denormalized count update)
   - Report + auto-hide at 3 threshold
   - Comment CRUD
3. **`family_platform/routers/village_router.py`** — 7 endpoints under `/api/village`
4. Wire router, add rate limits:
   - `POST /api/village/posts` → `(5, 86400)` (5/day)
   - `POST /api/village/posts/{id}/comments` → `(20, 86400)` (20/day)
5. Content moderation helper: regex for PII + keyword blocklist. LLM moderation deferred to when user base warrants it.

Dependencies: None technically (can be built in parallel with Phase 5), but deprioritized per spec
Success criteria: Feed paginates correctly; reactions toggle; reports auto-hide at threshold; PII regex blocks phone/email/URL

---

### Phase 7: Frontend Sync + Dad-Alpha Parity (~1 day)

Tasks:
1. Verify `mom-alpha/src/types/api-contracts.ts` matches all new response shapes
2. Verify `mom-alpha/src/lib/api-client.ts` has methods for all 27 endpoints
3. Copy both files to `dad-alpha/src/types/api-contracts.ts` and `dad-alpha/src/lib/api-client.ts`
4. Brand-specific adjustments:
   - Referral code prefix: `MOM-` vs `DAD-` (driven by `parent_brand` in JWT)
   - Village feed: shared feed with `parent_brand` column, or separate feeds (product decision needed)

Dependencies: All prior phases
Success criteria: Both apps compile with `npm run build`; TypeScript types match backend responses

---

## 5. Testing Strategy

### Unit Tests

| Module | Tests |
|--------|-------|
| `referral_ops.py` | Code generation format, redeem validation (self-referral, double-redeem, cap), reward calculation |
| `emergency_ops.py` | Activate (task reassignment count), deactivate (unpause events), idempotency (no double-activate) |
| `caregiver_ops.py` | Token generation, permission filtering, revocation |
| `balance_ops.py` | 1-parent vs 2-parent, category mapping from agent_type |
| `wins_ops.py` | Aggregation correctness, streak calculation |
| `village_ops.py` | PII regex (phone, email, URL), report threshold, reaction toggle |
| `template_ops.py` | Rating upsert math, clone increments uses_count |
| `goal_ops.py` | Auto-complete trigger, period reset |
| `share_ops.py` | Token expiry, preview data scoping per item_type |

### Integration Tests (Against Test DB)

| Test | Validates |
|------|-----------|
| Referral full loop | Create referral → share → new user redeems → both trial_expires_at extended |
| Emergency transaction | Activate → verify tasks reassigned + events paused → deactivate → verify restored |
| Public endpoint auth bypass | `GET /api/share/{token}` and `GET /api/caregiver/{token}` return 200 without JWT |
| RLS isolation | User A cannot see User B's goals, emergency events, or caregiver list |

### Existing Tests to Update

| File | Change |
|------|--------|
| `_REQUIRED_TABLES` health check | Add new table names — existing health diagnostic test must pass |
| OpenAPI schema test | Verify `/openapi.json` still generates without errors after 27 new endpoints |

### E2E Tests (Playwright)

- Referral flow: signup with `?ref=` code, verify reward applied
- Share flow: create share → open public link → verify preview renders
- Emergency mode: activate → verify UI updates → deactivate

---

## 6. Open Questions / Risks

### Blockers (Must Resolve Before Phase 1)

| # | Question | Impact | Recommendation |
|---|----------|--------|----------------|
| 1 | **Spec uses `operators(id)` FK everywhere — our DB uses `users(id)`** | All migration FK references | Use `users(id)` throughout. The spec's `operator_id` maps to our `user_id` (JWT `claims.sub`). |
| 2 | **No `referral_redemptions` table in spec** | Cannot enforce "one redemption per user" | Add `referral_redemptions(id, referral_id, redeemer_user_id UNIQUE, created_at)` |
| 3 | **`tasks.assigned_to` doesn't exist** | Emergency mode + balance features depend on it | Migration 013 adds it. Existing task creation code must be updated to populate it (default: `created_by` user). |

### Product Decisions Needed

| # | Question | Options |
|---|----------|---------|
| 4 | **Village feed: shared across brands or separate?** | A) Shared feed with `parent_brand` tag, B) Separate feeds. Recommend B for MVP — simpler moderation. |
| 5 | **Caregiver invite: email required or link-only?** | A) Transactional email (needs new service), B) Return link, frontend shows copy/share UI. Recommend B for Phase 1. |
| 6 | **Background jobs: in-process or external?** | A) APScheduler in-process, B) Render Cron Jobs (HTTP triggers). Recommend A for simplicity; B if we want the app to stay stateless. |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Emergency mode task reassignment breaks if co-parent has no `users` row | Medium | Tasks orphaned | Check co-parent exists before reassigning; if none, skip delegation and inform user |
| Village feed content moderation gaps | Medium | Inappropriate content visible | Ship with strict PII regex + keyword blocklist; add LLM moderation when at ~200 households |
| Goal auto-progress coupling | Low | Missing increments if handler forgets to call `increment_goal` | Document clearly; add integration test for each trigger path |
| Cross-tenant queries (templates, village, seasonal) bypass RLS | Low | Data leak if RLS assumed everywhere | Use `elevated_transaction` explicitly; document why these tables are cross-tenant |
| Share token brute-force | Low | 64-char token space is astronomically large (62^64) | Add IP rate limit `(30, 60)` as defense-in-depth |

### Assumptions

1. Frontend work (49 pages, 46 files) is complete and types in `api-contracts.ts` match this spec
2. `push_to_household()` in `family_platform/notifications/push.py` works in production
3. Gemini Flash API is accessible from the backend (Google AI API key already in `.env`)
4. Render Postgres supports `gen_random_uuid()` (PostgreSQL 13+ — confirmed)
5. No need for WebSocket events for real-time feed updates (P3 can use polling initially)

---

## Summary

| Phase | Scope | Estimate |
|-------|-------|----------|
| Phase 1 | Schema foundation + tasks extension | ~2 days |
| Phase 2 | P0 endpoints (referrals, sharing, wins) | ~3 days |
| Phase 3 | P1 endpoints (emergency, caregivers, balance) | ~4 days |
| Phase 4 | Background jobs infrastructure | ~2 days |
| Phase 5 | P2 endpoints (templates, goals, seasonal, voice brief) | ~3 days |
| Phase 6 | P3 endpoints (village community) | ~3 days |
| Phase 7 | Frontend sync + dad-alpha parity | ~1 day |
| **Total** | **27 endpoints, 9 tables, 4 crons, 6 routers** | **~18 days** |

Phases 1-3 deliver the core viral loops (sharing + referrals + co-parent conversion). Phases 4-6 add engagement and community features. Phase 7 ensures brand parity.
