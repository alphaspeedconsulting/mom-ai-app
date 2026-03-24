---
name: alphaai-design-system
description: AlphaAI Dashboard Design System — page blueprints, component patterns, token reference, and anti-patterns. Use when building new pages, components, or modifying existing dashboard UI. Provides the "how to build correctly" guide that complements ui-consistency-review's "what's wrong" audit.
---

# AlphaAI Dashboard Design System

This skill teaches how to build dashboard pages that are **consistent, easy to use, and token-compliant**. It encodes the UX patterns that make the Content page feel better than pages built without this guidance.

Use this skill BEFORE building any new page or component. Use `/ui-consistency-review` AFTER to verify compliance.

---

## Page Anatomy (Mandatory Structure)

Every AlphaAI dashboard page follows this vertical layout:

```
┌─────────────────────────────────────────────┐
│  HEADER — icon + title + badge + (optional  │
│           stats row)                         │
├─────────────────────────────────────────────┤
│  STUDIO PANEL — always-visible creation     │
│  surface with pill selectors and single     │
│  primary action button                      │
├─────────────────────────────────────────────┤
│  CONTENT GRID — split-pane or kanban board  │
│  ┌──────────┬──────────────────────────┐    │
│  │  LIST    │  DETAIL                  │    │
│  │  (cards) │  (selected item)         │    │
│  └──────────┴──────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Reference:** Content page (`AlphaAIContent.tsx`) implements this perfectly.

### Header Pattern
```tsx
<div className="px-4 md:px-6 pt-3 md:pt-5 pb-3">
  <div className="flex items-center gap-2.5">
    <Icon className="w-5 h-5 text-[hsl(var(--brand))]" />
    <h1 className="text-alphaai-lg font-semibold text-[hsl(var(--foreground))] tracking-tight">Page Title</h1>
    <Badge variant="secondary" className="border-0 text-alphaai-3xs px-1.5 py-0 h-4 bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]">
      {count} items
    </Badge>
  </div>
</div>
```

---

## Studio Panel Blueprint

The studio panel is the **primary creation surface**. It is always visible — never hidden behind a button or modal. Users should immediately understand what the page does and how to start.

### Container
```tsx
<div className="rounded-xl border border-[hsl(var(--brand)/0.25)] bg-gradient-to-br from-[hsl(var(--brand)/0.04)] to-transparent">
  <div className="p-4 md:p-5">
    {/* content */}
  </div>
</div>
```

### Structure (top to bottom)
1. **Icon logo mark + title + subtitle** — identifies the panel
2. **Pill selector rows** — one row per key choice (3–6 pills per row)
3. **Text input row** — for the one required free-text field
4. **Action row** — primary button + optional secondary links

### Icon Logo Mark
```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--brand)/0.15)] border border-[hsl(var(--brand)/0.3)] flex items-center justify-center">
    <Icon className="w-5 h-5 text-[hsl(var(--brand))]" />
  </div>
  <div className="flex-1">
    <h2 className="text-alphaai-md font-semibold text-[hsl(var(--foreground))]">Panel Title</h2>
    <p className="text-alphaai-3xs text-[hsl(var(--muted-foreground))]">
      One-line description of what this does
    </p>
  </div>
</div>
```

### Pill Selector Row
```tsx
<div className="flex items-center gap-2 flex-wrap">
  <span className="text-alphaai-3xs font-semibold text-[hsl(var(--muted-foreground))] mr-1">Label:</span>
  {OPTIONS.map((opt) => (
    <button
      key={opt}
      onClick={() => setSelected(opt)}
      className={`px-3 py-1.5 rounded-full text-alphaai-3xs font-semibold transition-all ${
        selected === opt
          ? "bg-[hsl(var(--brand))] text-[hsl(var(--background))] shadow-sm shadow-[hsl(var(--brand)/0.2)]"
          : "bg-[hsl(var(--muted)/0.4)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.6)]"
      }`}
    >
      {opt}
    </button>
  ))}
</div>
```

**Rules:**
- Active pill: `bg-brand text-background` (teal on dark)
- Inactive pill: `bg-muted/0.4 text-muted-foreground`
- Always include an "Other…" pill that reveals a text input for custom values
- Max 6 pills per row before wrapping looks cluttered

### Primary Action Button
```tsx
<button
  onClick={handleAction}
  disabled={!canSubmit}
  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-alphaai-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
  style={{ background: "hsl(var(--brand))", color: "hsl(var(--background))" }}
>
  <Rocket className="w-4 h-4" />
  Action Label
</button>
```

---

## Component Patterns

### List Card (sidebar item)
Every list card MUST show enough information to act without clicking into detail:

```
┌────────────────────────────────────────┐
│ Campaign Name                          │  ← text-alphaai-sm font-medium
│ [status] [type] metro · vertical · 2h  │  ← badges + meta
│ → Launch to find leads  ·  5 qualified │  ← next-action hint + stats
└────────────────────────────────────────┘
```

**Required elements:**
1. **Name** — truncated, `text-alphaai-sm font-medium`
2. **Status badge** — colored per status map
3. **Meta text** — `text-alphaai-2xs text-muted-foreground`
4. **Next-action hint** — `text-alphaai-3xs text-brand` (e.g., "→ Ready to launch")
5. **Mini stats** — `text-alphaai-3xs text-muted-foreground` (e.g., "5 qualified · 2 sent")

### Empty State (MUST be actionable)
```tsx
// ❌ BAD — passive text, user doesn't know what to do
<p>No targets discovered yet. Run recon_discover_competitors via the agent.</p>

