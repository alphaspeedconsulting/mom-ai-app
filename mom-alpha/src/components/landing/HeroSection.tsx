"use client";

import { PhoneMockup } from "./PhoneMockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Ambient gradient blobs — Lullaby & Logic hero depth */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-[140px] opacity-25 bg-brand-glow pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-secondary-container pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[160px] opacity-10 bg-tertiary-container pointer-events-none" />

      <div className="mom-container px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <div className="mom-chip mb-6">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Launching Soon
            </div>

            <h1 className="font-headline font-extrabold text-alphaai-display md:text-alphaai-display-lg text-foreground leading-tight mb-6">
              Take a breath.
              <br />
              <span className="text-brand">
                We&apos;ll handle the rest.
              </span>
            </h1>

            <p className="text-alphaai-lg md:text-alphaai-xl text-muted-foreground max-w-lg mx-auto md:mx-0 mb-8">
              8 AI agents that manage your household — calendar, groceries,
              budget, school events, and more. So you can focus on what
              matters most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="/login?mode=signup" className="mom-btn-primary text-alphaai-md py-4 px-8">
                Start Free Trial
              </a>
              <a href="#agents" className="mom-btn-outline text-alphaai-md py-4 px-8">
                Meet Your Team
              </a>
            </div>

            <p className="text-alphaai-sm text-muted-foreground mt-4 text-center md:text-left">
              Already have an account?{" "}
              <a href="/login" className="text-brand font-medium hover:underline">
                Log in
              </a>
            </p>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
