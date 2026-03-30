"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useWinsStore } from "@/stores/wins-store";
import { WeeklyWinCard } from "@/components/wins/WeeklyWinCard";
import { WinCardRenderer } from "@/components/wins/WinCardRenderer";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function WinsPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;
  const { weeklyWin, isLoading, error, fetchWeeklyWin } = useWinsStore();

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    if (householdId) {
      fetchWeeklyWin(householdId);
    }
  }, [isClient, token, householdId, fetchWeeklyWin, router]);

  if (!isClient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
              Weekly Wins
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Your family&apos;s accomplishments
            </p>
          </div>
          <div className="w-8 h-8 mom-gradient-hero rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <div className="h-12 mom-skeleton rounded-full" />
          </div>
        ) : error ? (
          <EmptyState
            icon="error"
            title="Couldn&apos;t load wins"
            description={error}
          />
        ) : weeklyWin ? (
          <div>
            <WeeklyWinCard
              win={weeklyWin}
              userName={user?.name?.split(" ")[0]}
            />
            <WinCardRenderer cardElementId="win-card" />

            {/* Encouragement */}
            <div className="mt-6 text-center">
              <p className="text-alphaai-xs text-muted-foreground">
                Share your wins and inspire other families!
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="emoji_events"
            title="No wins yet this week"
            description="Start using your agents to track accomplishments. Your first weekly summary will appear here!"
          />
        )}
      </main>
    </div>
  );
}