// ✅ GOOD — action button for the logical next step
<>
  <p className="text-alphaai-xs text-[hsl(var(--muted-foreground))] mb-3">
    No targets yet — launch the analysis to discover competitors.
  </p>
  <button
    onClick={() => launchProject.mutate(projectId)}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-alphaai-xs font-medium"
    style={{ background: "hsl(var(--brand))", color: "hsl(var(--background))" }}
  >
    <Rocket className="w-3.5 h-3.5" />
    Launch Analysis
  </button>
</>
```

### Status Badge
```tsx
<Badge variant="secondary" className={`border-0 text-alphaai-3xs px-1.5 py-0 h-4 ${STATUS_COLORS[status]}`}>
  {status}
</Badge>
```

Color map pattern: `"bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"`

---

## Token Cheat Sheet

### Typography (MANDATORY — never use `text-xs`, `text-sm`, `text-[14px]`)
| Token | Size | Use for |
|-------|------|---------|
| `text-alphaai-3xs` | 10px | Tiny badges, security labels, timestamps |
| `text-alphaai-2xs` | 9.6px | Micro labels, meta text, pill labels |
| `text-alphaai-xs` | 10.4px | Small badges, captions, table cells |
| `text-alphaai-sm` | 11.2px | Section headers, card names, secondary text |
| `text-alphaai-base` | 12.8px | Card body text, form labels |
| `text-alphaai-md` | 13.2px | Primary body text, panel titles |
| `text-alphaai-lg` | 14.4px | Page titles, emphasized text |
| `text-alphaai-xl` | 16.8px | Mobile page headings |

### Colors (MANDATORY — never use `#hex`, `rgb()`, or standard Tailwind colors)
| Category | Tokens |
|----------|--------|
| **Semantic** | `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground` |
| **Brand** | `bg-brand`, `text-brand`, `border-brand`, `text-brand-glow`, `bg-brand-dark` |
| **Status** | `text-success`, `bg-warning`, `text-danger`, `bg-info` |
| **Accent** | `bg-accent-purple`, `text-accent-orange` |
| **Grey** | `text-grey-dark`, `bg-grey-medium`, `border-grey-light` |

### Inline `hsl(var(--*))` Pattern
When Tailwind shorthand doesn't support opacity modifiers, use:
```
bg-[hsl(var(--brand)/0.15)]    ← 15% opacity brand background
text-[hsl(var(--success))]     ← solid success text
border-[hsl(var(--border))]   ← standard border
shadow-[0_0_20px_-6px_hsl(var(--brand)/0.15)]  ← glow shadow
```

### Reusable CSS Classes (from `alphaai.css`)
| Class | Purpose |
|-------|---------|
| `.alphaai-card-hover` | Card with hover lift + border glow |
| `.alphaai-qa-btn` | Standard action button (brand-styled) |
| `.alphaai-stat-label` | Uppercase tracking label |
| `.alphaai-stat-number` | Large stat value |
| `.alphaai-scrollbar` | Styled scrollbar (always visible) |
| `.alphaai-scrollbar-auto` | Styled scrollbar (visible on hover) |
| `.alphaai-gradient-text` | Brand gradient text effect |
| `.alphaai-badge-brand/success/warning/danger` | Colored badges |
| `.alphaai-tag-success/task/warn/error/info` | Colored tags |
| `.alphaai-input-focus` | Input with brand focus ring |
| `.alphaai-hover-lift` | Subtle lift on hover |

---

## Anti-Patterns (NEVER DO THIS)

### 1. Modal for Primary Creation
```
❌ Click "New" button → modal opens → fill form → submit → modal closes
✅ Studio panel is always visible → fill pill selectors → click action button
```
Modals are acceptable for **secondary/advanced** configuration (e.g., ICP override), not primary creation.

### 2. Hidden Actions
```
❌ User must click a list item to discover available actions in the detail panel
✅ List card shows next-action hint ("→ Ready to launch") and mini stats
```

### 3. Layout-Shifting Inline Forms
```
❌ Click "New" → form expands inline → pushes content grid down
✅ Studio panel is part of the permanent layout — no shift
```

### 4. Passive Empty States
```
❌ "No items yet."
❌ "Run recon_discover_competitors via the agent."
✅ "No items yet — [Action Button] to get started."
```

### 5. Filters as Standalone Sections
```
❌ Two rows of filter tabs between header and content grid
✅ Compact filter pills inside the list card header
```

### 6. Raw Token Values
```
❌ text-[14px], text-sm, text-base, #20C9B8, rgb(32,201,184)
✅ text-alphaai-sm, text-alphaai-base, text-[hsl(var(--brand))]
```

---

## Mobile Conventions

| Convention | Value |
|-----------|-------|
| Breakpoint | `md` (768px) — mobile UI hidden above this |
| Tab bar z-index | `z-50` |
| Overlay z-index | `z-[60]` to `z-[70]` |
| Modal z-index | `z-[75]` |
| FAB z-index | `z-40` |
| Safe area | `pb-[env(safe-area-inset-bottom)]` |
| Sticky inputs | `sticky bottom-0` + safe-area padding |

---

## File Organization

| What | Where |
|------|-------|
| Pages | `src/pages/AlphaAI*.tsx` |
| Domain components | `src/components/alphaai/` |
| shadcn/ui primitives | `src/components/ui/` (do not modify) |
| Hooks | `src/hooks/use*.ts` |
| Design tokens | `src/styles/alphaai.css` + `tailwind.config.ts` |
| Shared utilities | `src/lib/page-utils.ts` |
