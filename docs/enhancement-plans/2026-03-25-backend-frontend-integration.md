# Enhancement Plan: Backend-Frontend Integration (Cross-Repo)

**Created:** 2026-03-25
**Reviewed:** 2026-03-25 (verified against both repos)
**Status:** Draft
**Author:** Claude
**Related Files:**
- `mom-alpha/src/lib/api-client.ts` (frontend API client)
- `mom-alpha/src/types/api-contracts.ts` (shared types)
- `mom-alpha/.env.example` (frontend env vars)
- `mom-alpha/.github/workflows/ci.yml` (CI — has broken backend job)
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/` (backend root)
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/app/main.py` (FastAPI entry)
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/app/config.py` (backend settings)
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/render.yaml` (backend deploy)

---

## Context

The Mom.alpha backend was previously duplicated inside this repo at `mom-alpha/backend/`, but those files have been deleted (correctly — the canonical backend lives in the Cowork Basic Plugin Kit repo). The latest Cowork commit `c035039 feat: add Mom.alpha backend (extracted from public PWA repo)` confirms this extraction. This plan describes how to make the two repos work together for **local development**, **deployment**, and **ongoing maintenance**.

### Verified Current State (2026-03-25)

**Frontend (this repo — `mom-ai-app`):**
- Next.js 16 static PWA at `mom-alpha/`, fully typed API client, Zustand stores, all 14+ API domain modules
- `.gitignore` already excludes `/backend/` and `/database/` with comment referencing repo boundary
- `development-plan.md` and `execution-strategy.md` already define the public/private repo boundary
- 4 untracked frontend files ready to commit: self-care page, sleep page, analytics page, voice input hook
- **CRITICAL: `mom-alpha/.github/workflows/ci.yml` has a broken `backend` job referencing non-existent `mom-alpha/backend/` directory — this will fail on every push/PR**

