"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // TODO: Replace with Resend or Mailchimp API integration
      // For now, log and simulate success
      console.log("Waitlist signup:", email);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mom-card p-6 inline-flex items-center gap-3">
        <span className="material-symbols-outlined text-brand text-xl">check_circle</span>
        <span className="font-headline font-semibold text-alphaai-md text-foreground">
          You&apos;re on the list!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-5 py-3.5 rounded-full text-alphaai-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        style={{
          background: "hsl(var(--surface-input))",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mom-btn-primary py-3.5 px-8 disabled:opacity-60"
      >
        {status === "loading" ? "Joining..." : "Get Early Access"}
      </button>
      {status === "error" && (
        <p className="text-alphaai-xs text-error text-center sm:text-left mt-1">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
