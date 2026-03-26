import { CardAccent } from "@/components/shared/CardAccent";

type PreviewKind = "calendar" | "chat" | "receipt" | "school";

const features: {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: string;
  gradient: string;
  previewKind: PreviewKind;
}[] = [
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
    previewKind: "calendar",
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
    previewKind: "chat",
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
    previewKind: "receipt",
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
    previewKind: "school",
  },
];

function CalendarSyncPreview() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="w-full max-w-md space-y-3 text-left">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", on: true },
          { label: "Shared", on: false },
          { label: "Mom", on: false, dot: true },
        ].map((c) => (
          <span
            key={c.label}
            className={`rounded-full px-3 py-1 text-alphaai-xs font-medium ${
              c.on ? "bg-brand text-on-primary" : "bg-surface-container text-muted-foreground"
            }`}
          >
            {c.dot && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />}
            {c.label}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container"
          aria-hidden
        >
          <span className="material-symbols-outlined text-[18px] text-foreground">chevron_left</span>
        </button>
        <p className="font-headline text-alphaai-sm font-semibold text-foreground">March 2026</p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container"
          aria-hidden
        >
          <span className="material-symbols-outlined text-[18px] text-foreground">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, idx) => (
          <div key={`dow-${idx}`} className="text-center text-alphaai-3xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day) => {
          const sel = day === 26;
          const has = [3, 17, 26].includes(day);
          return (
            <div
              key={day}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-alphaai-xs ${
                sel
                  ? "bg-brand/10 font-semibold text-brand ring-2 ring-brand"
                  : "bg-surface-container-low text-foreground"
              }`}
            >
              <span>{day}</span>
              {has && (
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-secondary" />
                  {day === 17 && <span className="h-1 w-1 rounded-full bg-tertiary" />}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="font-headline text-alphaai-xs font-semibold text-foreground">Wednesday, March 26</p>
      <div className="space-y-2">
        <CardAccent colorVar="hsl(var(--secondary))">
          <div className="p-3">
            <p className="font-headline text-alphaai-sm font-semibold text-foreground">Mom: Dentist</p>
            <p className="text-alphaai-xs text-muted-foreground">9:00 AM — 10:00 AM · Google</p>
          </div>
        </CardAccent>
        <CardAccent colorVar="hsl(var(--brand))">
          <div className="p-3">
            <p className="font-headline text-alphaai-sm font-semibold text-foreground">Leo: Soccer</p>
            <p className="text-alphaai-xs text-muted-foreground">4:30 PM — 6:00 PM</p>
            <span className="mt-1 inline-flex rounded-full bg-brand-glow/50 px-2 py-0.5 text-alphaai-3xs font-medium text-brand">
              No conflicts
            </span>
          </div>
        </CardAccent>
      </div>
    </div>
  );
}

function ChatFeaturePreview() {
  const rows = [
    { q: "Add eggs and milk", route: "Instant", ms: "12ms", tone: "brand" as const },
    { q: "Plan dinners this week", route: "AI response", ms: "Gemini Flash", tone: "tertiary" as const },
    { q: "Find tutor for math", route: "Best model", ms: "GPT-4o mini", tone: "secondary" as const },
  ];
  return (
    <div className="w-full max-w-md space-y-3 text-left">
      <div className="mom-card p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-border-subtle/20 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-glow/40">
            <span className="material-symbols-outlined text-[20px] text-brand">smart_toy</span>
          </div>
          <div>
            <p className="font-headline text-alphaai-sm font-semibold text-foreground">Grocery Guru</p>
            <p className="text-alphaai-3xs text-muted-foreground">Agent chat · Household context on</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.q} className="rounded-2xl bg-surface-container-low p-3">
              <p className="text-alphaai-sm text-foreground">&ldquo;{row.q}&rdquo;</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-alphaai-3xs font-medium ${
                    row.tone === "brand"
                      ? "bg-brand-glow/50 text-brand"
                      : row.tone === "tertiary"
                        ? "bg-tertiary-container/80 text-tertiary"
                        : "bg-secondary-container/80 text-secondary"
                  }`}
                >
                  {row.route}
                </span>
                <span className="text-alphaai-3xs text-muted-foreground">{row.ms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReceiptFeaturePreview() {
  const cats = [
    { icon: "shopping_basket", label: "Groceries", sub: "$63.40" },
    { icon: "local_cafe", label: "Dining", sub: "$24.10" },
  ];
  return (
    <div className="w-full max-w-md space-y-3 text-left">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-glow p-5 text-on-primary mom-editorial-shadow">
        <p className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-90">Household Health</p>
        <p className="font-headline text-alphaai-2xl font-bold">$1,847.22</p>
        <p className="mt-1 text-alphaai-xs opacity-90">This month · trending on track</p>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-2 -right-1 text-[5rem] opacity-[0.12]">
          account_balance_wallet
        </span>
      </div>
      <div className="mom-card flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-glow/35">
          <span className="material-symbols-outlined text-[22px] text-brand">receipt_long</span>
        </div>
        <div>
          <p className="font-headline text-alphaai-sm font-semibold text-foreground">Scan Receipt</p>
          <p className="text-alphaai-xs text-muted-foreground">OCR · auto-categorize</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-muted-foreground">photo_camera</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cats.map((c) => (
          <div key={c.label} className="mom-card flex flex-col gap-1 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px] text-brand">{c.icon}</span>
            </div>
            <p className="text-alphaai-3xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="font-headline text-alphaai-lg font-bold text-foreground">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="rounded-xl bg-error-container/25 px-3 py-2 text-alphaai-xs text-foreground">
        <span className="material-symbols-outlined mr-1 align-middle text-[16px] text-error">warning</span>
        Price anomaly: duplicate charge flagged
      </p>
    </div>
  );
}

function SchoolFeaturePreview() {
  const rows = [
    {
      title: "Field Trip Form",
      meta: "Due Friday · permission required",
      accent: "hsl(var(--secondary))",
      icon: "assignment",
    },
    {
      title: "Book Fair Payment",
      meta: "Reminder set · $15",
      accent: "hsl(var(--brand))",
      icon: "payments",
    },
    {
      title: "Parent-Teacher Conference",
      meta: "Added to Family Calendar",
      accent: "hsl(var(--tertiary))",
      icon: "event",
    },
  ];
  return (
    <div className="w-full max-w-md space-y-2 text-left">
      {rows.map((r) => (
        <CardAccent key={r.title} colorVar={r.accent}>
          <div className="flex items-start gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
              <span className="material-symbols-outlined text-[20px] text-muted-foreground">{r.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-headline text-alphaai-sm font-semibold text-foreground">{r.title}</p>
              <p className="text-alphaai-xs text-muted-foreground">{r.meta}</p>
            </div>
          </div>
        </CardAccent>
      ))}
    </div>
  );
}

function FeaturePreview({ kind }: { kind: PreviewKind }) {
  switch (kind) {
    case "calendar":
      return <CalendarSyncPreview />;
    case "chat":
      return <ChatFeaturePreview />;
    case "receipt":
      return <ReceiptFeaturePreview />;
    case "school":
      return <SchoolFeaturePreview />;
    default:
      return null;
  }
}

export function FeatureDeepDives() {
  return (
    <section id="features" className="mom-section bg-surface-container-low">
      <div className="mom-container px-6">
        <div className="mb-14 text-center md:mb-16">
          <h2 className="mb-4 font-headline text-alphaai-3xl font-bold text-foreground md:text-alphaai-display">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-alphaai-lg text-muted-foreground">
            Powerful features, designed to disappear. The best technology is the kind you forget is there.
          </p>
        </div>

        <div className="flex flex-col gap-20 md:gap-24">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex flex-col gap-10 md:gap-14 lg:gap-16 ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } lg:items-start`}
            >
              <div className="w-full min-w-0 flex-1 lg:max-w-[min(100%,520px)]">
                <div
                  className={`relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br p-8 md:min-h-[320px] md:p-10 ${feature.gradient} mom-editorial-shadow`}
                >
                  <div className="relative z-10 w-full">
                    <FeaturePreview kind={feature.previewKind} />
                  </div>
                </div>
              </div>

              <div className="w-full min-w-0 flex-1 lg:pt-2">
                <span className="mom-chip mb-4 inline-flex">{feature.subtitle}</span>
                <h3 className="mt-2 font-headline text-alphaai-2xl font-bold text-foreground md:text-alphaai-3xl">
                  {feature.title}
                </h3>
                <p className="mt-4 text-alphaai-base leading-relaxed text-muted-foreground">{feature.description}</p>
                <ul className="mt-6 space-y-3">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-brand">
                        check_circle
                      </span>
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
