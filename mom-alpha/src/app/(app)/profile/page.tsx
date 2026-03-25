"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import * as api from "@/lib/api-client";
import type { Household } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";

const TIER_LABELS: Record<string, string> = {
  trial: "Free Trial",
  family: "Family",
  family_pro: "Family Pro",
};

const TIER_COLORS: Record<string, string> = {
  trial: "bg-surface-container text-muted-foreground",
  family: "bg-brand-glow/30 text-brand",
  family_pro: "bg-secondary-container text-secondary",
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { budget, fetchBudget } = useSubscriptionStore();
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.household_id) return;

    async function load() {
      try {
        const [hhData] = await Promise.all([
          api.household.get(user!.household_id!),
          fetchBudget(user!.household_id!),
        ]);
        setHousehold(hhData);
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user?.household_id, fetchBudget]);

  const budgetPct = budget ? Math.round((budget.used / budget.limit) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* User card */}
        <section className="mom-card p-5 flex items-center gap-4">
          <div className="w-16 h-16 mom-gradient-hero rounded-full flex items-center justify-center">
            <span className="text-on-primary font-headline font-bold text-alphaai-xl">
              {user?.name?.charAt(0) ?? "M"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-alphaai-lg font-bold text-foreground truncate">
              {user?.name ?? "User"}
            </h2>
            <p className="text-alphaai-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-alphaai-3xs font-semibold ${TIER_COLORS[user?.tier ?? "trial"]}`}>
              {TIER_LABELS[user?.tier ?? "trial"]}
            </span>
          </div>
        </section>

        {/* Call Budget */}
        <section className="mom-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground">
              AI Call Budget
            </h3>
            <span className="text-alphaai-xs text-muted-foreground">
              {budget?.used ?? 0} / {budget?.limit ?? 0}
            </span>
          </div>
          <div className="mom-progress-track">
            <div
              className="mom-progress-fill"
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
          <p className="text-alphaai-xs text-muted-foreground mt-2">
            {budget?.remaining ?? 0} calls remaining this month
          </p>
          {budget?.is_over_budget && (
            <div className="mom-banner mt-3 bg-error/10">
              <span className="material-symbols-outlined text-[20px] text-error">warning</span>
              <p className="text-alphaai-sm text-error">
                Agents are running in basic mode until {budget.period_end ? new Date(budget.period_end).toLocaleDateString() : "reset"}.
              </p>
            </div>
          )}
          {budgetPct >= 80 && !budget?.is_over_budget && user?.tier !== "family_pro" && (
            <div className="mom-banner mt-3 bg-secondary/10">
              <span className="material-symbols-outlined text-[20px] text-secondary">upgrade</span>
              <p className="text-alphaai-sm text-secondary">
                Running low on calls. Upgrade to Family Pro for 2,000 monthly calls.
              </p>
            </div>
          )}
        </section>

        {/* Family Members */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Family Members
          </h3>
          {isLoading ? (
            <CardSkeleton />
          ) : household?.members.length ? (
            <div className="grid grid-cols-2 gap-3">
              {household.members.map((member) => (
                <div key={member.id} className="mom-card p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-on-primary font-headline font-bold text-alphaai-sm"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-alphaai-sm font-semibold text-foreground truncate">
                      {member.name}
                    </p>
                    {member.age && (
                      <p className="text-alphaai-3xs text-muted-foreground">
                        Age {member.age}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-alphaai-sm text-muted-foreground">No family members added yet.</p>
          )}
        </section>

        {/* Quick links */}
        <section className="space-y-2">
          <Link href="/settings" className="mom-card p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">settings</span>
            <span className="text-alphaai-sm font-medium text-foreground flex-1">Settings</span>
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
          </Link>
          <Link href="/settings" className="mom-card p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">security</span>
            <span className="text-alphaai-sm font-medium text-foreground flex-1">Security & Privacy</span>
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
          </Link>
          <Link href="/legal/terms" className="mom-card p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">gavel</span>
            <span className="text-alphaai-sm font-medium text-foreground flex-1">Legal Documents</span>
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
