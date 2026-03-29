# Pending Remote Actions — 2026-03-28

Run these from the machine that has the correct GitHub credentials for `alphaspeedconsulting`.

---

## Context

A commit (`177fa62`) has already been made locally on the `main` branch but could not be pushed. The push was rejected because the stored GitHub OAuth token is missing the **`workflow` scope** — required whenever a push touches files inside `.github/workflows/`.

---

## Step 1 — Pull the commit onto the other machine

```bash
cd "/path/to/mom-ai-app"   # adjust to wherever the repo lives on that machine
git pull origin main
```

This will bring down commit `177fa62` which includes:
- `deploy-pages.yml` — env vars injected at build time (the core fix)
- UI/UX component updates (AuthForm, AgentChatClient, BottomNav, Footer, dashboard, settings, mom-alpha.css)
- `use-focus-trap.ts` hook
- E2E test reports and enhancement plan docs

---

## Step 2 — Fix the GitHub auth scope (pick one method)

### Option A — GitHub CLI (recommended)

```bash
gh auth refresh -s workflow
```

Follow the browser prompt. This adds the `workflow` scope to your existing token without revoking anything else.

Verify it worked:

```bash
gh auth status
```

You should see `workflow` listed under Token scopes.

### Option B — Personal Access Token (classic)

1. Go to: **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Find the token used for this machine.
3. Click **Edit** and check the **`workflow`** scope.
4. Click **Update token** and copy the new token value.
5. Update the stored credential:

```bash
git credential reject <<EOF
protocol=https
host=github.com
EOF
```

Then run any git push — you'll be prompted for username + the new token.

---

## Step 3 — Push

```bash
git push origin main
```

Expected output:
```
To https://github.com/alphaspeedconsulting/mom-ai-app.git
   c0158de..177fa62  main -> main
```

---

## Step 4 — Add GitHub Actions secrets (if not already set)

The new `deploy-pages.yml` references three secrets that must exist in the repo for the production build to work. Check and add if missing:

**GitHub → alphaspeedconsulting/mom-ai-app → Settings → Secrets and variables → Actions**

| Secret name | Value |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID (`xxx.apps.googleusercontent.com`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Your VAPID public key (from pywebpush setup) |

A missing secret causes the var to be an empty string in the build — it won't break the build, but the feature will silently not work.

---

## Step 5 — Verify the deploy

After pushing, GitHub Actions will trigger automatically. Monitor at:

```
https://github.com/alphaspeedconsulting/mom-ai-app/actions
```

The `Deploy to GitHub Pages` workflow should complete green. Once deployed, open the live site and confirm in the browser Network tab that API requests go to `https://household-alpha-api.onrender.com`.

---

## Summary of what's already done (no action needed)

- [x] Root cause identified: missing `env:` block in build step
- [x] Fix applied to `deploy-pages.yml`
- [x] All UI/UX changes committed
- [ ] **Push to remote** — needs `workflow` scope (steps above)
- [ ] **Secrets verified** in GitHub Actions settings
