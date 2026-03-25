# Enhancement Plan: Mom.alpha — Full Development Plan (Option 3: Render-Only + Cowork MCP)

**Created:** 2026-03-24
**Status:** Draft
**Author:** Claude
**Architecture:** Option 3 — Cowork Plugin + Render-Only MCP Backend + **PWA (Next.js)**
**Source Documents:** `projects/mom-ai/prd.md` (v1.1), `projects/mom-ai/architecture-analysis.md` (v1.2), `projects/mom-ai/pricing.md`
**Infrastructure:** Render Postgres ($19/mo) + FastAPI License Server ($7/mo) + MCP HTTP Server ($7/mo) + Cloudflare R2 (free) + Cloudflare Pages ($0) — deployed at `mom.alphaspeedai.com`
**Distribution:** Launched directly from **AlphaSpeedAi.com** to leverage existing platform traffic and brand authority

---

## Why PWA Instead of Native

| Factor | PWA (Next.js) | Native (React Native) |
|---|---|---|
| **Time to first user** | ~10 weeks | ~14 weeks |
| **Platform tax on $7.99 sub** | 2.9% Stripe ($0.23) | 30% Apple ($2.40) |
| **Annual revenue lost to fees (21K users)** | ~$73K | ~$570K |
| **Update speed** | Deploy and done | OTA for JS, full rebuild for native |
| **Design system** | Direct Tailwind — design exports are already HTML+Tailwind | Must convert to NativeWind |
| **Camera (receipt OCR)** | Web Camera API — sufficient for photos | Native Camera — slightly better |
| **Push notifications** | Web Push API (iOS 16.4+, Android full) | FCM — universal |
| **Offline** | Service Workers + IndexedDB | SQLite + background sync |
| **App Store discovery** | AlphaSpeedAi.com traffic + SEO + cross-promotion | App Store search |
| **Build cost** | ~$98K | ~$124K |
| **Ongoing cost** | $0 hosting (Cloudflare Pages) + $0 platform fees | $1,300/yr (Apple + Google + Expo EAS) |

**Decision: PWA first.** Wrap in Capacitor later if App Store distribution becomes important.

---

## 1. Enhancement Breakdown

### What is being built
A mobile-first **Progressive Web App** with 8 specialized AI agents, deterministic/intelligent operation split, LLM cost routing, and paid-only subscription model ($7.99/$14.99). Deployed as a web app — installable on home screen, works offline, sends push notifications.

### Why Option 3 was chosen
- ~60% backend reuse from existing Cowork MCP infrastructure
- $33/mo infrastructure vs $225+/mo for greenfield Supabase
- ~11 days of new backend work vs 2-3 months for full build
- Same MCP backend serves PWA, Cowork desktop companion, and future native wrapper

### Services affected

| Service | Action | Details |
|---|---|---|
| `agentvault-license-server` (Render) | **Extend** | Add OAuth, WebSocket, family API routes, call budget tracking |
| `agentvault-mcp` (Render) | **Extend** | Add Mom.alpha agent skills, intent classifier, LLM router |
| `agentvault-db` (Render Postgres) | **Extend** | Add family schema tables |
| **Next.js PWA** | **New** | 13 pages, "Lullaby & Logic" design system, Tailwind CSS, Service Worker |
| Cloudflare R2 | **New** | File storage for receipts, user uploads |
| Cloudflare Pages (or Render Static) | **New** | PWA hosting — $0 |
| Family Optimizer MCP | **Reuse** | Calendar Whiz agent backbone |
| Gmail Connector MCP | **Reuse** | School Event Hub email scanning |
| Google Calendar MCP | **Reuse** | Bidirectional calendar sync |
| AgentVault License System | **Reuse** | Stripe subscriptions, tier gating, JWT |
| Governance Layer | **Reuse** | Payment/signing approval gates |

---

## 2. Reuse vs New Code Analysis

### Reuse as-is (~40%)

| Component | Source | Reuse Confidence |
|---|---|---|
| Google Calendar MCP (sync layer) | Cowork Plugin Kit | 90% — direct reuse, add family member filter |
| AgentVault License System (Stripe + JWT) | Cowork Plugin Kit | 95% — add Mom.alpha tier definitions |
| Render Postgres + render.yaml | Cowork Plugin Kit | 90% — add migration for family tables |
| LangSmith + Langfuse observability | AI Product Agents | 100% — already configured |
| Dashboard Bridge pattern (HTTP/SSE) | Cowork Plugin Kit | 80% — PWA uses same HTTP/SSE transport |

### Extend (~25%)

