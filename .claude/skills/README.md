# AlphaAI Frontend Skills

These skills apply when building or reviewing the **AlphaAI dashboard frontend** (React/TypeScript, Tailwind, alphaai.css). They are maintained in this repo for reuse across workspaces.

## Path context

- **`ai-assistant-local`** in the skill content = root of the AlphaAI dashboard app (e.g. `alpha-ai-assistant`, Alpha AI Mini, or your local frontend repo). When using these skills, treat that path as the dashboard app root where `src/pages/`, `src/components/alphaai/`, `src/styles/alphaai.css`, and `tailwind.config.ts` live.

## Skills

| Skill | Use when |
|-------|----------|
| **alphaai-design-system** | Building a new page or component — page anatomy, studio panel, tokens, anti-patterns |
| **alphaai-frontend-design** | Designing a new page/component with distinctive aesthetics within the token system |
| **ui-consistency-review** | Before/after any frontend change — 11-check audit (colors, typography, UX patterns) |

## Flow

1. **Building a new page?** → Use `alphaai-design-system` then `alphaai-frontend-design`.
2. **Done building?** → Run `ui-consistency-review` to verify compliance.
3. **Editing `.tsx`?** → `.claude/rules/frontend.md` (Page UX Patterns) applies automatically where configured.
