const trustPoints = [
  {
    icon: "shield",
    title: "PII Stripping",
    description: "Names, addresses, and phone numbers are stripped before any AI model sees your data. Always.",
  },
  {
    icon: "lock",
    title: "Zero AI Training",
    description: "Your family data is never used to train AI models. Period. No exceptions, no fine print.",
  },
  {
    icon: "encrypted",
    title: "Encrypted at Rest",
    description: "All data encrypted with AES-256. Passwords hashed with bcrypt. Industry-standard protection.",
  },
  {
    icon: "delete_forever",
    title: "Data Portability",
    description: "Export or delete all your data anytime. One click, no hoops. Your data, your choice.",
  },
];

export function TrustPrivacy() {
  return (
    <section className="mom-section">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            Your Family Data Is Sacred
          </h2>
          <p className="text-alphaai-lg text-muted-foreground max-w-2xl mx-auto">
            We built Alpha.Mom with privacy as the foundation, not an afterthought.
            Your family&apos;s information never leaves the boundaries you set.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-brand-glow">
                <span className="material-symbols-outlined text-xl text-brand">
                  {point.icon}
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-alphaai-md text-foreground mb-1">
                  {point.title}
                </h3>
                <p className="text-alphaai-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {["SOC 2 Ready", "GDPR Compliant", "No Child Data Collection", "18+ Users Only"].map((badge) => (
            <div
              key={badge}
              className="px-4 py-2 rounded-full text-alphaai-xs font-medium"
              style={{
                background: "hsl(var(--surface-elevated))",
                color: "hsl(var(--brand))",
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
