"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useReferralStore } from "@/stores/referral-store";
import { useShare } from "@/hooks/use-share";
import { CardSkeleton } from "@/components/shared/Skeleton";
import * as api from "@/lib/api-client";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ReferralPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { referral, isLoading, fetchReferral } = useReferralStore();
  const { share, canShare } = useShare();

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    fetchReferral();
  }, [isClient, token, fetchReferral, router]);

  const handleShare = async () => {
    if (!referral) return;

    const result = await share({
      title: "Join Alpha.Mom — Get 2 Free Weeks!",
      text: `${user?.name?.split(" ")[0] ?? "A friend"} invited you to Alpha.Mom! Use code ${referral.referral_code} to get 2 free weeks of Family Pro.`,
      url: referral.referral_url,
    });

    api.viral.track({
      event_type: "referral_send",
      metadata: { method: result },
    }).catch(() => {});
  };

  if (!isClient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to dashboard"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1">
            Invite Friends
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            {/* Hero card */}
            <div className="mom-card overflow-hidden">
              <div className="mom-gradient-hero px-6 py-6 text-center relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <span className="material-symbols-outlined text-[48px] text-on-primary/80 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  card_giftcard
                </span>
                <h2 className="font-headline text-alphaai-xl font-bold text-on-primary mb-1">
                  Give 2 Weeks, Get 2 Weeks
                </h2>
                <p className="text-alphaai-sm text-on-primary/80">
                  Invite a friend to Alpha.Mom — you both get 2 free weeks of Family Pro!
                </p>
              </div>

              {referral && (
                <div className="px-6 py-5">
                  {/* Referral code */}
                  <div className="bg-surface-container rounded-xl px-4 py-3 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-alphaai-3xs text-muted-foreground uppercase tracking-wider">
                        Your code
                      </p>
                      <p className="text-alphaai-lg font-bold text-foreground font-mono tracking-widest">
                        {referral.referral_code}
                      </p>
                    </div>
                    <button
                      onClick={handleShare}
                      className="mom-btn-primary px-5 py-2.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      {canShare ? "Share" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {referral && (
              <div className="grid grid-cols-3 gap-3">
                <div className="mom-card p-4 text-center">
                  <p className="text-alphaai-xl font-bold text-foreground">
                    {referral.friends_invited}
                  </p>
                  <p className="text-alphaai-3xs text-muted-foreground">Invited</p>
                </div>
                <div className="mom-card p-4 text-center">
                  <p className="text-alphaai-xl font-bold text-brand">
                    {referral.friends_joined}
                  </p>
                  <p className="text-alphaai-3xs text-muted-foreground">Joined</p>
                </div>
                <div className="mom-card p-4 text-center">
                  <p className="text-alphaai-xl font-bold text-secondary">
                    {referral.reward_weeks_earned}
                  </p>
                  <p className="text-alphaai-3xs text-muted-foreground">Free Weeks</p>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="mom-card p-5">
              <h3 className="text-alphaai-sm font-semibold text-foreground mb-3">
                How It Works
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "share", text: "Share your unique code with a friend" },
                  { icon: "person_add", text: "They sign up and enter your code" },
                  { icon: "celebration", text: "You both get 2 free weeks of Family Pro" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-glow/15 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-brand">
                        {step.icon}
                      </span>
                    </div>
                    <p className="text-alphaai-xs text-foreground">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
