# Stripe Setup & PWA Local Testing Guide

**For:** Mom.alpha beta launch
**Prerequisites:** Stripe account access, Node.js 18+, Chrome/Safari

---

## Part 1: Stripe Setup

### 1.1 Collect Your Price IDs

Your products are already live. You need the **Price IDs** (not Product IDs) for all four prices.

1. Go to **Stripe Dashboard → Products**
2. Click **AlphaMom - Family** (`prod_UDOYNk9QTjdxAC`)
3. Copy both price IDs:

| Price | Copy the "Price ID" (starts with `price_`) |
|---|---|
| $7.99 / month | `price_1TExlHDyHw9Ast4ZHZccnpwI` |
| $69.99 / year | `price_1TExmgDyHw9Ast4Z3b1llgXG` |

4. Click **AlphaMom-Family Pro** (`prod_UDOYhKPo0sqInn`)
5. Copy both price IDs:

| Price | Copy the "Price ID" (starts with `price_`) |
|---|---|
| $14.99 / month | `price_1TExlfDyHw9Ast4ZiEUutlat` |
| $129.99 / year | `price_1TExmFDyHw9Ast4ZGizaBQPa` |

6. Open the backend `.env` file in the Cowork repo and fill in:

```env
STRIPE_FAMILY_MONTHLY_PRICE=price_1TExlHDyHw9Ast4ZHZccnpwI
STRIPE_FAMILY_YEARLY_PRICE=price_1TExmgDyHw9Ast4Z3b1llgXG
STRIPE_PRO_MONTHLY_PRICE=price_1TExlfDyHw9Ast4ZiEUutlat
STRIPE_PRO_YEARLY_PRICE=price_1TExmFDyHw9Ast4ZGizaBQPa
```

---

### 1.2 Get Your API Keys

1. Go to **Stripe Dashboard → Developers → API keys**
2. You'll need two keys:

| Key | Where it goes |
|---|---|
| **Publishable key** (`pk_test_...` or `pk_live_...`) | Frontend — `mom-alpha/.env.local` |
| **Secret key** (`sk_test_...` or `sk_live_...`) | Backend — Cowork `.env` |

**Frontend** (`mom-alpha/.env.local`):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
```

**Backend** (Cowork `.env`):
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
```

> Use `pk_test_` / `sk_test_` keys for development and beta. Switch to live keys only for production launch.

---

### 1.3 Set Up the Webhook

The webhook keeps subscription state in sync after checkout completes, payment fails, or a plan is cancelled.

#### Local development (using Stripe CLI):

1. Install the Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Start the backend (from Cowork repo): `./scripts/dev.sh`
4. In a separate terminal, forward events to your local backend:

```bash
stripe listen --forward-to http://localhost:8000/api/stripe/webhook
```

5. Copy the **webhook signing secret** it prints (`whsec_...`) into the backend `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

#### Production (Render):

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://api.mom.alphaspeedai.com/api/stripe/webhook`
4. Select these events to listen for:

```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

5. After saving, click **Reveal** on the signing secret and add it to Render's environment variables as `STRIPE_WEBHOOK_SECRET`

---

### 1.4 Test the Checkout Flow

Before creating beta codes, verify checkout works end-to-end using Stripe test cards.

1. Run the app locally (see Part 2)
2. Sign in as a trial user and click an upgrade button
3. Use Stripe's test card at checkout:

| Scenario | Card number | Exp / CVC |
|---|---|---|
| Successful payment | `4242 4242 4242 4242` | Any future date / any 3 digits |
| Payment declined | `4000 0000 0000 0002` | Any future date / any 3 digits |
| Payment requires 3D Secure | `4000 0025 0000 3155` | Any future date / any 3 digits |

4. After successful checkout, confirm you land back on `/settings?checkout=success` and see the "Subscription activated!" banner.
5. In Stripe Dashboard → **Events**, confirm `customer.subscription.created` fired and the webhook delivered with status 200.

---

### 1.5 Create Beta Promotion Codes

Once checkout is working, create invite codes for your beta testers.

1. Go to **Stripe Dashboard → Product catalog → Coupons**
2. Click **Create coupon**:

| Field | Recommended value |
|---|---|
| Name | `Beta Invite - 50% off first 3 months` |
| Type | Percentage discount |
| Percentage off | 50% (or your choice) |
| Duration | 3 months |
| Redemption limits | Check "Limit the total number of times this coupon can be redeemed" → set to `25` |

3. Save the coupon, then go to **Promotion codes** tab and click **Add promotion code**:

| Field | Value |
|---|---|
| Code | `ALPHA50` (or your choice — this is what testers enter) |
| Coupon | Select the coupon you just created |
| Expiry | Set to ~60 days out |
| Restrict to specific products | Select both AlphaMom prices |

4. Enable beta promo code input in the frontend:

```env
# mom-alpha/.env.local
NEXT_PUBLIC_BETA_MODE=true
```

---

## Part 2: PWA Local Testing

> **Important:** Service workers require either **HTTPS** or **localhost**. The dev server (`npm run dev`) serves correctly on `localhost:3000`, but SW caching only works properly with a production build.

### 2.1 Dev Mode (fastest — good for UI work)

```bash
cd mom-alpha
npm install
npm run dev
# → http://localhost:3000
```

The app runs and the SW is technically served at `/sw.js`, but the precache list won't match dev build assets. Good for testing UI, billing flow, and manifest. Not good for testing offline behavior.

---

### 2.2 Production Build (required for full PWA testing)

The static output goes to `mom-alpha/out/`. You need to serve it from a local server.

```bash
cd mom-alpha

