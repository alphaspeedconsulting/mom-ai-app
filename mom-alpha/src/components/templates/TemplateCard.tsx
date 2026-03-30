"use client";

import React from "react";
import Link from "next/link";
import type { FamilyTemplate, TemplateCategory } from "@/types/api-contracts";

const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  routine: "schedule",
  meal_plan: "restaurant",
  chore_chart: "cleaning_services",
  school_prep: "school",
  bedtime: "bedtime",
  budget: "account_balance_wallet",
  other: "category",
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  routine: "Routine",
  meal_plan: "Meal Plan",
  chore_chart: "Chores",
  school_prep: "School Prep",
  bedtime: "Bedtime",
  budget: "Budget",
  other: "Other",
};

interface TemplateCardProps {
  template: FamilyTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      href={`/templates/detail?id=${template.id}`}
      className="mom-card p-4 hover:bg-surface-container-low transition-colors block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-glow/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-brand">
            {CATEGORY_ICONS[template.category]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-alphaai-sm font-semibold text-foreground truncate">
            {template.title}
          </h3>
          <p className="text-alphaai-3xs text-muted-foreground line-clamp-2 mt-0.5">
            {template.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-alphaai-3xs text-muted-foreground">
              by {template.author_name}
            </span>
            <span className="flex items-center gap-0.5 text-alphaai-3xs text-muted-foreground">
              <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              {template.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-0.5 text-alphaai-3xs text-muted-foreground">
              <span className="material-symbols-outlined text-[12px]">group</span>
              {template.uses_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="mom-chip text-alphaai-3xs px-2 py-0.5">
              {tag}
            </span>
          ))}
          <span className="mom-chip-secondary text-alphaai-3xs px-2 py-0.5">
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>
      )}
    </Link>
  );
}

export { CATEGORY_ICONS, CATEGORY_LABELS };
