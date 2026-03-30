"use client";

import React from "react";

interface BalanceHistoryProps {
  trend: Array<{ week: string; parent_a_pct: number; parent_b_pct: number }>;
  parentAName: string;
  parentBName: string;
}

/**
 * 4-week horizontal bar chart showing balance trend over time.
 */
export function BalanceHistory({ trend, parentAName, parentBName }: BalanceHistoryProps) {
  if (trend.length === 0) return null;

  return (
    <section>
      <h3 className="text-alphaai-xs font-semibold text-foreground mb-3">
        Weekly Trend
      </h3>
      <div className="space-y-2.5">
        {trend.slice(-4).map((week) => (
          <div key={week.week}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-alphaai-3xs text-muted-foreground">
                {formatWeekLabel(week.week)}
              </span>
              <span className="text-alphaai-3xs text-muted-foreground">
                {week.parent_a_pct}% / {week.parent_b_pct}%
              </span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-container">
              <div
                className="bg-brand rounded-l-full transition-all duration-500"
                style={{ width: `${week.parent_a_pct}%` }}
                aria-label={`${parentAName} ${week.parent_a_pct}%`}
              />
              <div
                className="bg-secondary rounded-r-full transition-all duration-500"
                style={{ width: `${week.parent_b_pct}%` }}
                aria-label={`${parentBName} ${week.parent_b_pct}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatWeekLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
