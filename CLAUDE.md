# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mom.alpha** is a mobile-first AI assistant platform that deploys 8 specialized AI agents to manage household tasks for busy mothers. The product is in **pre-development/planning phase** — no application code exists yet. The repo contains planning documents and design assets.

## Project Status

- **Phase**: Active development — frontend PWA live in `mom-alpha/`, backend live in Cowork repo
- **Architecture decision**: Option 3 — Cowork Plugin + Render-Only MCP Backend + PWA (Next.js)
- **Stack**: Next.js 16 PWA (TypeScript, Tailwind CSS 4, Zustand 5, static export), FastAPI backend (Render + Postgres)
- **Design system**: "Lullaby & Logic" — existing HTML+Tailwind exports in `stitch_screenshot_of_https_mom.alphaspeedai.com/`

## Repository Boundary

| Code | Repo |
|---|---|
| Next.js PWA (`mom-alpha/`), public planning docs, design assets | **This repo** (`mom-ai-app`) — public |
| FastAPI backend, agent skills, LLM router, PII masker, DB migrations | **Cowork Basic Plugin Kit** (`cowork_plugin/platform files/mom_alpha/`) — private |
| Shared API types (source of truth) | `mom-alpha/src/types/api-contracts.ts` (this repo) |

**Rule:** Do not put proprietary agent behavior, MCP skills, or backend source code in this repo.

## Cross-Repo Development Setup

### Start the backend (Cowork repo):
```bash
cd "/Users/miguelfranco/Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha"
cp .env.example .env          # fill in values
python scripts/migrate.py     # bootstrap DB (run once)
./scripts/dev.sh              # starts on http://localhost:8000
```

### Start the frontend (this repo):
```bash
cd mom-alpha
# .env.local already configured for localhost:8000
npm install
npm run dev                   # starts on http://localhost:3000
```

### API contract changes:
When adding or changing a backend endpoint, update `mom-alpha/src/types/api-contracts.ts` in this repo to match.

## Key Planning Documents

| File | Purpose |
|---|---|
| `prd.md` | Product requirements — personas, user stories, 8 agent definitions, MVP scope |
| `architecture-analysis.md` | Architecture options scoring, tech stack decisions, integration analysis |
| `development-plan.md` | Implementation phases, task breakdown, database schema, reuse analysis |
| `execution-strategy.md` | Session plan, parallelization, quality gates, phase dependency graph |
| `pricing.md` | Tier structure ($7.99/$14.99), LLM cost routing model, revenue projections |

## Architecture Highlights

- **8 AI agents**: Calendar Whiz, Grocery Guru, Budget Buddy, School Event Hub, Tutor Finder, Health Hub, Sleep Tracker, Self-Care Reminder
- **Multi-agent orchestration**: Agents share family context via shared DB tables + event bus
- **LLM Router**: Routes requests to Gemini Flash (60%), GPT-4o mini (25%), or GPT-4o (15%) based on complexity
- **Intent Classifier**: Deterministic operations bypass LLM entirely (direct DB ops)
- **~60% backend reuse** from existing Cowork MCP infrastructure (AgentVault license server, MCP HTTP/SSE transport, Google Calendar MCP, Gmail Connector)
- **Multi-tenant isolation**: All data isolated by `household_id` (app-level RLS)

## Design Assets — `stitch_screenshot_of_https_mom.alphaspeedai.com/`

Pre-built UI designs with **ready-to-use HTML+Tailwind code** and reference screenshots. Each screen has a `code.html` (extractable Tailwind components) and `screen.png` (visual reference).

**Canonical folder name in this repo:** `stitch_screenshot_of_https_mom.alphaspeedai.com/`. If a local Stitch export still uses the legacy path `stitch_screenshot_of_https_mom.ai/`, rename or symlink it when vendoring assets so docs and imports stay aligned.

| Subdirectory | Screen |
|---|---|
| `login_sign_up/` | Login & signup flow |
| `onboarding/` | Family onboarding wizard |
| `home_marketplace/` | Home dashboard + agent marketplace |
| `family_calendar/` | Calendar view with conflict detection |
| `agent_chat/` + `refined_agent_chat/` | Agent chat interface (original + refined) |
| `tasks_dashboard/` + `refined_tasks_dashboard/` | Task tracking (original + refined) |
| `budget_buddy_agent/` | Budget Buddy agent screen |
| `school_event_hub/` | School Event Hub agent screen |
| `tutor_finder_agent/` | Tutor Finder agent screen |
| `family_health_hub_agent/` | Health Hub agent screen |
| `notification_center/` | Notification center |
| `user_profile/` | User profile & settings |
| `app_settings/` | App settings |
| `lullaby_logic/` | Design system spec (`DESIGN.md`) |

Also includes:
- `mom.alphaspeedai.com_design_plan.html` — Full design plan document
- `development_handover_document.html` — Development handover reference

When building components, **extract directly from the `code.html` files** — they contain production-ready Tailwind markup matching the "Lullaby & Logic" design system.

## When Development Starts

The development plan specifies:
```bash
npx create-next-app@latest mom-ai --typescript --tailwind --app
```
With: Zustand (state), SWR or React Query (data fetching), next-pwa (Service Worker)

### Design System: CSS Zen Garden Architecture (Theme-Swappable)

The "Lullaby & Logic" theme uses the AlphaAI CSS Zen Garden 4-layer architecture:

| Layer | File | Purpose |
|---|---|---|
| Layer 1 | `src/styles/index.css` | CSS custom properties (`:root` vars) — **only file with hardcoded colors** |
| Layer 2 | `tailwind.config.ts` | Maps CSS vars to utilities (`bg-brand`, `text-alphaai-sm`) |
| Layer 3 | `src/styles/mom-alpha.css` | Shared component classes (`.mom-glass-panel`, `.mom-card`, `.mom-chip`) |
| Layer 4 | Component TSX files | Structure only — **zero hardcoded colors or font sizes** |

**Key tokens**: `--brand` (teal #32695a), `--background`, `--surface`, `--foreground`, `--shadow-tint`
**Fonts**: Plus Jakarta Sans (headlines), Be Vietnam Pro (body)
**Typography**: Use `text-alphaai-*` tokens only (3xs through xl)
**To retheme**: Change only Layer 1 CSS variables — zero component files touched

**Quality gates** (run before every frontend PR):
- `/ui-consistency-review` — 11-point CSS Zen Garden compliance audit
- `/alphaai-design-system` — Page blueprints and component patterns
- `/alphaai-frontend-design` — Creative design within token constraints

### Backend Services (on Render)
- `agentvault-license-server` — FastAPI: OAuth, JWT, family API routes, call budget tracking
- `agentvault-mcp` — MCP HTTP/SSE server: agent skills, intent classifier, LLM router
- `agentvault-db` — Render Postgres ($19/mo)

## MCP Sub-Agent Integration

This project uses AI Product Agents via MCP as sub-agents (see `.cursor/rules/ai-product-agents-subagents.mdc`):
- **Product Agent** → `generate_prd`
- **Architecture Agent** → `analyze_architecture`, `review_architecture`, etc.
- **Orchestrator Agent** → PRD + architecture in one flow (use same `workflow_name`)
- **Sales Agent** → `generate_pitch`
- **UI/UX Agent** → `analyze_ui_ux`
