const timelineEvents = [
  {
    time: "7:00 AM",
    title: "The Daily Edit",
    description: "Your morning briefing: today's schedule, pending tasks, and a self-care reminder. All before your first sip of coffee.",
    agent: "Calendar Whiz",
    icon: "wb_sunny",
    color: "var(--secondary)",
    bgColor: "var(--secondary-container)",
  },
  {
    time: "8:15 AM",
    title: "Permission Slip Alert",
    description: "\"Field trip to Science Museum — due Friday. Tap to sign.\" School Event Hub scanned your email while you made breakfast.",
    agent: "School Event Hub",
    icon: "school",
    color: "var(--tertiary)",
    bgColor: "var(--tertiary-container)",
  },
  {
    time: "12:30 PM",
    title: "Receipt Scan",
    description: "Snap a photo of your grocery receipt. Budget Buddy categorizes everything instantly and spots a $4 overcharge.",
    agent: "Budget Buddy",
    icon: "receipt_long",
    color: "var(--brand-dim)",
    bgColor: "var(--surface-active)",
  },
  {
    time: "3:00 PM",
    title: "Calendar Conflict Detected",
    description: "\"Soccer practice overlaps with Emma's dentist. Suggest moving dentist to Thursday?\" One tap to fix.",
    agent: "Calendar Whiz",
    icon: "event_busy",
    color: "var(--brand)",
    bgColor: "var(--brand-glow)",
  },
  {
    time: "5:30 PM",
    title: "Dinner Plan Ready",
    description: "Grocery Guru planned tonight's meal around what's already in your pantry — and it's allergy-safe for everyone.",
    agent: "Grocery Guru",
    icon: "restaurant",
    color: "var(--secondary)",
    bgColor: "var(--secondary-container)",
  },
  {
    time: "8:00 PM",
    title: "Self-Care Check-in",
    description: "\"You've had a long day. How about 15 minutes of that podcast you love?\" Because you matter too.",
    agent: "Self-Care Reminder",
    icon: "spa",
    color: "var(--brand)",
    bgColor: "var(--brand-glow)",
  },
];

export function DayTimeline() {
  return (
    <section className="mom-section">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            A Day With Mom.alpha
          </h2>
          <p className="text-alphaai-lg text-muted-foreground max-w-2xl mx-auto">
            From sunrise to sunset, your AI team works quietly in the background so you can be present for what matters.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
            style={{ background: "hsl(var(--border-subtle) / 0.3)" }}
          />

          {timelineEvents.map((event, i) => (
            <div
              key={event.time}
              className={`relative flex gap-6 md:gap-12 mb-12 last:mb-0 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Time dot */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 mt-6"
                style={{ background: `hsl(${event.color})`, boxShadow: `0 0 0 4px hsl(var(--background))` }}
              />

              {/* Time label */}
              <div className={`hidden md:flex flex-1 items-start pt-5 ${i % 2 === 0 ? "justify-end pr-12" : "justify-start pl-12"}`}>
                <span className="font-headline font-bold text-alphaai-lg text-brand">{event.time}</span>
              </div>

              {/* Card */}
              <div className="flex-1 ml-16 md:ml-0 mom-card p-6">
                <span className="md:hidden font-headline font-bold text-alphaai-sm text-brand">{event.time}</span>
                <div className="flex items-center gap-3 mt-1 md:mt-0 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `hsl(${event.bgColor})` }}
                  >
                    <span className="material-symbols-outlined text-base" style={{ color: `hsl(${event.color})` }}>
                      {event.icon}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-alphaai-md text-foreground">{event.title}</h3>
                </div>
                <p className="text-alphaai-sm text-muted-foreground leading-relaxed mb-2">
                  {event.description}
                </p>
                <span className="mom-chip text-alphaai-3xs">{event.agent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
