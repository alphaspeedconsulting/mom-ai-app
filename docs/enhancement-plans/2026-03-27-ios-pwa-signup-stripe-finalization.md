# Enhancement Plan: iOS PWA Install + Full Signup & Stripe Buy Flow

**Created:** 2026-03-27
**Updated:** 2026-03-27
**Status:** Ready for implementation
**Goal:** Complete the full user journey — sign up on iPhone, get prompted to install the PWA, set up household, then upgrade via Stripe test checkout — all working end-to-end on a real device.

---

## User Journey (How It's Supposed to Work)

The marketing site and the app are the **same Next.js PWA** on a single domain. The user discovers the app, signs up, and *then* gets prompted to install it. The install happens post-auth so the PWA opens directly into the authenticated app — not back to the marketing page.

```
mom.alphaspeedai.com/                  ← Marketing landing page (public)
    ↓ "Start Free Trial" button
/login?mode=signup                     ← Email or Google signup (public)
    ↓ auth success → JWT stored
Consent Modal                          ← Accept terms, privacy, AI disclosure
    ↓ all 3 accepted
/install?next=/onboarding/household    ← PWA install prompt (iOS: "Add to Home Screen")
    ↓ install or skip
/onboarding/household                  ← 4-step household wizard (auth-protected)
    ↓ household created
/dashboard                             ← The app — agent cards, nav bar (auth-protected)
    ↓ go to Settings
/settings                              ← Upgrade to Family/Pro via Stripe checkout
    ↓ Stripe test card
/settings?checkout=success             ← Subscription activated
```

**Key insight:** The `/install` page appears *after* signup, so when the user adds the PWA to their home screen, it opens with an authenticated session (JWT in localStorage). The app shell, bottom nav, and offline support only render inside the `(app)/` route group — the marketing landing page is a separate layout.

---

## Current State Summary

| Area | Status | What works | What's blocking |
|------|--------|-----------|-----------------|
| **Marketing → Signup** | 95% | Landing page CTAs → `/login?mode=signup`, AuthForm with email + Google OAuth, consent modal | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var needed for Google button to work |
| **Install prompt** | 90% | `/install` page detects iOS/Android, shows platform-specific instructions, routes to next step | Missing iOS meta tags so "Add to Home Screen" produces poor icon + no standalone mode |
| **Household onboarding** | 100% | 4-step wizard (name → members → invite → confirm), `POST /api/household` | — |
| **Dashboard & app** | 100% | Auth guards, agent cards, bottom nav, all 30+ pages | Backend must be live |
| **Stripe checkout** | 85% | `startCheckout()` wired, billing cycle toggle, promo code input, success/cancel banners, Stripe products live | Backend env vars (price IDs, keys, webhook secret) not set |
| **PWA manifest & SW** | 85% | manifest.json, sw.js (Workbox), sw-push.js, icons 192/512 | Missing: iOS meta tags, apple-touch-icon, SW registration call, badge icon, safe area insets |
| **Backend** | Deployed | `household-alpha-api.onrender.com`, 14 API domains typed | CORS + Stripe + VAPID env vars needed |

---

## Owner Actions (Manual Setup — Must Do First)

These are things only you can do in external dashboards. No code changes needed.

### Stripe Dashboard (5 min)
- [ ] **Developers > API keys** — copy Publishable key (`pk_test_...`) and Secret key (`sk_test_...`)
- [ ] **Developers > Webhooks > Add endpoint:**
  - URL: `https://household-alpha-api.onrender.com/api/stripe/webhook`
  - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copy the **Webhook signing secret** (`whsec_...`)
- [ ] *(Optional)* Create a beta coupon + promotion code (e.g., `ALPHA50`, 50% off 3 months, limited to 25 redemptions)

### Render Backend Environment (5 min)
Add these env vars to the backend service on Render:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FAMILY_MONTHLY_PRICE=price_1TExlHDyHw9Ast4ZHZccnpwI
STRIPE_FAMILY_YEARLY_PRICE=price_1TExmgDyHw9Ast4Z3b1llgXG
STRIPE_PRO_MONTHLY_PRICE=price_1TExlfDyHw9Ast4ZiEUutlat
STRIPE_PRO_YEARLY_PRICE=price_1TExmFDyHw9Ast4ZGizaBQPa
CORS_ORIGINS=https://mom.alphaspeedai.com,http://localhost:3000
```

### GitHub Repo Secrets (3 min)
Add to `alphaspeedconsulting/mom-ai-app` > **Settings > Secrets > Actions**:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com   (optional — email signup works without it)
```

