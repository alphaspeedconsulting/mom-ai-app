const features = [
  {
    title: "Smart Calendar Sync",
    subtitle: "Google + Apple Calendar in one view",
    description:
      "Calendar Whiz merges Google Calendar and Apple Calendar into a single family view. Color-coded by family member, with automatic conflict detection that suggests solutions — not just warnings.",
    highlights: [
      "Bidirectional sync — changes go both ways",
      "Conflict detection across family members",
      "Smart rescheduling with one-tap confirm",
    ],
    icon: "calendar_month",
    gradient: "from-brand to-brand-glow",
    previewRows: [
      { label: "Mom: Dentist 9:00 AM", value: "Synced" },
      { label: "Leo: Soccer 4:30 PM", value: "No conflicts" },
      { label: "Family Dinner 6:30 PM", value: "All available" },
    ],
  },
  {
    title: "AI-Powered Chat",
    subtitle: "Talk naturally, get things done instantly",
    description:
      "\"Add milk to the grocery list\" takes 50ms. \"Plan healthy dinners for the week\" brings in AI. The system intelligently routes — fast when possible, smart when needed. You never wait unnecessarily.",
    highlights: [
      "Simple tasks execute instantly (no AI needed)",
      "Complex requests route to the best AI model",
      "Cost-optimized: you pay less, we use smarter routing",
    ],
    icon: "chat_bubble",
    gradient: "from-secondary to-secondary-container",
    previewRows: [
      { label: "\"Add eggs and milk\"", value: "Instant" },
      { label: "\"Plan dinners this week\"", value: "AI response" },
      { label: "\"Find tutor for math\"", value: "Best model" },
    ],
  },
  {
    title: "Receipt Scanner",
    subtitle: "Snap, categorize, track — automatically",
    description:
      "Point your camera at any receipt. Budget Buddy uses vision AI to extract every item, categorize spending, and spot patterns. See where your money goes without entering a single number.",
    highlights: [
      "Instant OCR — merchant, items, and amounts",
      "Auto-categorization with spending trends",
      "Catches overcharges and duplicate bills",
    ],
    icon: "photo_camera",
    gradient: "from-tertiary to-tertiary-container",
    previewRows: [
      { label: "Whole Foods", value: "$63.40" },
      { label: "Category: Groceries", value: "Auto-tagged" },
      { label: "Price anomaly detected", value: "1 item" },
    ],
  },
  {
    title: "School Event Autopilot",
    subtitle: "Never miss a permission slip again",
    description:
      "School Event Hub scans your email for school communications — field trips, deadlines, fees. It extracts events, tracks permission slips, and reminds you before anything is due.",
    highlights: [
      "Scans Seesaw, ClassDojo, and school emails",
      "Digital permission slip signing",
      "Auto-adds events to your family calendar",
    ],
    icon: "school",
    gradient: "from-brand-dim to-brand",
    previewRows: [
      { label: "Field Trip Form", value: "Due Fri" },
      { label: "Book Fair Payment", value: "Reminder set" },
      { label: "Parent-Teacher Meeting", value: "Added to calendar" },
    ],
  },
];

export function FeatureDeepDives() {
  return (
    <section id="features" className="mom-section bg-surface-container-low">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-alphaai-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features, designed to disappear. The best technology is the kind you forget is there.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-12 items-center`}
            >
              {/* Visual */}
              <div className="flex-1 w-full">
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 md:p-12 aspect-[4/3] flex items-center justify-center`}>
                  <div className="mom-card p-6 md:p-8 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-2xl text-brand">{feature.icon}</span>
                      <span className="font-headline font-bold text-alphaai-md text-foreground">{feature.title}</span>
                    </div>
                    <div className="space-y-2.5">
                      {feature.previewRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between rounded-lg px-3 py-2 bg-surface-active"
                        >
                          <span className="text-alphaai-xs text-foreground">{row.label}</span>
                          <span className="text-alphaai-xs text-brand font-medium">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1">
                <span className="mom-chip mb-4">{feature.subtitle}</span>
                <h3 className="font-headline font-bold text-alphaai-2xl md:text-alphaai-3xl text-foreground mt-4 mb-4">
                  {feature.title}
                </h3>
                <p className="text-alphaai-base text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-brand text-lg mt-0.5">check_circle</span>
                      <span className="text-alphaai-sm text-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
