"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useWinsStore } from "@/stores/wins-store";

/**
 * Compact wins teaser card on the dashboard — links to full /wins page.
 * Shows a quick stat summary to entice sharing.
 */
export function WinsTeaser() {
  const householdId = useAuthStore((s) => s.user?.household_id);
  const { weeklyWin, isLoading, fetchWeeklyWin } = useWinsStore();

  useEffect(() => {
    if (householdId) fetchWeeklyWin(householdId);
  }, [householdId, fetchWeeklyWin]);

  // Don't show if loading or no data
  if (isLoading || !weeklyWin) return null;

  const hasActivity = weeklyWin.tasks_completed > 0 || weeklyWin.events_managed > 0;
  if (!hasActivity) return null;

  return (
    <Link href="/wins" className="block">
      <div className="mom-card p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
        <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[24px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-alphaai-sm font-semibold text-foreground">
            Weekly Wins Ready
          </h3>
          <p className="text-alphaai-3xs text-muted-foreground truncate">
            {weeklyWin.tasks_completed} tasks · {weeklyWin.events_managed} events
            {weeklyWin.streak_days > 0 && ` · ${weeklyWin.streak_days} day streak`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-brand">
          <span className="text-alphaai-xs font-medium">Share</span>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </div>
      </div>
    </Link>
  );
}
