"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { CardSkeleton } from "@/components/shared/Skeleton";
import * as api from "@/lib/api-client";
import type { EmergencyStatus } from "@/types/api-contracts";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function EmergencyPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;

  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(1);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    if (householdId) {
      api.emergency
        .status(householdId)
        .then(setStatus)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isClient, token, householdId, router]);

  const handleActivate = useCallback(async () => {
    if (!householdId) return;
    setActivating(true);
    try {
      const result = await api.emergency.activate(householdId, {
        duration_days: duration,
        message_to_coparent: message.trim() || undefined,
      });
      setStatus(result);
      setShowConfirm(false);
      api.viral.track({
        event_type: "emergency_activate",
        metadata: { duration_days: duration },
      }).catch(() => {});
    } catch {
      // Error handling
    } finally {
      setActivating(false);
    }
  }, [householdId, duration, message]);

  const handleDeactivate = useCallback(async () => {
    if (!householdId) return;
    try {
      const result = await api.emergency.deactivate(householdId);
      setStatus(result);
    } catch {
      // Error handling
    }
  }, [householdId]);

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
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1">
            Emergency Mode
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-6">
        {isLoading ? (
          <CardSkeleton />
        ) : status?.active ? (
          /* Active emergency */
          <>
            <div className="mom-card overflow-hidden">
              <div className="bg-error/10 px-6 py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[36px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emergency
                  </span>
                </div>
                <h2 className="font-headline text-alphaai-xl font-bold text-foreground mb-1">
                  Emergency Mode Active
                </h2>
                <p className="text-alphaai-sm text-muted-foreground">
                  Take it easy — your co-parent has been notified
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-alphaai-xs text-muted-foreground">Tasks delegated</span>
                  <span className="text-alphaai-sm font-semibold text-foreground">{status.delegated_tasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-alphaai-xs text-muted-foreground">Events adjusted</span>
                  <span className="text-alphaai-sm font-semibold text-foreground">{status.cancelled_events}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-alphaai-xs text-muted-foreground">Co-parent notified</span>
                  <span className="material-symbols-outlined text-[20px] text-brand" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {status.notified_coparent ? "check_circle" : "pending"}
                  </span>
                </div>
                {status.deactivates_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-alphaai-xs text-muted-foreground">Auto-deactivates</span>
                    <span className="text-alphaai-sm text-foreground">
                      {new Date(status.deactivates_at).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleDeactivate} className="mom-btn-outline w-full">
              <span className="material-symbols-outlined text-[20px]">check</span>
              I&apos;m Feeling Better — Deactivate
            </button>
          </>
        ) : (
          /* Inactive — activation flow */
          <>
            <div className="mom-card p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[40px] text-error">
                  emergency
                </span>
              </div>
              <h2 className="font-headline text-alphaai-xl font-bold text-foreground mb-2">
                Need a Break?
              </h2>
              <p className="text-alphaai-sm text-muted-foreground mb-1">
                One tap and we&apos;ll handle everything:
              </p>
              <div className="space-y-2 mt-4 text-left">
                {[
                  { icon: "forward", text: "Delegate all active tasks to your co-parent" },
                  { icon: "notifications_active", text: "Notify your co-parent immediately" },
                  { icon: "event_busy", text: "Adjust non-essential calendar events" },
                  { icon: "self_improvement", text: "Pause non-urgent agent reminders" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-brand">
                      {item.icon}
                    </span>
                    <p className="text-alphaai-xs text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 rounded-2xl bg-error text-on-primary font-headline text-alphaai-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[24px]">emergency</span>
              Activate Emergency Mode
            </button>

            <p className="text-alphaai-3xs text-muted-foreground text-center">
              Your co-parent will be notified immediately. You can deactivate anytime.
            </p>
          </>
        )}
      </main>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 space-y-5">
            <h2 className="font-headline text-alphaai-lg font-bold text-foreground">
              Confirm Emergency Mode
            </h2>

            {/* Duration */}
            <div>
              <p className="text-alphaai-xs font-medium text-foreground mb-2">Duration</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 rounded-full text-alphaai-sm font-medium transition-colors ${
                      duration === d
                        ? "bg-error text-on-primary"
                        : "bg-surface-container text-muted-foreground"
                    }`}
                  >
                    {d} day{d > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="em-msg" className="text-alphaai-xs font-medium text-foreground mb-1 block">
                Message to co-parent (optional)
              </label>
              <textarea
                id="em-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Not feeling well today. Can you cover the kids' activities?"
                className="mom-input min-h-[70px] resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="mom-btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={activating}
                className="flex-1 py-3 rounded-full bg-error text-on-primary font-headline font-semibold disabled:opacity-50"
              >
                {activating ? "Activating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
