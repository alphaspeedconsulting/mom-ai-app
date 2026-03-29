"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useHouseholdStore } from "@/stores/household-store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import * as api from "@/lib/api-client";
import Link from "next/link";

const IS_BETA = process.env.NEXT_PUBLIC_BETA_MODE === "true";

const PRICES = {
  family: { monthly: "$7.99/mo", yearly: "$69.99/yr" },
  family_pro: { monthly: "$14.99/mo", yearly: "$129.99/yr" },
} as const;

const BRAND_LABELS = {
  mom: "Mom",
  dad: "Dad",
  neutral: "Parent",
} as const;

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };
  const { openPortal, startCheckout } = useSubscriptionStore();
  const {
    members,
    usage,
    latestInvite,
    error: householdError,
    isLoading: isHouseholdLoading,
    fetchMembers,
    fetchUsage,
    inviteCoParent,
    clearError,
  } = useHouseholdStore();
  const { permission, subscribe } = usePushNotifications();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [promoCode, setPromoCode] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mom-alpha-promo-code") ?? "";
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus] = useState<"success" | "cancelled" | null>(() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("checkout");
    return value === "success" || value === "cancelled" ? value : null;
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user?.household_id) return;
    fetchMembers(user.household_id);
    fetchUsage(user.household_id);
  }, [user?.household_id, fetchMembers, fetchUsage]);

  const handleUpgrade = async (tier: "family" | "family_pro") => {
    setIsCheckingOut(true);
    const code = promoCode.trim() || undefined;
    if (code) localStorage.removeItem("mom-alpha-promo-code");
    try {
      await startCheckout(tier, billingCycle, code);
    } catch {
      setIsCheckingOut(false);
    }
  };

  const handleInviteCoParent = async () => {
    if (!user?.household_id || !inviteEmail.trim()) return;
    await inviteCoParent(user.household_id, {
      email: inviteEmail.trim(),
      parent_brand: user.parent_brand === "dad" ? "mom" : "dad",
      role: "member",
    });
    setInviteEmail("");
  };

  const handleCopyInviteToken = async () => {
    if (!latestInvite?.invite_token) return;
    try {
      await navigator.clipboard.writeText(latestInvite.invite_token);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 rounded-none border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Notifications */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Notifications
          </h3>
          <div className="mom-card divide-y divide-border-subtle/10">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-alphaai-3xs text-muted-foreground">
                  {permission === "granted" ? "Enabled" : "Enable to receive alerts"}
                </p>
              </div>
              {permission !== "granted" ? (
                <button
                  onClick={subscribe}
                  className="mom-btn-primary text-alphaai-xs py-2 px-4"
                >
                  Enable
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {IS_BETA && (
                    <button
                      onClick={() => api.notifications.sendTestPush()}
                      className="text-alphaai-3xs text-brand font-medium hover:underline"
                    >
                      Test
                    </button>
                  )}
                  <span className="material-symbols-outlined text-[20px] text-brand">check_circle</span>
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Daily Edit</p>
                <p className="text-alphaai-3xs text-muted-foreground">Morning summary at 7:00 AM</p>
              </div>
              <div className="mom-toggle" data-active="true" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Quiet Hours</p>
                <p className="text-alphaai-3xs text-muted-foreground">10:00 PM — 7:00 AM</p>
              </div>
              <div className="mom-toggle" data-active="true" />
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Subscription
          </h3>
          <div className="mom-card p-4">
            {/* Checkout result feedback */}
            {checkoutStatus === "success" && (
              <div className="mb-3 p-3 bg-brand/10 rounded-xl border border-brand/20">
                <p className="text-alphaai-xs text-brand font-semibold">Subscription activated!</p>
                <p className="text-alphaai-3xs text-brand/80 mt-0.5">Welcome to Alpha.Mom. Your agents are ready.</p>
              </div>
            )}
            {checkoutStatus === "cancelled" && (
              <div className="mb-3 p-3 bg-error/10 rounded-xl border border-error/20">
                <p className="text-alphaai-xs text-error font-semibold">Checkout cancelled</p>
                <p className="text-alphaai-3xs text-error/80 mt-0.5">No charges were made.</p>
              </div>
            )}

            {/* Current plan row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Current Plan</p>
                <p className="text-alphaai-xs text-muted-foreground capitalize">
                  {user?.tier?.replace("_", " ") ?? "Free Trial"}
                </p>
              </div>
              {user?.tier !== "trial" && (
                <button
                  onClick={openPortal}
                  className="mom-btn-outline text-alphaai-xs py-2 px-4"
                >
                  Manage
                </button>
              )}
            </div>

            {user?.tier === "trial" && (
              <>
                {/* Billing cycle toggle */}
                <div className="flex gap-1 p-1 mom-card mb-3">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "monthly" ? "bg-brand text-on-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "yearly" ? "bg-brand text-on-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Yearly{" "}
                    <span className="text-alphaai-3xs opacity-80">
                      {billingCycle === "yearly" ? "27% off" : "save 27%"}
                    </span>
                  </button>
                </div>

                {/* Upgrade buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleUpgrade("family")}
                    disabled={isCheckingOut}
                    className="flex-1 mom-btn-primary text-alphaai-xs py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="font-semibold block">Family</span>
                    <span className="text-alphaai-3xs opacity-90 block">
                      {PRICES.family[billingCycle]}
                    </span>
                  </button>
                  <button
                    onClick={() => handleUpgrade("family_pro")}
                    disabled={isCheckingOut}
                    className="flex-1 mom-btn-outline text-alphaai-xs py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="font-semibold block">Family Pro</span>
                    <span className="text-alphaai-3xs opacity-90 block">
                      {PRICES.family_pro[billingCycle]}
                    </span>
                  </button>
                </div>

                {/* Beta promo code — visible only in beta mode */}
                {(IS_BETA || !!promoCode) && (
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.trim().toUpperCase())}
                    placeholder="Beta invite code (optional)"
                    className="mom-input text-alphaai-xs"
                    aria-label="Beta promotion code"
                  />
                )}
              </>
            )}

            {/* Manage portal link for paid tiers */}
            {user?.tier !== "trial" && (
              <button
                onClick={openPortal}
                className="w-full text-alphaai-xs text-brand font-semibold text-left hover:underline"
              >
                Manage billing, change plan, or cancel →
              </button>
            )}
          </div>
        </section>

        {/* Household setup & co-parent access */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Household & Co-Parent Access
          </h3>
          <div className="mom-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">
                  Shared household status
                </p>
                <p className="text-alphaai-3xs text-muted-foreground capitalize">
                  {user?.household_membership_status ?? (user?.household_id ? "active" : "none")}
                </p>
              </div>
              {user?.parent_brand && (
                <span className="mom-chip text-alphaai-3xs">
                  {BRAND_LABELS[user.parent_brand]} view
                </span>
              )}
            </div>

            {!user?.household_id && (
              <Link
                href="/onboarding/household"
                className="flex items-center justify-between p-3 rounded-xl border border-brand/30 bg-brand/5 hover:bg-brand/10 transition-colors"
              >
                <div>
                  <p className="text-alphaai-sm font-semibold text-brand">Set up your household</p>
                  <p className="text-alphaai-3xs text-brand/70 mt-0.5">
                    Add family members and invite a co-parent
                  </p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-brand">arrow_forward</span>
              </Link>
            )}

            {user?.household_id && (
              <>
                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">
                    Invite co-parent
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="partner@email.com"
                      className="mom-input flex-1"
                      type="email"
                      aria-label="Co-parent email"
                    />
                    <button
                      onClick={handleInviteCoParent}
                      disabled={isHouseholdLoading || !inviteEmail.trim() || user.household_role !== "admin"}
                      className="mom-btn-primary text-alphaai-xs py-2 px-3 disabled:opacity-60"
                    >
                      Invite
                    </button>
                  </div>
                  {user.household_role !== "admin" && (
                    <p className="text-alphaai-3xs text-muted-foreground">
                      Only household admins can send invites.
                    </p>
                  )}
                </div>

                {latestInvite?.invite_token && (
                  <div className="mom-card p-3 space-y-2">
                    <p className="text-alphaai-3xs text-muted-foreground">Latest invite token</p>
                    <p className="text-alphaai-xs font-mono text-foreground break-all">
                      {latestInvite.invite_token}
                    </p>
                    <button
                      onClick={handleCopyInviteToken}
                      className="mom-btn-outline text-alphaai-3xs py-1 px-3"
                    >
                      {copyState === "copied" ? "Copied" : "Copy token"}
                    </button>
                  </div>
                )}

                {members.length > 0 && (
                  <div className="mom-card divide-y divide-border-subtle/10">
                    {members.map((member) => (
                      <div key={member.operator_id} className="p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-alphaai-xs font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-alphaai-3xs text-muted-foreground">
                            {member.email ?? "No email"} · {member.role}
                          </p>
                        </div>
                        {member.parent_brand && (
                          <span className="mom-chip text-alphaai-3xs">
                            {BRAND_LABELS[member.parent_brand]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {usage && (
                  <div className="mom-card p-3">
                    <p className="text-alphaai-xs text-foreground">
                      Shared monthly usage: {usage.calls_used} / {usage.calls_limit} calls ({usage.usage_pct}%)
                    </p>
                    {usage.is_soft_capped && (
                      <p className="text-alphaai-3xs text-error mt-1">
                        Soft cap reached. Intelligent requests are downgraded automatically.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {householdError && (
              <div className="rounded-xl border border-error/20 bg-error/10 p-3">
                <p className="text-alphaai-xs text-error">{householdError}</p>
                <button
                  onClick={clearError}
                  className="text-alphaai-3xs text-error/80 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Connected Accounts */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Connected Accounts
          </h3>
          <div className="mom-card divide-y divide-border-subtle/10">
            <div className="p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-brand">calendar_month</span>
              <span className="text-alphaai-sm text-foreground flex-1">Google Calendar</span>
              <span className="mom-chip text-alphaai-3xs">Connected</span>
            </div>
            <div className="p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-muted-foreground">mail</span>
              <span className="text-alphaai-sm text-foreground flex-1">School Email</span>
              <button className="text-alphaai-xs font-semibold text-brand">Connect</button>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Legal & Privacy
          </h3>
          <div className="mom-card divide-y divide-border-subtle/10">
            <Link href="/legal/terms" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">Terms of Service</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
            <Link href="/legal/privacy" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">Privacy Policy</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
            <Link href="/legal/ai-disclosure" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">AI Disclosure</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* Danger zone */}
        <section className="space-y-2">
          {showLogoutConfirm ? (
            <div className="mom-card p-4 space-y-3">
              <p className="text-alphaai-sm font-medium text-foreground">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 mom-btn-outline text-alphaai-xs py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 mom-btn-primary text-alphaai-xs py-2 bg-error border-error hover:bg-error/90"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full mom-card p-4 flex items-center gap-3 hover:bg-error/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-error">logout</span>
              <span className="text-alphaai-sm font-medium text-error">Sign Out</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
