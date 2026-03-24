---
name: ui-consistency-review
description: Performs a UI consistency audit enforcing the CSS Zen Garden design system. Checks for hardcoded colors, arbitrary font sizes, inline styles, theme variable drift, z-index violations, and component extraction opportunities. Use BEFORE and AFTER any frontend change.
---

# UI Consistency Review (CSS Zen Garden Compliance)

Act as a senior frontend architect enforcing the project's CSS Zen Garden design system approach.

You are performing a **UI consistency audit** to prevent styling drift, specificity conflicts, and duplication that undermines the centralized design system.

## PURPOSE
Ensure all frontend changes follow the established CSS architecture: design tokens via CSS custom properties, Tailwind utility classes mapped to those tokens, and the `alphaai.css` polish layer for shared component styles. Run this BEFORE and AFTER any frontend change.

CONTEXT:
- Files to review: $ARGUMENTS (if empty, audit all recently changed `.tsx` and `.css` files)
- Design System CSS: `ai-assistant-local/src/styles/alphaai.css`
- Tailwind Config: `tailwind.config.ts` (root)
- Component directory: `ai-assistant-local/src/components/alphaai/`
- Pages directory: `ai-assistant-local/src/pages/`
- Hooks directory: `ai-assistant-local/src/hooks/`
- shadcn/ui components: `ai-assistant-local/src/components/ui/`

## CSS ARCHITECTURE RULES

### Layer Hierarchy
```
1. CSS Custom Properties    -- :root variables (--brand, --border, --success, etc.)
2. Tailwind Config          -- Maps CSS vars to utility classes (bg-brand, text-muted, text-alphaai-sm)
3. alphaai.css              -- Shared component polish (.alphaai-* classes for gradients, glows, scrollbars)
4. Component inline styles  -- NEVER (except JS-driven dynamic values like width/transform)
```

**Golden Rule:** A component should NEVER contain raw hex/rgb/hsl values or arbitrary `text-[14px]` sizes. All visual tokens flow through CSS variables and Tailwind config.

### Typography Token Scale (MANDATORY)
All font sizes MUST use these named tokens from `tailwind.config.ts`:
```
text-alphaai-3xs  -- 0.625rem (10px)  -- tiny badges, security labels
text-alphaai-2xs  -- 0.6rem   (9.6px) -- micro labels, timestamps
text-alphaai-xs   -- 0.65rem  (10.4px)-- small badges, captions
text-alphaai-sm   -- 0.7rem   (11.2px)-- section headers, secondary text
text-alphaai-base -- 0.8rem   (12.8px)-- card body text, form labels
text-alphaai-md   -- 0.825rem (13.2px)-- primary body text
text-alphaai-lg   -- 0.9rem   (14.4px)-- emphasized text, titles
```

### Color Token System (MANDATORY)
All colors MUST reference Tailwind tokens mapped to CSS variables:
```
Semantic:  bg-background, text-foreground, border-border, bg-card, text-muted-foreground
Brand:     bg-brand, text-brand, border-brand, text-brand-glow, bg-brand-dark
Status:    text-success, bg-warning, text-danger, bg-info
Accent:    bg-accent-purple, text-accent-orange
Greys:     text-grey-dark, bg-grey-medium, border-grey-light
```

### Mobile Conventions
- Breakpoint: `md` (768px) -- all mobile UI hidden above this
- Z-index: tab bar = `z-50`, overlays = `z-[60]`-`z-[70]`, FAB = `z-40`
- Safe area: `pb-[env(safe-area-inset-bottom)]`
- Sticky inputs: `sticky bottom-0` + safe-area padding

## REQUIRED CHECKS

### 1. Hardcoded Color Scan
Search changed files for raw color values that should use Tailwind tokens:

