---
name: alphaai-frontend-design
description: Creative frontend design thinking constrained to the AlphaAI design system. Use when designing a new page or component where you want distinctive, intentional aesthetics while staying within the project's CSS token system. Bridges Anthropic's frontend-design methodology with AlphaAI's CSS Zen Garden architecture.
---

# AlphaAI Frontend Design

Apply the design thinking methodology from Anthropic's `frontend-design` skill — but constrain all output to the AlphaAI token system.

## Design Thinking (from frontend-design)

Before building, answer these questions:
1. **Purpose** — What problem does this interface solve? Who uses it?
2. **Tone** — What feeling should it evoke? (Efficient, confident, clear, powerful)
3. **Differentiation** — What makes this page memorable and easy to use?

## Constraints (AlphaAI overrides)

The following rules override `frontend-design` defaults:

### Typography
- **ONLY** use `text-alphaai-3xs` through `text-alphaai-xl` — no arbitrary sizes
- Font family is Inter (configured in `tailwind.config.ts`) — do not introduce other fonts
- Create visual hierarchy through weight (`font-medium`, `font-semibold`) and token scale, not custom sizes

### Colors
- **ONLY** use CSS custom property tokens — `hsl(var(--brand))`, `bg-success`, `text-muted-foreground`, etc.
- No hardcoded hex, rgb, or hsl values anywhere in component code
- Create visual interest through **opacity modifiers**: `bg-[hsl(var(--brand)/0.15)]`, `border-[hsl(var(--brand)/0.3)]`
- Gradients must use tokens: `bg-gradient-to-br from-[hsl(var(--brand)/0.04)] to-transparent`

### Layout
- Follow the page anatomy: Header → Studio Panel → Content Grid (see `/alphaai-design-system`)
- Use the studio panel pattern for creation flows
- Split-pane layout: `grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]`

### Motion
- Prefer CSS transitions over JS animations: `transition-all duration-200`
- Use existing keyframes from `tailwind.config.ts`: `animate-pulse-glow`, `animate-float`, `animate-avatar-breathe`
- Hover effects via `alphaai-hover-lift` or subtle border/shadow changes

### Visual Depth
- Create atmosphere through **token-based gradients and glows**, not raw color values
- Card glow: `shadow-[0_0_20px_-6px_hsl(var(--brand)/0.15)]`
- Brand border accent: `border-[hsl(var(--brand)/0.4)]`
- Background layering: `bg-[hsl(var(--card))]` on `bg-[hsl(var(--background))]`

## What This Skill Does NOT Do
- Does not introduce new fonts, color palettes, or design systems
- Does not override `alphaai.css` or `tailwind.config.ts`
- Does not create standalone artifacts — builds within the existing dashboard
- Does not bypass `/ui-consistency-review` — always run that after implementing
