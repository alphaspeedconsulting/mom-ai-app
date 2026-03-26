"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { SelfCareReminder, SelfCareListResponse } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  relaxation: { icon: "spa", label: "Relaxation" },
  exercise: { icon: "fitness_center", label: "Exercise" },
  social: { icon: "group", label: "Social" },
  hobby: { icon: "palette", label: "Hobby" },
  rest: { icon: "self_improvement", label: "Rest" },
  custom: { icon: "favorite", label: "Custom" },
};

export default function SelfCarePage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<SelfCareListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = async () => {
    if (!user?.household_id) return;
    try {
      const result = await api.selfCare.list(user.household_id);
      setData(result);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.household_id]);

  const handleComplete = async (reminderId: string) => {
    if (!user?.household_id) return;
    try {
      await api.selfCare.complete(user.household_id, reminderId);
      await loadData();
    } catch {
      // Handle error
    }
  };

  const handleSnooze = async (reminderId: string) => {
    if (!user?.household_id) return;
    try {
      await api.selfCare.snooze(user.household_id, reminderId, 15);
      await loadData();
    } catch {
      // Handle error
    }
  };

  const handleCreate = async (body: {
    title: string;
    category: string;
    remind_at: string;
  }) => {
    if (!user?.household_id) return;
    try {
      await api.selfCare.create(user.household_id, {
        title: body.title,
        category: body.category as SelfCareReminder["category"],
        remind_at: body.remind_at,
      });
      setShowCreate(false);
      await loadData();
    } catch {
      // Handle error
    }
  };

  const pending = data?.reminders.filter((r) => !r.completed_at) ?? [];
  const completed = data?.reminders.filter((r) => r.completed_at) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Self-Care
            </h1>
          </div>
          <Link
            href="/chat/self_care_reminder"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">chat</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Stats hero */}
        <section className="mom-gradient-hero rounded-2xl p-5 text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-80 mb-1">
              Mom Moments
            </p>
            <h2 className="font-headline text-alphaai-lg font-bold">
              {data
                ? data.streak_days > 0
                  ? `${data.streak_days} day streak`
                  : `${data.completed_today} done today`
                : "Take a moment for you"}
            </h2>
            {data && data.completed_today > 0 && data.streak_days > 0 && (
              <p className="text-alphaai-sm opacity-80 mt-1">
                {data.completed_today} completed today
              </p>
            )}
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[8rem] opacity-10">
            self_improvement
          </span>
        </section>

        {/* Quick add */}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mom-btn-primary w-full"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Self-Care Reminder
        </button>

        {/* Create form */}
        {showCreate && <CreateForm onSubmit={handleCreate} />}

        {/* Pending reminders */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Upcoming
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon="self_improvement"
              title="No reminders"
              description="Create a self-care reminder to start taking Mom Moments."
              action={{
                label: "Add Reminder",
                onClick: () => setShowCreate(true),
              }}
            />
          ) : (
            <div className="space-y-2">
              {pending.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={() => handleComplete(reminder.id)}
                  onSnooze={() => handleSnooze(reminder.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed today */}
        {completed.length > 0 && (
          <section>
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Completed
            </h3>
            <div className="space-y-2">
              {completed.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="mom-card p-4 flex items-center gap-3 opacity-60"
                >
                  <span className="material-symbols-outlined text-[20px] text-brand">
                    check_circle
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-alphaai-sm text-foreground line-through truncate">
                      {reminder.title}
                    </p>
                  </div>
                  <span className="mom-chip text-alphaai-3xs">
                    {CATEGORY_CONFIG[reminder.category]?.label ?? reminder.category}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ReminderCard({
  reminder,
  onComplete,
  onSnooze,
}: {
  reminder: SelfCareReminder;
  onComplete: () => void;
  onSnooze: () => void;
}) {
  const config = CATEGORY_CONFIG[reminder.category] ?? CATEGORY_CONFIG.custom;
  const remindDate = new Date(reminder.remind_at);
  const isSnoozed = reminder.snoozed_until && new Date(reminder.snoozed_until) > new Date();

  return (
    <div className="mom-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-tertiary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-tertiary">
            {config.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-alphaai-base font-semibold text-foreground truncate">
            {reminder.title}
          </h4>
          <p className="text-alphaai-xs text-muted-foreground">
            {remindDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
            {" · "}
            {config.label}
            {reminder.recurring && " · Recurring"}
          </p>
          {isSnoozed && (
            <p className="text-alphaai-3xs text-secondary mt-1">
              Snoozed until{" "}
              {new Date(reminder.snoozed_until!).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
          {reminder.description && (
            <p className="text-alphaai-xs text-muted-foreground mt-1 line-clamp-2">
              {reminder.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onComplete}
          className="flex-1 mom-btn-primary py-2 text-alphaai-sm"
        >
          Done
        </button>
        <button
          onClick={onSnooze}
          className="flex-1 mom-btn-outline py-2 text-alphaai-sm"
        >
          Snooze 15m
        </button>
      </div>
    </div>
  );
}

function CreateForm({
  onSubmit,
}: {
  onSubmit: (body: { title: string; category: string; remind_at: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("relaxation");
  const [remindAt, setRemindAt] = useState("");

  return (
    <div className="mom-card p-4 space-y-4">
      <h4 className="font-headline text-alphaai-base font-semibold text-foreground">
        New Self-Care Reminder
      </h4>
      <div className="space-y-3">
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">
            What would you like to do?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Take a 10-minute walk"
            className="mom-input"
          />
        </div>
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-full text-alphaai-xs font-medium flex items-center gap-1.5 transition-colors ${
                  category === key
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">Remind at</label>
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            className="mom-input"
          />
        </div>
      </div>
      <button
        onClick={() => {
          if (title && remindAt) {
            onSubmit({
              title,
              category,
              remind_at: new Date(remindAt).toISOString(),
            });
          }
        }}
        disabled={!title || !remindAt}
        className="mom-btn-primary w-full disabled:opacity-50"
      >
        Create Reminder
      </button>
    </div>
  );
}