**Search patterns in TSX/CSS:**
```
#[0-9a-fA-F]{3,8}         -- hex colors (should be bg-brand, text-success, etc.)
rgb\(                       -- rgb colors
rgba\(                      -- rgba colors
hsl\([^v]                   -- hsl NOT using var() (hsl(var(--brand)) is OK)
```

**In className strings:**
```
bg-\[#                      -- arbitrary Tailwind bg with hex
text-\[#                    -- arbitrary Tailwind text with hex
border-\[#                  -- arbitrary Tailwind border with hex
```

**Exceptions:** Only allowed inside `alphaai.css` `:root` / `.light` / `.dark` variable definitions.

### 2. Arbitrary Font Size Scan
Search for font sizes NOT using named tokens:

**Patterns:**
```
text-\[\d                   -- arbitrary text-[14px], text-[0.8rem]
text-xs                     -- standard Tailwind (should be text-alphaai-xs)
text-sm                     -- standard Tailwind (should be text-alphaai-sm)
text-base                   -- standard Tailwind (should be text-alphaai-base)
text-lg                     -- standard Tailwind (should be text-alphaai-lg)
fontSize.*\d+px             -- inline style font sizes
```

**Exception:** `text-xs`/`text-sm` inside shadcn/ui component files (`src/components/ui/`) are acceptable.

### 3. Inline Style Audit
Search changed TSX files for `style=` and `style={{` attributes:

**Acceptable:**
- `style={{ display: 'none' }}` for JS-toggled visibility
- `style={{ width: dynamicValue }}` for JS-computed dimensions
- `style={{ transform: ... }}` for JS-driven animations
- `style={{ '--css-var': value }}` for CSS variable injection

**NOT acceptable -- must use Tailwind classes:**
- Static colors: `style={{ color: '#c8102e' }}`
- Static layout: `style={{ padding: '0.5rem 1rem', gap: '1rem' }}`
- Static typography: `style={{ fontSize: '14px', fontWeight: 500 }}`
- Background colors: `style={{ backgroundColor: 'rgb(...)' }}`

### 4. Theme Variable Consistency
If any file defines or modifies CSS variables:

- [ ] Do `:root` variables match the canonical set in `alphaai.css` / the main stylesheet?
- [ ] Do `.light` / `.dark` overrides cover all required tokens?
- [ ] Are any NEW variables introduced without being added to `tailwind.config.ts`?
- [ ] Are all `hsl(var(--*))` references using tokens defined in Tailwind config?

**Canonical variable groups:**
```
Core:    --background, --foreground, --card, --card-foreground, --popover, --popover-foreground
         --primary, --primary-foreground, --secondary, --secondary-foreground
         --muted, --muted-foreground, --accent, --accent-foreground
         --destructive, --destructive-foreground, --border, --input, --ring

Brand:   --brand, --brand-glow, --brand-dim, --brand-dim2, --brand-dark

Status:  --success, --success-foreground, --warning, --warning-foreground
         --danger, --danger-foreground, --info, --info-foreground

Accent:  --accent-purple, --accent-purple-foreground
         --accent-orange, --accent-orange-foreground

Neutral: --neutral, --neutral-foreground, --terminal-bg
Grey:    --grey-dark, --grey-medium, --grey-light
```

### 5. Z-Index Audit
Check changed files for z-index usage:

**Allowed patterns:**
```
z-40       -- FAB (MobileFAB)
z-50       -- Mobile tab bar (MobileTabBar)
z-[60]     -- Mobile overlays (MobileMoreSheet)
z-[70]     -- Modal overlays
```

**NOT allowed:**
- `z-[999]`, `z-[9999]` or any other arbitrary large z-index
- `z-10`, `z-20`, `z-30` without clear justification (overlap with content)
- `style={{ zIndex: ... }}` inline z-index

### 6. alphaai.css Class Reuse
If the change introduces styling for a reusable pattern, check if an `alphaai-*` class already exists:

**Available classes in alphaai.css:**
- Buttons: `.alphaai-btn-primary`, `.alphaai-btn-outline`
- Cards: `.alphaai-card-brand`, `.alphaai-card-hover`, `.alphaai-hover-lift`
- Badges: `.alphaai-badge-brand`, `.alphaai-badge-success`, `.alphaai-badge-warning`, `.alphaai-badge-danger`
- Tags: `.alphaai-tag-success`, `.alphaai-tag-task`, `.alphaai-tag-warn`, `.alphaai-tag-error`, `.alphaai-tag-info`
- Input: `.alphaai-input-focus`
- Terminal: `.alphaai-terminal`
- Scrollbar: `.alphaai-scrollbar`, `.alphaai-scrollbar-auto`
- Text: `.alphaai-gradient-text`
- Layout: `.alphaai-header`, `.alphaai-orb-glow-active`, `.alphaai-orb-glow-idle`
- Progress: `.alphaai-progress-bar`

If the same pattern exists in 2+ component files, it should be extracted to `alphaai.css`.

### 7. Component Structure Compliance
Check that new/changed components follow the project structure:

- [ ] Components in `src/components/alphaai/` (NOT in `src/components/` root)
- [ ] Hooks in `src/hooks/` with `use` prefix
- [ ] Pages in `src/pages/` with `AlphaAI` prefix
- [ ] shadcn/ui primitives used from `src/components/ui/` (button, badge, card, scroll-area, switch)
- [ ] No direct DOM manipulation -- use React state/refs

### 8. New Page/Component Checklist
If adding a new page or component:

- [ ] All colors use Tailwind tokens, not hardcoded hex
- [ ] All font sizes use `text-alphaai-*` tokens
- [ ] No inline `style=` except for dynamic JS values
- [ ] Mobile responsive below `md` breakpoint (if user-facing)
- [ ] Uses `hsl(var(--*))` pattern in any custom CSS
- [ ] Imports are from `@alphaai/` alias (not relative `../../`)

### 9. Studio Panel Pattern (UX)
If the page has a creation flow (creating campaigns, projects, content, etc.):

- [ ] Creation surface is an **always-visible inline panel**, not a modal or toggle
- [ ] Panel uses the standard structure: icon logo mark → title+subtitle → pill selector rows → action button
- [ ] Primary choices use **pill selectors** (rounded-full buttons), not dropdowns or text inputs
- [ ] Panel has a single prominent action button (brand-colored, right-aligned)
- [ ] Container uses `rounded-xl border border-[hsl(var(--brand)/0.25)] bg-gradient-to-br from-[hsl(var(--brand)/0.04)]`

**Exceptions:** Pages without a creation flow (Dashboard overview, Security) — mark N/A.

### 10. Actionable Empty States (UX)
Check all empty-state messages in the page:

- [ ] Empty states include an **action button** for the logical next step, not just text
- [ ] Button calls the appropriate mutation (e.g., launch, create, discover)
- [ ] No references to agent tool names in user-facing text (e.g., "Run recon_discover_competitors" is wrong)
- [ ] Empty state has an icon + descriptive text + action button (3-part structure)

**Patterns to flag:**
```
❌ "No items yet."
❌ "Run tool_name via the agent."
✅ "No items yet — [Launch Analysis] to get started."
```

### 11. Card Information Density (UX)
Check list cards (sidebar items in split-pane layouts):

- [ ] Cards show **name + status badge + meta text** (minimum 3 elements)
- [ ] Cards show a **next-action hint** (e.g., "→ Ready to launch") based on status
- [ ] Cards show **mini stats** when available (e.g., "5 qualified · 2 sent")
- [ ] Users can understand what to do next WITHOUT clicking into the detail panel

**Patterns to flag:**
```
❌ Card shows only name + status badge (insufficient density)
✅ Card shows name + status + type badges + meta + hint + stats
```

## OUTPUT FORMAT (MANDATORY)

### UI Consistency Assessment

