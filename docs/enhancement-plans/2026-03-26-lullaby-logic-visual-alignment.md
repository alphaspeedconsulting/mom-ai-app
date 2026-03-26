# Enhancement Plan: Lullaby & Logic Visual Alignment

**Created:** 2026-03-26
**Status:** Complete
**Author:** Claude
**Related Files:**
- `mom-alpha/src/styles/index.css` (Layer 1 — CSS custom properties)
- `mom-alpha/src/styles/mom-alpha.css` (Layer 3 — shared component classes)
- `mom-alpha/src/app/globals.css` (Layer 2 — Tailwind theme mapping)
- `mom-alpha/src/components/landing/*.tsx` (all 10 landing components)
- `mom-alpha/src/app/(app)/login/page.tsx`
- `mom-alpha/src/app/(app)/settings/page.tsx`
- `mom-alpha/src/app/(app)/dashboard/page.tsx`
- `mom-alpha/src/components/shared/BottomNav.tsx`
- `mom-alpha/src/components/shared/Skeleton.tsx`
- `mom-alpha/src/components/chat/AgentChatClient.tsx`

---

## Problem Statement

The website currently looks **generic** rather than matching the polished "Lullaby & Logic" design system visible in the Stitch reference screenshots. Key gaps:

1. **Missing component class definitions** — 8 `mom-*` CSS classes are referenced in code but never defined (bottom-nav, skeleton, agent-avatar, toggle, input, chat-agent, chat-user, chip-secondary)
2. **Excessive inline HSL syntax** — Components like PhoneMockup, AgentShowcase, DayTimeline use `style={{ background: "hsl(var(--...))" }}` instead of utility classes
3. **App pages feel flat** — Login, settings, and dashboard lack the glass-morphism, organic shapes, and editorial depth seen in the Stitch reference designs
4. **No ambient decorative elements** — The reference designs show gradient backgrounds, floating blur spheres, and organic shapes that create the "sanctuary" feel — the current app pages have flat solid backgrounds
5. **Bottom navigation doesn't match** — Reference shows a frosted-glass bottom nav with rounded top corners; current implementation lacks these treatments

---

## 1. Enhancement Breakdown

### Enhancement A: Complete the Missing `mom-*` Component Classes
- **What**: Add CSS definitions for the 8 missing component classes in `mom-alpha.css`
- **Services affected**: Layer 3 CSS only — no component logic changes
- **Why**: These classes are already referenced in TSX files. Defining them centralizes styling and removes reliance on ad-hoc Tailwind classes for these patterns

### Enhancement B: Replace Inline HSL Styles with Utility Classes
- **What**: Add Tailwind utility mappings for commonly-used background patterns (e.g., `bg-brand-glow/30`, `bg-surface-active`) and replace inline `style={{}}` props
- **Services affected**: Landing components (PhoneMockup, AgentShowcase, DayTimeline, FeatureDeepDives), globals.css
- **Why**: Inline HSL is verbose, error-prone, and defeats the purpose of the token system. Tailwind v4 already supports `bg-brand-glow` — we just need to ensure opacity variants work

### Enhancement C: Elevate App Pages to Match Stitch Reference
- **What**: Rework login, dashboard, and settings pages to incorporate glass panels, editorial gradients, ambient decorative shapes, and organic border radii from the Stitch designs
- **Services affected**: App page components (login, dashboard, settings, chat)
- **Why**: These are the pages users spend 90% of their time on. The landing page looks great; the app pages need the same treatment

### Enhancement D: Frosted Bottom Navigation & App Chrome
- **What**: Style BottomNav with glass-morphism (semi-transparent bg, backdrop-blur, rounded top corners, upward shadow) matching the Stitch reference
- **Services affected**: BottomNav.tsx, mom-alpha.css
- **Why**: The bottom nav is visible on every app page — it sets the tone for the entire in-app experience