| Component | What Changes | Effort |
|---|---|---|
| License Server (FastAPI) | Add Google/Apple OAuth routes, WebSocket layer, family CRUD endpoints, call budget counter | ~5 days |
| MCP Server | Add 8 Mom.alpha agent skill definitions, intent classifier, LLM router | ~8 days |
| Family Optimizer MCP | Add conflict detection UI hooks, multi-child scheduling | ~3 days |
| Gmail Connector MCP | Add school-specific email parsing rules (events, slips, fees) | ~3 days |
| Governance Layer | Add permission slip signing gate, school fee payment gate | ~2 days |

### Net-new (~35%)

| Component | Why New | Effort |
|---|---|---|
| Next.js PWA (13 pages) | Custom "Lullaby & Logic" design system — **but design exports are already HTML+Tailwind, massively accelerating this** | ~25 days |
| Service Worker + offline | PWA installability, offline calendar/lists, background sync | ~3 days |
| Web Push notifications | Push API registration, notification display, quiet hours | ~3 days |
| Intent Classifier | Core cost optimization — deterministic/intelligent routing | ~5 days |
| LLM Router | Multi-model cost routing (Gemini Flash / GPT-4o mini / GPT-4o) | ~3 days |
| Call Budget Tracker | Per-household monthly counter with graceful downgrade | ~2 days |
| Receipt OCR pipeline | GPT-4o vision via Web Camera API | ~3 days |
| Cloudflare R2 integration | S3-compatible file storage for receipts/uploads | ~1 day |

**PWA advantage: Design exports from Mom.alpha App are already HTML + Tailwind CSS.** Instead of converting to NativeWind (React Native), we use them almost directly. This saves ~15 days compared to native.

---

## 3. Workflow Impact Analysis

### Workflow steps affected

| Workflow | Steps Changed | Impact |
|---|---|---|
| User Authentication | New OAuth providers added to existing JWT flow | Low — additive, existing flow untouched |
| License Validation | New tier definitions (Family/Pro) added to tier_gate | Low — existing tiers unaffected |
| MCP Tool Invocation | Intent classifier intercepts before MCP call | Medium — new routing layer before existing pipeline |
| Stripe Webhooks | New subscription products ($7.99/$14.99) | Low — additive to existing webhook handler |
| Calendar Sync | Family Optimizer extended with multi-child support | Medium — existing single-user patterns must handle multi-member |

### State transitions introduced

| New State | Trigger | Side Effect |
|---|---|---|
| `trial_active` → `trial_expired` | 7-day timer | App locks agent features, data preserved 30 days |
| `over_budget` | LLM call count ≥ tier limit | Router switches to Gemini Flash only |
| `budget_reset` | Billing cycle date | Counter resets to 0 |
| `deterministic_intent` | Intent classifier match | Bypass LLM entirely, direct DB operation |

### Regression risk

| Area | Risk | Mitigation |
|---|---|---|
| Existing AgentVault license flow | Low | New tiers are additive; existing Basic/Advanced/Custom unchanged |
| Google Calendar MCP | Medium | Family multi-member filter could break single-user sync — test both paths |
| Gmail Connector | Medium | School-specific parsing rules could false-positive on non-school emails — add opt-in toggle |
| Render Postgres migrations | Low | New tables only, no schema changes to existing tables |
| MCP HTTP/SSE transport | Low | PWA client uses same protocol as Cowork — no transport changes |

---

## 4. Implementation Phases

### Phase 1: Foundation & Infrastructure (Weeks 1-2)

**Goal:** Project scaffolding, database schema, auth system, design system, CI/CD pipeline.

#### Tasks

