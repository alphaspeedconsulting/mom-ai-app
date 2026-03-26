"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-8">
        <article className="prose prose-sm text-foreground">
          <p className="text-alphaai-3xs text-muted-foreground mb-4">Last updated: March 2026 · Version 1.0.0</p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">1. Who This Policy Applies To</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Alpha.Mom is designed for users aged 18 and older (parents and guardians). Family member data, including children&apos;s names, ages, allergies, and school information, is entered and managed exclusively by the parent account holder. Children do not interact with the app directly — there are no child accounts or child-facing UI elements.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">2. Data We Collect</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            We collect: account information (email, name), family profile data, calendar events, grocery lists, expense records, and chat messages. We also collect device information for push notification delivery.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">3. How We Use AI</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Your messages are processed through our PII masking pipeline before being sent to third-party AI providers. Personal identifiers (names, addresses, phone numbers) are stripped or tokenized. AI providers include OpenAI and Google, both configured for zero data retention. Your data is never used to train AI models.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">4. Data Retention</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Chat messages: retained for 90 days, then auto-deleted. Audit logs (PII-masked): 30 days. Calendar and list data: retained until account deletion. Upon account deletion, all data is permanently removed within 30 days.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">5. Third-Party Providers</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            We use: Stripe (payments), Google Calendar API (calendar sync), OpenAI (AI processing with zero data retention), Google Gemini (AI processing), and Render (hosting). Each provider processes only the minimum data necessary.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">6. Your Rights (GDPR/CCPA)</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            You have the right to: access your data, export your data, correct inaccurate data, delete your account and all associated data, and opt out of non-essential data processing. To exercise these rights, visit Settings or contact privacy@alphaspeedai.com.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">7. Security</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            All data is encrypted in transit (TLS 1.3) and at rest (AES-256). CalDAV passwords are encrypted. PII token maps exist only in memory during request processing and are never persisted or logged.
          </p>
        </article>
      </main>
    </div>
  );
}
