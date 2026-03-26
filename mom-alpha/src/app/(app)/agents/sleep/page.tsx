"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { SleepEntry, SleepHistoryResponse } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const QUALITY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  great: { icon: "sentiment_very_satisfied", label: "Great", color: "text-brand" },
  good: { icon: "sentiment_satisfied", label: "Good", color: "text-brand" },
  fair: { icon: "sentiment_neutral", label: "Fair", color: "text-secondary" },
  poor: { icon: "sentiment_dissatisfied", label: "Poor", color: "text-error" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function SleepTrackerPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<SleepHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    if (!user?.household_id) return;

    api.sleep
      .history(user.household_id, 30)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.household_id]);

  const handleLog = async (entry: {
    sleep_at: string;
    wake_at: string;
    quality: string;
  }) => {
    if (!user?.household_id) return;
    try {
      const updated = await api.sleep.log(user.household_id, {
        sleep_at: entry.sleep_at,
        wake_at: entry.wake_at,
        quality: entry.quality as "great" | "good" | "fair" | "poor",
      });
      setData(updated);
      setShowLogForm(false);
    } catch {
      // Handle error
    }
  };

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
              Sleep Tracker
            </h1>
          </div>
          <Link
            href="/chat/sleep_tracker"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">chat</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Stats overview */}
        <section className="mom-gradient-hero rounded-2xl p-5 text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-80 mb-1">
              Sleep Overview
            </p>
            <h2 className="font-headline text-alphaai-lg font-bold">
              {data
                ? `${data.avg_duration_hours.toFixed(1)}h avg`
                : "Start tracking"}
            </h2>
            {data && data.avg_quality_score > 0 && (
              <p className="text-alphaai-sm opacity-80 mt-1">
                Quality score: {data.avg_quality_score.toFixed(1)}/4.0
              </p>
            )}
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[8rem] opacity-10">
            bedtime
          </span>
        </section>

        {/* Weekly pattern */}
        {data && Object.keys(data.weekly_pattern).length > 0 && (
          <section>
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Weekly Pattern
            </h3>
            <div className="mom-card p-4">
              <div className="flex justify-between items-end gap-1">
                {DAYS.map((day) => {
                  const dayFull =
                    day === "Sun" ? "Sunday" :
                    day === "Mon" ? "Monday" :
                    day === "Tue" ? "Tuesday" :
                    day === "Wed" ? "Wednesday" :
                    day === "Thu" ? "Thursday" :
                    day === "Fri" ? "Friday" : "Saturday";
                  const hours = data.weekly_pattern[dayFull] ?? 0;
                  const maxH = 10;
                  const pct = Math.min(hours / maxH * 100, 100);
                  return (
                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-alphaai-3xs text-muted-foreground font-medium">
                        {hours > 0 ? `${hours.toFixed(1)}h` : "-"}
                      </span>
                      <div className="w-full h-20 bg-surface-input rounded-lg relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-lg bg-brand/60"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-alphaai-3xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Log button */}
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="mom-btn-primary w-full"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Log Sleep
        </button>

        {/* Log form */}
        {showLogForm && <SleepLogForm onSubmit={handleLog} />}

        {/* Recent entries */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Recent Entries
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : !data || data.entries.length === 0 ? (
            <EmptyState
              icon="bedtime"
              title="No sleep data yet"
              description="Log your first sleep entry to start tracking patterns."
            />
          ) : (
            <div className="space-y-2">
              {data.entries.slice(0, 10).map((entry) => (
                <SleepEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SleepEntryCard({ entry }: { entry: SleepEntry }) {
  const config = QUALITY_CONFIG[entry.quality] ?? QUALITY_CONFIG.fair;
  const date = new Date(entry.sleep_at);

  return (
    <div className="mom-card p-4 flex items-center gap-3">
      <div className="flex flex-col items-center justify-center bg-surface-container-low min-w-[48px] h-[48px] rounded-xl">
        <span className="text-alphaai-3xs font-bold text-brand uppercase">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-alphaai-base font-bold text-foreground">
          {date.getDate()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-alphaai-sm font-semibold text-foreground">
          {entry.duration_hours.toFixed(1)} hours
        </p>
        <p className="text-alphaai-xs text-muted-foreground">
          {new Date(entry.sleep_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {" - "}
          {new Date(entry.wake_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {entry.member_name && ` · ${entry.member_name}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className={`material-symbols-outlined text-[20px] ${config.color}`}>
          {config.icon}
        </span>
        <span className="text-alphaai-3xs text-muted-foreground">{config.label}</span>
      </div>
    </div>
  );
}

function SleepLogForm({
  onSubmit,
}: {
  onSubmit: (entry: { sleep_at: string; wake_at: string; quality: string }) => void;
}) {
  const [sleepAt, setSleepAt] = useState("");
  const [wakeAt, setWakeAt] = useState("");
  const [quality, setQuality] = useState("good");

  return (
    <div className="mom-card p-4 space-y-4">
      <h4 className="font-headline text-alphaai-base font-semibold text-foreground">
        Log Sleep Entry
      </h4>
      <div className="space-y-3">
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">Bedtime</label>
          <input
            type="datetime-local"
            value={sleepAt}
            onChange={(e) => setSleepAt(e.target.value)}
            className="mom-input"
          />
        </div>
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">Wake time</label>
          <input
            type="datetime-local"
            value={wakeAt}
            onChange={(e) => setWakeAt(e.target.value)}
            className="mom-input"
          />
        </div>
        <div>
          <label className="text-alphaai-xs text-muted-foreground mb-1 block">Quality</label>
          <div className="flex gap-2">
            {(["great", "good", "fair", "poor"] as const).map((q) => {
              const cfg = QUALITY_CONFIG[q];
              return (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 rounded-xl text-alphaai-xs font-medium transition-colors ${
                    quality === q
                      ? "bg-brand text-on-primary"
                      : "bg-surface-container text-muted-foreground"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          if (sleepAt && wakeAt) {
            onSubmit({
              sleep_at: new Date(sleepAt).toISOString(),
              wake_at: new Date(wakeAt).toISOString(),
              quality,
            });
          }
        }}
        disabled={!sleepAt || !wakeAt}
        className="mom-btn-primary w-full disabled:opacity-50"
      >
        Save Entry
      </button>
    </div>
  );
}