| Check | Status | Issues Found |
|-------|--------|--------------|
| Hardcoded Colors | PASS / WARN / FAIL | [Count and locations] |
| Arbitrary Font Sizes | PASS / WARN / FAIL | [Count and locations] |
| Inline Styles | PASS / WARN / FAIL | [Count and locations] |
| Theme Variable Consistency | PASS / WARN / FAIL | [Drift found] |
| Z-Index Compliance | PASS / WARN / FAIL | [Details] |
| alphaai.css Reuse | PASS / WARN / FAIL | [Opportunities] |
| Component Structure | PASS / WARN / FAIL | [Details] |
| New Page Compliance | PASS / WARN / N/A | [Details] |
| Studio Panel Pattern | PASS / WARN / N/A | [Details] |
| Actionable Empty States | PASS / WARN / FAIL | [Details] |
| Card Information Density | PASS / WARN / N/A | [Details] |

### Blocking Issues (Must Fix)
For each FAIL:
- **File**: Exact file and line
- **Issue**: What's wrong
- **Fix**: Exact change needed (show before/after)
- **Why**: What breaks if unfixed (theme breakage, visual regression, maintenance burden)

### Warnings (Should Fix)
For each WARN:
- **File**: Location
- **Issue**: What could improve
- **Recommendation**: Suggested change
- **Priority**: Fix now / Fix in next sprint / Track as tech debt

### Recommendations
- Patterns to extract to `alphaai.css`
- Variables to add to canonical set
- Inline styles to convert to Tailwind classes
- Components to refactor for token compliance

### Confidence Assessment
- **Safe to Ship**: YES / NO / CONDITIONAL
- **Conditions** (if applicable): [What must be fixed first]
- **Tech Debt Created**: NONE / LOW / MEDIUM / HIGH

## WHEN TO USE THIS COMMAND

Use `/ui-consistency-review` BEFORE merging:
- Any change to `src/components/alphaai/**/*.tsx`
- Any change to `src/pages/AlphaAI*.tsx`
- Any change to `src/styles/alphaai.css`
- Any change to `tailwind.config.ts`
- Adding a new page or component

Use AFTER implementing to verify:
- Theme colors are consistent across all pages
- Dark/light mode works on changed pages
- Mobile layout respects breakpoint conventions
- No visual regressions

## SCOPE GUIDANCE

**Full check (all 11 checks) required for:**
- New pages
- Changes to `tailwind.config.ts` or `alphaai.css`
- Multi-component changes
- Mobile layout changes
- UX pattern changes (creation flows, empty states, list cards)

**Abbreviated check (checks 1, 2, 3 only) for:**
- Single component content changes
- Hook-only changes with no JSX modifications

**UX-focused check (checks 9, 10, 11 only) for:**
- Adding a new creation flow or studio panel
- Changing empty states or list card layouts
- Cross-page consistency audits

## Prerequisites
- Frontend source exists at `ai-assistant-local/src/`
- `alphaai.css` and `tailwind.config.ts` present (design system baseline)
- Files to review specified via `$ARGUMENTS` or recent git changes available

## Side Effects
- None — read-only audit, produces report only

## Output Contract
- Mandatory table: 11 checks, each with Status (PASS/WARN/FAIL) and Issues Found
- Blocking Issues section: file, line, issue, fix (before/after), why
- Confidence assessment: `Safe to Ship` (YES/NO/CONDITIONAL), `Tech Debt Created` (NONE/LOW/MEDIUM/HIGH)

## Fallback Behavior
- `$ARGUMENTS` empty: audits all files changed since last commit (`git diff --name-only HEAD`)
- `alphaai.css` missing: FAIL on check 6 with note "design system file not found"
- `tailwind.config.ts` missing: FAIL on checks 2 and 4

## Degraded Conditions
- No git history (new repo): audits all `.tsx` and `.css` files in `src/`
- Large changeset (50+ files): runs abbreviated checks (1, 2, 3) only, notes skipped checks
