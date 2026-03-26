# Enhancement Plan: Stripe Integration + Beta PWA Installability

**Created:** 2026-03-25
**Updated:** 2026-03-26
**Status:** Draft
**Author:** Claude
**Related Files:**
- `mom-alpha/src/lib/api-client.ts`
- `mom-alpha/src/stores/subscription-store.ts`
- `mom-alpha/src/app/(app)/settings/page.tsx`
- `mom-alpha/src/types/api-contracts.ts`
- `mom-alpha/src/app/layout.tsx`
- `mom-alpha/public/manifest.json`
- `mom-alpha/public/sw.js` (Workbox-based, pre-built)
- `mom-alpha/public/sw-push.js`
- `mom-alpha/public/icons/icon-192.png`, `icon-512.png`
- `mom-alpha/next.config.ts`
- `mom-alpha/tests/e2e/pwa.spec.ts`
- `development-plan.md`
- `execution-strategy.md`
- `prd.md`
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/app/routers/stripe.py` (private backend repo)
- `Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/app/config.py` (private backend repo)

---

## Stripe Product Catalog (Live)

Products and prices are already created in Stripe (created 2026-03-25):

| Product | Product ID | Monthly (Default) | Yearly |
|---|---|---|---|
| **AlphaMom - Family** | `prod_UDOYNk9QTjdxAC` | $7.99/mo | $69.99/yr (~27% savings) |
| **AlphaMom-Family Pro** | `prod_UDOYhKPo0sqInn` | $14.99/mo | $129.99/yr (~28% savings) |

Both products are **Active** with 0 subscriptions. Price IDs to be captured from Stripe Dashboard and configured as backend environment variables.

> **Note:** Annual prices ($69.99/$129.99) include a discount vs. monthly billing ($95.88/$179.88 annualized). This is consistent with typical SaaS annual pricing and does not require separate coupon handling.

---

## 1. Enhancement Breakdown

### 1A) Complete Stripe subscription lifecycle (Family + Family Pro, monthly + yearly)
- **What is added/changed**
  - Wire frontend upgrade buttons to Stripe Checkout creation. Currently `settings/page.tsx` uses `<Link href="/settings?upgrade=family">` instead of calling `startCheckout()` from the subscription store — this needs to be replaced with proper checkout invocation including billing cycle selection.
  - Extend `CheckoutTrialRequest` type in `api-contracts.ts` to include optional `promotion_code` field for beta invite codes.
  - Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var to frontend configuration for Stripe.js initialization (if needed for client-side validation or redirect confirmation).
  - Keep customer self-service via Stripe Billing Portal (already wired via `openPortal()`).
  - Add beta-friendly promotion code path in Checkout (for invite-only trial/beta cohorts).
  - Ensure webhook-driven subscription state sync (trial active, active, past_due, canceled) updates household tier and budget windows.
- **Services / agents / workflows affected**
  - Service-based: `license-server` Stripe router + webhook handler (backend repo), frontend subscription store + settings page (this repo).
  - Agent Overlay: tier and budget state remains the gating input for tool access/routing; no agent behavior logic is moved into billing.
  - LangGraph/workflow engine: no new core graph; billing state is consumed as existing policy context.
- **Why this approach**
  - Maximizes reuse of existing Stripe client/store scaffolding and AgentVault license infrastructure.
  - Keeps billing in a dedicated service boundary and avoids coupling payment logic into agent execution paths.

### 1B) Ensure installable PWA for beta client testing
- **What is added/changed**
  - Audit and extend existing Workbox-based service worker (`public/sw.js`) rather than introducing new SW tooling. The current SW already includes precaching, network-first for start URL, cache-first for fonts, and stale-while-revalidate for static assets.
  - Resolve service worker coexistence: merge push notification handling from `sw-push.js` into the primary `sw.js`, or ensure only one SW registration per scope (two SW registrations on the same scope will conflict).
  - Verify manifest linking in app metadata/head is deterministic across all app routes.
  - Verify icon assets (`icon-192.png`, `icon-512.png`) meet Lighthouse requirements: correct dimensions, maskable safe zone compliance, and sufficient contrast.
  - Define explicit offline fallback behavior for core shell routes.
- **Services / agents / workflows affected**
  - Frontend shell (Next.js app router, public assets, SW configuration).
  - Notifications workflow (push subscription must work with unified SW strategy).
  - Agent workflows unaffected except improved app availability in weak connectivity.
- **Why this approach**
  - Existing Workbox SW covers most installability requirements — scope is audit/extend, not build from scratch.
  - Beta testing quality depends on installability + offline resilience more than new feature scope.

### 1C) Beta operations readiness for friendlies
- **What is added/changed**
  - Define beta promotion code policy against the live Stripe catalog (codes applicable to specific price IDs from the products above).
  - Add beta distribution checklist: install instructions (iOS/Android), known limitations, and feedback capture loop.
  - iOS-specific install messaging (no native install prompt — must guide users through Safari "Add to Home Screen" flow, push notifications limited on iOS).
- **Services / agents / workflows affected**
  - Stripe Dashboard operations + support workflow.
  - QA/UAT workflow for install and billing paths.
- **Why this approach**
  - Prevents ad-hoc pricing changes and gives a controlled beta funnel without distorting production pricing architecture.

---

## 2. Reuse vs New Code Analysis

### Reuse as-is
| Component | Reuse rationale |
|---|---|
| `api-client.ts` Stripe methods (`/api/stripe/checkout`, `/api/stripe/portal`) | Already implemented and typed |
| `subscription-store.ts` methods (`startCheckout`, `openPortal`) | Core client-side flow exists; `startCheckout` accepts tier + billingCycle |
| Existing manifest (`public/manifest.json`) + install hook/banner | Good baseline — name, icons, display mode, theme already configured |
| Icon assets (`public/icons/icon-192.png`, `icon-512.png`) | Both exist; need Lighthouse compliance verification only |
| Existing Workbox SW (`public/sw.js`) | Full precaching + runtime caching already built; needs audit, not replacement |
| Existing PRD/pricing constraints + live Stripe catalog | Products and prices already created (see catalog table above) |
| Existing AgentVault license/tier model (backend private repo) | Intended home for Stripe lifecycle and gating |

### Needs extension
| Component | Extension needed | Reason |
|---|---|---|
| Settings upgrade UX (`settings/page.tsx`) | Replace `<Link>` navigation with `startCheckout()` calls; add billing cycle toggle (monthly/yearly); add beta promo code input | Current buttons navigate to `/settings?upgrade=family` instead of triggering checkout |
| `CheckoutTrialRequest` type (`api-contracts.ts`) | Add optional `promotion_code?: string` field | Required for beta discount application; currently only has tier, billing_cycle, success_url, cancel_url |
| Backend checkout endpoint | Accept `promotion_code` in request body; map tier + billing_cycle to correct Stripe price IDs from catalog | Required for annual plans and beta promo operations |
| Webhook mapping | Confirm tier/budget transitions for trial/active/cancel states and idempotent processing | Avoid entitlement drift — this is a **Phase 1 blocker** (see below) |
| PWA app metadata (`layout.tsx`) | Verify manifest link and theme color are always emitted for all app routes | Needed for install prompts on beta devices |
| SW coexistence strategy | Merge push handlers from `sw-push.js` into `sw.js` or use single registration with importScripts | Two SW registrations on the same scope will conflict |
| Environment configuration | Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local` and deployment env | Frontend needs publishable key for Stripe.js if used |