### Google Cloud Console (only if Google OAuth desired)
- [ ] Add `https://mom.alphaspeedai.com` as authorized JavaScript origin
- [ ] Add `https://mom.alphaspeedai.com` as authorized redirect URI

---

## Phase 1: iOS PWA Install Experience

**Goal:** When a user taps "Add to Home Screen" from the `/install` page on Safari, the installed app looks and behaves like a native app — proper icon, standalone mode, no notch clipping.

**Effort:** 0.5 day
**Dependencies:** None — can start immediately

### 1A) Add iOS meta tags to root layout

**File:** `mom-alpha/src/app/layout.tsx`

The root `<head>` currently has `<link rel="manifest">` and Material Symbols, but no Apple-specific tags. Add:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Alpha.Mom" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

**Why these matter:**
- `apple-mobile-web-app-capable` — without this, iOS opens the PWA in Safari with full browser chrome instead of standalone
- `apple-mobile-web-app-status-bar-style` — `black-translucent` lets the app content extend behind the status bar, blending with the teal brand color
- `apple-mobile-web-app-title` — controls the name shown under the icon on the home screen
- `apple-touch-icon` — iOS uses this instead of manifest icons; without it, iOS screenshots the page as the icon

### 1B) Generate apple-touch-icon (180x180)

**File:** `mom-alpha/public/icons/apple-touch-icon-180.png`

Resize from `icon-512.png`. iOS requires an opaque background (no transparency). The icon should be 180x180px with the Alpha.Mom logo on a solid `#32695a` (brand teal) or `#f3fbff` (background) fill.

### 1C) Add missing badge icon for notifications

**File:** `mom-alpha/public/icons/badge-72.png`

`sw-push.js` references `/icons/badge-72.png` for notification badges but the file doesn't exist. Create a 72x72 monochrome version of the app icon.

### 1D) Add explicit service worker registration

