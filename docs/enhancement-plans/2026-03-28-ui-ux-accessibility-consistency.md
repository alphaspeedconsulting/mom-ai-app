# Enhancement Plan: UI/UX Accessibility & Consistency

**Created:** 2026-03-28
**Status:** Complete
**Author:** Claude
**Related Files:**
- `mom-alpha/src/components/auth/AuthForm.tsx`
- `mom-alpha/src/app/(app)/dashboard/page.tsx`
- `mom-alpha/src/app/(app)/layout.tsx`
- `mom-alpha/src/components/chat/AgentChatClient.tsx`
- `mom-alpha/src/components/shared/` (nav, banners, empty states)
- `mom-alpha/src/styles/index.css`
- `cowork_plugin/platform files/static/agent_portal/styles.css`
- `cowork_plugin/platform files/governance_console/style.css`
- `cowork_plugin/platform files/governance_console/app.js`

---

## Background

Two audits were performed on 2026-03-28:
1. `/ui-consistency-review` — CSS Zen Garden compliance audit of the Cowork Plugin governance console and agent portal
2. `/analyze-ui-ux` — Full accessibility, responsive design, and UX flow audit of the Mom.alpha Next.js PWA

This plan consolidates all identified issues into sequenced, testable phases prioritized by user impact and regression risk.

---

## 1. Enhancement Breakdown

### 1A — Copy Fix (mom-alpha PWA)
**"Join the Sanctuary" → "Join Alpha.Mom"**
- File: `AuthForm.tsx:197`
- The signup mode header uses stale brand copy from an earlier concept.
- Change the conditional string `"Join the Sanctuary"` → `"Join Alpha.Mom"`.
- Affects: signup screen header only.

### 1B — Accessibility: Form Labels (mom-alpha PWA)
All form inputs in `AuthForm.tsx` rely on `placeholder` only. Screen readers announce placeholder text which disappears on focus — WCAG 1.3.1 violation.
- Inputs affected: email, password, name (signup), invite code
- Fix: add visually-hidden `<label>` elements (using `sr-only` Tailwind class) or `aria-label` attributes
- Also affected: search input on dashboard page

### 1C — Accessibility: Icon-Only Buttons (mom-alpha PWA)
Buttons containing only a Material Symbol icon have no accessible name — WCAG 4.1.2 violation.
- Buttons affected: notification bell (dashboard), back arrow (chat), "more" menu (chat), password visibility toggle (AuthForm)
- Fix: add `aria-label` attribute to each button

### 1D — Accessibility: Focus Trap in Consent Modal (mom-alpha PWA)
The consent modal in `AuthForm.tsx` (lines 111–184) does not trap focus. Keyboard users can Tab behind the modal into the background document — WCAG 2.4.3 violation.
- Fix: implement a `useFocusTrap` hook; apply to modal container on open; restore focus on close
- New code required: `src/hooks/useFocusTrap.ts` — no existing hook covers this

### 1E — Accessibility: Active Nav State (mom-alpha PWA)
Bottom navigation tab bar has no `aria-current="page"` on the active item — screen readers cannot determine current location.
- File: `src/app/(app)/layout.tsx` (or shared nav component)
- Fix: add `aria-current={isActive ? "page" : undefined}` to each nav link

### 1F — UX: Destructive Action Confirmation (mom-alpha PWA)
Logout has no confirmation dialog. A mis-tap on mobile silently ends the session.
- File: settings page / profile page
- Fix: wrap logout action in a simple confirm dialog (two-button: "Cancel" / "Sign Out")
- Reuse the existing modal/overlay pattern already present in `AuthForm.tsx`; no new modal library needed

### 1G — UX: Toggle Switch Touch Target (mom-alpha PWA)
Agent enable/disable toggles render at 44×24px — height is below the WCAG 44×44 minimum touch target.
- Fix: increase the toggle container minimum height to 44px with a transparent padding wrapper; visual size can remain unchanged