### Enhancement E: Ambient Background System
- **What**: Create a reusable ambient background component with gradient blurs, floating organic shapes, and subtle tonal layering that can be applied to any page
- **Services affected**: New shared component, app layout
- **Why**: The Stitch reference shows rich gradient backgrounds (teal-to-mint gradients behind content). Currently, all app pages use a flat `bg-background` solid color

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is
- **Layer 1 CSS variables** (`index.css`) — The full color palette, typography scale, and spacing tokens are already defined and comprehensive. No changes needed.
- **Layer 2 Tailwind mappings** (`globals.css`) — Most utility mappings exist. Minor additions only.
- **`mom-card`, `mom-chip`, `mom-btn-*`, `mom-glass-panel`, `mom-gradient-hero`** — These existing component classes are well-defined and working. Landing pages prove they work.
- **Stitch `code.html` files** — Ready-to-extract Tailwind markup for login, home, chat, tasks screens

### Needs Extension
- **`mom-alpha.css`** — Add 8 missing class definitions (bottom-nav, skeleton, input, toggle, agent-avatar, chat-agent, chat-user, chip-secondary)
- **`globals.css`** — Add a few missing opacity-variant utility mappings
- **Landing components** — Swap inline HSL to utility classes (no visual change, just cleaner code)

### Net-New Code
- **Ambient background component** (`AmbientBackground.tsx`) — A shared component that renders decorative gradient blurs and organic shapes behind page content
- **Why necessary**: No existing component provides the layered gradient backgrounds visible in Stitch references. This is a visual foundation piece, not just decoration — it's the primary differentiator between "generic" and "Lullaby & Logic"

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected
- **Frontend rendering only** — No backend, API, or agent workflow changes
- **No state transitions or side effects** — All changes are purely presentational CSS/TSX
- **Build pipeline** — PostCSS/Tailwind compilation will pick up new CSS classes automatically

### Regression Risk Level: **Low**

**Rationale:**
- CSS additions are additive (new classes), not modifications to existing ones
- Inline style removal preserves identical visual output if utilities match
- Component structure unchanged — only className/style props modified
- No JavaScript logic changes

### Mitigation Strategies
1. **Visual regression testing** — Compare screenshots before/after each phase using Percy or manual comparison
2. **Incremental rollout** — CSS class definitions (Phase 1) are zero-risk since they're already referenced; only later phases change visual output
3. **Design token audit** — Run `/ui-consistency-review` after each phase to verify CSS Zen Garden compliance
4. **Mobile-first testing** — Test on 375px viewport first (primary user device), then tablet and desktop

---

## 4. Implementation Phases

### Phase 1: Complete Missing CSS Component Classes (2-3 hours)

**Tasks:**
1. Define `.mom-bottom-nav` in `mom-alpha.css` — frosted glass, rounded-t-[2.5rem], backdrop-blur-2xl, upward shadow
2. Define `.mom-skeleton` — animated pulse placeholder with surface-container background
3. Define `.mom-agent-avatar` — circular container with surface-container bg, centered icon, standardized sizes (sm/md/lg)
4. Define `.mom-toggle` — custom toggle switch with brand color active state
5. Define `.mom-input` — surface-container-highest bg, no border, rounded-DEFAULT, focus ring
6. Define `.mom-chat-agent` / `.mom-chat-user` — chat bubble styles with proper border-radius (agent: rounded-tl-sm, user: rounded-tr-sm)
7. Define `.mom-chip-secondary` — secondary-container bg, secondary text color, pill shape

**Dependencies:** None
**Success Criteria:**
- Done when: All 8 classes are defined in `mom-alpha.css` and no undefined class warnings exist
- Verified by: Visual inspection of every page using these classes; no layout shifts
- Risk level: Low

### Phase 2: Replace Inline HSL with Utility Classes (2-3 hours)

