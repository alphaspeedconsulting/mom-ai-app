# Enhancement Plan: iOS PWA Install + Full Signup & Stripe Buy Flow

**Created:** 2026-03-27
**Status:** Ready for implementation
**Goal:** Get the app installable on an iPhone as a PWA, complete the full signup flow end-to-end, and process a test purchase through Stripe — all working on a real device.

---

## Current State Summary

| Area | Status | What works | What's missing |
|------|--------|-----------|----------------|
| **PWA manifest & SW** | 90% | manifest.json, sw.js (Workbox), sw-push.js, icons (192/512), install page with iOS instructions | iOS meta tags, apple-touch-icon, splash screens, SW registration code, badge icon |
| **Signup flow** | 95% | Email signup, Google OAuth (AuthForm + backend), consent modal, household wizard (4 steps), install page routing | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var needed for Google OAuth to work |
| **Stripe checkout** | 85% | `startCheckout()` wired, billing cycle toggle, promo code input, success/cancel banners, Stripe products live (4 price IDs) | Backend env vars (price IDs, keys, webhook secret), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var |
| **Backend connectivity** | Live | API client typed with 14 domains, `household-alpha-api.onrender.com` deployed | CORS must include `mom.alphaspeedai.com`, env vars must be set on Render |

---

## What You Need to Do (Owner Actions — Not Code Changes)

Before any code changes matter, these manual setup steps are required:

### Stripe Dashboard (5 min)
- [ ] Go to **Stripe Dashboard > Developers > API keys**
- [ ] Copy the **Publishable key** (`pk_test_...`) — needed for frontend
- [ ] Copy the **Secret key** (`sk_test_...`) — needed for backend
- [ ] Go to **Developers > Webhooks > Add endpoint**
  - URL: `https://household-alpha-api.onrender.com/api/stripe/webhook`
  - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copy the **Webhook signing secret** (`whsec_...`) — needed for backend

### Render Backend Environment (5 min)
Set these env vars on the Render backend service:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FAMILY_MONTHLY_PRICE=price_1TExlHDyHw9Ast4ZHZccnpwI
STRIPE_FAMILY_YEARLY_PRICE=price_1TExmgDyHw9Ast4Z3b1llgXG
STRIPE_PRO_MONTHLY_PRICE=price_1TExlfDyHw9Ast4ZiEUutlat
STRIPE_PRO_YEARLY_PRICE=price_1TExmFDyHw9Ast4ZGizaBQPa
CORS_ORIGINS=https://mom.alphaspeedai.com,http://localhost:3000
```

### GitHub Secrets (3 min)
Add these to `alphaspeedconsulting/mom-ai-app` repo **Settings > Secrets > Actions**:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Google Cloud Console (if Google OAuth desired for beta)
- [ ] Add `https://mom.alphaspeedai.com` as an authorized JavaScript origin
- [ ] Add `https://mom.alphaspeedai.com` as an authorized redirect URI

---

## Phase 1: iOS PWA Hardening (Code Changes)

**Goal:** Make "Add to Home Screen" on iPhone produce a native-feeling app experience.

**Estimated effort:** 0.5 day

### 1A) Add iOS meta tags to root layout

**File:** `mom-alpha/src/app/layout.tsx`

Add to `<head>`:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Alpha.Mom" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

**Why:** Without these, iOS Safari won't treat the PWA as a standalone app. The status bar will show default white, the home screen icon will be a screenshot instead of the app icon, and the title may truncate.

### 1B) Generate apple-touch-icon

**File:** `mom-alpha/public/icons/apple-touch-icon-180.png`

Generate a 180x180 PNG from the existing icon-512.png. No transparency — iOS requires an opaque background.

### 1C) Add badge icon for push notifications

**File:** `mom-alpha/public/icons/badge-72.png`

The `sw-push.js` references `/icons/badge-72.png` for notification badges but the file doesn't exist. Generate a 72x72 monochrome version of the app icon.

### 1D) Add service worker registration

The service worker (`sw.js`) exists in `public/` but there's no explicit registration call in the app. Add registration in the app layout or a client component:

**File:** New client component or added to `(app)/layout.tsx`

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

### 1E) Add safe area inset support for notch/Dynamic Island

**File:** `mom-alpha/src/app/layout.tsx`

Update viewport meta:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

**File:** `mom-alpha/src/styles/index.css` or `globals.css`

Add:
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Success criteria
- Open `mom.alphaspeedai.com` in Safari on iPhone
- "Add to Home Screen" produces app with proper icon (not screenshot)
- App opens in standalone mode (no Safari chrome)
- Content doesn't clip behind notch or Dynamic Island
- Status bar blends with app theme color

