# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mom.Ai** is a mobile-first AI assistant platform that deploys 8 specialized AI agents to manage household tasks for busy mothers. The product is in **pre-development/planning phase** — no application code exists yet. The repo contains planning documents and design assets.

## Project Status

- **Phase**: Pre-development (planning & design complete, implementation not started)
- **Architecture decision**: Option 3 — Cowork Plugin + Render-Only MCP Backend + PWA (Next.js)
- **Target stack**: Next.js PWA (TypeScript, Tailwind CSS, Zustand, SWR/React Query, next-pwa), FastAPI backend (existing license server + MCP server on Render), Render Postgres
- **Design system**: "Lullaby & Logic" — existing HTML+Tailwind exports in `stitch_screenshot_of_https_mom.ai/`

## Key Planning Documents

| File | Purpose |
|---|---|
| `prd.md` | Product requirements — personas, user stories, 8 agent definitions, MVP scope |
| `architecture-analysis.md` | Architecture options scoring, tech stack decisions, integration analysis |
| `development-plan.md` | Implementation phases (4 phases), task breakdown, database schema, reuse analysis |
| `pricing.md` | Tier structure ($7.99/$14.99), LLM cost routing model, revenue projections |

## Architecture Highlights

- **8 AI agents**: Calendar Whiz, Grocery Guru, Budget Buddy, School Event Hub, Tutor Finder, Health Hub, Sleep Tracker, Self-Care Reminder
- **Multi-agent orchestration**: Agents share family context via shared DB tables + event bus
- **LLM Router**: Routes requests to Gemini Flash (60%), GPT-4o mini (25%), or GPT-4o (15%) based on complexity
- **Intent Classifier**: Deterministic operations bypass LLM entirely (direct DB ops)
- **~60% backend reuse** from existing Cowork MCP infrastructure (AgentVault license server, MCP HTTP/SSE transport, Google Calendar MCP, Gmail Connector)
- **Multi-tenant isolation**: All data isolated by `household_id` (app-level RLS)

## Design Assets — `stitch_screenshot_of_https_mom.ai/`

Pre-built UI designs with **ready-to-use HTML+Tailwind code** and reference screenshots. Each screen has a `code.html` (extractable Tailwind components) and `screen.png` (visual reference).

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
- `mom.ai_design_plan.html` — Full design plan document
- `development_handover_document.html` — Development handover reference

When building components, **extract directly from the `code.html` files** — they contain production-ready Tailwind markup matching the "Lullaby & Logic" design system.

## When Development Starts

The development plan specifies:
```bash
npx create-next-app@latest mom-ai --typescript --tailwind --app
```
With: Zustand (state), SWR or React Query (data fetching), next-pwa (Service Worker)

### Design System Tokens
- Primary color: `#32695a`
- Fonts: Plus Jakarta Sans (headlines), Be Vietnam Pro (body)
- No borders — separation via background color shifts
- Glass effects: `backdrop-blur-[20px]` + `bg-*/60` on floating elements
- Ambient shadows: `shadow-[0_8px_24px_rgba(0,55,71,0.06)]`
- Spacing base: 0.35rem

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
