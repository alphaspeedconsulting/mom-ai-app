"use client";

import { useState, useEffect } from "react";

const screens = [
  {
    name: "Family Calendar",
    tab: "Cal",
    cards: [
      { title: "School Pickup", meta: "Today 3:30 PM", bgClass: "bg-tertiary-container" },
      { title: "Piano Lesson", meta: "Emma at 4:00 PM", bgClass: "bg-brand-glow" },
      { title: "Dentist Reminder", meta: "Tomorrow 9:00 AM", bgClass: "bg-secondary-container" },
    ],
  },
  {
    name: "Agent Chat",
    tab: "Home",
    cards: [
      { title: "Added milk to grocery list", meta: "Done in 50ms", bgClass: "bg-brand-glow" },
      { title: "Planned 5 healthy dinners", meta: "Budget: $120 this week", bgClass: "bg-secondary-container" },
      { title: "Set pickup reminder", meta: "15 min before dismissal", bgClass: "bg-tertiary-container" },
    ],
  },
  {
    name: "Budget Tracker",
    tab: "Tasks",
    cards: [
      { title: "Groceries", meta: "$94 / $120 weekly", bgClass: "bg-secondary-container" },
      { title: "Utilities", meta: "On track this month", bgClass: "bg-tertiary-container" },
      { title: "Potential savings", meta: "$38 from duplicates", bgClass: "bg-brand-glow" },
    ],
  },
  {
    name: "School Hub",
    tab: "Me",
    cards: [
      { title: "Field Trip Form", meta: "Due Friday", bgClass: "bg-brand-glow" },
      { title: "Class Photo Payment", meta: "Reminder set", bgClass: "bg-secondary-container" },
      { title: "Soccer Practice", meta: "Added to family calendar", bgClass: "bg-tertiary-container" },
    ],
  },
];

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
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] p-3 mom-editorial-shadow bg-inverse-surface">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 rounded-b-2xl bg-inverse-surface" />

        {/* Screen */}
        <div className="relative rounded-[2rem] overflow-hidden aspect-[9/19.5] bg-background">
          {/* Screen content */}
          {screens.map((screen, i) => (
            <div
              key={screen.name}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-700"
              style={{ opacity: i === activeScreen ? 1 : 0 }}
            >
              {/* Status bar mock */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-8 pb-2">
                <span className="text-[10px] font-medium text-foreground">9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-2 rounded-sm bg-foreground" />
                </div>
              </div>

              {/* App header */}
              <div className="absolute top-14 left-0 right-0 px-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full mom-gradient-hero" />
                  <span className="text-xs font-bold text-foreground">
                    Mom.alpha
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {screen.name}
                </h3>
              </div>

              {/* Representative screen cards */}
              <div className="mt-16 w-full space-y-3">
                {screen.cards.map((card, j) => (
                  <div
                    key={card.title}
                    className={`rounded-xl p-4 border border-border-subtle ${card.bgClass}`}
                    style={{ opacity: 1 - j * 0.08 }}
                  >
                    <p className="text-alphaai-sm font-semibold text-foreground leading-tight">
                      {card.title}
                    </p>
                    <p className="text-alphaai-xs text-muted-foreground mt-1">
                      {card.meta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom nav mock */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-around py-2 rounded-full bg-surface-elevated">
                {["Home", "Tasks", "Cal", "Me"].map((tab) => (
                  <div key={tab} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-4 h-4 rounded ${
                        tab === screen.tab ? "bg-brand/80" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span
                      className={`text-[8px] ${
                        tab === screen.tab ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tab}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Screen indicators */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeScreen ? "bg-brand scale-125" : "bg-border-subtle"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute -inset-8 rounded-full blur-3xl -z-10 opacity-20 bg-brand-glow" />
    </div>
  );
}