---

## Phase 2: Environment Variables & Build Pipeline

**Goal:** Wire Stripe publishable key and Google OAuth client ID into the production build.

**Estimated effort:** 0.25 day

### 2A) Add env vars to deploy workflow

**File:** `mom-alpha/.github/workflows/deploy.yml`

Add to the `env:` block:
```yaml
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${{ secrets.NEXT_PUBLIC_GOOGLE_CLIENT_ID }}
NEXT_PUBLIC_BETA_MODE: "true"
```

### 2B) Create `.env.example` for documentation

**File:** `mom-alpha/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
NEXT_PUBLIC_BETA_MODE=true
```

### Success criteria
- `npm run build` in CI uses all env vars from GitHub Secrets
- No hardcoded keys in source code
- `.env.example` documents all required vars for new developers

---

## Phase 3: Signup-to-Dashboard Flow Verification

**Goal:** Ensure the full path works: Landing > Signup > Consent > Install > Household Wizard > Dashboard.

**Estimated effort:** 0.5 day

### 3A) Verify email signup path

The flow is already implemented:
1. `/login?mode=signup` or `/signup` renders `AuthForm`
2. Email + password → `POST /api/auth/signup` → `AuthResponse`
3. Consent modal (3 checkboxes) → `POST /api/consent`
4. Redirect to `/install?next=/onboarding/household`
5. Install page (iOS instructions) → skip or install → `/onboarding/household`
6. 4-step wizard → `POST /api/household` → `/dashboard`

**Verification tasks:**
- [ ] Test email signup end-to-end against live backend
- [ ] Confirm consent modal renders and accepts all 3 docs
- [ ] Confirm install page detects iOS correctly
- [ ] Confirm household wizard creates household and redirects to dashboard
- [ ] Confirm dashboard renders with agent cards after signup

### 3B) Verify Google OAuth path (if client ID configured)

Same flow but starts with Google popup → `POST /api/auth/google` → same consent/install/wizard path.

**Verification tasks:**
- [ ] Google sign-in button renders (not error state)
- [ ] Credential callback posts to backend
- [ ] Returns JWT + user, enters consent flow

### 3C) Fix any dead-end states

Check for edge cases:
- User closes app mid-wizard → reopening should resume at correct step or restart wizard
- User navigates directly to `/dashboard` without household → should redirect to `/onboarding/household`
- Expired/invalid JWT → should redirect to `/login`

### Success criteria
- New user can go from landing page to dashboard in under 2 minutes
- All API calls succeed against live backend
- No console errors or broken redirects

---

## Phase 4: Stripe Test Purchase Flow

**Goal:** Trial user can upgrade to Family or Family Pro using Stripe test cards.

**Estimated effort:** 0.5 day

### 4A) Verify settings page checkout buttons

The settings page (`settings/page.tsx`) already has:
- Billing cycle toggle (monthly/yearly)
- `handleUpgrade(tier)` calling `startCheckout(tier, billingCycle, promoCode)`
- Success/cancel banners on return

**Verification tasks:**
- [ ] Trial user sees upgrade cards with correct prices ($7.99/$14.99 monthly, $69.99/$129.99 yearly)
- [ ] Clicking "Upgrade" calls `POST /api/stripe/checkout` with correct tier + billing_cycle
- [ ] Backend returns `checkout_url` → browser redirects to Stripe hosted checkout
- [ ] Test card `4242 4242 4242 4242` completes checkout
- [ ] Redirect back to `/settings?checkout=success` shows success banner
- [ ] User's `tier` updates from `trial` to `family` or `family_pro`

### 4B) Verify Stripe webhook round-trip

After checkout completes:
- [ ] Stripe fires `customer.subscription.created` webhook to backend
- [ ] Backend updates household tier in database
- [ ] Frontend reflects new tier on settings page reload

### 4C) Test billing portal

- [ ] "Manage" button on settings (for paid users) calls `GET /api/stripe/portal`
- [ ] Redirects to Stripe billing portal
- [ ] User can view/cancel subscription
- [ ] Return from portal lands back on settings page

### 4D) Test promo code (optional, if beta coupon created)

- [ ] `NEXT_PUBLIC_BETA_MODE=true` shows promo code input
- [ ] Entering valid promo code (e.g., `ALPHA50`) passes to checkout
- [ ] Stripe checkout shows discounted price

### Success criteria
- Complete purchase with test card `4242 4242 4242 4242`
- Tier updates correctly after webhook
- Billing portal accessible for managing subscription

---

## Phase 5: End-to-End Device Testing

**Goal:** Walk through the entire flow on a real iPhone.

