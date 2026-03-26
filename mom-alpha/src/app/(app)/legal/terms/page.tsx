"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-8">
        <article className="prose prose-sm text-foreground">
          <p className="text-alphaai-3xs text-muted-foreground mb-4">Last updated: March 2026 · Version 1.0.0</p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">1. Acceptance of Terms</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            By accessing or using Alpha.Mom (&ldquo;the Service&rdquo;), operated by AlphaSpeed AI, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">2. Eligibility</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            The Service is intended for users aged 18 and older. By using Alpha.Mom, you represent that you are at least 18 years old. Family member data (including children&apos;s information) is entered and managed by the parent account holder.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">3. Service Description</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Alpha.Mom provides AI-powered household management assistance through specialized agents. The Service uses third-party AI models to process requests. AI responses are for informational purposes only and do not constitute professional advice in any domain.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">4. Subscriptions & Billing</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Paid subscriptions are billed through Stripe. A 7-day free trial is offered for new users with payment method collection at signup. Subscriptions auto-renew unless cancelled. Refund requests are handled per our refund policy.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">5. Limitation of Liability</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            AlphaSpeed AI provides the Service &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">6. Termination</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through Settings. Upon account deletion, your data will be permanently removed within 30 days.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">7. Governing Law</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            These Terms are governed by the laws of the State of Delaware, United States.
          </p>
        </article>
      </main>
    </div>
  );
}
