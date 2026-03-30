"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useBalanceStore } from "@/stores/balance-store";
import { BalanceDoughnut } from "@/components/balance/BalanceDoughnut";
import { BalanceHistory } from "@/components/balance/BalanceHistory";
import { CategoryBreakdown } from "@/components/balance/CategoryBreakdown";
import { ShareButton } from "@/components/shared/ShareButton";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function BalancePage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;
  const { balance, isLoading, error, fetchBalance } = useBalanceStore();

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    if (householdId) fetchBalance(householdId);
  }, [isClient, token, householdId, fetchBalance, router]);

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
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
              Family Balance
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              How tasks are shared this week
            </p>
          </div>
          {balance && (
            <ShareButton
              itemType="task"
              title={`Family Balance: ${balance.parent_a.name} ${balance.parent_a.pct}% / ${balance.parent_b?.name ?? "Co-parent"} ${balance.parent_b?.pct ?? 0}%`}
              text="Check out how our family splits the workload!"
              compact
            />
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <EmptyState
            icon="error"
            title="Couldn't load balance"
            description={error}
          />
        ) : !balance ? (
          <EmptyState
            icon="balance"
            title="No balance data yet"
            description="Start completing tasks with your co-parent to see how the workload splits."
          />
        ) : !balance.parent_b ? (
          /* Single-parent household */
          <div className="mom-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-glow/15 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-brand">
                person_add
              </span>
            </div>
            <h2 className="font-headline text-alphaai-lg font-bold text-foreground mb-2">
              Invite Your Co-Parent
            </h2>
            <p className="text-alphaai-sm text-muted-foreground mb-4">
              The balance dashboard shows how tasks are shared between parents.
              Invite your partner to see the split.
            </p>
            <Link href="/settings" className="mom-btn-primary">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Invite Co-Parent
            </Link>
          </div>
        ) : (
          <>
            {/* Main doughnut */}
            <div className="mom-card p-6">
              <div className="flex flex-col items-center">
                <BalanceDoughnut
                  parentAPct={balance.parent_a.pct}
                  parentBPct={balance.parent_b.pct}
                  parentAName={balance.parent_a.name}
                  parentBName={balance.parent_b.name}
                />
                <div className="mt-4 text-center">
                  <p className="text-alphaai-sm text-muted-foreground">
                    {balance.parent_a.tasks_completed + balance.parent_b.tasks_completed} tasks
                    completed this week
                  </p>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                name={balance.parent_a.name.split(" ")[0]}
                count={balance.parent_a.tasks_completed}
                colorClass="bg-brand"
              />
              <StatCard
                name={balance.parent_b.name.split(" ")[0]}
                count={balance.parent_b.tasks_completed}
                colorClass="bg-secondary"
              />
            </div>

            {/* Category breakdown */}
            {balance.by_category.length > 0 && (
              <div className="mom-card p-5">
                <CategoryBreakdown
                  categories={balance.by_category}
                  parentAName={balance.parent_a.name}
                  parentBName={balance.parent_b.name}
                />
              </div>
            )}

            {/* Weekly trend */}
            {balance.weekly_trend.length > 0 && (
              <div className="mom-card p-5">
                <BalanceHistory
                  trend={balance.weekly_trend}
                  parentAName={balance.parent_a.name}
                  parentBName={balance.parent_b.name}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  name,
  count,
  colorClass,
}: {
  name: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="mom-card p-4 text-center">
      <div className={`w-3 h-3 rounded-full ${colorClass} mx-auto mb-2`} />
      <p className="text-alphaai-xl font-bold text-foreground">{count}</p>
      <p className="text-alphaai-3xs text-muted-foreground">{name}&apos;s tasks</p>
    </div>
  );
}
