"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import Link from "next/link";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { openPortal } = useSubscriptionStore();
  const { permission, subscribe } = usePushNotifications();

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
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Current Plan</p>
                <p className="text-alphaai-xs text-muted-foreground capitalize">
                  {user?.tier?.replace("_", " ") ?? "Free Trial"}
                </p>
              </div>
              <button
                onClick={openPortal}
                className="mom-btn-outline text-alphaai-xs py-2 px-4"
              >
                Manage
              </button>
            </div>
            {user?.tier === "trial" && (
              <div className="flex gap-2">
                <Link
                  href="/settings?upgrade=family"
                  className="flex-1 mom-btn-primary text-alphaai-xs py-2 text-center"
                >
                  Family $7.99/mo
                </Link>
                <Link
                  href="/settings?upgrade=family_pro"
                  className="flex-1 mom-btn-outline text-alphaai-xs py-2 text-center"
                >
                  Pro $14.99/mo
                </Link>
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
