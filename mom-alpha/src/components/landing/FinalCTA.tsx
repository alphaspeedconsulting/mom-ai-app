"use client";

import { WaitlistForm } from "./WaitlistForm";

export function FinalCTA() {
  return (
    <section id="waitlist" className="mom-section relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 mom-gradient-hero opacity-[0.07]" />

      <div className="mom-container px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            Ready to take a breath?
          </h2>
          <p className="text-alphaai-lg text-muted-foreground mb-8">
            Join the waitlist and be the first to experience Mom.alpha.
            We&apos;ll notify you the moment we launch.
          </p>

          <WaitlistForm />

          <p className="text-alphaai-xs text-muted-foreground mt-4">
            No spam. Unsubscribe anytime. We respect your inbox like we respect your time.
          </p>
        </div>
      </div>
    </section>
  );
}
