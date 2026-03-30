"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useBalanceStore } from "@/stores/balance-store";

/**
 * Compact balance teaser on the dashboard — shows task split at a glance.
 * Only renders when co-parent data exists.
 */
export function BalanceTeaser() {
  const householdId = useAuthStore((s) => s.user?.household_id);
  const { balance, isLoading, fetchBalance } = useBalanceStore();

  useEffect(() => {
    if (householdId) fetchBalance(householdId);
  }, [householdId, fetchBalance]);

  if (isLoading || !balance?.parent_b) return null;

  const { parent_a, parent_b } = balance;

  return (
    <Link href="/balance" className="block">
      <div className="mom-card p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
        {/* Mini doughnut */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `conic-gradient(
              hsl(var(--brand)) 0deg ${parent_a.pct * 3.6}deg,
              hsl(var(--secondary)) ${parent_a.pct * 3.6}deg 360deg
            )`,
          }}
        >
          <div className="w-7 h-7 rounded-full bg-surface" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-alphaai-sm font-semibold text-foreground">
            Family Balance
          </h3>
          <p className="text-alphaai-3xs text-muted-foreground truncate">
            {parent_a.name.split(" ")[0]} {parent_a.pct}% · {parent_b.name.split(" ")[0]} {parent_b.pct}%
          </p>
        </div>
        <span className="material-symbols-outlined text-[18px] text-brand">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