# Build the static export
npm run build
# → generates out/ folder

# Serve it on port 3000 (install once: npm install -g serve)
npx serve out -p 3000 -s
# → http://localhost:3000
```

Now the SW, manifest, and precache all work correctly at `localhost:3000`.

---

### 2.3 Verify PWA Installability in Chrome

1. Open `http://localhost:3000` in **Chrome**
2. Open DevTools (`F12` or `Cmd+Option+I`)
3. Go to **Application tab**

Check the following:

| Check | Where to look | Expected |
|---|---|---|
| Manifest loaded | Application → Manifest | Name, icons, display: standalone shown |
| Service worker registered | Application → Service Workers | Status: "Activated and running" |
| Push handler loaded | Application → Service Workers | Click the SW URL — should include `sw-push.js` reference |
| Precache populated | Application → Cache Storage | "workbox-precache" cache with app shell files |

4. Go to **Lighthouse tab** → check "Navigation" mode
5. Run audit → check **PWA** score
6. Lighthouse will flag specific issues if icons or manifest have problems

---

### 2.4 Test Install on Android (Chrome)

**Option A — Real device via USB:**

1. Enable **Developer Options** and **USB Debugging** on your Android phone
2. Connect via USB
3. On your phone, open Chrome and navigate to `http://YOUR_LOCAL_IP:3000`
   - Find your local IP: `ipconfig getifaddr en0` on Mac
   - Your phone and Mac must be on the same WiFi
4. You should see the install banner appear (on second visit, per `use-install-prompt.ts`)
5. Or tap the three-dot menu → **Add to Home screen**

**Option B — Remote debugging:**

```bash
# Forward localhost:3000 from your phone to your Mac
# (Enables your phone's Chrome to reach Mac's localhost)
adb reverse tcp:3000 tcp:3000
```

Then navigate to `http://localhost:3000` on the phone's Chrome.

**Option C — ngrok tunnel (no USB needed):**

```bash
# Install ngrok: brew install ngrok
ngrok http 3000
# → gives you https://xxxx.ngrok.io — works on any device, any network
```

Use the `https://` ngrok URL on your phone. PWA install will work since it's HTTPS.

---

### 2.5 Test Install on iOS (Safari)

iOS doesn't support the native install prompt — users must do it manually.

1. Open Safari on your iPhone
2. Navigate to `http://YOUR_LOCAL_IP:3000` (or the ngrok URL)
3. Tap the **Share button** (box with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **Add**

**What to verify after installing:**
- App opens in standalone mode (no Safari URL bar)
- Tap the home screen icon → app opens without browser chrome
- Check that `window.matchMedia("(display-mode: standalone)").matches` returns `true` (visible in browser console via remote debugging)

**iOS push notifications note:** Web push only works on iOS 16.4+ AND only after the app is installed to the home screen. Don't expect push to work in Safari browser — test it from the installed PWA.

---

### 2.6 Test Offline Behavior

1. Open the installed PWA (or `localhost:3000` in Chrome)
2. Navigate around a few pages to populate the cache
3. In Chrome DevTools → **Application → Service Workers** → check **"Offline"**
4. Refresh — the app shell should still load from cache
5. The offline banner should appear within ~1 second (per `pwa.spec.ts`)
6. Uncheck "Offline" to go back online

---

### 2.7 Run the E2E PWA Tests

```bash
cd mom-alpha

# Install Playwright browsers once
npx playwright install chromium

# Run PWA-specific tests (against dev server on :3000)
npx playwright test tests/e2e/pwa.spec.ts --project="Mobile Chrome"

# Run all E2E tests
npx playwright test

# Open the HTML report
npx playwright show-report
```

> The Playwright config (`tests/playwright.config.ts`) uses `npm run dev` as the web server, so you don't need to start the dev server separately before running tests.

---

## Quick Reference Checklist

### Stripe
- [ ] Price IDs for all 4 plans collected and added to backend `.env`
- [ ] Publishable key added to `mom-alpha/.env.local`
- [ ] Secret key added to backend `.env`
- [ ] Stripe CLI running locally (`stripe listen --forward-to ...`)
- [ ] Webhook secret added to backend `.env`
- [ ] Checkout tested end-to-end with test card `4242 4242 4242 4242`
- [ ] Webhook delivery confirmed (200 response in Stripe Dashboard → Events)
- [ ] Beta coupon created with redemption cap and expiry
- [ ] Promotion code created (e.g., `ALPHA50`) and restricted to eligible prices
- [ ] `NEXT_PUBLIC_BETA_MODE=true` set to show promo input in app

### PWA (local)
- [ ] `npm run build` completes without errors
- [ ] `npx serve out -p 3000 -s` serves the app
- [ ] Chrome DevTools → Application shows manifest + SW active
- [ ] Lighthouse PWA audit runs (note score + any failures)
- [ ] Installed to Android home screen via Chrome
- [ ] Installed to iOS home screen via Safari "Add to Home Screen"
- [ ] Offline mode shows offline banner without crashing
- [ ] `npx playwright test tests/e2e/pwa.spec.ts` passes
