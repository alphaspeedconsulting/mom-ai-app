"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useMemoryStore } from "@/stores/memory-store";
import * as api from "@/lib/api-client";
import type { CalendarEvent, TaskItem } from "@/types/api-contracts";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Daily Morning Brief — the daily ritual trigger.
 * Synthesizes today's calendar, active inbox tasks, pending memories,
 * and agent insights into one glanceable card.
 */
export function DailyBrief() {
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;
  const { inbox, items: memories } = useMemoryStore();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    Promise.allSettled([
      api.calendar.list({ start_after: startOfDay, start_before: endOfDay }),
      api.tasks.list(),
    ]).then(([eventsResult, tasksResult]) => {
      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value.events ?? []);
      }
      if (tasksResult.status === "fulfilled") {
        setTasks(tasksResult.value.tasks?.filter((t) => t.status !== "completed") ?? []);
      }
      setLoading(false);
    });
  }, [householdId]);

  const activeInbox = inbox.filter((i) => i.status !== "done" && i.status !== "dismissed");
  const pinnedMemories = memories.filter((m) => m.pinned).slice(0, 3);
  const todayRoutines = memories
    .filter((m) => m.category === "routine")
    .slice(0, 3);
  const todayDates = memories
    .filter((m) => m.category === "important_date")
    .slice(0, 2);

  const todayEvents = events.filter((e) => isToday(e.start_at)).sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  const totalItems = todayEvents.length + activeInbox.length + tasks.length;

  if (loading) {
    return (
      <div className="mom-card p-5 space-y-3">
        <div className="h-5 w-40 mom-skeleton rounded" />
        <div className="h-4 w-full mom-skeleton rounded" />
        <div className="h-4 w-3/4 mom-skeleton rounded" />
        <div className="h-4 w-1/2 mom-skeleton rounded" />
      </div>
    );
  }

  return (
    <div className="mom-card overflow-hidden">
      {/* Header with gradient */}
      <div className="mom-gradient-hero px-5 py-4 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-alphaai-3xs uppercase tracking-widest opacity-70 font-medium text-on-primary">
          Today&apos;s Brief
        </p>
        <h2 className="font-headline text-alphaai-lg font-bold text-on-primary mt-0.5">
          Good {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h2>
        <p className="text-alphaai-xs text-on-primary/80 mt-1">
          {totalItems === 0
            ? "Your day is clear — enjoy it!"
            : `${totalItems} ${totalItems === 1 ? "thing" : "things"} on your plate today`}
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Today's schedule */}
        {todayEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-brand">calendar_month</span>
              <h3 className="text-alphaai-xs font-semibold text-foreground">Schedule</h3>
            </div>
            <div className="space-y-1.5">
              {todayEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="text-alphaai-3xs text-muted-foreground w-14 text-right flex-shrink-0">
                    {event.all_day ? "All day" : formatTime(event.start_at)}
                  </span>
                  <div
                    className="w-1 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.member_color ?? "hsl(var(--brand))" }}
                  />
                  <span className="text-alphaai-xs text-foreground truncate">
                    {event.title}
                  </span>
                  {event.member_name && (
                    <span className="text-alphaai-3xs text-muted-foreground flex-shrink-0">
                      {event.member_name}
                    </span>
                  )}
                </div>
              ))}
              {todayEvents.length > 5 && (
                <Link href="/calendar" className="text-alphaai-3xs text-brand font-medium">
                  +{todayEvents.length - 5} more events
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Active inbox tasks */}
        {activeInbox.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">inbox</span>
              <h3 className="text-alphaai-xs font-semibold text-foreground">Inbox</h3>
              <span className="text-alphaai-3xs text-muted-foreground">
                {activeInbox.length} pending
              </span>
            </div>
            <div className="space-y-1.5">
              {activeInbox.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  <span className="text-alphaai-xs text-foreground truncate flex-1">
                    {item.content}
                  </span>
                  {item.assigned_agent && (
                    <span className="mom-chip text-alphaai-3xs px-1.5 py-0">
                      {item.assigned_agent.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              ))}
              {activeInbox.length > 4 && (
                <Link href="/memory" className="text-alphaai-3xs text-brand font-medium">
                  +{activeInbox.length - 4} more tasks
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Active background tasks from agents */}
        {tasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-brand">task_alt</span>
              <h3 className="text-alphaai-xs font-semibold text-foreground">Agent Tasks</h3>
            </div>
            <div className="space-y-1.5">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-brand flex items-center justify-center flex-shrink-0">
                    {task.status === "completed" && (
                      <span className="material-symbols-outlined text-[10px] text-brand">check</span>
                    )}
                  </div>
                  <span className="text-alphaai-xs text-foreground truncate flex-1">
                    {task.title ?? "Processing..."}
                  </span>
                  <span className="text-alphaai-3xs text-muted-foreground">
                    {task.progress_pct}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Important dates & routines */}
        {(todayDates.length > 0 || todayRoutines.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">lightbulb</span>
              <h3 className="text-alphaai-xs font-semibold text-foreground">Remember</h3>
            </div>
            <div className="space-y-1">
              {todayDates.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-secondary">event</span>
                  <span className="text-alphaai-3xs text-foreground">{m.content}</span>
                </div>
              ))}
              {todayRoutines.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-brand">schedule</span>
                  <span className="text-alphaai-3xs text-foreground">{m.content}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pinned memories */}
        {pinnedMemories.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
              <h3 className="text-alphaai-xs font-semibold text-foreground">Pinned</h3>
            </div>
            <div className="space-y-1">
              {pinnedMemories.map((m) => (
                <p key={m.id} className="text-alphaai-3xs text-muted-foreground">
                  {m.content}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalItems === 0 && todayDates.length === 0 && todayRoutines.length === 0 && pinnedMemories.length === 0 && (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-[32px] text-muted-foreground/30 mb-2">
              wb_sunny
            </span>
            <p className="text-alphaai-xs text-muted-foreground">
              Nothing scheduled — use the + button to capture tasks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
