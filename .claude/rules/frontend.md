---
paths: ["ai-assistant-local/src/**/*.tsx", "ai-assistant-local/src/**/*.ts", "src/**/*.css"]
---
# Frontend Rules

## CSS Zen Garden Compliance
- ALL colors must use CSS custom properties — zero hardcoded hex/rgb/hsl values
- ALL font sizes must use named tokens (`text-alphaai-3xs` through `text-alphaai-lg`)
- To retheme: change only `--brand` in `index.css` — zero component files touched
- Dark/light theme via `.light` class with token overrides

## Component Structure
- Components in `src/components/alphaai/`, organized by domain
- Hooks in `src/hooks/` — one hook per concern (e.g., `useMetrics`, `useAlerts`)
- Pages in `src/pages/` — lazy-loaded via `AlphaAIRoutes.tsx`
- shadcn/ui components in `src/components/ui/` — do not modify these directly

## Mobile
- Mobile breakpoint: `md` (768px) — mobile UI hidden above this
- z-index layers: tab bar `z-50`, overlays `z-[60-70]`, FAB `z-40`
- Safe-area: `pb-[env(safe-area-inset-bottom)]` with `max()` fallback
- Sticky inputs: `sticky bottom-0` + safe-area padding

## WebSocket Hooks
- All WS hooks use exponential backoff (5s → 120s cap) with reset on successful open
- Use shared `ws_redis_stream.stream_redis_channel()` pattern to survive Redis downtime
- Never assume WS is connected — always handle disconnected state gracefully

## Page UX Patterns
- **Studio panel is the primary creation surface** — always visible between header and content grid. Never use a modal or inline toggle for the main creation flow. Modals are only for secondary/advanced configuration.
- **List cards must show enough to act without clicking** — name + status badge + next-action hint + mini stats. Users should understand the next step from the card alone.
- **Empty states must include an action button** — not just text. "No items yet — [Launch] to get started" beats "No items yet." Never reference agent tool names in user-facing text.
- **Filters belong inside their parent container** — put status filter pills in the list card header, not as standalone sections between header and content grid.

## API Calls
- Use `/api/v1` (relative, proxied by Vite) — NEVER absolute `http://localhost:8000` URLs
- Graceful empty states when API unavailable — no fake/mock data fallbacks
- TypeScript types must match backend Pydantic schemas
