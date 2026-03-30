"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useGoalsStore } from "@/stores/goals-store";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { ShareButton } from "@/components/shared/ShareButton";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import * as api from "@/lib/api-client";
import type { FamilyGoal, GoalType } from "@/types/api-contracts";

const GOAL_ICONS: Record<GoalType, string> = {
  savings: "savings",
  meals: "restaurant",
  exercise: "fitness_center",
  sleep: "bedtime",
  tasks: "task_alt",
  custom: "flag",
};

const GOAL_LABELS: Record<GoalType, string> = {
  savings: "Savings",
  meals: "Meals",
  exercise: "Exercise",
  sleep: "Sleep",
  tasks: "Tasks",
  custom: "Custom",
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;
  const { goals, isLoading, fetchGoals } = useGoalsStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    if (householdId) fetchGoals(householdId);
  }, [isClient, token, householdId, fetchGoals, router]);

  const activeGoals = goals.filter((g) => !g.completed_at);
  const completedGoals = goals.filter((g) => g.completed_at);

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
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
              Family Goals
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Track progress together
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
            aria-label="Create goal"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">add</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon="flag"
            title="No goals yet"
            description="Set a family goal — like saving $500 or cooking at home 5x/week."
          />
        ) : (
          <>
            {/* Active goals */}
            {activeGoals.length > 0 && (
              <section>
                <h2 className="text-alphaai-xs font-semibold text-foreground mb-3">
                  Active ({activeGoals.length})
                </h2>
                <div className="space-y-3">
                  {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <section>
                <h2 className="text-alphaai-xs font-semibold text-muted-foreground mb-3">
                  Completed ({completedGoals.length})
                </h2>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showCreate && householdId && (
        <CreateGoalModal
          householdId={householdId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            if (householdId) fetchGoals(householdId);
          }}
        />
      )}
    </div>
  );
}

function GoalCard({ goal }: { goal: FamilyGoal }) {
  const isComplete = !!goal.completed_at;
  const pct = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;

  return (
    <div className={`mom-card p-4 flex items-center gap-4 ${isComplete ? "opacity-60" : ""}`}>
      <GoalProgress current={goal.current_value} target={goal.target_value} size={56} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-brand">
            {GOAL_ICONS[goal.goal_type]}
          </span>
          <h3 className="text-alphaai-sm font-semibold text-foreground truncate">
            {goal.title}
          </h3>
        </div>
        <p className="text-alphaai-3xs text-muted-foreground mt-0.5">
          {goal.current_value} / {goal.target_value} {goal.unit} · {goal.period}
        </p>
      </div>
      {isComplete ? (
        <span className="material-symbols-outlined text-[24px] text-brand" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      ) : (
        <ShareButton
          itemType="task"
          title={`Family goal: ${goal.title} — ${pct}% done!`}
          compact
        />
      )}
    </div>
  );
}

function CreateGoalModal({
  householdId,
  onClose,
  onSuccess,
}: {
  householdId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("tasks");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("tasks");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !target) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.goals.create(householdId, {
        title: title.trim(),
        goal_type: goalType,
        target_value: Number(target),
        unit,
        period,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setSubmitting(false);
    }
  }, [householdId, title, goalType, target, unit, period, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-alphaai-lg font-bold text-foreground">
            New Family Goal
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Goal type */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(GOAL_LABELS) as GoalType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setGoalType(type);
                  setUnit(type === "savings" ? "$" : type === "custom" ? "" : type);
                }}
                className={`px-3 py-2 rounded-full text-alphaai-xs font-medium transition-colors flex items-center gap-1.5 ${
                  goalType === type
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {GOAL_ICONS[type]}
                </span>
                {GOAL_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="goal-title" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Goal
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cook at home 5 nights this week"
            className="mom-input"
          />
        </div>

        {/* Target + unit */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="goal-target" className="text-alphaai-xs font-medium text-foreground mb-1 block">
              Target
            </label>
            <input
              id="goal-target"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="5"
              className="mom-input"
              min={1}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="goal-unit" className="text-alphaai-xs font-medium text-foreground mb-1 block">
              Unit
            </label>
            <input
              id="goal-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="meals, $, hours..."
              className="mom-input"
            />
          </div>
        </div>

        {/* Period */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">Period</p>
          <div className="flex gap-2">
            {(["weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 px-4 py-2.5 rounded-full text-alphaai-sm font-medium transition-colors ${
                  period === p
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                {p === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-alphaai-xs text-error">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !target || submitting}
          className="mom-btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Set Goal"}
        </button>
      </div>
    </div>
  );
}
