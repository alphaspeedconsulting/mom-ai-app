# Enhancement Plan: Viral Growth Features — Mom.alpha

**Created:** 2026-03-30
**Status:** Draft
**Author:** Claude
**Related Files:** `src/types/api-contracts.ts`, `src/lib/api-client.ts`, `src/styles/mom-alpha.css`, `src/components/dashboard/DailyBrief.tsx`, `src/stores/tasks-store.ts`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/layout.tsx`, `src/components/shared/BottomNav.tsx`

---

## 1. Enhancement Breakdown

### The Problem
Mom.alpha is a fully-featured household management PWA with 8 AI agents, co-parent support, and a local memory layer. But it has **zero viral mechanics**. Users don't have reasons to share, invite, or recruit. The app is a private productivity tool when it should be a social household operating system.

### What's Being Added
12 features across 4 phases that create **5 viral loops**:

| Loop | Mechanic | Features |
|------|----------|----------|
| **Content Loop** | Users generate shareable content that non-users see | Weekly Win Card, Share-to-Message |
| **Invitation Loop** | Users invite specific people to join | Smart Referrals, Caregiver Mode |
| **Balance Loop** | One parent's usage creates urgency for the other | Co-Parent Balance Dashboard |
| **Community Loop** | Content gets better with more users | Templates Marketplace, Village Feed |
| **Word-of-Mouth Loop** | Features so remarkable people tell stories | Emergency Button, Voice Briefing |

### Services/Areas Affected

| Area | Impact |
|------|--------|
| Dashboard | New cards (Balance, Referral Banner, Seasonal Pack, Emergency Button) |
| Navigation | Potential new nav items or hub restructure |
| Auth/Signup | Referral code redemption, caregiver access tokens |
| API Client | 15+ new endpoint wrappers |
| API Contracts | 12+ new TypeScript interfaces |
| Design System | 8-10 new Layer 3 component classes |
| Stores | 6 new Zustand stores |
| Routes | 10+ new pages |

---

## 2. Reuse vs New Code Analysis

### Reuse as-is

| Pattern | Source | Reused In |
|---------|--------|-----------|
| Card layout with gradient header | `DailyBrief.tsx` | WeeklyWinCard, BalanceCard, GoalCard, SeasonalPackCard |
| Overlay + floating action button | `QuickCapture.tsx` | EmergencyButton trigger, VillageComposer |
| Settings section layout | `SettingsPage` | Referral page, Caregivers page, Goals page |
| Analytics progress bars | `AnalyticsPage` components | Balance doughnut, Goal progress ring |
| Chip/badge patterns | `mom-chip`, `mom-chip-secondary` | Template tags, seasonal tags, caregiver role badges |
| Auth guard + redirect | `DashboardPage` useEffect pattern | All new authenticated pages |
| Store shape (loading/error/data) | `household-store.ts` | All 6 new stores |
| Empty state component | `EmptyState` | All new list pages |
| Modal/bottom sheet | Settings panels | Share sheet, caregiver invite, goal creator |

### Needs extension

| Component | Extension Needed |
|-----------|-----------------|
| `DailyBrief.tsx` | Add confetti trigger check, voice briefing play button, emergency status indicator |
| `tasks-store.ts` | Add `celebrationShown` state + actions |
| `api-contracts.ts` | Add 12+ new interfaces |
| `api-client.ts` | Add 15+ new endpoint methods |
| `mom-alpha.css` | Add 8-10 new component classes |
| `BottomNav.tsx` | Consider adding "Village" or "Family" tab |
| Dashboard page | Integrate new cards below DailyBrief |
| App layout | Confetti overlay component |
| Auth/signup flow | Referral code field |

### Net-new (with justification)

| New Code | Why It Can't Reuse Existing |
|----------|---------------------------|
| `html2canvas` integration | No image rendering exists. Needed to convert Win Card DOM → shareable PNG. |
| `use-share.ts` hook | No Web Share API wrapper exists. Navigator.share() with clipboard fallback. |
| `use-voice-briefing.ts` hook | No speech synthesis exists. Web Speech API for morning briefing narration. |
| `Confetti.tsx` | No animation system exists. CSS-only (no library), 15-20 span elements with keyframes. |
| `WinCardRenderer.tsx` | Unique to sharing flow. Renders styled div → canvas → blob → share. |
| 6 new Zustand stores | Each feature domain needs its own state (wins, balance, referral, templates, goals, village). Follows existing pattern. |
| 10+ new pages | Each feature needs its own route. Follows existing `src/app/(app)/` pattern. |
| Public preview pages | Share links and caregiver view need unauthenticated access — new pattern for this app. |

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

| Workflow | Steps Changed | Impact |
|----------|---------------|--------|
| User Signup | Add optional referral code field | Low — additive, existing flow untouched |
| Dashboard Render | Add 3-4 new card components below DailyBrief | Low — additive, existing cards unchanged |
| Task Completion | Check if all daily tasks done → trigger celebration | Low — post-completion side effect only |
| Chat with Agent | No changes | None |
| Co-Parent Invite | No changes (balance dashboard reads existing data) | None |
| Push Notifications | Add celebration + emergency notification types | Low — additive |

### State Transitions Introduced

| New State | Trigger | Side Effect |
|-----------|---------|-------------|
| `celebration_triggered` | All daily tasks completed | Confetti animation + toast |
| `emergency_active` | User presses Emergency button | Delegates all tasks to co-parent, notifies them |
| `emergency_deactivated` | User recovers or timer expires | Shows debrief, restores normal state |
| `caregiver_access_granted` | Parent invites caregiver | Caregiver gets limited access token |
| `referral_redeemed` | New user enters referral code at signup | Both users get 2 free weeks of Family Pro |
| `template_cloned` | User clones a community template | Template items added to household routines |

### Regression Risk

| Area | Risk | Mitigation |
|------|------|------------|
| Dashboard layout | Medium | New cards are additive below DailyBrief. Existing cards untouched. |
| Auth flow | Low | Referral code is optional field — existing signup untouched |
| Task store | Low | `celebrationShown` is isolated boolean, no interference with existing state |
| API client | Low | All new methods in new namespaces, no modification of existing methods |
| Navigation | Medium | If BottomNav changes, test all 5 existing nav items still work |
| Public routes | Low | New pattern (unauthenticated pages), but isolated from authenticated app |

---

## 4. Implementation Phases

### Phase 1: Shareable Moments + Micro-Celebrations (~6 days)

**Rationale**: Ship the features with highest viral coefficient per engineering day. These generate organic content that non-users see, and they require minimal backend work.

#### Tasks

**1A. Weekly Family Win Card (3 days)**
- [ ] Add `WeeklyWinSummary` type to `api-contracts.ts`
- [ ] Add `wins.weekly()` method to `api-client.ts`
- [ ] Create `src/stores/wins-store.ts` (Zustand, loading/error/data pattern)
- [ ] Create `src/components/wins/WeeklyWinCard.tsx` — branded card with stats
- [ ] Create `src/components/wins/WinCardRenderer.tsx` — html2canvas → PNG blob
- [ ] Create `src/components/wins/ShareSheet.tsx` — navigator.share() + clipboard fallback
- [ ] Create `src/app/(app)/wins/page.tsx` — weekly wins page
- [ ] Add `mom-win-card`, `mom-share-btn` classes to `mom-alpha.css`
- [ ] Install `html2canvas` dependency
- [ ] Add link to wins page from dashboard (below DailyBrief or in nav)

**1B. Micro-Celebrations (1.5 days)**
- [ ] Create `src/components/shared/Confetti.tsx` — CSS-only confetti animation
- [ ] Create `src/components/shared/CelebrationToast.tsx` — slide-up toast
- [ ] Add `celebrationShown`, `showCelebration()`, `dismissCelebration()` to `tasks-store.ts`
- [ ] Add confetti trigger logic to `DailyBrief.tsx` (when all tasks done)
- [ ] Add confetti overlay mount point to `layout.tsx`
- [ ] Add `@keyframes mom-confetti-fall`, `.mom-confetti-piece`, `.mom-celebration-toast` to CSS

**1C. Share-to-Message Deep Links (1.5 days)**
- [ ] Add `ShareLinkRequest`, `ShareLinkResponse`, `SharePreviewResponse` to `api-contracts.ts`
- [ ] Add `share.create()`, `share.preview()` to `api-client.ts`
- [ ] Create `src/components/shared/ShareButton.tsx` — reusable share trigger
- [ ] Create `src/hooks/use-share.ts` — Web Share API wrapper hook
- [ ] Create `src/app/(app)/share/[type]/[id]/page.tsx` — public preview page
- [ ] Integrate `ShareButton` into grocery list items, calendar events, task items

#### Dependencies
- Backend: `GET /api/wins/{household_id}/weekly`, `POST /api/household/{id}/share`, `GET /api/share/{token}`
- npm: `html2canvas` package

#### Success Criteria
- Win Card renders correctly on iOS Safari and Android Chrome
- Web Share API triggers native share sheet (fallback to clipboard on desktop)
- Share preview page loads without auth and shows signup CTA
- Confetti triggers when last daily task is completed
- `npm run build` passes with zero errors
- `/ui-consistency-review` passes (no hardcoded values in TSX)

---

### Phase 2: Co-Parent Network + Referral Engine (~10 days)

**Rationale**: Turn single-parent households into two-parent households (2x LTV) and give every user a reason to recruit friends.

#### Tasks

**2A. Co-Parent Balance Dashboard (3 days)**
- [ ] Add `CoParentBalance` type to `api-contracts.ts`
- [ ] Add `balance.get()` to `api-client.ts`
- [ ] Create `src/stores/balance-store.ts`
- [ ] Create `src/components/balance/BalanceDoughnut.tsx` — CSS conic-gradient split
- [ ] Create `src/components/balance/BalanceCard.tsx` — weekly summary (reuse DailyBrief card pattern)
- [ ] Create `src/components/balance/BalanceHistory.tsx` — 4-week trend bars
- [ ] Create `src/app/(app)/balance/page.tsx`
- [ ] Add balance summary card to dashboard page (below DailyBrief)
- [ ] Add share button to balance card (reuse ShareButton from Phase 1)

**2B. Smart Referral Engine (3 days)**
- [ ] Add `ReferralInfo`, `ReferralRedeemRequest` types to `api-contracts.ts`
- [ ] Add `referral.get()`, `referral.redeem()` to `api-client.ts`
- [ ] Create `src/stores/referral-store.ts`
- [ ] Create `src/components/referral/ReferralCard.tsx` — code + share button
- [ ] Create `src/components/referral/ReferralStats.tsx` — friends invited/joined/earned
- [ ] Create `src/components/referral/ReferralBanner.tsx` — dismissible dashboard banner
- [ ] Create `src/app/(app)/referral/page.tsx`
- [ ] Add optional referral code field to signup form (`AuthForm.tsx`)
- [ ] Add referral banner to dashboard page

**2C. Caregiver Mode (4 days)**
- [ ] Add `CaregiverAccess`, `CaregiverInviteRequest`, `CaregiverViewData` types to `api-contracts.ts`
- [ ] Add `caregivers` namespace to `api-client.ts` (list, create, delete, getView)
- [ ] Create `src/components/caregivers/CaregiverList.tsx`
- [ ] Create `src/components/caregivers/CaregiverInvite.tsx` — modal with name, email, role, permissions
- [ ] Create `src/components/caregivers/CaregiverViewLayout.tsx` — stripped-down read-only dashboard
- [ ] Create `src/app/(app)/caregivers/page.tsx` — manage caregivers
- [ ] Create `src/app/(app)/caregiver-view/page.tsx` — limited view (public, token-authenticated)
- [ ] Add caregiver management link to Settings page

#### Dependencies
- Phase 1 complete (reuse ShareButton, use-share hook)
- Backend: balance, referral, and caregiver endpoints

#### Success Criteria
- Balance shows correct split for two-parent household, graceful empty state for single-parent
- Referral code generates, shares, and redeems correctly
- Caregiver receives email, accesses limited view, sees only permitted data
- All pages mobile-responsive, design system compliant

---

### Phase 3: Content Flywheel (~12 days)

**Rationale**: Build user-generated content that attracts new users and retains existing ones.

#### Tasks

**3A. Family Templates Marketplace (5 days)**
- [ ] Add `FamilyTemplate`, `TemplateCreateRequest`, `TemplateCategory` types to `api-contracts.ts`
- [ ] Add `templates` namespace to `api-client.ts` (list, get, create, clone, rate)
- [ ] Create `src/stores/templates-store.ts`
- [ ] Create `src/components/templates/TemplateBrowser.tsx` — search + filter grid
- [ ] Create `src/components/templates/TemplateCard.tsx` — preview card with use count + rating
- [ ] Create `src/components/templates/TemplateDetail.tsx` — full view with clone button
- [ ] Create `src/components/templates/TemplateCreator.tsx` — form to publish from existing routine
- [ ] Create `src/app/(app)/templates/page.tsx`, `[id]/page.tsx`, `create/page.tsx`

**3B. Seasonal Intelligence Packs (3 days)**
- [ ] Add `SeasonalPack` type to `api-contracts.ts`
- [ ] Add `seasonal.current()` to `api-client.ts`
- [ ] Create `src/components/seasonal/SeasonalPackCard.tsx`
- [ ] Create `src/components/seasonal/SeasonalBanner.tsx` — dashboard integration
- [ ] Create `src/app/(app)/seasonal/page.tsx`
- [ ] Integrate seasonal banner into dashboard (time-gated visibility)

**3C. Family Goals (4 days)**
- [ ] Add `FamilyGoal`, `GoalType` types to `api-contracts.ts`
- [ ] Add `goals` namespace to `api-client.ts` (CRUD)
- [ ] Create `src/stores/goals-store.ts`
- [ ] Create `src/components/goals/GoalCard.tsx` — progress ring + status
- [ ] Create `src/components/goals/GoalCreator.tsx` — goal type picker + target setter
- [ ] Create `src/components/goals/GoalProgress.tsx` — animated SVG progress ring
- [ ] Create `src/app/(app)/goals/page.tsx`
- [ ] Link goal completion to celebration system (Phase 1 confetti)

#### Dependencies
- Phase 1 celebrations system (confetti on goal completion)
- Backend: templates, seasonal, and goals endpoints

#### Success Criteria
- Templates searchable, cloneable, and rateable
- Seasonal packs appear/disappear based on date range
- Goal progress updates when related agent data changes
- Template creator can publish from existing household routines

---

### Phase 4: Voice + Emergency + Community (~17 days)

**Rationale**: Features that generate the most organic word-of-mouth and build long-term network effects. Only start after Phase 1-3 show traction.

#### Tasks

**4A. Voice Morning Briefing (5 days)**
- [ ] Add `VoiceBriefScript` type to `api-contracts.ts`
- [ ] Add `voice.getBrief()` to `api-client.ts`
- [ ] Create `src/hooks/use-voice-briefing.ts` — Web Speech Synthesis API wrapper
- [ ] Create `src/components/dashboard/VoiceBriefing.tsx` — play/pause button
- [ ] Integrate into `DailyBrief.tsx` header area
- [ ] Handle iOS Safari speech synthesis quirks (user gesture requirement)

**4B. Emergency "I'm Sick" Button (4 days)**
- [ ] Add `EmergencyActivateRequest`, `EmergencyStatus` types to `api-contracts.ts`
- [ ] Add `emergency` namespace to `api-client.ts` (activate, status, deactivate)
- [ ] Create `src/components/shared/EmergencyButton.tsx` — prominent button on dashboard
- [ ] Create `src/components/emergency/EmergencyStatus.tsx` — what was delegated
- [ ] Create `src/components/emergency/EmergencyDebrief.tsx` — "Welcome back" recovery
- [ ] Create `src/app/(app)/emergency/page.tsx`
- [ ] Add confirmation dialog (prevent accidental activation)
- [ ] Push notification to co-parent on activation

**4C. "Mom's Village" Community Feed (8 days)**
- [ ] Design community data model (posts, comments, reactions, moderation)
- [ ] Add extensive types to `api-contracts.ts`
- [ ] Add `village` namespace to `api-client.ts` (feed, post, comment, react, report)
- [ ] Create `src/stores/village-store.ts` (feed state, infinite scroll, filters)
- [ ] Create `src/components/village/VillageFeed.tsx` — infinite scroll feed
- [ ] Create `src/components/village/VillagePost.tsx` — post card with reactions
- [ ] Create `src/components/village/VillageComposer.tsx` — create post (reuse QuickCapture pattern)
- [ ] Create `src/components/village/VillageFilters.tsx` — topic, age group, location
- [ ] Create `src/app/(app)/village/page.tsx`, `village/post/page.tsx`
- [ ] Add content moderation flags + report button
- [ ] Consider adding "Village" tab to BottomNav

#### Dependencies
- Co-parent system working (Emergency depends on delegation)
- Sufficient user base for community feed (Phase 4C)
- Backend: voice brief generation, emergency delegation, community CRUD + moderation

#### Success Criteria
- Voice briefing plays on iOS Safari and Android Chrome
- Emergency activation delegates tasks and notifies co-parent within 30 seconds
- Emergency deactivation restores normal state
- Village feed loads, scrolls, and filters without jank
- Community posts have moderation (report, flag, hide)

---

## 5. Testing Strategy

### Unit Tests (when test framework added)
- Win Card data formatting (edge cases: zero tasks, no savings data)
- Celebration trigger logic (boundary conditions)
- Referral code validation
- Balance percentage calculations
- Goal progress derivation

### E2E Tests (Playwright — `tests/e2e/`)
| Test | Phase | What It Covers |
|------|-------|----------------|
| `wins-share.spec.ts` | 1 | Win card renders, share triggers, fallback works |
| `celebration.spec.ts` | 1 | Confetti appears when all tasks done, dismisses correctly |
| `share-link.spec.ts` | 1 | Deep link creates, preview loads without auth, CTA links to signup |
| `balance.spec.ts` | 2 | Single-parent empty state, two-parent split renders |
| `referral.spec.ts` | 2 | Code generates, shares, redeems at signup |
| `caregiver.spec.ts` | 2 | Invite sends, limited view renders with correct permissions |
| `templates.spec.ts` | 3 | Browse, search, clone, create, rate |
| `goals.spec.ts` | 3 | Create goal, update progress, complete triggers celebration |
| `voice-brief.spec.ts` | 4 | Play/pause toggle, speech synthesis called with correct text |
| `emergency.spec.ts` | 4 | Activate with confirmation, status page, deactivate |

### Design System Compliance
- Run `/ui-consistency-review` after each phase
- Zero hardcoded colors, font sizes, or inline styles in new TSX files
- All new component classes use CSS variable tokens in `mom-alpha.css`

### Cross-Browser Testing (Manual)
- iOS Safari 16.4+ (Web Share API, Speech Synthesis)
- Android Chrome (Web Share API, html2canvas)
- Desktop Chrome/Firefox (clipboard fallback)

---

## 6. Open Questions / Risks

### Open Questions
1. **BottomNav capacity** — Currently 5 items. Adding Village or Family tab requires redesign or "More" menu. Decision needed before Phase 4C.
2. **Public preview routes** — Share previews and caregiver views are unauthenticated. Need to ensure static export (GitHub Pages) can handle dynamic public routes, or these may need backend-rendered pages.
3. **html2canvas reliability** — Known issues with certain CSS properties (gradients, shadows). May need to simplify Win Card design for reliable rendering.
4. **Community moderation** — Village Feed needs moderation from day one. Who moderates? AI auto-moderation? Manual review? Decision needed before Phase 4C.
5. **dad-alpha sync** — All `api-contracts.ts` and `api-client.ts` changes must be mirrored. Establish sync process before Phase 1 starts.

### Assumptions
- Backend team can build required endpoints in parallel with frontend work
- Web Share API coverage is sufficient for target audience (iOS 15+, Android 5+)
- html2canvas works reliably enough for Win Card rendering
- Users will share if given beautiful, low-friction sharing mechanics

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend endpoints not ready when frontend ships | High | Frontend uses mock data during dev; API client methods return typed mock responses |
| Win Card rendering inconsistent across devices | Medium | Simplify card CSS; test on 5+ device/browser combos; fallback to screenshot instructions |
| Community Feed attracts spam/abuse | Medium | AI moderation + report system from day one; rate limiting; mandatory Phase 4 |
| Referral fraud (self-referral, fake accounts) | Low | Backend validates unique email + IP; limit rewards per account |
| Voice briefing sounds robotic | Low | Use premium voices where available; allow user to pick voice; fallback to text display |
| Phase 4 starts before user base justifies community | Medium | Gate Phase 4C on reaching 500+ active households; use waitlist if needed |

---

## Priority Stack Rank

| Rank | Feature | Viral Type | Coefficient | Effort | Phase |
|------|---------|------------|-------------|--------|-------|
| 1 | Weekly Win Card | Content sharing | 0.15-0.3/user/wk | 3d | 1 |
| 2 | Share-to-Message | Content sharing | 0.1-0.2/share | 1.5d | 1 |
| 3 | Co-Parent Balance | Invitation pressure | 0.4 (co-parent conversion) | 3d | 2 |
| 4 | Smart Referral | Direct invitation | 0.3-0.5/share | 3d | 2 |
| 5 | Emergency Button | Word-of-mouth | 10-20 people/activation | 4d | 4 |
| 6 | Micro-Celebrations | Delight/screenshots | 0.02-0.05 | 1.5d | 1 |
| 7 | Caregiver Mode | Network expansion | 1-3 users/household | 4d | 2 |
| 8 | Templates Marketplace | UGC flywheel | Compounds over time | 5d | 3 |
| 9 | Family Goals | Shared progress | 0.05-0.1 | 4d | 3 |
| 10 | Voice Briefing | Word-of-mouth | High WoM, low direct | 5d | 4 |
| 11 | Seasonal Packs | Reactivation | Periodic spikes | 3d | 3 |
| 12 | Village Community | Network effect | Long-term compound | 8d | 4 |

**Total estimated effort: ~45 days across 4 phases.**