The service worker (`public/sw.js`) exists but nothing in the app registers it. The push notification hook uses `navigator.serviceWorker.ready` (which assumes it's already registered).

**File:** `mom-alpha/src/app/(app)/layout.tsx` (the app shell layout — where SW matters)

Add a `useEffect` in the client component that wraps the layout:

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

**Why in `(app)/layout.tsx` not root:** The SW should cache the app shell and authenticated routes, not the marketing landing page. Registering in the app shell layout means it activates once a user enters the app flow.

### 1E) Safe area insets for notch / Dynamic Island

**File:** `mom-alpha/src/app/layout.tsx` — update viewport export:

```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#32695a",
  viewportFit: "cover",  // ← add this
};
```

**File:** `mom-alpha/src/styles/globals.css` — add safe area padding:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Success criteria
- User on `/install` page taps "Add to Home Screen" → home screen icon is the Alpha.Mom logo (not a page screenshot)
- Opening the PWA from home screen → standalone mode (no Safari URL bar)
- Content is not clipped behind notch or Dynamic Island
- Status bar area blends with the app background

---

## Phase 2: Build Pipeline & Environment Wiring

**Goal:** Wire Stripe and Google OAuth env vars into the GitHub Pages deploy so the production build has everything it needs.

**Effort:** 0.25 day
**Dependencies:** GitHub Secrets set (Owner Action)

### 2A) Add env vars to deploy workflow

**File:** `mom-alpha/.github/workflows/deploy.yml`

Add to the `env:` block alongside the existing `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`:

```yaml
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${{ secrets.NEXT_PUBLIC_GOOGLE_CLIENT_ID }}
NEXT_PUBLIC_BETA_MODE: "true"
```

### 2B) Create `.env.example`

**File:** `mom-alpha/.env.example`

```env
# Backend API (local dev uses localhost, prod uses Render)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe (publishable key only — secret key is backend-only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google OAuth (optional — email signup works without it)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Web Push (optional — generated by pywebpush)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=

# Beta mode (shows promo code input on settings page)
NEXT_PUBLIC_BETA_MODE=true
```

### Success criteria
- Push to `main` → GitHub Actions build picks up all secrets → deploys to GitHub Pages
- `.env.example` exists for local dev setup

---

## Phase 3: Signup → Install → Onboarding Flow

**Goal:** Verify the complete new-user journey works end-to-end against the live backend. Fix any broken transitions.

**Effort:** 0.5 day
**Dependencies:** Phase 2 deployed, backend live on Render with CORS configured

### 3A) End-to-end email signup

Walk through and verify every step:

| Step | Route | What happens | API call |
|------|-------|-------------|----------|
| 1 | `/` | Tap "Start Free Trial" | — |
| 2 | `/login?mode=signup` | Enter name, email, password → submit | `POST /api/auth/signup` |
| 3 | Same page (modal) | Check all 3 consent boxes → accept | `POST /api/consent` |
| 4 | `/install?next=/onboarding/household` | See iOS install instructions | — |
| 5 | Same page | Tap "Continue" (or install first) | — |
| 6 | `/onboarding/household` | Step 1: name household | — |
| 7 | Same page | Step 2: add family members | `POST /api/household` |
| 8 | Same page | Step 3: skip co-parent invite | — |
| 9 | Same page | Step 4: confirmation → "Let's go" | — |
| 10 | `/dashboard` | See agent cards, bottom nav | `GET /api/agents` |

### 3B) Google OAuth signup (if client ID configured)

Same flow but step 2 is: tap "Continue with Google" → Google popup → `POST /api/auth/google`.

### 3C) Edge case fixes

- **Direct `/dashboard` without household:** Dashboard checks for token → if no `household_id`, should redirect to `/onboarding/household`
- **Expired JWT:** 401 response → `logout()` → redirect to `/login`
- **Mid-wizard abandonment:** Reopening app → if `isAuthenticated` but no `household_id` → route back to wizard

### 3D) Install page "already installed" detection

The install page uses `window.matchMedia("(display-mode: standalone)")` to detect if the user already installed the PWA. If so, it auto-skips to the next route. Verify this works on iOS Safari after "Add to Home Screen".

### Success criteria
- New user goes from landing page to dashboard in under 2 minutes
- All API calls return 200 (no CORS errors, no 401s, no 500s)
- No dead-end states — every path leads somewhere

---

## Phase 4: Stripe Test Purchase

**Goal:** A trial user on the dashboard can upgrade to Family or Family Pro using a Stripe test card.

**Effort:** 0.5 day
**Dependencies:** Phase 3 complete (user is on dashboard), Render env vars set (Stripe keys + price IDs)

### 4A) Upgrade flow

| Step | Action | Expected |
|------|--------|----------|
| 1 | Go to `/settings` | See "Free Trial" badge, two upgrade cards (Family $7.99/mo, Pro $14.99/mo) |
| 2 | Toggle to "Yearly" | Prices update to $69.99/yr and $129.99/yr |
| 3 | Tap "Upgrade" on Family | `POST /api/stripe/checkout` with `{ tier: "family", billing_cycle: "monthly" }` |
| 4 | Redirected to Stripe Checkout | Stripe hosted page shows correct price |
| 5 | Enter test card `4242 4242 4242 4242` | Payment succeeds |
| 6 | Redirected to `/settings?checkout=success` | "Subscription activated!" banner shown |
| 7 | Reload settings | Tier shows "Family" (not "Free Trial"), "Manage" button visible |

### 4B) Webhook verification

After checkout:
- [ ] Check **Stripe Dashboard > Events** — `customer.subscription.created` fired
- [ ] Check webhook delivery — 200 response from backend
- [ ] Backend updated household `tier` from `trial` to `family`
- [ ] Frontend reflects new tier on page reload

### 4C) Billing portal

- [ ] Paid user taps "Manage" → `GET /api/stripe/portal` → redirects to Stripe billing portal
- [ ] Can view subscription details
- [ ] Can cancel subscription
- [ ] Return from portal lands on `/settings`

### 4D) Beta promo code (optional)

If `NEXT_PUBLIC_BETA_MODE=true` and a promotion code was created in Stripe:
- [ ] Promo input visible on settings page
- [ ] Enter code (e.g., `ALPHA50`) before upgrading
- [ ] Stripe checkout shows discounted price

### Success criteria
- Test card purchase completes → tier updates → billing portal accessible
- Full checkout round-trip in under 1 minute

---

## Phase 5: Full iPhone Device Test

**Goal:** Walk through the entire journey on a real iPhone — from Safari to installed PWA to paid subscription.

**Effort:** 0.5 day
**Dependencies:** All previous phases complete and deployed

### 5A) Complete iPhone walkthrough (13 steps)

1. Open `mom.alphaspeedai.com` in **Safari** on iPhone
2. Tap **"Start Free Trial"** on the landing page
3. Sign up with email + password (or Google)
4. Accept all 3 consent checkboxes → tap Accept
5. See the **install page** with iOS-specific instructions
6. Tap **Share** (box-with-arrow) → **"Add to Home Screen"** → **Add**
7. Tap **"Continue"** on the install page (or open from home screen)
8. Complete household wizard: name, add a family member, skip invite, confirm
9. Land on **dashboard** with agent cards and bottom nav
10. Navigate to **Settings**
11. Tap **"Upgrade"** on the Family plan
12. Complete Stripe checkout with `4242 4242 4242 4242`
13. Return to settings — see **"Subscription activated!"** and tier = Family

### 5B) Standalone mode verification

- [ ] Close Safari completely
- [ ] Open the app from the home screen icon
- [ ] App opens in **standalone mode** (no Safari URL bar)
- [ ] Auth session persists (JWT in localStorage) — lands on dashboard, not login
- [ ] Bottom nav renders correctly (not clipped by home indicator)

### 5C) Offline behavior

- [ ] Enable airplane mode
- [ ] App shell still loads from SW cache
- [ ] Offline banner appears: "You're offline — some features may be limited"
- [ ] Disable airplane mode → banner disappears, app reconnects

### 5D) Push notifications (optional, requires VAPID)

- [ ] Settings > enable notifications > allow permission prompt
- [ ] Trigger test push from backend
- [ ] Notification appears on lock screen

### Success criteria
- All 13 steps in 5A complete without errors
- App icon on home screen is Alpha.Mom logo (not screenshot)
- Standalone mode — no browser chrome
- Auth persists across app open/close
- Content not clipped by notch or Dynamic Island

---

## Dependency Graph

```
Owner Actions (Stripe, Render, GitHub Secrets)
    │
    ├──→ Phase 1: iOS PWA Hardening     ──┐
    │    (no backend dependency)           │
    │                                      ├──→ Deploy to GitHub Pages
    └──→ Phase 2: Build Pipeline Env Vars ─┘           │
                                                       ↓
                                              Phase 3: Signup Flow
                                                       │
                                                       ↓
                                              Phase 4: Stripe Purchase
                                                       │
                                                       ↓
                                              Phase 5: iPhone Device Test
```

**Phase 1 and Phase 2 are parallelizable** — both feed into a single deploy.
**Phases 3 → 4 → 5 are sequential** — each depends on the previous.

---

## Files Changed (Code Only)

| File | Change | Phase |
|------|--------|-------|
| `src/app/layout.tsx` | Add iOS meta tags, apple-touch-icon link, `viewportFit: "cover"` | 1A, 1E |
| `public/icons/apple-touch-icon-180.png` | New — 180x180 opaque app icon for iOS | 1B |
| `public/icons/badge-72.png` | New — 72x72 notification badge icon | 1C |
| `src/app/(app)/layout.tsx` | Add `navigator.serviceWorker.register("/sw.js")` in useEffect | 1D |
| `src/styles/globals.css` | Add `env(safe-area-inset-*)` padding on body | 1E |
| `.github/workflows/deploy.yml` | Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `GOOGLE_CLIENT_ID`, `BETA_MODE` | 2A |
| `.env.example` | New — document all required env vars | 2B |

**Total new files:** 3 (apple-touch-icon, badge icon, .env.example)
**Total modified files:** 4 (root layout, app layout, globals.css, deploy.yml)

---

## Stripe Test Cards Reference

| Scenario | Card Number | Exp / CVC |
|----------|-------------|-----------|
| Successful payment | `4242 4242 4242 4242` | Any future date / any 3 digits |
| Payment declined | `4000 0000 0000 0002` | Any future date / any 3 digits |
| 3D Secure required | `4000 0025 0000 3155` | Any future date / any 3 digits |

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Render backend asleep (free tier cold start) | High | Upgrade to paid instance, or hit any endpoint to wake it before testing |
| CORS blocks frontend → backend requests | High | Verify `CORS_ORIGINS` includes `https://mom.alphaspeedai.com` on Render |
| Stripe webhook doesn't reach backend | Medium | Check delivery logs in Stripe Dashboard > Webhooks; verify URL is correct |
| iOS Safari doesn't trigger `beforeinstallprompt` | Expected | This is normal — iOS has no native install prompt. The `/install` page shows manual "Add to Home Screen" instructions instead |
| Google OAuth button errors (no client ID) | Low | Email signup is the primary path; Google OAuth is optional for beta |
| SW cache serves old version after deploy | Medium | `sw.js` uses `skipWaiting()` — refresh should pick up new version |

---

## Estimated Effort

| Phase | Effort | Can start |
|-------|--------|-----------|
| Owner Actions (manual setup) | 15 min | Now |
| Phase 1: iOS PWA Hardening | 0.5 day | Now (parallel with owner actions) |
| Phase 2: Build Pipeline | 0.25 day | After GitHub Secrets are set |
| Phase 3: Signup Flow Verification | 0.5 day | After deploy + backend live |
| Phase 4: Stripe Test Purchase | 0.5 day | After Phase 3 |
| Phase 5: iPhone Device Test | 0.5 day | After Phase 4 |
| **Total** | **~2.25 days** | |