**Tasks:**
1. Audit all `style={{ background: "hsl(var(--...))" }}` in landing components
2. Map each to existing Tailwind utility (e.g., `bg-surface-container-low`) or add missing utility in `globals.css`
3. Replace inline styles in PhoneMockup.tsx (~15 instances)
4. Replace inline styles in AgentShowcase.tsx (~5 instances)
5. Replace inline styles in DayTimeline.tsx (~4 instances)
6. Replace inline styles in FeatureDeepDives.tsx (~3 instances)
7. Replace inline styles in PricingSection.tsx (~2 instances)
8. Replace inline styles in Footer.tsx (~1 instance)
9. Remove color string storage pattern (e.g., `bgColor: "var(--brand-glow)"`) — use className strings instead

**Dependencies:** Phase 1 (some replacements may use newly-defined classes)
**Success Criteria:**
- Done when: Zero `style={{ background: "hsl(var(--` patterns remain in landing components
- Verified by: Visual diff shows zero pixel changes; `/ui-consistency-review` passes
- Risk level: Low

### Phase 3: Ambient Background System (2-3 hours)

**Tasks:**
1. Create `mom-alpha/src/components/shared/AmbientBackground.tsx` — renders positioned gradient blurs (teal→mint, lavender→peach) as decorative background layer
2. Add variants: `hero` (strong gradient, for landing), `subtle` (muted, for app pages), `warm` (secondary colors, for special pages)
3. Add `.mom-ambient-*` classes to `mom-alpha.css` for the gradient blur circles
4. Integrate into app layout (`src/app/(app)/layout.tsx`) with `subtle` variant
5. Replace flat `bg-background` with ambient background on login, dashboard, settings

**Dependencies:** None (can run parallel with Phase 2)
**Success Criteria:**
- Done when: App pages have visible tonal depth matching Stitch reference gradients
- Verified by: Side-by-side comparison with Stitch screenshots; gradient visible but not distracting
- Risk level: Low

### Phase 4: Elevate Login Page (3-4 hours)

**Tasks:**
1. Extract layout and styling from Stitch `login_sign_up/code.html`
2. Rework login page to use glass card (`mom-glass-panel`) for the form container
3. Add proper input field styling with `mom-input` class
4. Style social login buttons (Google, Apple) matching Stitch reference — dark pill buttons
5. Add the decorative gradient background (via AmbientBackground component)
6. Ensure proper responsive layout — centered card on desktop, full-width on mobile
7. Add the "Join the Sanctuary" headline with proper typography tokens
8. Style the consent/data-protection banner matching Stitch reference

**Dependencies:** Phase 1 (mom-input class), Phase 3 (AmbientBackground)
**Success Criteria:**
- Done when: Login page visually matches Stitch login_sign_up/screen.png
- Verified by: Side-by-side screenshot comparison at 375px and 1280px viewports
- Risk level: Medium (user-facing auth page — must not break form functionality)

### Phase 5: Elevate Dashboard Page (3-4 hours)

**Tasks:**
1. Extract patterns from Stitch `home_marketplace/code.html`
2. Add editorial gradient header card ("Your Digital Sanctuary") matching Stitch
3. Style agent cards with proper glass treatment and organic shapes
4. Add mom-agent-avatar styling to agent icons
5. Style search input with `mom-input`
6. Add horizontal scroll carousel for "Suggested for You" section with `mom-no-scrollbar`
7. Ensure active task cards use `mom-card` with proper elevation and status chips

**Dependencies:** Phase 1, Phase 3
**Success Criteria:**
- Done when: Dashboard matches Stitch home_marketplace/screen.png layout and feel
- Verified by: Screenshot comparison; `/ui-consistency-review` passes
- Risk level: Medium (dashboard is primary user screen)

### Phase 6: Elevate Bottom Nav, Settings & Chat (3-4 hours)

**Tasks:**
1. Apply `mom-bottom-nav` class to BottomNav.tsx — frosted glass, rounded top, upward shadow
2. Add active state styling: teal pill background, filled icon
3. Rework settings page sections to use `mom-card` consistently
4. Add glass treatment to settings subscription toggle area
5. Style chat bubbles with `mom-chat-agent` / `mom-chat-user` classes
6. Add suggested reply chips with `mom-chip` styling
7. Style chat input area with `mom-input` and send button with `mom-btn-primary`