### Net-new code (minimal and justified)
| Net-new item | Why necessary |
|---|---|
| Billing cycle selector UI component (settings page) | Users must choose monthly vs. yearly before checkout; not currently in UI |
| Beta promo code input (conditional on beta flag) | Invite-only beta requires code entry point |
| Stripe beta promo validation path (backend) | Prevent unauthorized coupons and keep discounts bounded for invite-only beta |
| Beta UAT scripts/checklists docs | Needed for repeatable acceptance with friendlies across iOS/Android |

---

## 3. Workflow Impact Analysis

### Workflow steps affected
1. **Subscription upgrade path**: Settings -> select tier + billing cycle -> `startCheckout()` -> Stripe Hosted Checkout (with optional promo) -> webhook -> local tier/budget update.
2. **Subscription management**: Settings -> "Manage" button -> `openPortal()` -> Stripe Billing Portal -> plan changes/cancel -> webhook sync.
3. **Install flow**: open app on supported mobile browser -> install prompt conditions met (Android) / user follows "Add to Home Screen" guide (iOS) -> install to home screen.
4. **Offline/poor connectivity behavior**: shell + last-known state remain accessible; API failures handled gracefully.

### State transitions / side effects introduced
- `trial` -> `family` / `family_pro` on successful checkout.
- `family` <-> `family_pro` via upgrade/downgrade events through Billing Portal.
- `active` -> `past_due` / `canceled` changes gating and potentially call-budget enforcement policy.
- `web` -> `installed` client state (UX-only, may influence install banner suppression).
- `online` <-> `offline` UI state now validated against real SW/cache behavior.

