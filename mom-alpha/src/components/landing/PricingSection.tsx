const plans = [
  {
    name: "Family",
    price: "$7.99",
    period: "/mo",
    annual: "$69.99/yr (save 27%)",
    description: "Everything you need to organize your household",
    features: [
      "4 core AI agents (Calendar, Grocery, Budget, School)",
      "Google & Apple Calendar sync",
      "Receipt scanning & budget tracking",
      "School email scanning",
      "1,000 AI interactions/month",
      "Web Push notifications",
      "7-day free trial",
    ],
    cta: "Get Early Access",
    popular: false,
  },
  {
    name: "Family Pro",
    price: "$14.99",
    period: "/mo",
    annual: "$129.99/yr (save 28%)",
    description: "The complete family management suite",
    features: [
      "All 8 AI agents",
      "Everything in Family, plus:",
      "Health Hub & Sleep Tracker",
      "Tutor Finder with matching",
      "Self-Care Reminder",
      "5,000 AI interactions/month",
      "Priority AI (faster models)",
      "Family wellness streaks",
      "7-day free trial",
    ],
    cta: "Get Early Access",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mom-section bg-surface-container-low">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-alphaai-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No platform tax. Cancel anytime. Start with a 7-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`mom-card p-8 relative ${plan.popular ? "ring-2 ring-brand" : ""}`}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-alphaai-xs font-semibold bg-brand text-on-primary"
                >
                  Most Popular
                </div>
              )}

              <h3 className="font-headline font-bold text-alphaai-xl text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-alphaai-sm text-muted-foreground mb-6">
                {plan.description}
              </p>

              <div className="mb-2">
                <span className="font-headline font-extrabold text-alphaai-display text-foreground">
                  {plan.price}
                </span>
                <span className="text-alphaai-md text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-alphaai-xs text-brand font-medium mb-8">
                {plan.annual}
              </p>

              <a
                href="#waitlist"
                className={`block text-center py-3.5 rounded-full font-headline font-semibold text-alphaai-base transition-all ${
                  plan.popular
                    ? "mom-btn-primary w-full"
                    : "mom-btn-outline w-full"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-brand text-base mt-0.5">check</span>
                    <span className="text-alphaai-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-alphaai-xs text-muted-foreground mt-8">
          Powered by Stripe. 2.9% processing — no 30% platform tax.
        </p>
      </div>
    </section>
  );
}
