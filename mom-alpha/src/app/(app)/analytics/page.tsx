"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { AnalyticsDashboard } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const AGENT_LABELS: Record<string, string> = {
  calendar_whiz: "Calendar Whiz",
  grocery_guru: "Grocery Guru",
  budget_buddy: "Budget Buddy",
  school_event_hub: "School Hub",
  tutor_finder: "Tutor Finder",
  health_hub: "Health Hub",
  sleep_tracker: "Sleep Tracker",
  self_care_reminder: "Self-Care",
};

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.household_id) return;

    api.analytics
      .dashboard(user.household_id)
      .then(setData)
      .catch((err) => {
        setError(err?.detail ?? "Failed to load analytics");
      })
      .finally(() => setIsLoading(false));
  }, [user?.household_id]);

  if (user?.tier !== "family_pro") {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
            </Link>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Analytics</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-24">
          <EmptyState
            icon="analytics"
            title="Family Pro Feature"
            description="Upgrade to Family Pro to access spending trends, schedule density, and agent usage analytics."
            action={{
              label: "Upgrade to Pro",
              onClick: () => {},
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Analytics</h1>
          </div>
          <span className="mom-chip-secondary text-alphaai-3xs py-0.5 px-2">PRO</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <EmptyState
            icon="error"
            title="Error loading analytics"
            description={error}
          />
        ) : data ? (
          <>
            {/* Call budget usage */}
            <section className="mom-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline text-alphaai-base font-semibold text-foreground">
                  AI Call Budget
                </h3>
                <span className="text-alphaai-sm font-bold text-brand">
                  {data.call_budget_usage_pct.toFixed(0)}%
                </span>
              </div>
              <div className="mom-progress-track">
                <div
                  className="mom-progress-fill"
                  style={{ width: `${Math.min(data.call_budget_usage_pct, 100)}%` }}
                />
              </div>
              <p className="text-alphaai-3xs text-muted-foreground mt-2">
                {data.period} billing period
              </p>
            </section>

            {/* Agent usage */}
            <section className="mom-card p-5">
              <h3 className="font-headline text-alphaai-base font-semibold text-foreground mb-3">
                Agent Usage
              </h3>
              {Object.keys(data.agent_usage).length === 0 ? (
                <p className="text-alphaai-sm text-muted-foreground">
                  No agent interactions this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.agent_usage)
                    .sort(([, a], [, b]) => b - a)
                    .map(([agentType, count]) => {
                      const maxCount = Math.max(
                        ...Object.values(data.agent_usage)
                      );
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={agentType}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-alphaai-sm text-foreground">
                              {AGENT_LABELS[agentType] ?? agentType}
                            </span>
                            <span className="text-alphaai-xs text-muted-foreground font-medium">
                              {count} chats
                            </span>
                          </div>
                          <div className="mom-progress-track">
                            <div
                              className="mom-progress-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* Spending trend */}
            {data.spending_trend.length > 0 && (
              <section className="mom-card p-5">
                <h3 className="font-headline text-alphaai-base font-semibold text-foreground mb-3">
                  Spending Trend
                </h3>
                <div className="flex items-end gap-1 h-24">
                  {data.spending_trend.map((point) => {
                    const maxAmt = Math.max(
                      ...data.spending_trend.map((p) => p.amount)
                    );
                    const pct =
                      maxAmt > 0 ? (point.amount / maxAmt) * 100 : 0;
                    return (
                      <div
                        key={point.date}
                        className="flex-1 bg-brand/40 rounded-t-sm"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${point.date}: $${point.amount.toFixed(2)}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-alphaai-3xs text-muted-foreground">
                    {data.spending_trend[0]?.date.slice(5)}
                  </span>
                  <span className="text-alphaai-3xs text-muted-foreground">
                    {data.spending_trend[data.spending_trend.length - 1]?.date.slice(5)}
                  </span>
                </div>
              </section>
            )}

            {/* Schedule density */}
            {data.schedule_density.length > 0 && (
              <section className="mom-card p-5">
                <h3 className="font-headline text-alphaai-base font-semibold text-foreground mb-3">
                  Schedule Density
                </h3>
                <div className="flex items-end gap-1 h-24">
                  {data.schedule_density.map((point) => {
                    const maxEvt = Math.max(
                      ...data.schedule_density.map((p) => p.events)
                    );
                    const pct =
                      maxEvt > 0 ? (point.events / maxEvt) * 100 : 0;
                    return (
                      <div
                        key={point.date}
                        className="flex-1 bg-tertiary/40 rounded-t-sm"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${point.date}: ${point.events} events`}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