### 1H — Performance: Image Lazy Loading (mom-alpha PWA)
Raw `<img>` tags have no `loading="lazy"`. Static export prevents using `next/image`, so this must be done at the HTML attribute level.
- Fix: add `loading="lazy"` to all non-above-the-fold `<img>` elements; keep `loading="eager"` on hero/logo images

### 1I — CSS: Agent Portal Token System (Cowork Plugin)
`platform files/static/agent_portal/styles.css` has no CSS variable system and uses `#2563eb` (blue) for the primary button — mismatched with the brand teal `#21cab9` used everywhere else.
- Fix: add a `:root` token block mirroring the governance console tokens; replace all raw hex with `var()` references; fix primary button to `var(--accent)`

### 1J — CSS: Out-of-`:root` Raw Values (Cowork Plugin)
`governance_console/style.css` has 28 `rgba()` values outside `:root` that either duplicate existing tokens or need new tokens.
- Fix: audit each occurrence; replace with existing token where one exists; add 4–5 new tokens (`--overlay-bg`, `--separator`, `--surface-hover`, `--z-toast`) for the remainder

### 1K — CSS: Font-Size Token Scale (Cowork Plugin)
`governance_console/style.css` has 54 `font-size` declarations with no size token scale in `:root`.
- Fix: add `--text-2xs` through `--text-xl` scale to `:root`; replace pixel values with `var(--text-*)` references

### 1L — CSS: Static Inline Styles in `app.js` (Cowork Plugin)
~15 template string fragments use `style="padding:..."`, `style="height:200px"`, etc. — should be CSS utility classes.
- Fix: add `.empty-state--sm`, `.empty-state--lg`, `.text-muted-sm` classes to `style.css`; remove inline style attributes from `app.js` template strings

### 1M — CSS: Z-Index Layer Scale (Cowork Plugin)
`#toast-container` uses `z-index: 9999` with no documented layer scale.
- Fix: add `--z-topbar: 10`, `--z-modal: 100`, `--z-toast: 200` tokens to `:root`; replace magic numbers

---

## 2. Reuse vs New Code Analysis

| Item | Reuse | New Code | Justification |
|------|-------|----------|---------------|
| 1A copy fix | `AuthForm.tsx` string | None | One-line change |
| 1B form labels | `AuthForm.tsx` inputs | `sr-only` class (already in Tailwind) | Add HTML only |
| 1C icon aria-labels | Existing buttons | None | Add attribute only |
| 1D focus trap | `AuthForm.tsx` modal | `useFocusTrap.ts` hook | No existing hook; pattern is reusable across future modals |
| 1E aria-current | Nav link render | None | Add attribute only |
| 1F logout confirm | Existing overlay pattern in AuthForm | None | Reuse modal CSS already present |
| 1G touch targets | Toggle component | None | CSS wrapper only |
| 1H lazy loading | `<img>` tags | None | Add attribute only |
| 1I agent portal CSS | Governance console `:root` tokens | New `:root` block in `styles.css` | File has no tokens at all |
| 1J–1M governance CSS | Existing `:root` in `style.css` | 4–5 new token declarations | Extends existing token block |

**Net-new files:** `mom-alpha/src/hooks/useFocusTrap.ts` (1 file, ~40 lines)

---

## 3. Workflow Impact Analysis

| Item | Affected Route / Component | Regression Risk |
|------|---------------------------|-----------------|
| 1A copy | `/signup` auth screen | **Low** — string change only |
| 1B labels | `/signup`, `/login` | **Low** — HTML only, no logic |
| 1C aria-labels | `/dashboard`, `/chat/[agent]`, `/signup` | **Low** — attributes only |
| 1D focus trap | Consent modal in auth flow | **Medium** — DOM focus manipulation; test on iOS Safari (known quirks) |
| 1E aria-current | All authenticated routes (nav) | **Low** — attribute change |
| 1F logout confirm | Settings / profile | **Low** — wraps existing action |
| 1G toggle touch target | `/dashboard` agent toggles | **Low** — CSS wrapper |
| 1H lazy loading | All pages with images | **Low** — attribute; above-fold images need `eager` |
| 1I–1M governance CSS | Governance console, agent portal | **Low** — purely visual; no JS logic |

