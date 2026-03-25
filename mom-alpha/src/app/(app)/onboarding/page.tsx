"use client";

import Link from "next/link";

const BENEFITS = [
  {
    icon: "calendar_month",
    title: "One Calendar to Rule Them All",
    description: "Sync Google, Apple, and school calendars. AI detects conflicts before they happen.",
    span: "md:col-span-7 md:row-span-2",
    gradient: "from-brand to-brand-glow",
  },
  {
    icon: "shopping_cart",
    title: "Grocery Lists on Autopilot",
    description: "AI-powered meal planning that fits your family's dietary needs and budget.",
    span: "md:col-span-5",
    gradient: "from-secondary to-secondary-container",
  },
  {
    icon: "school",
    title: "Never Miss a Permission Slip",
    description: "Auto-scans school emails, tracks deadlines, and lets you sign digitally.",
    span: "md:col-span-5",
    gradient: "from-tertiary to-tertiary-container",
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-tertiary-container/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/4 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero headline */}
        <div className="text-center mb-12 md:mb-16">
          <div className="mom-chip mb-4 mx-auto">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            Your AI Family Team
          </div>
          <h1 className="font-headline text-alphaai-display font-extrabold text-foreground leading-tight mb-4">
            8 agents.{" "}
            <span className="text-brand">One calm home.</span>
          </h1>
          <p className="text-alphaai-lg text-muted-foreground max-w-xl mx-auto">
            Mom.alpha deploys specialized AI agents to handle the mental load —
            so you can breathe.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className={`mom-card p-6 md:p-8 ${benefit.span} overflow-hidden relative group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px] text-brand">
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="font-headline text-alphaai-xl font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-alphaai-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/login" className="mom-btn-primary text-alphaai-md px-10 py-4">
            Get Started
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <p className="text-alphaai-xs text-muted-foreground mt-3">
            7-day free trial — no commitment
          </p>
        </div>
      </div>
    </div>
  );
}
