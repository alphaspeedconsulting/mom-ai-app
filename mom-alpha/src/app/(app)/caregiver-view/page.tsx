"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api-client";
import type { CaregiverViewData } from "@/types/api-contracts";

/**
 * Limited caregiver view — accessed via ?token= query param.
 * Shows only the data the parent has permitted.
 * Read-only, no editing capabilities.
 */
export default function CaregiverViewPage() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("token");
  const [data, setData] = useState<CaregiverViewData | null>(null);
  const [loading, setLoading] = useState(!!accessToken);
  const [error, setError] = useState<string | null>(accessToken ? null : "No access token provided.");

  useEffect(() => {
    if (!accessToken) return;
    api.caregivers
      .getView(accessToken)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Access denied or link expired"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mom-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[24px] text-on-primary">spa</span>
          </div>
          <p className="text-alphaai-sm text-muted-foreground">Loading family info...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="mom-card p-8 text-center max-w-sm w-full">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground/30 mb-4">
            lock
          </span>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-alphaai-sm text-muted-foreground mb-6">
            {error ?? "This link is no longer valid."}
          </p>
          <Link href="/login?mode=signup" className="mom-btn-primary">
            Join Alpha.Mom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 mom-gradient-hero rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-on-primary">spa</span>
            </div>
            <div>
              <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
                {data.household_name}
              </h1>
              <p className="text-alphaai-3xs text-muted-foreground">
                Caregiver View · Read Only
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Family members */}
        {data.family_members.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-brand">group</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Family</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.family_members.map((m, i) => (
                <span key={i} className="mom-chip text-alphaai-xs">
                  {m.name}{m.age != null ? ` (${m.age})` : ""}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Today's schedule */}
        {data.today_schedule.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-brand">calendar_month</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Today&apos;s Schedule</h2>
            </div>
            <div className="space-y-2">
              {data.today_schedule.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="text-alphaai-3xs text-muted-foreground w-14 text-right flex-shrink-0">
                    {event.all_day
                      ? "All day"
                      : new Date(event.start_at).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                  </span>
                  <div
                    className="w-1 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.member_color ?? "hsl(var(--brand))" }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-alphaai-xs text-foreground truncate block">
                      {event.title}
                    </span>
                    {event.member_name && (
                      <span className="text-alphaai-3xs text-muted-foreground">
                        {event.member_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emergency contacts */}
        {data.emergency_contacts.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-error">emergency</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Emergency Contacts</h2>
            </div>
            <div className="space-y-3">
              {data.emergency_contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-alphaai-xs font-medium text-foreground">{contact.name}</p>
                    <p className="text-alphaai-3xs text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-glow/15 text-brand text-alphaai-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Allergies */}
        {data.allergies.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-secondary">warning</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Allergies</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.allergies.map((allergy, i) => (
                <span key={i} className="mom-chip-secondary text-alphaai-xs px-3 py-1">
                  {allergy}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Medications */}
        {data.medications.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-tertiary">medication</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Medications</h2>
            </div>
            <div className="space-y-2">
              {data.medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3">
                  <div>
                    <p className="text-alphaai-xs font-medium text-foreground">{med.medication}</p>
                    <p className="text-alphaai-3xs text-muted-foreground">For {med.member}</p>
                  </div>
                  <span className="text-alphaai-3xs text-muted-foreground">{med.schedule}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Routines */}
        {data.routines.length > 0 && (
          <section className="mom-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-brand">schedule</span>
              <h2 className="text-alphaai-sm font-semibold text-foreground">Routines</h2>
            </div>
            <div className="space-y-2">
              {data.routines.map((routine, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-alphaai-3xs text-muted-foreground w-14 text-right flex-shrink-0">
                    {routine.time}
                  </span>
                  <span className="text-alphaai-xs text-foreground">{routine.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Powered by footer */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-5 h-5 mom-gradient-hero rounded-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-on-primary">spa</span>
            </div>
            <span className="text-alphaai-3xs text-muted-foreground">
              Powered by Alpha.Mom
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
