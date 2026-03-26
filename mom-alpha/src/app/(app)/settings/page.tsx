"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useHouseholdStore } from "@/stores/household-store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
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
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { openPortal, startCheckout } = useSubscriptionStore();
  const {
    members,
    usage,
    latestInvite,
    error: householdError,
    isLoading: isHouseholdLoading,
    createHousehold,
    joinHousehold,
    fetchMembers,
    fetchUsage,
    inviteCoParent,
    clearError,
  } = useHouseholdStore();
  const { permission, subscribe } = usePushNotifications();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus] = useState<"success" | "cancelled" | null>(() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("checkout");
    return value === "success" || value === "cancelled" ? value : null;
  });
  const [showHouseholdOnboardingHint] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("onboarding") === "household";
  });
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (!user?.household_id) return;
    fetchMembers(user.household_id);
    fetchUsage(user.household_id);
  }, [user?.household_id, fetchMembers, fetchUsage]);

  const handleUpgrade = async (tier: "family" | "family_pro") => {
    setIsCheckingOut(true);
    try {
      await startCheckout(tier, billingCycle, promoCode.trim() || undefined);
    } catch {
      setIsCheckingOut(false);
    }
  };

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return;
    const household = await createHousehold(householdName.trim());
    if (!household) return;
    updateUser({
      household_id: household.id,
      household_role: "admin",
      household_membership_status: "active",
    });
    await Promise.all([fetchMembers(household.id), fetchUsage(household.id)]);
    setHouseholdName("");
  };

  const handleJoinHousehold = async () => {
    if (!inviteToken.trim()) return;
    const household = await joinHousehold({ invite_token: inviteToken.trim() });
    if (!household) return;
    updateUser({
      household_id: household.id,
      household_role: "member",
      household_membership_status: "active",
    });
    await Promise.all([fetchMembers(household.id), fetchUsage(household.id)]);
    setInviteToken("");
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
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
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
                <span className="material-symbols-outlined text-[20px] text-brand">check_circle</span>
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
                <p className="text-alphaai-3xs text-brand/80 mt-0.5">Welcome to Mom.alpha. Your agents are ready.</p>
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
                <div className="flex gap-1 p-1 bg-surface rounded-xl mb-3">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "monthly" ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "yearly" ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
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
                {IS_BETA && (
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.trim().toUpperCase())}
                    placeholder="Beta invite code (optional)"
                    className="w-full bg-surface border border-border-subtle/20 rounded-xl px-4 py-2 text-alphaai-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
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
            {showHouseholdOnboardingHint && !user?.household_id && (
              <div className="rounded-xl border border-brand/20 bg-brand/10 p-3">
                <p className="text-alphaai-xs text-brand font-semibold">
                  One last step: set up your shared household.
                </p>
                <p className="text-alphaai-3xs text-brand/80 mt-1">
                  Create a household or join with a co-parent invite token.
                </p>
              </div>
            )}
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
              <>
                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">
                    Create a household
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      placeholder="Franco Family"
                      className="mom-input flex-1"
                      aria-label="Household name"
                    />
                    <button
                      onClick={handleCreateHousehold}
                      disabled={isHouseholdLoading || !householdName.trim()}
                      className="mom-btn-primary text-alphaai-xs py-2 px-3 disabled:opacity-60"
                    >
                      Create
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">
                    Join via invite token
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="Paste invite token"
                      className="mom-input flex-1"
                      aria-label="Invite token"
                    />
                    <button
                      onClick={handleJoinHousehold}
                      disabled={isHouseholdLoading || !inviteToken.trim()}
                      className="mom-btn-outline text-alphaai-xs py-2 px-3 disabled:opacity-60"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </>
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
                  <div className="rounded-xl border border-border-subtle/20 bg-surface p-3 space-y-2">
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
                  <div className="rounded-xl border border-border-subtle/20 divide-y divide-border-subtle/10">
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
                  <div className="rounded-xl border border-border-subtle/20 bg-surface p-3">
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
          <button
            onClick={logout}
            className="w-full mom-card p-4 flex items-center gap-3 hover:bg-error/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-error">logout</span>
            <span className="text-alphaai-sm font-medium text-error">Sign Out</span>
          </button>
        </section>
      </main>
    </div>
  );
}
