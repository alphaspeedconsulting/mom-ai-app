# Execution Strategy: Mom.alpha — AI-Driven Development Plan

**Created:** 2026-03-25
**Model:** Claude Opus 4.6 (1M context)
**Method:** `/execute-plan` (obra/superpowers pattern) per session
**Architecture:** Phase-per-session, new sessions (not compact), parallel where dependencies allow

---

## Why Opus, Not Sonnet

| Factor | Opus | Sonnet |
|---|---|---|
| Context coherence across 800+ line PRD + 700+ line dev plan | Holds full architecture in working memory | Starts losing coherence at this scale |
| Cross-file consistency (CSS vars ↔ Tailwind config ↔ components ↔ backend schemas) | Maintains exact token names, column names, API shapes across files | Drifts on variable names, schema columns, function signatures |
| Constraint adherence (CSS Zen Garden: zero hardcoded colors across 13 pages) | Holds constraints persistently throughout session | Compliance degrades as session lengthens |
| Multi-domain reasoning (frontend + backend + security + legal + calendar sync) | Strong at architectural tradeoffs across domains | Better suited for focused single-domain tasks |

**Verdict:** Opus for all execution sessions. Sonnet is fine for isolated bug fixes or single-file edits post-launch.

---

## Why New Sessions, Not Compact

Compact (context compression) is lossy — it summarizes code into prose:

- Variable names, import paths, and exact function signatures get paraphrased
- CSS token names (`--brand-glow` vs `--brand-dim`) blur together
- Schema column names drift (`accepted_at` becomes `consent_timestamp`)
- API contract shapes (request/response types) lose field-level precision

For a project where **cross-file consistency is the whole game**, lossy compression is actively harmful.

**New session + point it at committed code.** By Phase 2, Phase 1's code is committed and readable. A fresh Opus session with the planning docs + actual source files is a better context than a compressed memory of writing them.

### Session setup pattern

Each new session starts with:
1. Opus reads `CLAUDE.md` (automatic — project instructions)
2. Opus reads `prd.md`, `development-plan.md`, `execution-strategy.md` (pointed to by task prompt)
3. Opus reads the actual source code committed by previous phases
4. Execute: `/execute-plan` targeting the specific phase

This gives the model **ground truth** (committed code) rather than **compressed memory** (lossy summaries).

---

## Dependency Graph

```
Phase 0: Landing Page (standalone — zero backend dependencies)
   │
   ▼
Phase 1: Foundation (schema, auth, design system, legal consent, CI/CD)
   ├─────────────────────────────┐
   ▼                             ▼
Phase 2: Backend               Phase 3: Frontend Pages
(intent classifier,            (6 MVP pages, mock API,
 LLM router, PII masker,       CSS Zen Garden design system,
 prompt guard, CalDAV sync,     legal consent UI,
 agent skill definitions,       calendar linking UI)
 call budget, consent API)
   │                             │
   ├──────────┬──────────────────┤
   ▼          ▼                  │
Phase 4: Integration          Phase 5a: Stripe + Notifications
(wire real APIs to UI,        (subscription lifecycle,
 calendar sync E2E,            Web Push, Daily Edit —
 PII pipeline E2E,             independent of specific agents)
 consent flow E2E)
   │          │                  │
   ▼          ▼                  ▼
Phase 5b: Remaining Pages + Daily Edit + Legal Pages
   │
   ▼
Phase 6: Polish, Testing & Launch (mom.alphaspeedai.com LIVE)
   │
   ▼
Phase 7: Remaining 4 Agents + Family Pro Features
   ├──────────┐
   ▼          ▼
 7a: Wellness + Sleep    7b: Tutor + Self-Care
   │          │
   ▼          ▼
Phase 8 (Backlog): Skincare Tracker + Orthodontic/Dental Tracker
```

---

## Parallelization Rules

### CAN run in parallel

