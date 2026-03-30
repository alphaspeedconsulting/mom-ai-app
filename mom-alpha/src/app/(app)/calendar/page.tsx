"use client";

import { useEffect, useState } from "react";
import { useCalendarStore } from "@/stores/calendar-store";
import type { CalendarEvent } from "@/types/api-contracts";
import { CalendarGridSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FILTERS = [
  { label: "All", value: "all" as const, color: null },
  { label: "Shared", value: "shared" as const, color: null },
  { label: "Mom", value: "mom" as const, color: "#32695a" },
  { label: "Kids", value: "kids" as const, color: "#8f4f14" },
];

export default function CalendarPage() {
  const { events, selectedDate, filter, isLoading, fetchEvents, setSelectedDate, setFilter, getEventsForDate } =
    useCalendarStore();

  const [viewMonth, setViewMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const todayEvents = getEventsForDate(selectedDate);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEventsForDay = (day: number): CalendarEvent[] => {
    return events.filter((e) => {
      const ed = new Date(e.start_at);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day;
    });
  };

  const isToday = (day: number) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const monthName = viewMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
            Family Calendar
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto mom-no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-alphaai-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? "bg-brand text-on-primary"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
            >
              {f.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-foreground">chevron_left</span>
          </button>
          <h2 className="font-headline text-alphaai-md font-semibold text-foreground">{monthName}</h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-foreground">chevron_right</span>
          </button>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <CalendarGridSkeleton />
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-alphaai-3xs text-muted-foreground font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;

                const dayEvents = getEventsForDay(day);
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-alphaai-sm transition-all ${
                      selected
                        ? "bg-brand/10 ring-2 ring-brand text-brand font-bold"
                        : today
                          ? "bg-surface-container-low font-semibold text-foreground"
                          : "bg-surface-container-low/50 text-foreground hover:bg-surface-container"
                    }`}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: e.member_color ?? "hsl(var(--brand))" }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Today's schedule */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>

          {todayEvents.length === 0 ? (
            <EmptyState
              icon="event_available"
              title="No events"
              description="Your schedule is clear for this day."
              action={{ label: "Add Event", onClick: () => {} }}
            />
          ) : (
            <div className="space-y-3">
              {todayEvents
                .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                .map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full mom-gradient-hero mom-editorial-shadow flex items-center justify-center z-30">
        <span className="material-symbols-outlined text-[24px] text-on-primary">add</span>
      </button>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const startTime = new Date(event.start_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = new Date(event.end_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="mom-card p-4 border-l-4 flex gap-3"
      style={{ borderLeftColor: event.member_color ?? "hsl(155, 37%, 30%)" }}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
          {event.title}
        </h4>
        <p className="text-alphaai-xs text-muted-foreground">
          {startTime} — {endTime}
          {event.member_name && ` · ${event.member_name}`}
        </p>
        {event.description && (
          <p className="text-alphaai-xs text-muted-foreground mt-1 truncate">
            {event.description}
          </p>
        )}
      </div>
      {event.source !== "internal" && (
        <span className="mom-chip text-alphaai-3xs self-start">
          {event.source === "google" ? "Google" : event.source === "apple" ? "Apple" : "School"}
        </span>
      )}
    </div>
  );
}