1. **Next.js project init**
   - `npx create-next-app@latest mom-ai --typescript --tailwind --app`
   - Add Zustand (state), SWR or React Query (data fetching), next-pwa (Service Worker)
   - Configure `next.config.js` for PWA: manifest.json, service worker, icons
   - Add `manifest.json`: app name, theme color (#32695a), display: standalone, icons (192/512px)

2. **"Lullaby & Logic" design system implementation**
   - `tailwind.config.ts` with all 35+ color tokens — **copy directly from existing design exports**
   - Typography: Plus Jakarta Sans (Google Fonts, headlines), Be Vietnam Pro (Google Fonts, body)
   - Component primitives: Button, Card, Chip, Input, BottomNav, GlassPanel
   - Design rules enforced via Tailwind utilities:
     - No-Line Rule: no `border` classes, separation via `bg-*` shifts
     - Glass & Gradient Rule: `backdrop-blur-[20px]` + `bg-*/60` on floating elements
     - Ambient shadows: `shadow-[0_8px_24px_rgba(0,55,71,0.06)]`
   - Spacing scale (base 0.35rem), border-radius tokens
   - **Accelerator**: Existing HTML exports from `/Users/miguelfranco/Mom.alpha App` are already Tailwind — extract components directly

3. **Database schema migration**
   - Add tables to existing `agentvault-db` Render Postgres:
     - `households` (id, owner_user_id, name, created_at, subscription_tier, trial_expires_at)
     - `family_members` (id, household_id, name, age, photo_url, tags jsonb, color)
     - `agents_config` (id, household_id, agent_type, is_active, settings jsonb)
     - `lists` (id, household_id, agent_type, name, items jsonb)
     - `events` (id, household_id, member_id, title, start_at, end_at, source, metadata jsonb)
     - `tasks` (id, household_id, agent_type, status, progress_pct, steps jsonb, created_at)
     - `chat_messages` (id, household_id, agent_type, role, content, media_urls, created_at)
     - `notifications` (id, household_id, category, title, body, action_type, action_payload, read_at)
     - `call_budget` (id, household_id, period_start, period_end, used, tier_limit)
     - `expenses` (id, household_id, amount, category, merchant, date, receipt_url, source)
     - `wellness_streaks` (id, household_id, member_id, streak_type, dates jsonb, current_streak)
     - `permission_slips` (id, household_id, title, status, due_date, fee_amount, signed_at)
   - Row-level isolation via `household_id` on all queries (app-level enforcement)

4. **Auth extension on license server**
   - Add OAuth routes to existing FastAPI: `/auth/google`, `/auth/apple`, `/auth/facebook`, `/auth/microsoft`
   - Support all major consumer OAuth providers (Google, Apple, Facebook, Microsoft) + email/password fallback
   - Map OAuth user → household → JWT with `household_id` + `tier` claims
   - Reuse existing JWT issuance/validation from `jwt_handler.py`
   - CORS configuration: allow `mom.alphaspeedai.com` origin on license server

5. **CI/CD pipeline**
   - GitHub Actions: lint (ESLint + Prettier) → type check → test → deploy
   - Frontend: Cloudflare Pages auto-deploy on push (or Render Static Site)
   - Backend: existing Render auto-deploy on push (already configured)

**Dependencies:** None — this is the starting point.

**Success criteria:**
- Done when: `next dev` renders home page skeleton with design system tokens; PWA installable from Chrome; OAuth login returns JWT; all 12 tables created in Render Postgres
- Verified by: Lighthouse PWA audit passes (installable, service worker registered); `curl /auth/google` and `/auth/apple` return redirect URLs; `psql` shows all tables
- Risk level: Low

---

### Phase 2: Core Agent Backend — Intent Classifier + LLM Router + Call Budget (Weeks 2-4)

**Goal:** The brain of the system — deterministic/intelligent routing, multi-model LLM cost optimization, per-household call budget tracking.

#### Tasks

1. **Intent Classifier**
   - Rule-based pattern matcher with regex + keyword lists per agent domain
   - Categories: `calendar_crud`, `list_crud`, `reminder_set`, `status_query`, `streak_log`, `payment_query`, `filter_search` → deterministic
   - Fallback: if no rule matches → classify as intelligent
   - Add to MCP server as middleware before agent skill invocation
   - Target: ≥90% accuracy on test dataset of 500 messages

2. **LLM Router**
   - New module in MCP server: `llm_router.py`
   - Model selection logic:
     - Agent type → default model mapping (e.g., Grocery Guru meal planning = GPT-4o mini, Receipt OCR = GPT-4o vision)
     - Over-budget override → force Gemini Flash regardless of agent type
   - Multi-provider support: OpenAI (GPT-4o, GPT-4o mini), Google (Gemini 2.5 Flash)
   - Env vars: `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`
   - Return: model response + tokens_used + model_name (for tracking)

3. **Call Budget Tracker**
   - New module: `call_budget.py`
   - On each intelligent operation: `increment_usage(household_id)` → UPDATE `call_budget` SET used = used + 1
   - On each request: `check_budget(household_id)` → returns `{remaining, tier_limit, is_over_budget}`
   - Monthly reset: on-demand check (if `period_end < now()`, reset counter and advance period)
   - Expose via API: `GET /api/budget/{household_id}` → `{used: 342, limit: 1000, remaining: 658}`

4. **Deterministic operation handlers**
   - Per-agent CRUD handlers that execute directly against Postgres:
     - Calendar: `create_event`, `list_events`, `delete_event`, `update_event`
     - Lists: `add_item`, `remove_item`, `check_item`, `get_list`
     - Reminders: `create_reminder`, `list_reminders`, `dismiss_reminder`
     - Streaks: `log_streak`, `get_streak`, `get_member_streaks`
     - Expenses: `list_expenses`, `get_category_breakdown`, `get_recurring`
     - Slips: `list_pending_slips`, `get_slip_status`
   - All return structured JSON — no LLM formatting needed

5. **Agent skill definitions (MCP)**
   - Create 4 MVP agent skills as MCP skill files:
     - `calendar-whiz.md` — wraps Family Optimizer MCP + deterministic calendar ops
     - `grocery-guru.md` — deterministic list CRUD + intelligent meal planning/recipes
     - `school-event-hub.md` — wraps Gmail Connector + deterministic slip tracking
     - `budget-buddy.md` — deterministic expense queries + intelligent OCR/analysis

**Dependencies:** Phase 1 (database schema, auth).

**Success criteria:**
- Done when: A chat message like "add milk to grocery list" executes in <50ms with zero LLM calls; "plan dinners for the week" routes to GPT-4o mini and decrements call budget; over-budget household gets Gemini Flash response
- Verified by: Intent classifier test suite (500 messages, ≥90% accuracy); LLM router unit tests (model selection per agent type); call budget integration test (increment, check, reset, over-budget downgrade)
- Risk level: Medium (intent classifier accuracy is the key risk)

---

### Phase 3: MVP Pages — Onboarding, Home, Chat, Calendar (Weeks 3-5)

**Goal:** First 6 pages functional: Onboarding, Login, Home/Marketplace, Agent Chat, Family Calendar, Tasks Dashboard.

#### Tasks

1. **Onboarding page** (`/onboarding`)
   - Bento-style asymmetric layout with benefits cards
   - "Get Started" CTA → navigate to Login
   - **Accelerator**: Convert existing `onboarding/code.html` export to Next.js component

2. **Login/Signup page** (`/login`)
   - Google, Apple, Facebook, and Microsoft OAuth buttons + email/password (connect to Phase 1 auth)
   - "Take a breath. We'll handle the rest." tagline
   - 7-day trial activation on first login (CC collection via Stripe Checkout)
   - Stripe Checkout: `POST /api/checkout/trial` → redirect to Stripe hosted page → webhook creates household
   - **No Apple 30% cut** — Stripe processes payment directly at 2.9%
   - **Accelerator**: Convert existing `login_sign_up/code.html` export

3. **Home/Marketplace page** (`/`)
   - Agent discovery hub with search bar
   - "Suggested for You" carousel (based on family profile tags)
   - Agent cards: icon, name, description, category badge, activate toggle
   - Bottom navigation: Home, Tasks, Calendar, Profile (fixed, mobile-optimized)
   - **Accelerator**: Convert existing `home_marketplace/code.html` export

4. **Agent Chat page** (`/chat/[agent]`)
   - Per-agent chat interface (dynamic route per agent type)
   - User messages: primary teal bubble, right-aligned
   - Agent messages: surface container, left-aligned with agent avatar
   - Quick action chips below agent responses
   - Typing indicator (animated dots) — only shows for intelligent operations
   - Input field with send button (voice button placeholder for Phase 7)
   - Connect to MCP backend: `POST /api/chat` → intent classifier → deterministic or LLM response
   - **Accelerator**: Convert existing `refined_agent_chat/code.html` export

5. **Family Calendar page** (`/calendar`)
   - Monthly view with 7-column bento grid
   - Per-member color coding with filter chips (Shared, Mom, Kids)
   - Today's schedule section below calendar
   - FAB for manual event creation
   - Connect to Google Calendar MCP for bidirectional sync
   - Weekly view toggle (P1 — can ship after MVP)
   - **Accelerator**: Convert existing `family_calendar/code.html` export

6. **Tasks Dashboard page** (`/tasks`)
   - Agent Status Overview hero (active count, completed today)
   - Active tasks with progress bars and stepper indicators
   - Completed tasks section
   - Real-time updates via WebSocket
   - **Accelerator**: Convert existing `refined_tasks_dashboard/code.html` export

**Dependencies:** Phase 1 (design system, auth), Phase 2 (agent backend, chat API).

**Success criteria:**
- Done when: User can sign up → activate Calendar Whiz → ask "what's on tomorrow?" → see calendar response in chat → view events on calendar page; all 6 pages match "Lullaby & Logic" design specs
- Verified by: E2E test (Playwright): signup → trial → activate agent → chat → calendar sync; visual QA against design screenshots; Lighthouse PWA + accessibility audit (≥90)
- Risk level: Low (design exports are already Tailwind — conversion is straightforward)

---

### Phase 4: MVP Agents — Calendar Whiz, Grocery Guru, School Event Hub, Budget Buddy (Weeks 4-7)

**Goal:** All 4 MVP agents fully functional with both deterministic and intelligent operations.

#### Tasks

1. **Calendar Whiz (extends Family Optimizer MCP)**
   - Deterministic: event CRUD, reminder management, member filtering
   - Intelligent: AI conflict detection (when 2+ events overlap for same member), smart rescheduling suggestions
   - Integration: bidirectional Google Calendar sync via existing MCP

2. **Grocery Guru**
   - Deterministic: grocery list CRUD (add/remove/check items), view list, reorder
   - Intelligent: meal planning with dietary constraints (reads family member tags for allergies), recipe suggestions from available ingredients, auto-generate grocery list from meal plan
   - LLM model: Gemini Flash for simple recipes, GPT-4o mini for complex meal planning

3. **School Event Hub (extends Gmail Connector MCP)**
   - Deterministic: view pending permission slips, check event status, view after-school timeline
   - Intelligent: email scanning (parse school newsletters/emails for events, deadlines, fees using GPT-4o mini)
   - Features: digital permission slip signing (e-signature via Web Canvas API), "Active Sync" indicator
   - School fee payments via Stripe (use governance approval gate)
   - Auto-sync extracted events to Family Calendar

4. **Budget Buddy**
   - Deterministic: view spending breakdown, check recurring payments ("Recurring Pulse"), view category totals
   - Intelligent: receipt OCR via GPT-4o vision (Web Camera API → capture → upload to R2 → GPT-4o vision → extract merchant, items, amounts, categorize), savings recommendations ("Agent Savings Wins"), spending trend analysis
   - "Household Health" dashboard with mini trend chart (pre-computed aggregates)

5. **Agent-specific pages**
   - School Event Hub page (`/agents/school`) — Bento grid: events/permissions left, extracurriculars right
   - Budget Buddy page (`/agents/budget`) — Household Health hero, Scan Receipt button, Recurring Pulse, category grid
   - **Accelerator**: Convert `school_event_hub/code.html` and `budget_buddy_agent/code.html` exports

**Dependencies:** Phase 2 (intent classifier, LLM router), Phase 3 (chat page, calendar page).

**Success criteria:**
- Done when: Each agent handles ≥5 deterministic operations and ≥3 intelligent operations correctly; receipt OCR extracts merchant + amount with ≥85% accuracy; school email parsing extracts events with ≥80% accuracy
- Verified by: Per-agent test suite (happy path + edge cases); OCR accuracy test on 50 sample receipts; email parsing test on 20 sample school newsletters
- Risk level: Medium (OCR accuracy and email parsing are the key risks)

---

### Phase 5: Subscriptions, Notifications & Remaining Pages (Weeks 6-9)

**Goal:** Payment system, push notifications, and remaining 7 pages.

#### Tasks

1. **Stripe subscription system**
   - Products: Family ($7.99/mo, $69.99/yr), Family Pro ($14.99/mo, $129.99/yr)
   - 7-day trial: Stripe Checkout with `trial_period_days: 7` + `payment_method_collection: always`
   - Webhook handlers: `customer.subscription.created`, `.updated`, `.deleted`, `invoice.payment_failed`
   - Map Stripe subscription → household tier → call budget limit
   - Trial expiry: lock agent features, preserve data 30 days, show upgrade prompt
   - Extend existing `stripe_client.py` with Mom.alpha products
   - **No platform tax** — Stripe charges 2.9% + $0.30 directly (vs 30% Apple cut)

2. **Web Push notifications**
   - Web Push API + VAPID keys (no FCM dependency for web)
   - Service Worker handles push events and notification display
   - Notification categories: NEW UPDATES, EARLIER (grouped by recency)
   - Actionable notifications: "Sign Slip", "View Appointment", "Pay $24.00" → deep link to relevant page
   - Quiet hours support (user-configurable, enforced server-side)
   - Notification Center page (`/notifications`)
   - **iOS support**: Safari 16.4+ supports Web Push — covers most target users

3. **Daily Edit (morning summary)**
   - Render Cron Job: run at user-configured time (default 7am local)
   - Aggregate previous day's agent activity across household
   - Generate summary via LLM (GPT-4o mini, 1 call/day/household)
   - Deliver as web push notification + in-app notification entry

4. **Remaining pages**
   - **User Profile** (`/profile`): photo + tier badge, family members bento, dietary canvas, communication prefs, security settings
   - **App Settings** (`/settings`): notification preferences, quiet hours, connected accounts, data export/delete
   - **Notification Center** (`/notifications`): "The Daily Edit" branding, NEW/EARLIER grouping, action buttons
   - **Wellness Hub** (`/agents/wellness`): appointment reminders, wellness streak tracking (day grid), status overview
   - **Tutor Finder** (`/agents/tutor`): search with filters, tutor cards with ratings, "Book Intro" button (P2)
   - **Accelerator**: Convert remaining HTML exports (`user_profile/`, `notification_center/`, `family_health_hub_agent/`, `tutor_finder_agent/`, `app_settings/`)

5. **Call budget UI**
   - Usage display in Profile: "342 of 1,000 calls used this month" with progress bar
   - Over-budget banner: "Agents are running in basic mode until [reset date]."
   - Family Pro upsell prompt when user hits 80% of budget

**Dependencies:** Phase 3 (page framework, bottom nav), Phase 4 (agent backends).

**Success criteria:**
- Done when: User receives web push notification when School Event Hub finds a new permission slip; Daily Edit arrives at configured time; trial expiry locks features correctly; Stripe webhook processes subscription lifecycle
- Verified by: Stripe webhook integration test (create → renew → cancel → failed payment); web push delivery test; trial expiry E2E test; call budget UI shows correct numbers
- Risk level: Medium (Stripe webhook edge cases; Web Push on iOS requires Safari 16.4+)

---

### Phase 6: Polish, Testing & Launch (Weeks 8-10)

**Goal:** Performance optimization, comprehensive testing, COPPA compliance, deploy to production URL.

#### Tasks

1. **Performance optimization**
   - Deterministic operation target: <50ms response time
   - Intelligent operation target: <2s P95
   - First Contentful Paint target: <1.5s (Next.js SSR/SSG advantage)
   - Optimize calendar sync: incremental sync instead of full fetch
   - Image optimization: Next.js `<Image>` component + R2 upload compression
   - Code splitting: dynamic imports for agent-specific pages

2. **PWA polish**
   - Service Worker: cache static assets, offline calendar + grocery lists (IndexedDB)
   - Queue deterministic operations when offline, sync on reconnect
   - "Add to Home Screen" prompt on second visit
   - Splash screen with Mom.alpha logo + primary gradient
   - `manifest.json` verified: correct icons, theme color, display: standalone

3. **COPPA compliance**
   - Verifiable parental consent flow for child profiles (under 13)
   - No PII collection from children beyond name + age
   - Data minimization: child data only stored as part of parent's household
   - Privacy policy page (`/privacy`) with COPPA section

4. **Security hardening**
   - LLM prompt injection protection (reuse existing `tools/prompt_guard.py`)
   - PII masking in LLM prompts (reuse existing `tools/pii_masker.py`)
   - Input sanitization on all user-facing endpoints
   - Rate limiting on auth endpoints (reuse existing patterns)
   - CSP headers, CORS lockdown, HTTP-only cookies for JWT

5. **Testing**
   - Unit tests: intent classifier (500 messages), LLM router, call budget, deterministic handlers
   - Integration tests: OAuth → JWT → API, Stripe webhook → tier → budget, chat → intent → response
   - E2E tests (Playwright): full user journey across all 13 pages
   - Accessibility: Lighthouse WCAG 2.1 AA audit on all pages (target: ≥90)
   - Performance: Lighthouse performance score ≥90; load test at 1,000 concurrent households
   - PWA: Lighthouse PWA audit passes all checks (installable, offline, push)

6. **Production deploy — launch from AlphaSpeedAi.com**
   - Deploy as a section of the AlphaSpeed AI platform at `mom.alphaspeedai.com`
   - Cloudflare Pages (frontend) + Render (backend) — both auto-deploy on push
   - DNS configuration + TLS certificate (shared with AlphaSpeedAi.com domain)
   - Monitoring: Sentry for frontend errors, existing LangSmith for backend
   - **No App Store submission needed** — live the moment it deploys
   - **Traffic acquisition via AlphaSpeedAi.com**:
     - Hero banner / featured product placement on AlphaSpeedAi.com homepage
     - Cross-promotion from other AlphaSpeed AI products and email lists
     - SEO benefit from AlphaSpeedAi.com domain authority
     - Shared navigation: users discover Mom.alpha while browsing AlphaSpeed AI offerings
     - Social proof: "Powered by AlphaSpeed AI" trust signal

**Dependencies:** Phase 5 (all pages and features complete).

**Success criteria:**
- Done when: `mom.alphaspeedai.com` is live; all E2E tests pass; Lighthouse scores: Performance ≥90, Accessibility ≥90, PWA ≥90; P95 latency <2s for intelligent operations
- Verified by: Lighthouse report; Playwright E2E suite green; load test report; Sentry error rate <0.1%
- Risk level: Low (no App Store review gate — deploy when ready)

---

### Phase 7: Remaining 4 Agents + Family Pro Features (Weeks 9-12)

**Goal:** Expand from 4 MVP agents to full 8-agent ecosystem; ship Family Pro differentiators.

#### Tasks

1. **Wellness Hub agent**
   - Deterministic: log streak, view streaks, set appointment reminders, sync to calendar
   - Intelligent: proactive wellness nudges based on activity patterns (P2)

2. **Tutor Finder agent**
   - Deterministic: search with filters (grade, subject, specialty, session type), view ratings
   - Intelligent: personalized match recommendations based on child's learning profile (P2)

3. **Sleep Tracker agent**
   - Deterministic: log sleep times, view history, view weekly patterns
   - Intelligent: rest cycle analysis and optimization suggestions

4. **Self-Care Reminder agent**
   - Deterministic: set self-care reminders, view scheduled breaks, snooze
   - Intelligent: context-aware "Mom Moment" suggestions based on stress signals

5. **Family Pro features**
   - 2,000 call budget (vs 1,000)
   - Priority model routing (higher % of GPT-4o for complex tasks)
   - Up to 6 family members (vs 4)
   - Voice input via Web Speech API (browser-native STT — free, no API cost)
   - Advanced analytics dashboard (spending trends, schedule density, agent usage breakdown)
   - Multiple household support (co-parent/nanny access)

6. **Optional: Capacitor native wrapper**
   - If App Store distribution needed, wrap PWA in Capacitor
   - Same codebase, same Tailwind — just add native shell
   - Decision point: evaluate based on first 30 days of organic traffic

**Dependencies:** Phase 4 (agent framework proven with 4 agents), Phase 5 (subscription tiers).

**Success criteria:**
- Done when: All 8 agents functional with deterministic + intelligent split; Family Pro upgrade path works end-to-end; voice input transcribes and sends to agent correctly
- Verified by: Per-agent test suites; tier upgrade integration test; voice input accuracy test on Chrome + Safari
- Risk level: Low (proven patterns from Phase 4; agents 5-8 are simpler than the MVP 4)

---

## 5. Testing Strategy

### Unit Tests

| Component | Test Count | Coverage Target |
|---|---|---|
| Intent Classifier | 500 messages (250 deterministic, 250 intelligent) | ≥90% accuracy |
| LLM Router | 30 tests (model selection per agent × complexity level × budget state) | 100% branch coverage |
| Call Budget Tracker | 20 tests (increment, check, reset, over-budget, tier change) | 100% |
| Deterministic Handlers | 60 tests (CRUD for all 6 entity types × happy path + edge cases) | ≥90% |
| Auth (OAuth + JWT) | 25 tests (Google, Apple, Facebook, Microsoft, email, token refresh, expired token) | 100% |
| Stripe Webhooks | 12 tests (create, renew, cancel, fail, upgrade, downgrade, trial expire) | 100% |

### Integration Tests

| Flow | Test Description |
|---|---|
| Auth → API | OAuth login → JWT issued → API call with JWT → authorized response |
| Chat → Intent → Deterministic | Send "add milk to list" → classified deterministic → DB write → response (<50ms) |
| Chat → Intent → LLM | Send "plan dinners" → classified intelligent → LLM Router → GPT-4o mini → response + budget decrement |
| Over-budget → Downgrade | Exhaust budget → next intelligent call → Gemini Flash used → response |
| Stripe → Tier → Budget | Subscribe Family Pro → webhook → tier updated → budget limit = 2,000 |
| Calendar Sync | Create event in app → appears in Google Calendar → edit in Google → reflected in app |
| Receipt OCR | Upload receipt photo → GPT-4o vision → extracted data → expense record created |
| Email Parse | Forward school email → Gmail Connector → parsed events → calendar entries |
| Web Push | Server sends push → Service Worker receives → notification displayed |

### E2E Tests (Playwright)

| Journey | Steps |
|---|---|
| New User | Visit mom.alphaspeedai.com → Signup (Google/Apple/Facebook/Microsoft) → Family profile → Trial starts → Activate 2 agents → Chat with agent → View calendar → 7 days → Trial expires → Subscribe $7.99 → Agents resume |
| Daily Use | Open app → Check Daily Edit → Chat with Grocery Guru ("what's for dinner?") → View calendar → Scan receipt → Check budget usage → Set reminder |
| Over-budget | Use 1,000 calls → See banner → Agent still responds (Gemini Flash) → Upgrade to Pro → Budget resets to 2,000 |
| PWA Install | Visit on mobile Chrome → "Add to Home Screen" prompt → Install → Open from home screen → Full standalone experience |

### Test Data Requirements

| Data | Source | Notes |
|---|---|---|
| 500 classified chat messages | Hand-labeled dataset | 250 deterministic, 250 intelligent, balanced across all 8 agents |
| 50 sample receipts | Photographed real receipts | Varied: grocery stores, restaurants, gas stations, online orders |
| 20 school newsletters | Collected from actual school emails | Events, permission slips, fees, deadlines |
| Google Calendar test account | Dedicated test account | Pre-populated with 30 events across 2 family members |

---

## 6. Open Questions / Risks

### Assumptions

| Assumption | Impact if Wrong |
|---|---|
| Web Push on iOS (Safari 16.4+) covers target audience | If many users on older iOS, push notifications won't reach them — fallback to email |
| Web Camera API sufficient for receipt OCR quality | If quality too low, add option to upload from photo library (already supported) |
| Tailwind HTML exports from design tool convert cleanly to Next.js components | If markup is too different, add 3-5 days for manual conversion |
| 35% trial-to-paid conversion with CC-required trial | If lower, may need to lower price or add free tier |
| Gemini Flash quality sufficient for simple intelligent ops | May need GPT-4o mini baseline, increasing LLM costs |

### Unknowns

| Unknown | Mitigation |
|---|---|
| School email format variability | Start with 3-5 major platforms (Seesaw, ClassDojo, ParentSquare) |
| Receipt OCR accuracy via web camera | GPT-4o vision is best available; add manual correction UI for failed scans |
| Real-world call budget usage patterns | Instrument heavily from Day 1; adjust limits at Month 2 |
| PWA install rate on iOS vs Android | iOS "Add to Home Screen" is less discoverable — add in-app install prompt |

### Architectural Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| WebSocket on Render doesn't scale past 10K | Medium | Medium | Monitor; add Ably/Pusher at 10K ($0-$30/mo) |
| LLM provider outage | Low | High | Fallback chain: GPT-4o → Claude → Gemini Flash; cache frequent responses |
| Render Postgres connection pool exhaustion | Medium | Medium | PgBouncer; upgrade to basic-4gb if needed |
| iOS Safari PWA limitations (no background sync) | Medium | Medium | Graceful degradation; consider Capacitor wrap if critical |
| Users expect native app, not PWA | Medium | Medium | "Install" prompt with clear value prop; Capacitor wrap as Phase 7 option |

### Deployment Considerations

| Consideration | Plan |
|---|---|
| Database migration | Additive only (new tables); zero downtime; `alembic upgrade head` on Render |
| Backend deploy | Render auto-deploys on push; zero downtime (rolling restart) |
| Frontend deploy | Cloudflare Pages auto-deploys on push; instant global CDN propagation |
| Rollback | Backend: Render instant rollback; Frontend: Cloudflare Pages rollback to previous deploy |
| Staging environment | Cloudflare Pages preview deployments per PR (built-in) |

---

## 7. Timeline Summary

| Phase | Weeks | Calendar | Key Milestone |
|---|---|---|---|
| **Phase 1:** Foundation | Weeks 1-2 | Month 1 | PWA boots, auth works, DB ready, design system implemented |
| **Phase 2:** Agent Backend | Weeks 2-4 | Month 1 | Intent classifier + LLM router + call budget working |
| **Phase 3:** MVP Pages | Weeks 3-5 | Month 1-2 | 6 core pages with design system |
| **Phase 4:** MVP Agents | Weeks 4-7 | Month 2 | 4 agents fully functional |
| **Phase 5:** Payments & Notifications | Weeks 6-9 | Month 2-3 | Stripe, Web Push, Daily Edit, remaining pages |
| **Phase 6:** Polish & Launch | Weeks 8-10 | Month 3 | **mom.alphaspeedai.com is LIVE** |
| **Phase 7:** Full Ecosystem | Weeks 9-12 | Month 3 | 8 agents + Family Pro features |

**Total: ~12 weeks (3 months) to full 8-agent launch**
**MVP (4 agents) live at: ~10 weeks (2.5 months)**

### Estimated Effort

| Category | Days | Cost @ $150/hr |
|---|---|---|
| Next.js PWA (13 pages + design system) | 25 | $30,000 |
| Agent backend (intent classifier, LLM router, 8 skills) | 25 | $30,000 |
| Infrastructure extensions (auth, WebSocket, R2, schema) | 11 | $13,200 |
| Stripe + notifications + Daily Edit | 8 | $9,600 |
| Testing + QA + performance | 10 | $12,000 |
| PWA polish + security + compliance | 3 | $3,600 |
| **Total** | **82 days** | **$98,400** |

### Savings vs Native App Approach

| Category | PWA | Native (React Native) | Savings |
|---|---|---|---|
| Build cost | $98,400 | $123,600 | **$25,200** |
| Annual platform fees | $0 | $1,300/yr | **$1,300/yr** |
| Apple/Google subscription tax (Year 1) | $73K | $570K | **$497K** |
| Time to launch | 10 weeks | 14 weeks | **4 weeks faster** |
| **Total Year 1 savings** | | | **~$523,500** |