**Backend (Cowork repo — `cowork_plugin/platform files/mom_alpha/`):**
- FastAPI at `app/main.py`, 14 routers, 8 agent skills, intent classifier, LLM router, asyncpg + Postgres
- `config.py` already has `model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}` — `.env` loading works
- CORS uses `settings.cors_origin_list` property that splits comma-separated `cors_origins` — parsing is correct
- `render.yaml` sets `CORS_ORIGINS=https://mom.alphaspeedai.com` (production only)
- **Missing:** `.env.example` (referenced in README but file doesn't exist)
- **Missing:** `scripts/` directory (no dev.sh, no migrate.py)
- Cowork repo git root is at `cowork_plugin/` (not top-level)

**API contracts:** Frontend `api-contracts.ts` types align with backend routes/response shapes
**Frontend API base URL:** `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
**Frontend `.env.local`:** Does not exist yet

---

## 1. Enhancement Breakdown

### 1A. Backend: Make it runnable standalone for local dev
- **What**: Add a local dev script, document env var setup, ensure CORS allows `localhost:3000`
- **Services affected**: `mom_alpha/app/main.py` (CORS config), `mom_alpha/app/config.py` (settings)
- **Why**: Backend currently relies on Render env injection; local dev needs a `.env` file and explicit localhost CORS

### 1B. Backend: Database setup for local + production
- **What**: Create a migration runner script, document local Postgres setup
- **Services affected**: `mom_alpha/database/migrations/`, `mom_alpha/app/database.py`
- **Why**: Migrations exist as raw SQL files but there's no runner; dev needs a way to bootstrap a local DB

### 1C. Backend: CORS & security middleware alignment
- **What**: Ensure `cors_origins` config accepts both production URL and `http://localhost:3000`
- **Services affected**: `mom_alpha/app/main.py`, `mom_alpha/app/config.py`
- **Why**: Static PWA (different origin) needs CORS for every API call

### 1D. Frontend: Environment configuration for local dev
- **What**: Create `.env.local` template pointing at `http://localhost:8000`, document setup
- **Services affected**: `mom-alpha/.env.example`
- **Why**: Frontend defaults already point to `localhost:8000`, but developer needs clear instructions

### 1E. Frontend: Remove dead backend references from this repo
- **What**: Clean up any remaining references to the deleted `mom-alpha/backend/` directory
- **Services affected**: `development-plan.md`, `execution-strategy.md`, `.gitignore`
- **Why**: Avoid confusion about where the backend lives

### 1F. Cross-repo: API contract verification
- **What**: Audit all 14 frontend API modules against backend router endpoints to catch mismatches
- **Services affected**: `api-client.ts` ↔ all backend `routers/*.py`
- **Why**: The two codebases evolved separately; endpoint paths, request/response shapes, and HTTP methods may have drifted

### 1G. Backend: Render deployment config update
- **What**: Update `render.yaml` to set `CORS_ORIGINS` to the production frontend URL, verify env var list is complete
- **Services affected**: `mom_alpha/render.yaml`
- **Why**: Production CORS must allow the deployed PWA origin

---

## 2. Reuse vs New Code Analysis

### Reuse as-is (no changes needed)
| Component | Why |
|---|---|
| Frontend `api-client.ts` | Already fully typed, points at configurable `NEXT_PUBLIC_API_URL` |
| Frontend Zustand stores | Already integrate with API client correctly |
| Backend 14 routers | Endpoints match frontend expectations |
| Backend 8 agent skills | No frontend-facing changes needed |
| Backend intent classifier + LLM router | Internal orchestration, no API changes |
| Backend JWT auth | Frontend already sends `Bearer` tokens from auth store |
| Database schema (14 tables + migrations) | Schema is production-ready |

### Needs extension (small changes)
| Component | Change | Effort |
|---|---|---|
| ~~Backend `config.py`~~ | ~~Add `.env` file loading~~ — **ALREADY DONE** (`env_file = ".env"` confirmed) | 0 min |
| Backend `main.py` CORS | No code change needed — just set `CORS_ORIGINS=http://localhost:3000,https://mom.alphaspeedai.com` in `.env` | 2 min |
| Backend `render.yaml` | Add missing env vars, verify `CORS_ORIGINS` | 15 min |
| Frontend `.env.example` | Add local dev instructions as comments | 5 min |
| Frontend `ci.yml` | **Remove or disable broken `backend` job** (references deleted `mom-alpha/backend/`) | 5 min |

### Net-new code required
| Component | What | Why |
|---|---|---|
| `mom_alpha/scripts/migrate.py` | Simple script to run SQL migrations against Postgres in order | No migration runner exists; devs need to bootstrap local DB |
| `mom_alpha/scripts/dev.sh` | One-command local backend start (`uvicorn` + env loading) | Reduces setup friction |
| `mom_alpha/.env.example` | Backend env template | Backend has no `.env.example` currently |
| `mom_alpha/README-dev.md` | Local development instructions | Currently no dev setup docs |

---

## 3. Workflow Impact Analysis

### Workflow steps affected
1. **Local development** — Currently impossible without manual env setup. After this plan: single `./scripts/dev.sh` in backend, `npm run dev` in frontend.
2. **Deployment** — No workflow changes. Backend deploys to Render from Cowork repo. Frontend deploys as static export from this repo.
3. **API changes** — Any future endpoint changes require updating `api-contracts.ts` in this repo. No automated sync (acceptable for 2-repo setup).

### State transitions / side effects
- None. All changes are additive configuration — no data model or API behavior changes.

### Regression risk: **Low**
- No backend logic changes
- No frontend logic changes
- Only configuration and documentation additions

### Mitigation
- Run backend test suite (`pytest`) after config changes
- Run frontend build (`npm run build`) to catch type errors
- Manual smoke test: start both locally, hit `/health`, send a chat message

---

## 4. Implementation Phases

### Phase 1: Backend Local Dev Setup (1-2 hours)

**Tasks:**
1. Create `mom_alpha/.env.example` with all required env vars from `config.py` (documented, with safe defaults where possible)
2. ~~Verify `config.py` Pydantic Settings reads `.env` file~~ — **CONFIRMED**: `model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}` already present
3. CORS needs no code change — `cors_origin_list` property already splits comma-separated `cors_origins`. Just include `http://localhost:3000` in the `.env` file
4. Create `mom_alpha/scripts/dev.sh`:
   ```bash
   #!/bin/bash
   cd "$(dirname "$0")/.."
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Create `mom_alpha/scripts/migrate.py` — reads `DATABASE_URL` from env, runs each `database/migrations/*.sql` file in order, tracks applied migrations in a `_migrations` table

**Dependencies:** None (first phase)

**Success criteria:**
- Done when: `./scripts/dev.sh` starts the backend on port 8000 with a `.env` file, `/health` returns `{"status": "ok"}`
- Verified by: `curl http://localhost:8000/health` returns 200; CORS preflight from `localhost:3000` succeeds
- Risk level: Low

---

### Phase 2: Database Bootstrap (30-60 min)

**Tasks:**
1. Document local Postgres setup (create database, user, grant)
2. Test `scripts/migrate.py` against a fresh local Postgres — all 6 migration files run successfully
3. Verify migration idempotency (running twice doesn't error)

**Dependencies:** Phase 1 (needs `.env` with `DATABASE_URL`)

**Success criteria:**
- Done when: Fresh `createdb mom_alpha_dev` + `python scripts/migrate.py` creates all 14 tables
- Verified by: `\dt` in psql shows all tables; backend starts without DB errors
- Risk level: Low

---

### Phase 3: Frontend-Backend Wiring Verification (1-2 hours)

**Tasks:**
1. Create `mom-alpha/.env.local` from `.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
2. Start both frontend (`npm run dev`) and backend (`./scripts/dev.sh`)
3. Audit each of the 14 API modules in `api-client.ts` against the corresponding backend router:
   - Verify URL paths match (`/api/auth/google`, `/api/chat`, etc.)
   - Verify HTTP methods match (GET/POST/PUT/DELETE)
   - Verify request body shapes align with backend Pydantic models
   - Verify response shapes align with frontend TypeScript types
4. Document any mismatches found and fix them (either frontend or backend side)
5. Test the critical path end-to-end: Login → Dashboard → Chat → Agent response

**Dependencies:** Phase 1, Phase 2

**Success criteria:**
- Done when: All 14 API modules verified, critical path works end-to-end locally
- Verified by: Chat send returns a valid `ChatResponse`; calendar CRUD works; agent list loads
- Risk level: Medium (may find contract mismatches requiring fixes)

---

### Phase 4: Clean Up This Repo (45 min)

**Tasks:**
1. Confirm all `mom-alpha/backend/` and `database/` deletions are committed (git status shows `D` for those files — stage and commit)
2. **FIX CI WORKFLOW** — Remove or disable the `backend` job in `mom-alpha/.github/workflows/ci.yml` (lines 38-55 reference non-existent `mom-alpha/backend/` — this breaks every push/PR)
3. ~~Update `development-plan.md`~~ — **ALREADY DONE**: repo boundary is clearly defined (lines 11-21)
4. ~~Update `execution-strategy.md`~~ — **ALREADY DONE**: "where to implement what" section already references private repos
5. ~~Update `mom-alpha/.gitignore`~~ — **ALREADY DONE**: `/backend/` and `/database/` are explicitly ignored with comments
6. Commit the 4 untracked frontend files (self-care page, sleep page, analytics page, voice input hook — ~30KB)
7. Add cross-repo dev workflow section to `CLAUDE.md`

**Dependencies:** Phases 1-3 (want verified setup before documenting)

**Success criteria:**
- Done when: CI workflow passes, no dead backend references, untracked files committed
- Verified by: `ci.yml` has no `mom-alpha/backend` path; frontend build succeeds
- Risk level: Low

---

### Phase 5: Production Deployment Alignment (1 hour)

**Tasks:**
1. Update backend `render.yaml`:
   - Set `CORS_ORIGINS` to `https://mom.alphaspeedai.com` (production PWA URL)
   - Verify all env vars from `config.py` are listed
   - Add `DATABASE_URL` connection from `mom-alpha-db`
2. Verify frontend `.env.example` production values:
   - `NEXT_PUBLIC_API_URL=https://api.mom.alphaspeedai.com`
   - `NEXT_PUBLIC_WS_URL=wss://api.mom.alphaspeedai.com/ws`
3. Verify HTTPS/WSS endpoints will work (Render provides TLS by default)
4. Document the deployment flow:
   - Backend: Push to Cowork repo → Render auto-deploys
   - Frontend: Push to this repo → Build static export → Deploy to hosting (Render static site, Cloudflare Pages, or Vercel)

**Dependencies:** Phase 4

**Success criteria:**
- Done when: `render.yaml` has complete env var list, CORS allows production origin, deployment flow documented
- Verified by: Deploy backend to Render staging, hit `/health` from production frontend origin
- Risk level: Medium (first production deployment — may need iteration)

---

## 5. Testing Strategy

### Unit tests (backend — run in Cowork repo)
- **Existing**: 10 test files already exist (`test_call_budget.py`, `test_intent_classifier.py`, `test_llm_router.py`, etc.)
- **Run**: `cd mom_alpha && pytest` after any config changes
- **No new unit tests needed** — this plan doesn't change logic

### Integration tests
- **New**: Add a `tests/test_cors.py` that verifies CORS headers are set correctly for allowed origins
- **New**: Add a `tests/test_migrations.py` that runs migrations against a test DB and verifies table creation
- **Effort**: ~30 min

### E2E / smoke tests
- **Manual checklist** (until Playwright is added):
  1. Start backend locally → `/health` returns 200
  2. Start frontend locally → landing page loads
  3. Login flow → JWT stored in localStorage
  4. Agent list loads from `/api/agents`
  5. Send chat message → response renders
  6. Calendar CRUD → events appear
  7. WebSocket connection established (check browser DevTools)

### Existing tests to update
- None — existing tests mock the DB and don't depend on config changes

### Test data
- Migration script creates empty tables
- Frontend has mock data in `src/lib/mock-data.ts` for offline dev
- For integration testing: seed script would be nice (Phase 2 stretch goal, not required)

---

## 6. Open Questions / Risks

### Assumptions
1. **The Cowork repo is the single source of truth for backend code** — the deleted `mom-alpha/backend/` in this repo was a copy and should not be restored
2. **Backend deploys to Render** from the Cowork repo (not from this repo)
3. **Frontend deploys as a static export** (no SSR, no API routes in Next.js)
4. **Local Postgres** is acceptable for dev (no Docker required, though Docker Compose could be added later)
5. **No shared CI pipeline** needed yet — each repo has its own deploy

### Unknowns
1. **Google OAuth client ID** — Is the same client ID used for both local dev and production? Redirect URIs must include `http://localhost:3000` for dev
2. **Stripe webhook endpoint** — Does Render auto-provision the webhook URL, or does it need manual setup in Stripe dashboard?
3. **VAPID keys** — Are these generated yet? Push notifications won't work without them
4. **WebSocket in static export** — The frontend connects to `NEXT_PUBLIC_WS_URL` directly (client-side), which works fine with static export. Just need to verify the WS endpoint is live on Render

### Architectural risks
| Risk | Severity | Mitigation |
|---|---|---|
| API contract drift (two repos, no shared schema) | Medium | `api-contracts.ts` is the source of truth; add a CI step that generates OpenAPI from FastAPI and compares |
| CORS misconfiguration blocks production | Medium | Test with `curl -H "Origin: https://mom.alphaspeedai.com"` against staging |
| Database connection limits on Render Starter ($7/mo) | Low | Pool is 2-10 connections; sufficient for early traffic |
| Backend cold start on Render free/starter tier | Low | Render Starter plan has no sleep; if using free tier, expect 30s cold starts |

### Deployment considerations
- **Migrations**: Must run manually on Render Postgres before first deploy (or add to build command)
- **Rollback**: Backend is stateless (FastAPI); rollback = redeploy previous commit. DB migrations are additive (no destructive changes)
- **Secrets**: Never commit `.env.local` or `.env`. Both repos' `.gitignore` must exclude these

---

## 7. Summary: What To Do In Each Repo

### In the Cowork Basic Plugin Kit repo (`/Users/miguelfranco/Cowork Basic Plugin Kit`):

| # | Action | Location | Status |
|---|---|---|---|
| 1 | Create `.env.example` | `cowork_plugin/platform files/mom_alpha/.env.example` | **TODO** (missing, referenced in README) |
| 2 | ~~Verify Pydantic Settings loads `.env`~~ | `mom_alpha/app/config.py` | **DONE** (`env_file = ".env"` confirmed) |
| 3 | ~~Fix CORS code~~ — just add `localhost:3000` to `.env` | `mom_alpha/.env` | **Config-only** (no code change) |
| 4 | Create dev startup script | `mom_alpha/scripts/dev.sh` | **TODO** |
| 5 | Create migration runner | `mom_alpha/scripts/migrate.py` | **TODO** |
| 6 | Update `render.yaml` with complete env vars | `mom_alpha/render.yaml` | **TODO** (review needed) |
| 7 | Add CORS integration test | `mom_alpha/tests/test_cors.py` | **TODO** |
| 8 | Write dev setup README | `mom_alpha/README-dev.md` | **TODO** (README exists but references missing .env.example) |

### In this repo (`mom-ai-app`):

| # | Action | Location | Status |
|---|---|---|---|
| 1 | Create `.env.local` for dev | `mom-alpha/.env.local` | **TODO** |
| 2 | Stage + commit deleted `backend/` + `database/` files | Git | **TODO** (staged but not committed) |
| 3 | **Fix broken CI workflow** | `mom-alpha/.github/workflows/ci.yml` | **CRITICAL** (backend job references deleted dir) |
| 4 | ~~Update planning docs~~ | `development-plan.md`, `execution-strategy.md` | **DONE** (repo boundary already defined) |
| 5 | ~~Update `.gitignore`~~ | `mom-alpha/.gitignore` | **DONE** (`/backend/`, `/database/` already ignored) |
| 6 | Commit untracked frontend files | self-care, sleep, analytics pages + voice hook | **TODO** (~30KB) |
| 7 | Verify API contract alignment (audit 14 modules) | `api-contracts.ts` ↔ backend routers | **TODO** |
| 8 | Fix any contract mismatches found | `api-client.ts` or `api-contracts.ts` | **TODO** (if needed) |
| 9 | Document cross-repo dev workflow | `CLAUDE.md` | **TODO** |

---

## 8. Estimated Total Effort

| Phase | Estimate | Notes |
|---|---|---|
| Phase 1: Backend local dev setup | 45-90 min | Reduced — config.py and CORS parsing already work |
| Phase 2: Database bootstrap | 30-60 min | Unchanged |
| Phase 3: Frontend-backend wiring verification | 1-2 hours | Unchanged |
| Phase 4: Clean up this repo | 45 min | Added CI fix + commit untracked files |
| Phase 5: Production deployment alignment | 1 hour | Unchanged |
| **Total** | **3.5-6 hours** | ~1 hour saved from verified config |