**Estimated effort:** 0.5 day

### 5A) Full iPhone walkthrough

1. Open `mom.alphaspeedai.com` in Safari
2. Tap Share > "Add to Home Screen" > Add
3. Open the app from home screen (standalone mode)
4. Tap "Start Free Trial" on landing page
5. Sign up with email (or Google)
6. Accept consent (3 checkboxes)
7. See install page (should detect "already installed" or show iOS instructions)
8. Complete household wizard (name, add family member, skip invite)
9. Land on dashboard with agent cards
10. Go to Settings > tap "Upgrade" on Family plan
11. Complete Stripe checkout with `4242 4242 4242 4242`
12. Return to settings — see "Subscription activated!" banner
13. Verify tier shows "Family" (not "Free Trial")

### 5B) Offline behavior check

- [ ] Put phone in airplane mode
- [ ] App shell still loads from cache
- [ ] Offline banner appears
- [ ] Turn off airplane mode → app reconnects

### 5C) Push notification check (optional)

- [ ] Settings > enable notifications > allow prompt
- [ ] Test push from backend (if VAPID configured)
- [ ] Notification appears on device

### Success criteria
- All 13 steps in 5A complete without errors on iPhone
- App feels native (no browser chrome, proper icon, no notch clipping)

---

## Dependency Graph

```
Owner Actions (Stripe Dashboard, Render env, GitHub Secrets)
    │
    ├── Phase 1: iOS PWA Hardening (no backend dependency)
    │
    ├── Phase 2: Build Pipeline Env Vars
    │       │
    │       ├── Phase 3: Signup Flow Verification
    │       │       │
    │       │       └── Phase 4: Stripe Test Purchase
    │       │               │
    │       │               └── Phase 5: Device Testing
    │       │
    │       └── (merge & deploy to GitHub Pages)
    │
    └── Phase 1 can run in parallel with Phase 2
```

**Critical path:** Owner Actions → Phase 2 → deploy → Phase 3 → Phase 4 → Phase 5

**Parallelizable:** Phase 1 (iOS hardening) has zero backend dependency and can run immediately.

---

## Files Modified (Code Changes Only)

| File | Change | Phase |
|------|--------|-------|
| `src/app/layout.tsx` | Add iOS meta tags, apple-touch-icon link, viewport-fit=cover | 1A, 1E |
| `public/icons/apple-touch-icon-180.png` | New file — 180x180 opaque icon | 1B |
| `public/icons/badge-72.png` | New file — 72x72 notification badge | 1C |
| `src/app/(app)/layout.tsx` or new client component | Add SW registration `useEffect` | 1D |
| `src/styles/globals.css` or `index.css` | Add safe-area-inset padding | 1E |
| `.github/workflows/deploy.yml` | Add Stripe + Google OAuth env vars | 2A |
| `.env.example` | New file — document all env vars | 2B |

**Total new files:** 3 (icon, badge, .env.example)
**Total modified files:** 4 (layout.tsx, app layout, globals.css, deploy.yml)

---

## Test Cards Reference

| Scenario | Card Number | Exp / CVC |
|----------|-------------|-----------|
| Successful payment | `4242 4242 4242 4242` | Any future / any 3 digits |
| Payment declined | `4000 0000 0000 0002` | Any future / any 3 digits |
| 3D Secure required | `4000 0025 0000 3155` | Any future / any 3 digits |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend not responding on Render | High | Check Render dashboard; backend may be sleeping on free tier — upgrade to paid if needed |
| CORS blocking frontend requests | High | Ensure `CORS_ORIGINS` env var on backend includes `https://mom.alphaspeedai.com` |
| Stripe webhook not reaching backend | Medium | Test with Stripe CLI locally first; check webhook delivery logs in Stripe Dashboard |
| Google OAuth fails (missing client ID) | Low | Email signup works independently; Google OAuth is optional for beta |
| SW cache serves stale version after deploy | Medium | sw.js uses `skipWaiting()` — new deploy should activate immediately |

---

## Estimated Total Effort

| Phase | Effort | Blocker? |
|-------|--------|----------|
| Owner Actions (manual setup) | 15 min | Yes — must be done first |
| Phase 1: iOS PWA Hardening | 0.5 day | No |
| Phase 2: Build Pipeline | 0.25 day | Yes — env vars needed for Phases 3-4 |
| Phase 3: Signup Verification | 0.5 day | Depends on backend being live |
| Phase 4: Stripe Test Purchase | 0.5 day | Depends on Stripe env vars |
| Phase 5: Device Testing | 0.5 day | Depends on all above |
| **Total** | **~2.25 days** | |
