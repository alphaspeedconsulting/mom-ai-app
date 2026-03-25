"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { WellnessStreak, CalendarEvent } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const STREAK_ICONS: Record<string, string> = {
  exercise: "fitness_center",
  hydration: "water_drop",
  sleep: "bedtime",
  meditation: "self_improvement",
  vitamins: "medication",
  skincare: "spa",
  steps: "directions_walk",
};

export default function WellnessHubPage() {
  const user = useAuthStore((s) => s.user);
  const [streaks, setStreaks] = useState<WellnessStreak[]>([]);
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.household_id) return;

    async function load() {
      try {
        const [streaksData, eventsData] = await Promise.all([
          api.wellness.getStreaks(user!.household_id!),
          api.calendar.list(),
        ]);
        setStreaks(streaksData);
        // Filter for health-related events
        setAppointments(
          eventsData.events.filter(
            (e) =>
              e.title.toLowerCase().includes("doctor") ||
              e.title.toLowerCase().includes("dentist") ||
              e.title.toLowerCase().includes("appointment") ||
              e.title.toLowerCase().includes("checkup") ||
              e.title.toLowerCase().includes("health")
          )
        );
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user?.household_id]);

  const handleLogStreak = async (streakType: string) => {
    if (!user?.household_id) return;
    try {
      const updated = await api.wellness.logStreak(user.household_id, streakType);
      setStreaks((prev) =>
        prev.map((s) => (s.streak_type === streakType ? updated : s))
      );
    } catch {
      // Handle error
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Wellness Hub
            </h1>
          </div>
          <Link
            href="/chat/health_hub"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">chat</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Status overview */}
        <section className="mom-gradient-hero rounded-2xl p-5 text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-80 mb-1">
              Family Wellness
            </p>
            <h2 className="font-headline text-alphaai-lg font-bold">
              {streaks.length > 0
                ? `${streaks.filter((s) => s.current_streak > 0).length} active streaks`
                : "Start tracking today"}
            </h2>
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[8rem] opacity-10">
            health_and_safety
          </span>
        </section>

        {/* Wellness Streaks */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Streaks
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : streaks.length === 0 ? (
            <EmptyState
              icon="local_fire_department"
              title="No streaks yet"
              description="Start tracking wellness activities to build streaks."
              action={{
                label: "Log Activity",
                onClick: () => handleLogStreak("exercise"),
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {streaks.map((streak) => (
                <button
                  key={streak.id}
                  onClick={() => handleLogStreak(streak.streak_type)}
                  className="mom-card p-4 text-left hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[20px] text-brand">
                      {STREAK_ICONS[streak.streak_type] ?? "local_fire_department"}
                    </span>
                    <span className="text-alphaai-xs text-muted-foreground capitalize">
                      {streak.streak_type}
                    </span>
                  </div>
                  <p className="font-headline text-alphaai-xl font-bold text-foreground">
                    {streak.current_streak}
                  </p>
                  <p className="text-alphaai-3xs text-muted-foreground">
                    day streak · best {streak.longest_streak}
                  </p>
                  {streak.member_name && (
                    <span className="mom-chip text-alphaai-3xs mt-2">
                      {streak.member_name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Upcoming Appointments
          </h3>
          {isLoading ? (
            <CardSkeleton />
          ) : appointments.length === 0 ? (
            <EmptyState
              icon="event"
              title="No appointments"
              description="Health appointments will appear here."
            />
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 5).map((event) => {
                const date = new Date(event.start_at);
                return (
                  <div key={event.id} className="mom-card p-4 flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-surface-container-low min-w-[48px] h-[48px] rounded-xl">
                      <span className="text-alphaai-3xs font-bold text-brand uppercase">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-alphaai-base font-bold text-foreground">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-alphaai-sm font-semibold text-foreground truncate">
                        {event.title}
                      </p>
                      <p className="text-alphaai-xs text-muted-foreground">
                        {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {event.member_name && ` · ${event.member_name}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
