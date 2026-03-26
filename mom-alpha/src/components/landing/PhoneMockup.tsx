"use client";

import { useState, useEffect } from "react";
import { CardAccent } from "@/components/shared/CardAccent";

const NAV = [
  { key: "home", icon: "home", label: "Home" },
  { key: "tasks", icon: "task_alt", label: "Tasks" },
  { key: "calendar", icon: "calendar_month", label: "Calendar" },
  { key: "profile", icon: "person", label: "Profile" },
] as const;

type TabKey = (typeof NAV)[number]["key"];

type Screen = {
  name: string;
  activeTab: TabKey;
};

const screens: Screen[] = [
  {
    name: "Family Calendar",
    activeTab: "calendar",
  },
  {
    name: "Agent Chat",
    activeTab: "home",
  },
  {
    name: "Budget Buddy",
    activeTab: "home",
  },
  {
    name: "School Event Hub",
    activeTab: "tasks",
  },
];

function CalendarMock() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex gap-1 overflow-x-auto mom-no-scrollbar">
        {[
          { label: "All", on: true },
          { label: "Shared", on: false },
          { label: "Mom", on: false, dot: "hsl(155, 37%, 30%)" },
        ].map((c) => (
          <span
            key={c.label}
            className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium ${
              c.on ? "bg-brand text-on-primary" : "bg-surface-container text-muted-foreground"
            }`}
          >
            {c.dot && (
              <span
                className="mr-0.5 inline-block h-1 w-1 rounded-full align-middle"
                style={{ backgroundColor: c.dot }}
              />
            )}
            {c.label}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between px-0.5">
        <button type="button" className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-[12px] text-foreground">chevron_left</span>
        </button>
        <p className="font-headline text-[10px] font-semibold text-foreground">March 2026</p>
        <button type="button" className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-[12px] text-foreground">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => (
          <div key={`dow-${idx}`} className="text-center text-[7px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day) => {
          const sel = day === 26;
          const has = [3, 17, 26].includes(day);
          return (
            <button
              key={day}
              type="button"
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-[8px] transition-colors ${
                sel
                  ? "bg-brand/10 font-bold text-brand ring-2 ring-brand"
                  : "bg-surface-container-low/80 text-foreground"
              }`}
            >
              <span>{day}</span>
              {has && (
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-secondary" />
                  {day === 17 && <span className="h-1 w-1 rounded-full bg-tertiary" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="pt-0.5 font-headline text-[9px] font-semibold text-foreground">Wednesday, March 26</p>
      <div className="flex flex-col gap-1.5">
        <CardAccent colorVar="hsl(var(--secondary))">
          <div className="p-2 pl-2.5">
            <p className="truncate font-headline text-[9px] font-semibold text-foreground">School Pickup</p>
            <p className="text-[7px] text-muted-foreground">3:30 PM — 4:00 PM · Emma</p>
          </div>
        </CardAccent>
        <CardAccent colorVar="hsl(var(--tertiary))">
          <div className="flex flex-col gap-1 p-2 pl-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-headline text-[9px] font-semibold leading-tight text-foreground">Piano Lesson</p>
                <p className="text-[7px] text-muted-foreground">4:00 PM — 5:00 PM</p>
              </div>
              <span className="shrink-0 rounded-full bg-tertiary-container px-1.5 py-0.5 text-[6px] font-medium text-tertiary">
                Google
              </span>
            </div>
          </div>
        </CardAccent>
      </div>
    </div>
  );
}

function BudgetMock() {
  const cats = [
    { icon: "shopping_basket", label: "Groceries", amt: "$842", tint: "bg-brand-glow/35 text-foreground" },
    { icon: "bolt", label: "Utilities", amt: "$186", tint: "bg-secondary-container/60 text-foreground" },
    { icon: "child_care", label: "Kids", amt: "$1,250", tint: "bg-tertiary-container/60 text-foreground" },
    { icon: "movie", label: "Fun", amt: "$64", tint: "bg-surface-container text-foreground" },
  ];
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-glow p-3 text-on-primary mom-editorial-shadow">
        <div className="relative z-10">
          <p className="mb-0.5 text-[7px] font-bold uppercase tracking-widest opacity-90">Household Health</p>
          <p className="font-headline text-lg font-bold leading-tight">$2,847.12</p>
          <div className="mt-0.5 flex items-center gap-0.5 opacity-90">
            <span className="material-symbols-outlined text-[12px]">trending_flat</span>
            <span className="text-[8px]">On track this month</span>
          </div>
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[3.5rem] text-on-primary opacity-[0.12]">
          account_balance_wallet
        </span>
      </div>
      <button
        type="button"
        className="mom-card flex w-full items-center gap-2 p-2 text-left transition-colors hover:bg-surface-container-low"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-glow/30">
          <span className="material-symbols-outlined text-[16px] text-brand">receipt_long</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[9px] font-semibold text-foreground">Scan Receipt</p>
          <p className="text-[7px] text-muted-foreground">Auto-categorize expenses</p>
        </div>
      </button>
      <p className="font-headline text-[9px] font-semibold text-foreground">Spending Breakdown</p>
      <div className="grid grid-cols-2 gap-1.5">
        {cats.map((c) => (
          <div key={c.label} className={`mom-card flex flex-col gap-1 p-2 ${c.tint}`}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-background/70 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-brand">{c.icon}</span>
            </div>
            <p className="text-[7px] font-medium capitalize text-muted-foreground">{c.label}</p>
            <p className="font-headline text-[11px] font-bold text-foreground">{c.amt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMock() {
  const rows = [
    { icon: "check_circle", title: "Added milk to grocery list", meta: "Grocery Guru · now" },
    { icon: "restaurant", title: "Planned 5 healthy dinners", meta: "Budget: $120 this week" },
    { icon: "notifications_active", title: "Pickup reminder set", meta: "15 min before dismissal" },
  ];
  return (
    <div className="flex w-full flex-col gap-1.5">
      {rows.map((r) => (
        <div key={r.title} className="mom-card flex gap-2 p-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
            <span className="material-symbols-outlined text-[16px] text-brand">{r.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="font-headline text-[9px] font-semibold leading-snug text-foreground">{r.title}</p>
            <p className="text-[7px] text-muted-foreground">{r.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SchoolHubMock() {
  const rows = [
    { icon: "assignment", title: "Field trip form", meta: "Due Friday · School Event Hub", accent: "hsl(var(--secondary))" },
    { icon: "payments", title: "Class photo payment", meta: "Reminder set", accent: "hsl(var(--brand))" },
    { icon: "sports_soccer", title: "Soccer practice", meta: "Synced to Family Calendar", accent: "hsl(var(--tertiary))" },
  ];
  return (
    <div className="flex w-full flex-col gap-1.5">
      {rows.map((r) => (
        <CardAccent key={r.title} colorVar={r.accent}>
          <div className="flex gap-2 p-2.5 pl-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
              <span className="material-symbols-outlined text-[16px] text-muted-foreground">{r.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-headline text-[9px] font-semibold text-foreground">{r.title}</p>
              <p className="text-[7px] text-muted-foreground">{r.meta}</p>
            </div>
          </div>
        </CardAccent>
      ))}
    </div>
  );
}

function ScreenBody({ name }: { name: string }) {
  switch (name) {
    case "Family Calendar":
      return <CalendarMock />;
    case "Budget Buddy":
      return <BudgetMock />;
    case "Agent Chat":
      return <ChatMock />;
    case "School Event Hub":
      return <SchoolHubMock />;
    default:
      return null;
  }
}

export function PhoneMockup() {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[280px] md:w-[320px]">
      <div className="relative rounded-[2.5rem] bg-inverse-surface p-3 mom-editorial-shadow">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-inverse-surface" />

        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-background">
          {screens.map((screen, i) => (
            <div
              key={screen.name}
              className={`absolute inset-0 flex flex-col transition-opacity duration-700 ${
                i === activeScreen ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== activeScreen}
            >
              {/* Status */}
              <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-6">
                <span className="text-[10px] font-medium text-foreground">9:41</span>
                <div className="h-2 w-4 rounded-sm bg-foreground/90" />
              </div>

              {/* Brand + title — in document flow so mocks never overlap */}
              <div className="shrink-0 px-4 pb-2">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-glow" />
                  <span className="text-[10px] font-bold text-foreground">Alpha.Mom</span>
                </div>
                <h3 className="font-headline text-[11px] font-bold leading-snug text-foreground">{screen.name}</h3>
              </div>

              {/* Scrollable mock content */}
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-16 mom-no-scrollbar">
                <ScreenBody name={screen.name} />
              </div>

              <nav className="mom-bottom-nav absolute bottom-0 left-0 right-0 shrink-0">
                <div className="mx-auto flex max-w-lg items-center justify-around px-1 pb-2 pt-1.5">
                  {NAV.map((item) => {
                    const isActive = screen.activeTab === item.key;
                    return (
                      <div
                        key={item.key}
                        className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-colors ${
                          isActive ? "bg-brand-glow/40 text-brand" : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-[7px] font-medium">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>
          ))}

          <div className="pointer-events-none absolute bottom-14 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i === activeScreen ? "scale-125 bg-brand" : "bg-border-subtle"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -inset-8 -z-10 rounded-full bg-brand-glow opacity-20 blur-3xl" />
    </div>
  );
}