No backend changes required. No Zustand store changes. No API contract changes.

---

## 4. Implementation Phases

### Phase 1 — Quick Wins: Copy, Labels, Aria (~0.5 days)
**Items:** 1A, 1B, 1C, 1E, 1H

All are attribute/string changes with zero logic risk. Can be batched into a single commit.

**Tasks:**
- `AuthForm.tsx`: Change `"Join the Sanctuary"` → `"Join Alpha.Mom"`
- `AuthForm.tsx`: Add `<label className="sr-only" htmlFor="email">Email address</label>` etc. to all inputs; add `id` attributes to match
- `AuthForm.tsx`: Add `aria-label` to password visibility toggle button
- `dashboard/page.tsx`: Add `aria-label="Open notifications"` to notification bell button
- `AgentChatClient.tsx`: Add `aria-label="Go back"` to back button; `aria-label="More options"` to menu button
- `dashboard/page.tsx`: Add search input label
- `layout.tsx` (app): Add `aria-current={isActive ? "page" : undefined}` to nav links
- All `<img>` tags: Add `loading="lazy"` (audit for above-fold hero images that need `eager`)

**Dependencies:** None
**Success criteria:**
- No `<input>` without a label or `aria-label` (verified via axe-core or manual audit)
- No icon-only button without `aria-label`
- Auth form passes WCAG 1.3.1 and 4.1.2

---

### Phase 2 — Focus Management & Confirm Dialog (~0.5 days)
**Items:** 1D, 1F

**Tasks:**
- Create `mom-alpha/src/hooks/useFocusTrap.ts`:
  - Accepts a `ref` and `isActive: boolean`
  - On activation: collects all focusable elements within the ref, moves focus to first, traps Tab/Shift+Tab, restores prior focus on deactivation
- Apply `useFocusTrap` to consent modal in `AuthForm.tsx`; add `aria-modal="true"` and `role="dialog"` to modal container
- Add logout confirmation: in settings/profile, replace direct `logout()` call with a two-step confirm state; render a confirmation prompt ("Are you sure you want to sign out?") using existing modal CSS classes; "Cancel" dismisses, "Sign Out" proceeds

**Dependencies:** Phase 1 complete (so all accessibility changes are in one review cycle)
**Success criteria:**
- Focus cannot escape consent modal via keyboard
- Logout requires two taps/clicks to execute
- iOS Safari smoke test: focus trap works without JS errors

---

### Phase 3 — Touch Targets (~0.25 days)
**Items:** 1G

**Tasks:**
- Identify toggle component file (likely in `mom-alpha/src/components/shared/` or inline in dashboard)
- Wrap toggle with a container that has `min-height: 44px; display: flex; align-items: center`
- Verify no visual layout shift on dashboard agent cards

**Dependencies:** None (can run in parallel with Phase 2)
**Success criteria:**
- All toggles pass 44×44px minimum tap target requirement
- Dashboard visual layout unchanged

---

### Phase 4 — Cowork Plugin CSS Remediation (~1 day)
**Items:** 1I, 1J, 1K, 1L, 1M

This phase targets the governance console and agent portal in the `cowork_plugin` repo — separate from the mom-alpha PWA.

**Tasks:**
- `agent_portal/styles.css`: Add `:root` token block (copy subset from `governance_console/style.css`); replace all 9 raw hex values with `var()` references; change `.button.primary` from `#2563eb` → `var(--accent)`
- `governance_console/style.css`:
  - Add to `:root`: `--overlay-bg`, `--separator`, `--surface-hover`, `--z-topbar`, `--z-modal`, `--z-toast`, `--text-2xs` through `--text-xl` scale
  - Replace 28 out-of-`:root` raw colors with token references
  - Replace 54 `font-size` pixel values with `var(--text-*)` references
  - Replace `z-index: 9999` with `var(--z-toast)`
