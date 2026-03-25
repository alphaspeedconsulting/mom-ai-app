"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Mom.alpha?",
    answer:
      "Mom.alpha is an AI-powered family assistant with 8 specialized agents that handle your household tasks — calendar management, grocery lists, budget tracking, school events, and more. Think of it as a team of digital helpers that work together to keep your family organized.",
  },
  {
    question: "How does the AI actually work?",
    answer:
      "Simple tasks like \"add milk to the grocery list\" execute instantly with no AI needed (under 50ms). More complex requests like \"plan dinners for the week\" are routed to the best AI model for the job. This hybrid approach keeps things fast and affordable.",
  },
  {
    question: "Is my family's data safe?",
    answer:
      "Absolutely. All personal information (names, addresses, phone numbers) is stripped before any AI model processes your request. Your data is encrypted at rest (AES-256), never used to train AI models, and you can export or delete everything with one click. Mom.alpha is designed for adults 18+ who manage their household.",
  },
  {
    question: "Which calendars does it work with?",
    answer:
      "Mom.alpha syncs with Google Calendar and Apple Calendar (iCloud). Changes sync bidirectionally — update in Mom.alpha or your native calendar app, and it stays in sync. We detect conflicts across family members and suggest solutions.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel anytime with no penalties. Your data is preserved for 30 days after cancellation so you can export it. After 30 days, all data is permanently deleted per our privacy policy.",
  },
  {
    question: "What devices does it work on?",
    answer:
      "Mom.alpha is a Progressive Web App (PWA) — it works on any device with a modern browser. Install it on your phone's home screen for a native app experience. Works on iPhone (iOS 16.4+), Android, tablets, and desktop.",
  },
  {
    question: "What's the difference between Family and Family Pro?",
    answer:
      "Family ($7.99/mo) includes 4 core agents: Calendar Whiz, Grocery Guru, Budget Buddy, and School Event Hub — plus 1,000 AI interactions/month. Family Pro ($14.99/mo) unlocks all 8 agents, 5,000 interactions, priority AI models, and wellness features.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="mom-section">
      <div className="mom-container px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-alphaai-3xl md:text-alphaai-display text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.question} className="mom-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-headline font-semibold text-alphaai-base text-foreground pr-4">
                  {faq.question}
                </span>
                <span
                  className="material-symbols-outlined text-muted-foreground transition-transform duration-300 flex-shrink-0"
                  style={{
                    transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  expand_more
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === i ? "500px" : "0",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="px-6 pb-6 text-alphaai-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