### Regression risk level
- **Stripe integration:** Medium (financial and entitlement correctness).
- **PWA installability/offline:** Low-Medium (audit/extend existing SW, not rebuild).
- **Agent workflows:** Low (no direct change to agent graph logic).

### Mitigation strategies
- Webhook idempotency + signature verification + replay-safe event handling.
- Feature flags or staged rollout for checkout entrypoint and promo code usage.
- SW cache versioning and explicit cache invalidation policy to avoid stale assets.
- Parallel smoke tests in staging for checkout success/cancel, portal return, install, and offline banner behavior.

---

## 4. Implementation Phases

### Phase 1: Stripe Architecture Alignment & Backend Audit (0.5 day)

> **BLOCKER:** Backend webhook coverage must be audited before Phase 3 estimates are reliable.

- **Tasks**
  - Capture the 4 price IDs from Stripe Dashboard for the live catalog products above and configure as backend environment variables.
  - Audit existing backend Stripe webhook handler in Cowork repo: document which events are already handled (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, etc.) and identify gaps.
  - Define beta promotion code policy: create 1+ promotion codes in Stripe Dashboard with redemption cap (e.g., 25), expiration (e.g., 60 days), and restrict to eligible price IDs only.
  - Map Stripe event types to internal subscription states and tier gate outcomes.
  - Confirm whether `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is needed and add to `.env.local` + deployment config.
- **Dependencies**
  - Stripe Dashboard access (products already created).
  - Backend repo access for webhook audit.
  - Existing pricing decisions in `pricing.md` and PRD FR-12.
- **Success criteria**
  - **Done when:** Price IDs captured, webhook gap analysis complete, promo codes created, event-state mapping documented.
  - **Verified by:** Written matrix + webhook event mapping table reviewed against product requirements.
  - **Risk level:** Low.

### Phase 2: Frontend Checkout Wiring & UX Completion (0.5-1 day)
- **Tasks**
  - Replace `<Link href="/settings?upgrade=family">` and `<Link href="/settings?upgrade=family_pro">` in `settings/page.tsx` with buttons that call `startCheckout(tier, billingCycle)`.
  - Add billing cycle toggle (monthly/yearly) showing both price points per tier from the live catalog.
  - Extend `CheckoutTrialRequest` in `api-contracts.ts` to add `promotion_code?: string`.
  - Add optional promo code input field, visible only under beta feature flag.
  - Add clear success/cancel handling on return to settings (parse `?success=true` / `?canceled=true` query params from Stripe redirect).
- **Dependencies**
  - Phase 1 price IDs and promo policy.
- **Success criteria**
  - **Done when:** Trial user can launch checkout for both tiers and both billing cadences from app UI.
  - **Verified by:** Manual walkthrough + test Stripe sessions showing correct price IDs from live catalog.
  - **Risk level:** Medium.

### Phase 3: Backend Stripe Lifecycle Hardening (0.5-1 day)

> Estimate refined after Phase 1 webhook audit. If most handlers already exist, this phase shrinks to validation + promo support.

- **Tasks**
  - Confirm/create checkout endpoint: map `tier` + `billing_cycle` to correct price ID from the 4 live prices; pass `promotion_code` to Stripe Checkout Session creation if provided.
  - Fill any webhook gaps identified in Phase 1 audit: ensure handlers for checkout completion, subscription updates, cancellations, and invoice/payment failures.
  - Ensure idempotency keys/event replay safety and strict signature verification (`STRIPE_WEBHOOK_SECRET`).
  - Sync household tier + budget state changes atomically.
- **Dependencies**
  - Phase 1 webhook gap analysis (determines actual scope).
  - Phase 2 request contract confirmation.
  - Backend repo availability (`Cowork` private repo).
- **Success criteria**
  - **Done when:** Subscription state remains correct across normal and failure billing scenarios.
  - **Verified by:** Stripe CLI webhook replay tests + backend integration tests passing.
  - **Risk level:** Medium.

### Phase 4: PWA Installability Audit & Hardening (0.25-0.5 day)

> Scope reduced: existing Workbox SW (`public/sw.js`) already provides precaching + runtime caching. This phase is audit/extend, not build from scratch.

- **Tasks**
  - **SW coexistence resolution:** Decide and implement one of:
    - (A) Merge `sw-push.js` push/notification handlers into `sw.js` (preferred — single SW registration), or
    - (B) Have `sw.js` use `importScripts('sw-push.js')` to compose both in one registration.
  - **Icon audit:** Verify `icon-192.png` and `icon-512.png` meet Lighthouse PWA requirements (correct dimensions, maskable safe zone, sufficient contrast). Fix if needed.
  - **Manifest linking:** Confirm `<link rel="manifest" href="/manifest.json">` and `<meta name="theme-color" content="#32695a">` are emitted on all app routes in `layout.tsx`.
  - **Offline behavior:** Verify SW offline fallback works for core shell routes; add explicit offline fallback page if needed.
  - **SW registration:** Confirm registration code in app shell registers `/sw.js` correctly and handles updates (skipWaiting is already enabled).
- **Dependencies**
  - Existing manifest/install prompt artifacts in frontend.
- **Success criteria**
  - **Done when:** App passes Lighthouse PWA installability audit on Android Chrome; iOS Safari "Add to Home Screen" produces working standalone app.
  - **Verified by:** Lighthouse PWA audit score + E2E checks for manifest/SW + real-device install smoke tests.
  - **Risk level:** Low-Medium.

### Phase 5: Beta UAT & Operational Readiness (1 day)
- **Tasks**
  - Prepare beta tester runbook:
    - Invite flow with promotion code distribution.
    - Install steps for **Android** (Chrome install prompt) and **iOS** (Safari > Share > "Add to Home Screen" — no native prompt).
    - Known limitations: iOS push notification constraints, offline behavior scope.
    - Support/feedback channel.
  - Execute end-to-end beta scenarios: sign-up, trial, discounted conversion with promo code, billing portal changes, reinstall/offline behavior.
  - Set Stripe dashboard monitors/alerts for failed payments and anomalous coupon redemption.
- **Dependencies**
  - Phases 2-4 complete in staging.
- **Success criteria**
  - **Done when:** Beta friendlies can install app and complete billing lifecycle with expected outcomes.
  - **Verified by:** UAT checklist completion + no blocker defects open.
  - **Risk level:** Medium.

### Phase 6: Controlled Launch & Rollback Preparedness (0.5 day)
- **Tasks**
  - Roll out to limited beta cohort first (friendlies list), then widen.
  - Enable observability dashboards for checkout conversion, webhook failures, install success rate, and offline error frequency.
  - Prepare rollback playbook: disable promo codes in Stripe Dashboard, revert checkout entrypoint flag, revoke problematic SW cache version.
- **Dependencies**
  - Phase 5 signoff.
- **Success criteria**
  - **Done when:** Beta rollout is live with monitoring and rollback controls.
  - **Verified by:** First cohort activity appears in Stripe + app analytics with expected ratios.
  - **Risk level:** Low-Medium.

---

## 5. Testing Strategy

### Unit tests required
- Frontend:
  - Subscription store tests for checkout and portal redirects with correct tier/billing cycle params.
  - Billing cycle toggle component tests (monthly/yearly selection, price display).
  - Install prompt hook tests for second-visit logic and dismissal behavior.
- Backend:
  - Stripe payload validation tests: tier/billing cycle -> price ID mapping against live catalog.
  - Promotion code validation tests (valid code, expired code, over-cap code).
  - Webhook event parsing/idempotency tests for all subscription state transitions.

### Integration tests required
- Checkout endpoint integration using Stripe test mode with the 4 live price IDs.
- Webhook integration with Stripe CLI replay to validate tier/budget synchronization.
- Promotion code application flow end-to-end (code -> discount -> correct checkout amount).
- Service worker registration + push readiness integration (single SW serving both caching and push).

### E2E / workflow tests required
- New/updated Playwright flows:
  1. Trial user selects Family monthly, clicks upgrade, reaches Stripe Checkout with correct price.
  2. Trial user selects Family Pro yearly, clicks upgrade, reaches Stripe Checkout with correct price.
  3. Trial user cancels checkout and sees non-destructive cancel state.
  4. Billing portal deep-link opens and returns successfully.
  5. Manifest/SW/install checks pass in production-like build.
  6. Offline banner appears and core shell remains usable when network drops.
  7. Beta promo code applied at checkout produces expected discount.

### Existing tests to update
- `mom-alpha/tests/e2e/pwa.spec.ts`
  - Align SW assertions with unified SW strategy (single `sw.js` serving cache + push).
  - Add explicit test for install prompt eligibility criteria when feasible.
- Settings/subscription UI tests to reflect real checkout buttons instead of `<Link>` navigation.

### Test data requirements
- Stripe **test-mode**:
  - 4 price IDs from live catalog (Family monthly/yearly, Pro monthly/yearly).
  - At least one beta promotion code with redemption cap and expiration.
  - Test customers across trial, active, past_due, canceled states.
- App:
  - Beta test household fixtures for trial and paid tiers.
  - Deterministic seed data for dashboard/profile/settings validation.

---

## 6. Open Questions / Risks

### Assumptions
- Backend Stripe router and webhook handlers exist in private Cowork repo and are extendable (to be confirmed in Phase 1 audit).
- Frontend remains static export (`output: "export"`), so SW and caching approach must be compatible.
- Agent Overlay gating already consumes tier/budget state from license service without graph schema changes.
- Icon assets in `public/icons/` are correctly sized and maskable-safe (to be verified in Phase 4).

### Resolved (from initial review)
- ~~SW generation needed from scratch~~ → Workbox SW already exists at `public/sw.js` with full caching strategy.
- ~~Icon assets unknown~~ → `icon-192.png` and `icon-512.png` confirmed present; Lighthouse audit pending.
- ~~Stripe catalog not created~~ → Both products live with 4 prices (see catalog table above).
- ~~`promotion_code` contract gap~~ → Addressed in Phase 2 as `api-contracts.ts` extension.

### Remaining Unknowns
- Final decision on promo UX: user-entered code field vs. invite-link with auto-applied promo (recommend user-entered for simplicity in beta).
- Exact Stripe webhook event coverage currently implemented in backend — **Phase 1 blocker audit will resolve this**.
- Whether `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is needed (depends on whether frontend uses Stripe.js directly or relies entirely on backend-generated checkout URLs).
- iOS-specific push notification limitations for beta cohort devices (iOS 16.4+ supports web push, but only for installed PWAs).