| Parallel pair | Why it works | Coordination point |
|---|---|---|
| **Phase 0 + Phase 1 (partial)** | Landing page is static content. Phase 1 backend work (schema, auth) is independent. Can overlap in same calendar week. | Shared design system tokens — Phase 0 creates subset, Phase 1 extends. |
| **Phase 2 + Phase 3** | Backend doesn't need UI. Frontend mocks the API. Both depend only on Phase 1. | API contract types file committed in Phase 1. |
| **Phase 4 + Phase 5a** | Stripe webhooks and Web Push are completely independent of which agents are wired up. | Both need Phase 1 DB schema. |
| **Phase 7a + Phase 7b** | Each agent is independent. Same skill definition pattern from Phase 2. | Shared `wellness_streaks` table schema. |
| **Phase 8 agents** | Skincare and Dental trackers are independent of each other. | Both extend Wellness Hub infrastructure. |

### CANNOT run in parallel

| Sequential pair | Why |
|---|---|
| Phase 1 → everything | Schema, auth, design system tokens, API contracts — universal dependency |
| Phase 2/3 → Phase 4 | Can't integrate what doesn't exist yet |
| Phase 4/5 → Phase 6 | Can't polish and test what isn't built |
| Phase 6 → Phase 7 | Launch first, then expand (Phase 7 agents can't be tested without live infrastructure) |

---

## Session-by-Session Execution Plan

### Session 0: Phase 0 — Landing Page (Solo, ships first)

**Estimated duration:** 1 session (medium)
**Prerequisites:** None — this is the true starting point. Ships before anything else.

**Task prompt:**
```
Read prd.md (Section 5: FR-0 Landing Page) and development-plan.md (Phase 0).
Build the Mom.alpha landing page using /execute-plan.

This page ships BEFORE the app exists. It drives interest from AlphaSpeedAi.com
and collects waitlist emails.

Key deliverables:
1. Next.js project init with Tailwind + Cloudflare Pages deploy config
2. CSS Zen Garden Layer 1-3 (subset: landing page tokens only — will be extended in Phase 1)
3. Landing page at root route (/) with all sections:
   - Hero: "Take a breath. We'll handle the rest." + animated product mockup
   - Agent showcase: 8 agent cards with icons + descriptions + mini visual demos
   - "A Day With Mom.alpha": timeline narrative (7am → 8pm story arc)
   - Feature deep-dives: 3-4 sections with screenshot mockups from design exports
   - Trust & privacy: "Your family data is never used to train AI" + badges
   - Pricing: Family vs Family Pro comparison table
   - FAQ: expandable accordion
   - Final CTA + footer with AlphaSpeed AI branding
4. Mobile: sticky bottom CTA bar
5. Pre-launch waitlist: email capture form (Resend or Mailchimp integration)
6. SEO: meta tags, Open Graph, Product schema JSON-LD, sitemap.xml
7. Animated product mockups using existing screenshots from stitch_screenshot_of_https_mom.alphaspeedai.com/

Use /alphaai-frontend-design for creative design within token constraints.
Use existing design exports as source material for mockup animations.
Run /ui-consistency-review before completing.
Target: Lighthouse Performance ≥95, SEO ≥95, FCP <1.5s.
```

**Verification:**
- `mom.alphaspeedai.com` is live with landing page
- Lighthouse Performance ≥95, SEO ≥95
- Hero loads in <1.5s FCP
- Sticky mobile CTA works on iOS Safari + Chrome Android
- Email capture records to Resend/Mailchimp
- `/ui-consistency-review` passes (zero hardcoded colors)
- Open Graph preview renders correctly when shared on social media

**Why this ships first:** The landing page has zero dependencies on the backend. While Phase 1+ builds the actual app, the landing page is already:
- Collecting waitlist emails (validating demand)
- Building SEO authority (Google indexing starts)
- Giving AlphaSpeedAi.com a product page to cross-promote
- Testing headline/CTA messaging (iterate copy based on analytics)

---

### Session 1: Phase 1 — Foundation (Solo)

**Estimated duration:** 1 session (large)
**Prerequisites:** None — this is the starting point.

**Task prompt:**
```
Read prd.md, development-plan.md, and execution-strategy.md.
Execute Phase 1 from development-plan.md using /execute-plan.

Key deliverables:
1. Next.js project init with PWA config
2. CSS Zen Garden 4-layer design system (index.css → tailwind.config.ts → mom-alpha.css → components)
3. Database schema (all 14 tables including consent_records and legal_documents)
4. Auth extension: **Google + email/password** required; **Facebook/Microsoft** when provider apps are ready; **Sign in with Apple deferred to Phase 7** (Capacitor); legal consent gate + COPPA flow per `development-plan.md` Phase 1
5. API contract types file (src/types/api-contracts.ts) — this is the handshake for parallel Phase 2/3
6. CI/CD pipeline
7. Test fixtures under `/tests/fixtures/` + READMEs; `.env.example`; Render env groups + secret inventory (`development-plan.md` Phase 1 §6–7)

Run /ui-consistency-review on the design system before completing.
```

**Verification before moving on:**
- `next dev` renders home page skeleton with design system tokens
- PWA installable from Chrome (Lighthouse PWA audit)
- **Google** OAuth login returns JWT (other providers when enabled)
- All 14 tables created in Render Postgres
- `/ui-consistency-review` returns zero violations
- `src/types/api-contracts.ts` committed with all request/response shapes

**Critical output:** `src/types/api-contracts.ts` — both Phase 2 and Phase 3 sessions read this file. It defines:
- Chat API: request/response shapes for `/api/chat`
- Budget API: `/api/budget/{household_id}` response shape
- Consent API: `/api/consent` request shape
- Calendar API: event CRUD shapes
- Agent marketplace: agent card data shape
- Auth: JWT claims structure

---

### Session 2a: Phase 2 — Backend (Parallel with 2b)

**Estimated duration:** 1 session (large)
**Prerequisites:** Phase 1 committed and pushed.

**Task prompt:**
```
Read prd.md, development-plan.md, and src/types/api-contracts.ts.
Execute Phase 2 from development-plan.md using /execute-plan.

Key deliverables:
1. Intent classifier (rule-based + regex; ≥80% before Phase 3 integration, ≥90% target on full 500-message set)
2. LLM Router (Gemini Flash / GPT-4o mini / GPT-4o selection)
3. PII masker pipeline (strip/tokenize before LLM, in-memory token map, re-map on response)
4. Prompt guard (injection detection, Unicode normalization, output validation)
5. Call budget tracker (increment, check, reset, over-budget downgrade)
6. Deterministic operation handlers (calendar, lists, reminders, streaks, expenses, slips)
7. 4 MVP agent skill definitions (Calendar Whiz, Grocery Guru, School Event Hub, Budget Buddy)
8. **WebSocket layer** (JWT handshake, household rooms, JSON envelope protocol — `development-plan.md` Phase 2)
9. **LLM cost monitoring** (Langfuse tags, `GET /api/admin/llm-costs`, spend alerts — `development-plan.md` Phase 2)
10. CalDAV sync module for Apple Calendar
11. Consent recording API (POST /api/consent, append-only)

All API endpoints must match the shapes in src/types/api-contracts.ts exactly.
Run /run-tests after each major component.
```

**Verification:**
- "Add milk to grocery list" executes in <50ms with zero LLM calls
- "Plan dinners for the week" routes to GPT-4o mini, decrements call budget
- PII masker strips names/addresses/phones from 200 test messages with zero leakage
- Prompt guard blocks ≥95% of 100 injection test patterns
- CalDAV connects to iCloud test account and syncs events
- WebSocket: valid JWT → connect → receive at least one test event on a household channel
- **Phase 2 minimum unblock gate** satisfied before Phase 4 work begins (see `development-plan.md`)

---

### Session 2b: Phase 3 — Frontend Pages (Parallel with 2a)

**Estimated duration:** 1 session (large)
**Prerequisites:** Phase 1 committed and pushed.

**Task prompt:**
```
Read prd.md, development-plan.md, and src/types/api-contracts.ts.
Execute Phase 3 from development-plan.md using /execute-plan.

Key deliverables:
1. Login/Signup: **Google** (+ email) first; **Facebook/Microsoft** when enabled; **no Apple button** until Phase 7; legal consent screen (3 checkboxes: ToS, Privacy, AI Disclosure)
2. Onboarding page (family profile setup, COPPA consent for children under 13)
3. Home/Marketplace page (agent discovery, carousel, activate toggle)
4. Agent Chat page (per-agent dynamic route, message bubbles, quick action chips, typing indicator)
5. Family Calendar page (monthly grid, color coding, filter chips, calendar account linking UI)
6. Tasks Dashboard page (agent status, progress bars, WebSocket-driven updates when backend ready)
7. **Error & empty states** + offline banner (`development-plan.md` Phase 3 §7)

ALL pages must use CSS Zen Garden tokens only — zero hardcoded hex/rgb/hsl values.
Mock all API calls using src/types/api-contracts.ts shapes (return stubbed data).
Extract components from stitch_screenshot_of_https_mom.alphaspeedai.com/ HTML exports.
Run /ui-consistency-review on each page after building it.
Run /alphaai-design-system when starting each new page.
```

**Verification:**
- All 6 pages render and navigate correctly
- `/ui-consistency-review` passes on all 6 pages (zero hardcoded colors)
- Theme swap test: apply `.midnight-mom` class → all pages adopt alternate palette
- Legal consent screen blocks progression until all 3 checkboxes accepted
- Lighthouse accessibility ≥90 on all pages

---

### Session 3a: Phase 4 — Integration (After 2a + 2b complete)

**Estimated duration:** 1 session (medium)
**Prerequisites:** Phase 2 and Phase 3 committed and pushed.

**Task prompt:**
```
Read prd.md and development-plan.md.
Execute Phase 4 from development-plan.md using /execute-plan.

Key deliverables:
1. Replace all mock API calls in frontend with real backend endpoints
2. Calendar Whiz: wire Google Calendar MCP + CalDAV sync to calendar page
3. Grocery Guru: wire list CRUD + meal planning to chat interface
4. School Event Hub: wire email parsing + permission slips to agent page
5. Budget Buddy: wire receipt OCR + expense tracking to agent page
6. Agent-specific pages (/agents/school, /agents/budget)
7. E2E: signup → consent → activate agent → chat → calendar sync

Run /run-tests for each agent integration.
Run /ui-consistency-review on new agent pages.
```

---

### Session 3b: Phase 5a — Stripe + Notifications (Parallel with 3a)

**Estimated duration:** 1 session (medium)
**Prerequisites:** Phase 1 committed (DB schema, auth).

**Task prompt:**
```
Read prd.md and development-plan.md.
Execute Phase 5 tasks 1-3 from development-plan.md using /execute-plan.

Key deliverables:
1. Stripe subscription system (Family $7.99, Pro $14.99, 7-day trial)
2. Webhook handlers (subscription lifecycle, trial expiry, failed payment)
3. Web Push notifications (VAPID, Service Worker, quiet hours)
4. Daily Edit cron job (morning summary generation)

These are independent of which agents are wired up — focus on subscription
lifecycle and notification delivery infrastructure.
Run /run-tests after each component.
```

---

### Session 4: Phase 5b + Phase 6 — Remaining Pages + Polish + Launch (Solo)

**Estimated duration:** 1 session (large)
**Prerequisites:** Phases 4 and 5a committed and pushed.

**Task prompt:**
```
Read prd.md and development-plan.md.
Execute Phase 5 tasks 4-6 and Phase 6 from development-plan.md using /execute-plan.

Key deliverables:
Phase 5b:
1. Remaining 7 pages (Profile, Settings, Notifications, Wellness Hub, Tutor Finder, Legal pages)
2. Call budget UI (usage display, over-budget banner)
3. Legal document pages (/legal/terms, /legal/privacy, /legal/ai-disclosure)
4. Document update re-acceptance flow
5. Consent history in Settings

Phase 6:
1. Performance optimization (deterministic <50ms, intelligent <2s P95)
2. PWA polish (offline, install prompt, splash screen)
3. COPPA compliance verification
4. Security hardening (full PII pipeline audit)
5. Full test suite (unit + integration + E2E + CSS Zen Garden compliance + theme swap)
6. Production deploy to mom.alphaspeedai.com

Run /ui-consistency-review on ALL 13 pages.
Run /verify-plan-completion against development-plan.md Phases 1-6.
```

---

### Session 5a + 5b: Phase 7 — Remaining Agents (Parallel)

**Estimated duration:** 1 session each (medium)
**Prerequisites:** Phase 6 complete (live production).

**Session 5a prompt:**
```
Execute Phase 7 agents 1+3: Wellness Hub + Sleep Tracker.
Follow the same deterministic/intelligent split pattern from Phase 4.
Run /run-tests and /ui-consistency-review.
```

**Session 5b prompt:**
```
Execute Phase 7 agents 2+4: Tutor Finder + Self-Care Reminder.
Follow the same deterministic/intelligent split pattern from Phase 4.
Run /run-tests and /ui-consistency-review.
```

---

### Session 6 (Post-Launch Backlog): Phase 8 — Specialized Trackers

**Estimated duration:** 1 session (medium)
**Prerequisites:** Phase 7 complete (Wellness Hub operational).

```
Execute Phase 8 from development-plan.md:
1. Skincare Tracker (routine logging, product schedules, conflict detection, facial appointments)
2. Orthodontic & Dental Tracker (device reminders, compliance streaks, treatment timeline)
Both reuse existing streak, calendar, and reminder infrastructure.
```

---

### Session 7: Phase 9 — GA4, Sitemap & SEO (Solo, semi-manual)

**Estimated duration:** 1 session (medium) + manual developer tasks
**Prerequisites:**
1. App live (Phase 6 complete)
2. **SEO skills ported from Cowork Plugin repo** into `.claude/skills/` (manual — done by developer before session)
3. **GA4 property created** in Google Analytics console (manual — done by developer before session)
4. **Google Search Console verified** for `mom.alphaspeedai.com` (manual — done by developer before session)

**Task prompt:**
```
Read prd.md and development-plan.md (Phase 9).
Execute the GA4, Sitemap & SEO optimization phase using /execute-plan.

Prerequisites already completed by developer:
- SEO skills available in .claude/skills/
- GA4 measurement ID: [DEVELOPER FILLS IN]
- Search Console verified for mom.alphaspeedai.com

Key deliverables:
1. GA4 integration: gtag.js via Next.js Script, page view tracking,
   custom events (signup_start, consent_accepted, trial_activated,
   agent_activated, agent_chat_sent, receipt_scanned, calendar_synced,
   cta_clicked, trial_expired, subscription_started)
2. User properties: subscription_tier, agent_count, household_size
3. NO PII in GA4 — only anonymized event data
4. Cookie consent banner (GDPR) — analytics cookies after consent only
5. next-sitemap: auto-generated sitemap.xml + robots.txt
   (public pages only, exclude /api/*, /chat/*, /tasks/*, /profile/*)
6. Per-page SEO: meta tags, Open Graph, Twitter Card, structured data
   (Product schema + SoftwareApplication schema on landing page)
7. Heading hierarchy audit (H1 → H2 → H3, no skipped levels)
8. Image alt text audit
9. Core Web Vitals optimization (FCP <1.5s, LCP <2.5s, CLS <0.1)
10. Font optimization via next/font (self-hosted, no CLS)

Run the ported SEO skills for automated audit on all public pages.
Run /ui-consistency-review to confirm no regressions.
Target: Lighthouse SEO ≥95 on all public pages.
```

**What the developer does before/after this session:**

| Timing | Developer Task |
|---|---|
| **Before** | Port SEO skills from Cowork Plugin repo → `.claude/skills/` |
| **Before** | Create GA4 property in Google Analytics → get measurement ID |
| **Before** | Verify `mom.alphaspeedai.com` in Google Search Console (DNS TXT record) |
| **After** | Submit `sitemap.xml` in Search Console UI |
| **After** | Create GA4 Explorations: funnel report (landing → signup → trial → paid) |
| **After** | Create custom OG image (1200x630) in Figma/Canva for social sharing |
| **After** | Set up GA4 alerts: trial conversion <3%, bounce rate >50% |
| **After** | Test social sharing previews: Twitter, Facebook, LinkedIn, WhatsApp |

**Verification:**
- GA4 Realtime report shows page views and custom events firing
- `mom.alphaspeedai.com/sitemap.xml` returns valid XML with all public pages
- `mom.alphaspeedai.com/robots.txt` blocks authenticated routes
- Lighthouse SEO ≥95 on landing page and legal pages
- PageSpeed Insights mobile ≥90
- Cookie consent banner appears on first visit, blocks analytics until accepted

---

## Session Summary

| Session | Phase | Parallel? | Estimated Size | Key Risk |
|---|---|---|---|---|
| **0** | **Phase 0: Landing Page** | **Solo (ships first)** | **Medium** | **Copy/messaging resonance, animation performance** |
| **1** | Phase 1: Foundation | Solo | Large | Design system token consistency |
| **2a** | Phase 2: Backend | Parallel with 2b | Large | Intent classifier accuracy, PII masker coverage |
| **2b** | Phase 3: Frontend | Parallel with 2a | Large | CSS Zen Garden compliance across 6 pages |
| **3a** | Phase 4: Integration | Parallel with 3b | Medium | API contract mismatches between frontend/backend |
| **3b** | Phase 5a: Stripe + Push | Parallel with 3a | Medium | Stripe webhook edge cases |
| **4** | Phase 5b + 6: Polish + Launch | Solo | Large | Full test suite, performance targets |
| **5a** | Phase 7a: Wellness + Sleep | Parallel with 5b | Medium | Low (proven patterns) |
| **5b** | Phase 7b: Tutor + Self-Care | Parallel with 5a | Medium | Low (proven patterns) |
| **6** | Phase 8: Skincare + Dental | Solo | Medium | Low (reuses existing infra) |
| **7** | **Phase 9: GA4 + Sitemap + SEO** | **Solo (semi-manual)** | **Medium** | **Requires SEO skills ported from Cowork repo + manual GA4/Search Console setup** |

**Total: 11 sessions across 8 calendar slots** (3 parallel pairs reduce elapsed time).
**Landing page live: Session 0 (before any backend work begins).**
**SEO session: Runs after launch, requires developer prep (GA4 property, Search Console, SEO skills port).**

---

## Quality Gates Per Session

Every session ends with these checks before moving to the next:

| Gate | Tool/Command | Pass Criteria |
|---|---|---|
| CSS Zen Garden compliance | `/ui-consistency-review` | Zero hardcoded hex/rgb/hsl in components |
| Theme swap | Apply `.midnight-mom` class | All pages render correctly with alternate palette |
| Tests | `/run-tests` | All unit + integration tests green |
| Plan completion | `/verify-plan-completion` | All phase tasks checked off |
| Code quality | `/code-review` | 4-pass architecture compliance |
| Git | `/git-push` | All changes committed and pushed |

---

## Risk Mitigations

| Risk | Mitigation |
|---|---|
| API contract mismatch between Phase 2/3 parallel sessions | `src/types/api-contracts.ts` committed in Phase 1 as single source of truth. Both sessions import from it. |
| CSS Zen Garden drift across sessions | `/ui-consistency-review` runs after every page. Catches violations immediately. |
| Schema drift between sessions | All migrations committed in Phase 1. No schema changes after Phase 1 without explicit coordination. |
| Context loss between sessions | New session reads committed code (ground truth), not compressed memory. Planning docs provide architectural intent. |
| PII masker gaps | 200-message test suite with explicit coverage of edge cases (Unicode names, mixed-language addresses, partial PII fragments). Run every session. |

---

## File Reference

| Document | Purpose | Read When |
|---|---|---|
| `CLAUDE.md` | Project overview, design system summary, backend services | Every session (automatic) |
| `prd.md` | Full requirements, user stories, acceptance criteria, legal framework, LLM security | Every session |
| `development-plan.md` | Phase-by-phase tasks, success criteria, effort estimates, test strategy | Every session |
| `execution-strategy.md` | This file — session structure, parallelization, quality gates | Every session |
| `architecture-analysis.md` | Architecture options, scoring, reuse analysis | Session 1 (foundation decisions) |
| `pricing.md` | Tier structure, LLM cost model, revenue projections | Session 3b (Stripe setup) |
| `src/types/api-contracts.ts` | API request/response shapes — handshake between frontend/backend | Sessions 2a, 2b, 3a |
