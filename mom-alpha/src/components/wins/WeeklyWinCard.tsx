"use client";

import React from "react";
import type { WeeklyWinSummary, AgentType } from "@/types/api-contracts";

const AGENT_LABELS: Record<AgentType, string> = {
  calendar_whiz: "Calendar Whiz",
  grocery_guru: "Grocery Guru",
  budget_buddy: "Budget Buddy",
  school_event_hub: "School Event Hub",
  tutor_finder: "Tutor Finder",
  health_hub: "Health Hub",
  sleep_tracker: "Sleep Tracker",
  self_care_reminder: "Self-Care",
};

const AGENT_ICONS: Record<AgentType, string> = {
  calendar_whiz: "calendar_month",
  grocery_guru: "grocery",
  budget_buddy: "account_balance_wallet",
  school_event_hub: "school",
  tutor_finder: "menu_book",
  health_hub: "favorite",
  sleep_tracker: "bedtime",
  self_care_reminder: "spa",
};

interface WeeklyWinCardProps {
  win: WeeklyWinSummary;
  userName?: string;
}

/**
 * Shareable weekly family accomplishment card.
 * Rendered as a styled div — captured to canvas by WinCardRenderer for sharing.
 */
export function WeeklyWinCard({ win, userName }: WeeklyWinCardProps) {
  const weekLabel = formatWeekRange(win.week_start, win.week_end);

  return (
    <div className="mom-win-card overflow-hidden rounded-2xl" id="win-card">
      {/* Header gradient */}
      <div className="mom-gradient-hero px-6 py-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <p className="text-alphaai-3xs uppercase tracking-widest opacity-70 text-on-primary">
          Weekly Wins
        </p>
        <h2 className="font-headline text-alphaai-xl font-bold text-on-primary mt-1">
          {userName ? `${userName}'s Week` : "This Week's Wins"}
        </h2>
        <p className="text-alphaai-xs text-on-primary/80 mt-0.5">{weekLabel}</p>
      </div>

      {/* Stats grid */}
      <div className="bg-surface px-6 py-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <StatBlock
            icon="task_alt"
            value={win.tasks_completed}
            label="Tasks Done"
          />
          <StatBlock
            icon="calendar_month"
            value={win.events_managed}
            label="Events Managed"
          />
          <StatBlock
            icon="restaurant"
            value={win.meals_planned}
            label="Meals Planned"
          />
          <StatBlock
            icon="savings"
            value={win.dollars_saved > 0 ? `$${win.dollars_saved}` : "—"}
            label="Saved"
          />
        </div>

        {/* Streak + top agent */}
        <div className="flex items-center justify-between border-t border-border-subtle/10 pt-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <span className="text-alphaai-sm font-semibold text-foreground">
              {win.streak_days} day streak
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-brand">
              {AGENT_ICONS[win.top_agent]}
            </span>
            <span className="text-alphaai-3xs text-muted-foreground">
              MVP: {AGENT_LABELS[win.top_agent]}
            </span>
          </div>
        </div>

        {/* AI highlight */}
        {win.personal_highlight && (
          <div className="bg-brand-glow/10 rounded-xl px-4 py-3 mb-4">
            <p className="text-alphaai-xs text-foreground italic leading-relaxed">
              &ldquo;{win.personal_highlight}&rdquo;
            </p>
          </div>
        )}

        {/* Branding watermark */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <div className="w-5 h-5 mom-gradient-hero rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[10px] text-on-primary">spa</span>
          </div>
          <span className="text-alphaai-3xs text-muted-foreground font-medium">
            Alpha.Mom
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-glow/15 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[20px] text-brand">{icon}</span>
      </div>
      <div>
        <p className="text-alphaai-lg font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-alphaai-3xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}
