"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { PermissionSlip, CalendarEvent } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export default function SchoolEventHubPage() {
  const user = useAuthStore((s) => s.user);
  const [slips, setSlips] = useState<PermissionSlip[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.household_id) return;

    async function load() {
      try {
        const [slipsData, eventsData] = await Promise.all([
          api.slips.list(user!.household_id!),
          api.calendar.list(),
        ]);
        setSlips(slipsData);
        setEvents(eventsData.events.filter((e) => e.source === "school"));
      } catch {
        // Silently handle — empty state will show
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user?.household_id]);

  const pendingSlips = slips.filter((s) => s.status === "pending");

  const handleSign = async (slipId: string) => {
    try {
      const updated = await api.slips.sign(slipId);
      setSlips((prev) => prev.map((s) => (s.id === slipId ? updated : s)));
    } catch {
      // Handle error silently
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">
              arrow_back
            </span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              School Event Hub
            </h1>
          </div>
          <Link
            href="/chat/school_event_hub"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">
              chat
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Hero — Active Sync Status */}
        <section className="mom-gradient-hero rounded-2xl p-5 text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-primary/60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-on-primary" />
              </div>
              <span className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-80">
                Active Sync
              </span>
            </div>
            <h2 className="font-headline text-alphaai-lg font-bold mb-1">
              School Events
            </h2>
            <p className="text-alphaai-sm opacity-80">
              Monitoring school emails for events, slips, and deadlines.
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[8rem] opacity-10">
            school
          </span>
        </section>

        {/* Needs Attention — Permission Slips */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground">
              Needs Attention
            </h3>
            {pendingSlips.length > 0 && (
              <span className="mom-chip-secondary text-alphaai-3xs py-1 px-3">
                {pendingSlips.length} Pending
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : pendingSlips.length === 0 ? (
            <EmptyState
              icon="check_circle"
              title="All caught up!"
              description="No pending permission slips or actions needed."
            />
          ) : (
            <div className="space-y-3">
              {pendingSlips.map((slip) => (
                <div
                  key={slip.id}
                  className="mom-card p-4 border-l-4 border-l-secondary"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-alphaai-base font-semibold text-foreground">
                        {slip.title}
                      </h4>
                      {slip.description && (
                        <p className="text-alphaai-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {slip.description}
                        </p>
                      )}
                    </div>
                    {slip.due_date && (
                      <span className="text-alphaai-3xs font-bold text-secondary uppercase tracking-wide ml-2 whitespace-nowrap">
                        Due {new Date(slip.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSign(slip.id)}
                      className="flex-1 bg-secondary text-on-secondary py-2.5 rounded-full font-headline font-semibold text-alphaai-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      Sign Slip
                      <span className="material-symbols-outlined text-[16px]">draw</span>
                    </button>
                    {slip.fee_amount && (
                      <button className="flex-1 bg-tertiary text-on-tertiary py-2.5 rounded-full font-headline font-semibold text-alphaai-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
                        Pay ${slip.fee_amount.toFixed(2)}
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming School Events */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground">
              School Events
            </h3>
            <Link
              href="/calendar"
              className="text-alphaai-sm font-semibold text-brand flex items-center gap-0.5"
            >
              Full Calendar
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="event"
              title="No school events"
              description="School events will appear here when detected from emails."
            />
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => {
                const date = new Date(event.start_at);
                return (
                  <div
                    key={event.id}
                    className="mom-card p-4 flex items-center gap-4"
                  >
                    <div className="flex flex-col items-center justify-center bg-surface-container-low min-w-[56px] h-[56px] rounded-xl">
                      <span className="text-alphaai-3xs font-bold text-brand uppercase">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-alphaai-lg font-bold text-foreground">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
                        {event.title}
                      </h5>
                      <p className="text-alphaai-xs text-muted-foreground">
                        {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {event.description && ` · ${event.description}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Signed Slips */}
        {slips.filter((s) => s.status === "signed").length > 0 && (
          <section>
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Completed
            </h3>
            <div className="space-y-2">
              {slips
                .filter((s) => s.status === "signed")
                .map((slip) => (
                  <div key={slip.id} className="mom-card p-3 flex items-center gap-3 opacity-70">
                    <span className="material-symbols-outlined text-[20px] text-brand">
                      check_circle
                    </span>
                    <span className="text-alphaai-sm text-foreground flex-1 truncate">
                      {slip.title}
                    </span>
                    <span className="text-alphaai-3xs text-muted-foreground">
                      Signed
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
