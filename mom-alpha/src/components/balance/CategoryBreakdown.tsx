"use client";

import React from "react";

interface CategoryBreakdownProps {
  categories: Array<{ category: string; parent_a_pct: number; parent_b_pct: number }>;
  parentAName: string;
  parentBName: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  calendar: "calendar_month",
  meals: "restaurant",
  school: "school",
  budget: "account_balance_wallet",
  health: "favorite",
  chores: "cleaning_services",
  errands: "directions_car",
  other: "more_horiz",
};

/**
 * Per-category task split breakdown between co-parents.
 */
export function CategoryBreakdown({ categories, parentAName, parentBName }: CategoryBreakdownProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h3 className="text-alphaai-xs font-semibold text-foreground mb-3">
        By Category
      </h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.category} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                {CATEGORY_ICONS[cat.category] ?? CATEGORY_ICONS.other}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-alphaai-xs text-foreground capitalize mb-1">
                {cat.category}
              </p>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-container">
                <div
                  className="bg-brand rounded-l-full"
                  style={{ width: `${cat.parent_a_pct}%` }}
                  aria-label={`${parentAName} ${cat.parent_a_pct}%`}
                />
                <div
                  className="bg-secondary rounded-r-full"
                  style={{ width: `${cat.parent_b_pct}%` }}
                  aria-label={`${parentBName} ${cat.parent_b_pct}%`}
                />
              </div>
            </div>
            <span className="text-alphaai-3xs text-muted-foreground flex-shrink-0 w-16 text-right">
              {cat.parent_a_pct}% / {cat.parent_b_pct}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