**Dependencies:** Phase 1
**Success Criteria:**
- Done when: Bottom nav, settings, and chat match Stitch reference screenshots
- Verified by: Screenshot comparison with refined_agent_chat and app_settings Stitch screens
- Risk level: Low-Medium

### Phase 7: Final Polish & Quality Gate (2-3 hours)

**Tasks:**
1. Run `/ui-consistency-review` — 11-point CSS Zen Garden compliance audit
2. Verify zero hardcoded colors remain (grep for hex values in TSX files)
3. Verify zero inline HSL patterns remain in modified files
4. Test dark theme ("midnight-mom") — ensure all new classes respect theme variables
5. Test on mobile (375px), tablet (768px), desktop (1280px)
6. Performance check — ensure backdrop-blur doesn't cause jank on low-end devices
7. Accessibility check — ensure contrast ratios meet WCAG AA for all new color combinations

**Dependencies:** All previous phases
**Success Criteria:**
- Done when: All quality gates pass, zero visual regressions, design system audit clean
- Verified by: `/ui-consistency-review` output, Lighthouse accessibility score >= 90
- Risk level: Low

---

## 5. Testing Strategy

### Unit Tests Required
- None — these are purely CSS/presentational changes with no logic

### Integration Tests Required
- **Login form submission** — Verify form still submits correctly after layout rework (Phase 4)
- **Dashboard navigation** — Verify agent cards and quick actions still route correctly (Phase 5)
- **Chat message rendering** — Verify messages display correctly with new bubble classes (Phase 6)

### E2E / Workflow Tests Required
- **Visual regression snapshots** — Capture before/after for every modified page
- **Responsive layout check** — Each page at 375px, 768px, 1280px
- **Theme switching** — Verify all changes work in both lullaby-logic and midnight-mom themes

### Existing Tests to Update
- None expected — CSS class additions don't break existing test assertions

### Test Data Requirements
- Standard test account with dashboard data (agents, tasks, messages)
- Both light and dark theme states

---

## 6. Open Questions / Risks

### Assumptions
1. The Stitch `code.html` files contain production-ready Tailwind that maps to our token system (confirmed by CLAUDE.md)
2. Tailwind v4 opacity modifiers (`bg-brand-glow/30`) work correctly with our CSS variable definitions
3. The `midnight-mom` dark theme has equivalent variables for all tokens used (confirmed in `index.css`)

### Unknowns
1. **Performance impact of backdrop-blur on older iOS devices** — Glass-morphism (backdrop-filter: blur) can cause frame drops on iPhone 8 and older. May need a `@supports` fallback with solid backgrounds.
2. **Stitch code.html freshness** — Are the code.html exports current with the latest design iterations, or are the screenshots more recent? The screenshots (provided by user) show a Budget Tracker and Calendar Sync view that may not have code.html equivalents.

### Architectural Risks
- **Low**: All changes are in the presentation layer (CSS + TSX className props). No API, state management, or backend changes.
- **CSS specificity conflicts**: New `mom-*` classes could conflict with existing Tailwind utilities if specificity isn't managed. Mitigation: Use `@layer components` in `mom-alpha.css` (already in place).

### Deployment Considerations
- **No migrations** — Frontend-only changes
- **No environment variables** — No new config needed
- **Rollout**: Can deploy incrementally per phase since each phase is independently viable
- **Rollback**: Standard git revert — no persistent state changes

---

## Estimated Total Effort

| Phase | Description | Estimate |
|-------|------------|----------|
| 1 | Missing CSS component classes | 2-3 hours |
| 2 | Replace inline HSL with utilities | 2-3 hours |
| 3 | Ambient background system | 2-3 hours |
| 4 | Elevate login page | 3-4 hours |
| 5 | Elevate dashboard page | 3-4 hours |
| 6 | Elevate bottom nav, settings & chat | 3-4 hours |
| 7 | Final polish & quality gate | 2-3 hours |
| **Total** | | **17-24 hours** |

Phases 2 and 3 can run in parallel. All other phases are sequential.