### Architectural risks
| Risk | Severity | Mitigation |
|---|---|---|
| Entitlement drift between Stripe and household tier state | High | Webhook idempotency, reconciliation job, admin correction endpoint |
| SW scope conflict between `sw.js` and `sw-push.js` | High | Merge into single SW registration before beta (Phase 4 task) |
| Service worker cache serving stale shell after rapid updates | Medium | Versioned cache keys + forced cache bust policy + rollback docs |
| Beta discount abuse/leak beyond friendlies | Medium | Promotion code caps, expiration, eligible price restrictions, dashboard alerts |
| Overcoupling payment checks into agent execution | Medium | Keep billing in service boundary; only consume entitlement state in overlay policy |
| Price ID misconfiguration (wrong price mapped to wrong tier) | Medium | Automated test that asserts price ID -> tier mapping matches Stripe catalog |

### Deployment considerations
- **Migrations:** if subscription state schema changes are needed, release additive DB changes before webhook logic changes.
- **Environment:** capture 4 price IDs + promotion code IDs as environment variables in backend; add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to frontend deployment if needed.
- **Rollout:** enable checkout CTA + promo flow under feature flag for beta cohort first.
- **Rollback:** disable promotion code and checkout feature flag immediately if defects appear; keep portal access active.
- **Operational checks:** monitor webhook delivery failures, payment failures, and install rate by device/browser.

---

## Estimated Effort Summary

- **Total estimate:** ~3.5-4.5 working days (cross-repo, including UAT and rollout hardening).
- **Critical path:** Phase 1 (audit) -> Phase 2 -> Phase 3 -> Phase 5.
- **Parallelizable:** PWA Phase 4 can run in parallel with backend Stripe hardening (Phase 3) after Phase 1 is complete.
- **Reduced from original:** Phase 4 scope dropped ~0.5 day due to existing Workbox SW; Phase 3 may shrink further pending Phase 1 webhook audit results.