- `governance_console/app.js`:
  - Add CSS classes to `style.css`: `.empty-state--sm { padding: 20px; }`, `.empty-state--lg { padding: 32px; }`, `.cell-meta { font-size: var(--text-sm); color: var(--text-muted); }`, `.section-gap { margin-top: 24px; }`, `.section-gap-lg { margin-top: 28px; }`
  - Remove all static `style="padding:..."`, `style="height:200px"`, `style="margin-top:..."`, `style="font-size:11px"` inline attributes from template strings; replace with the new class names

**Dependencies:** None (isolated to Cowork Plugin repo)
**Success criteria:**
- Zero raw hex values outside `:root` in either CSS file
- Agent portal primary button renders teal, not blue
- `z-index: 9999` replaced with token
- Governance console visual appearance identical before/after (purely token substitution)

---

### Phase 5 — Nice-to-Haves (deferred, post-beta)
**Items not in scope for current sprint:**
- Per-field inline validation feedback (requires Zustand or local form state changes)
- Dark mode (Midnight Mom) theme toggle in settings UI
- Full heading hierarchy audit and correction across all pages

These are logged as future backlog items; no implementation planned now.

---

## 5. Testing Strategy

### Phase 1
- **Manual:** Submit auth form with screen reader (VoiceOver on iOS / NVDA on desktop) — every input must announce its label
- **Manual:** Tab through notification bell, back arrow, more menu — must announce `aria-label`
- **Visual regression:** Screenshot of signup page before/after — only heading text changes ("Join Alpha.Mom" visible)
- **Playwright:** Update `navigation.spec.ts` to verify `aria-current="page"` on active nav item

### Phase 2
- **Manual:** Open consent modal, press Tab repeatedly — focus must not escape to background
- **Manual:** Click logout, verify confirmation prompt appears; click Cancel, verify no logout; click Sign Out, verify redirect to login
- **iOS Safari:** Open consent modal on mobile, verify Tab/focus trap works (known iOS focus quirk)
- **Playwright:** Add test to `shared-household.spec.ts` — consent modal focus trap

### Phase 3
- **Manual:** Open dashboard on mobile device, attempt to tap toggle — must register without extra precision
- **Visual:** Confirm agent card layout unchanged after touch target wrapper addition

### Phase 4 (Cowork Plugin)
- **Visual:** Side-by-side screenshot of governance console before/after token substitution — should be pixel-identical
- **Visual:** Agent portal primary button must render teal
- **Browser console:** Zero JS errors in governance console after `app.js` template string changes
- **Manual:** Toast notifications still appear above modal overlay (z-index layer verification)

### Existing Tests to Update
- `mom-alpha/tests/e2e/navigation.spec.ts` — add `aria-current` assertion
- `mom-alpha/tests/e2e/pwa.spec.ts` — add check that signup header reads "Join Alpha.Mom"

---

## 6. Open Questions / Risks

1. **Toggle component ownership** — the toggle switch may be defined inline in dashboard JSX or as a shared component. If shared, the touch-target fix applies everywhere it's used (beneficial but must verify no visual regressions in other agent pages).

2. **`useFocusTrap` iOS Safari** — iOS has a known behavior where `focus()` on non-input elements requires `tabIndex="-1"` on the element. The hook implementation must account for this.

3. **`AuthForm.tsx` label alignment** — adding `<label>` elements may shift the vertical spacing of form fields if the design currently relies on `placeholder` for visual affordance. If visible labels are added (not `sr-only`), the design needs a layout adjustment for the tighter spacing.

4. **Cowork Plugin deployment** — Phase 4 changes are in the `cowork_plugin` repo and require a separate deploy. Governance console is a Render-hosted static file; changes take effect on next push to `main`.

5. **Phase ordering flexibility** — Phases 2 and 3 have no interdependency and can be developed in parallel. Phase 4 (Cowork Plugin) is fully independent and can be assigned to a separate branch/session.
