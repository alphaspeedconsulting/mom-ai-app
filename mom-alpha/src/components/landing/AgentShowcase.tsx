const agents = [
  {
    name: "Calendar Whiz",
    icon: "calendar_month",
    description: "Syncs Google & Apple calendars, detects conflicts, and reschedules intelligently.",
    iconClass: "text-brand",
    bgClass: "bg-brand-glow",
  },
  {
    name: "Grocery Guru",
    icon: "shopping_cart",
    description: "Manages grocery lists, plans meals around allergies, and suggests recipes.",
    iconClass: "text-secondary",
    bgClass: "bg-secondary-container",
  },
  {
    name: "Budget Buddy",
    icon: "account_balance_wallet",
    description: "Scans receipts, tracks spending, and finds savings across your household.",
    iconClass: "text-brand-dim",
    bgClass: "bg-surface-active",
  },
  {
    name: "School Event Hub",
    icon: "school",
    description: "Scans school emails, tracks permission slips, and manages deadlines.",
    iconClass: "text-tertiary",
    bgClass: "bg-tertiary-container",
  },
  {
    name: "Tutor Finder",
    icon: "menu_book",
    description: "Matches your child with vetted tutors based on subject, schedule, and learning style.",
    iconClass: "text-secondary",
    bgClass: "bg-secondary-container",
  },
  {
    name: "Health Hub",
    icon: "favorite",
    description: "Tracks appointments, medications, vaccination schedules, and wellness streaks.",
    iconClass: "text-error",
    bgClass: "bg-error-container",
  },
  {
    name: "Sleep Tracker",
    icon: "bedtime",
    description: "Monitors sleep patterns and suggests routines for better family rest.",
    iconClass: "text-tertiary",
    bgClass: "bg-tertiary-container",
  },
  {
    name: "Self-Care Reminder",
    icon: "spa",
    description: "Because you matter too. Gentle nudges for your wellbeing and personal time.",
    iconClass: "text-brand",
    bgClass: "bg-brand-glow",
  },
];

export function AgentShowcase() {
  return (
    <section id="agents" className="mom-section bg-surface-container-low">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            Meet Your Team
          </h2>
          <p className="text-alphaai-lg text-muted-foreground max-w-2xl mx-auto">
            8 specialized AI agents, each an expert in their domain. They work together, sharing context to keep your household running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="mom-card p-6 hover:translate-y-[-4px] transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${agent.bgClass}`}>
                <span className={`material-symbols-outlined text-xl ${agent.iconClass}`}>
                  {agent.icon}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-headline font-bold text-alphaai-md text-foreground mb-2">
                {agent.name}
              </h3>
              <p className="text-alphaai-sm text-muted-foreground leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
