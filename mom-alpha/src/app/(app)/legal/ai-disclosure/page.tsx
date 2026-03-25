"use client";

import Link from "next/link";

export default function AIDisclosurePage() {
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
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground">AI Disclosure</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-8">
        <article className="prose prose-sm text-foreground">
          <p className="text-alphaai-3xs text-muted-foreground mb-4">Last updated: March 2026 · Version 1.0.0</p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">How Mom.alpha Uses AI</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Mom.alpha uses third-party large language models (LLMs) to power intelligent features. This document explains how AI is used, what data it sees, and important limitations.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">AI Providers</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            We route requests to multiple AI providers based on task complexity: Google Gemini Flash (simple tasks), OpenAI GPT-4o mini (moderate tasks), and OpenAI GPT-4o (complex tasks like receipt OCR). All providers are configured for zero data retention — your data is not used for model training.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">PII Protection</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Before any message reaches an AI provider, our PII masking pipeline strips or tokenizes personal identifiers. Names become [CHILD_1], emails and phone numbers are removed, addresses are stripped. The AI never sees your family&apos;s real names, addresses, or contact information.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">Not Professional Advice</h2>
          <div className="mom-banner bg-secondary/10 mb-4">
            <span className="material-symbols-outlined text-[20px] text-secondary">info</span>
            <div>
              <p className="text-alphaai-sm text-foreground font-semibold mb-1">Important Disclaimer</p>
              <p className="text-alphaai-xs text-muted-foreground">
                AI responses from Mom.alpha agents do not constitute professional advice. Specifically:
              </p>
            </div>
          </div>
          <ul className="space-y-2 mb-4">
            <li className="text-alphaai-sm text-muted-foreground flex gap-2">
              <span className="text-secondary">·</span>
              <span><strong>Budget Buddy</strong> does not provide financial, tax, or investment advice.</span>
            </li>
            <li className="text-alphaai-sm text-muted-foreground flex gap-2">
              <span className="text-secondary">·</span>
              <span><strong>Health Hub</strong> does not provide medical diagnosis or treatment recommendations.</span>
            </li>
            <li className="text-alphaai-sm text-muted-foreground flex gap-2">
              <span className="text-secondary">·</span>
              <span><strong>Tutor Finder</strong> does not guarantee educational outcomes.</span>
            </li>
            <li className="text-alphaai-sm text-muted-foreground flex gap-2">
              <span className="text-secondary">·</span>
              <span><strong>School Event Hub</strong> may not capture all school communications.</span>
            </li>
          </ul>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            Always verify important information from official sources and consult qualified professionals for medical, financial, or legal decisions.
          </p>

          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mt-6 mb-2">Prompt Injection Protection</h2>
          <p className="text-alphaai-sm text-muted-foreground mb-4">
            We employ multiple layers of protection against prompt injection attacks, including input scanning, Unicode normalization, sandboxed email parsing, and output validation. Repeated malicious attempts may result in temporary account suspension.
          </p>
        </article>
      </main>
    </div>
  );
}
