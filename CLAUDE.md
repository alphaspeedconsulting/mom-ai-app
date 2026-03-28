# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mom.alpha** is a mobile-first AI assistant PWA that deploys 8 specialized AI agents to manage household tasks. The frontend lives in `mom-alpha/` (Next.js 16, TypeScript, Tailwind CSS 4, Zustand 5, static export). All business logic lives in a separate Cowork backend (FastAPI + Postgres on Render).

## Architecture — Four-Repo Model

This repo is the **Mom.AI Next.js PWA frontend only**.

| Repo | What it is |
|------|-----------|
| `cowork_plugin/platform files/family_platform/` | Shared Python package — ALL business logic |
| `cowork_plugin/platform files/mom_alpha/` | FastAPI backend — thin wrappers + brand config |
| `Mom.Ai App/mom-ai-app/mom-alpha/` | **This repo** — Mom.AI Next.js PWA |
| `Dad.Ai App/dad-ai-app/dad-alpha/` | Dad.AI PWA — sibling app, same backend |

## Rules for This Repo

**DO:**
- Build UI components, pages, Zustand stores, hooks
- Call the backend via `src/lib/api-client.ts`
- Inject `parent_brand: "mom"` on all auth calls (already in api-client.ts — do not remove)
- Keep `src/types/api-contracts.ts` in sync with `dad-alpha/src/types/api-contracts.ts`

**DO NOT:**
- Write business logic, DB queries, or AI pipeline code — it belongs in `family_platform/`
- Add backend API endpoints here — add them to `family_platform/` then `mom_alpha/`
- Hardcode any color or font-size values in TSX — use CSS variable tokens only (Layer 4 rule)
- Let `api-client.ts` or `api-contracts.ts` drift out of sync with dad-alpha's versions

**When a new backend endpoint is added**, update BOTH `mom-alpha/src/types/api-contracts.ts` AND `dad-alpha/src/types/api-contracts.ts`, and both `api-client.ts` files.

## Development Commands

```bash
# Frontend (this repo)
cd mom-alpha
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → mom-alpha/out/
npm run lint         # ESLint check

# Backend (Cowork repo)
cd "/Users/miguelfranco/Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha"
cp .env.example .env          # fill in values
python scripts/migrate.py     # bootstrap DB (run once)
./scripts/dev.sh              # http://localhost:8000
```

No unit test framework is configured. E2E tests use Playwright (`tests/e2e/`).

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/api-client.ts` | Typed fetch wrapper — all backend calls go here |
| `src/types/api-contracts.ts` | TypeScript types shared with dad-alpha |
| `src/styles/index.css` | Layer 1: all CSS custom properties (only file with hardcoded values) |
| `src/styles/mom-alpha.css` | Layer 3: shared component classes (`.mom-glass-panel`, `.mom-card`) |

## Design System: CSS Zen Garden (4 Layers)

| Layer | File | Rule |
|---|---|---|
| 1 | `src/styles/index.css` | Only file with hardcoded colors/sizes — edit here to retheme |
| 2 | `globals.css` `@theme` block | Maps CSS vars → Tailwind utilities (`bg-brand`, `text-alphaai-sm`) |
| 3 | `src/styles/mom-alpha.css` | Shared component classes using CSS vars |
| 4 | Component TSX | Structure only — zero hardcoded colors or font sizes |

**Key tokens**: `--brand` (teal #32695a), `--secondary` (amber), `--tertiary` (lavender)
**Fonts**: Plus Jakarta Sans (headlines via `--font-headline`), Be Vietnam Pro (body via `--font-body`)
**Typography**: Use `text-alphaai-*` scale only (3xs → display-lg)

Quality gates before every frontend PR:
- `/ui-consistency-review` — 11-point CSS Zen Garden compliance audit

## State Management

Zustand stores with `persist` middleware (localStorage). Key stores:

| Store | Key Data |
|-------|---------|
| `auth-store.ts` | JWT token, user profile, consent |
| `household-store.ts` | Family unit, members, co-parent invite, usage |
| `subscription-store.ts` | Trial/family/pro tier |
| `calendar-store.ts`, `chat-store.ts`, `tasks-store.ts` | Feature-specific state |

## 8 AI Agents

Calendar Whiz, Grocery Guru, Budget Buddy, School Event Hub, Tutor Finder, Health Hub, Sleep Tracker, Self-Care Reminder. Each has a route at `/agents/<agent-name>/` and a chat interface at `/chat/[agent]`.

## Design Assets

`stitch_screenshot_of_https_mom.alphaspeedai.com/` contains pre-built UI designs with `code.html` (extractable Tailwind markup) and `screen.png` (visual reference) for every screen. Extract components directly from these files when building new UI.

## Deployment

GitHub Actions (`.github/workflows/deploy-pages.yml`) deploys to GitHub Pages on push to `main`. Builds `mom-alpha/`, exports to `mom-alpha/out/`.

## Planning Documents

| File | Purpose |
|---|---|
| `prd.md` | Personas, user stories, 8 agent definitions, MVP scope |
| `architecture-analysis.md` | Architecture decisions, tech stack rationale |
| `development-plan.md` | Implementation phases, DB schema |
| `pricing.md` | Tier structure ($7.99/$14.99), LLM cost routing model |
