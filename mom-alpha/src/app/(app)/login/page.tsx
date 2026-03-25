"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

type AuthMode = "login" | "signup";

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  ai_disclosure: boolean;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    ai_disclosure: false,
  });

  const login = useAuthStore((s) => s.login);
  const allConsented = consent.terms && consent.privacy && consent.ai_disclosure;

  const handleGoogleLogin = () => {
    // Phase 4: real Google OAuth flow
    setShowConsent(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 4: real POST /api/auth/email
    setShowConsent(true);
  };

  const handleConsentSubmit = () => {
    // Phase 4: POST /api/consent then POST /api/checkout/trial
    login("mock_jwt_token", {
      id: "u1",
      email: email || "mom@example.com",
      name: "Sarah",
      household_id: "h1",
      tier: "trial",
      consent_current: true,
    });
    window.location.href = "/dashboard";
  };

  if (showConsent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        {/* Ambient decorative circles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
        </div>

        <div className="mom-card p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[48px] text-brand mb-4 block">
              verified_user
            </span>
            <h1 className="font-headline text-alphaai-2xl font-bold text-foreground mb-2">
              Almost there!
            </h1>
            <p className="text-alphaai-sm text-muted-foreground">
              Please review and accept our policies to get started.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent.terms}
                onChange={() => setConsent((c) => ({ ...c, terms: !c.terms }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-brand font-medium underline underline-offset-2">
                  Terms of Service
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent.privacy}
                onChange={() => setConsent((c) => ({ ...c, privacy: !c.privacy }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I agree to the{" "}
                <Link href="/legal/privacy" className="text-brand font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent.ai_disclosure}
                onChange={() => setConsent((c) => ({ ...c, ai_disclosure: !c.ai_disclosure }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I acknowledge the{" "}
                <Link href="/legal/ai-disclosure" className="text-brand font-medium underline underline-offset-2">
                  AI Disclosure
                </Link>{" "}
                — AI suggestions are not professional advice
              </span>
            </label>
          </div>

          <button
            onClick={handleConsentSubmit}
            disabled={!allConsented}
            className="mom-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue — Start 7-Day Free Trial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Ambient decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & tagline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">
              family_restroom
            </span>
          </div>
          <h1 className="font-headline text-alphaai-3xl font-extrabold text-foreground">
            Mom.alpha
          </h1>
          <p className="text-alphaai-sm text-muted-foreground mt-1">
            Take a breath. We&apos;ll handle the rest.
          </p>
        </div>

        {/* Auth card */}
        <div className="mom-card p-6">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container border border-border-subtle/20 rounded-full py-3 px-6 font-medium text-foreground text-alphaai-base transition-colors mb-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border-subtle/30" />
            <span className="text-alphaai-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border-subtle/30" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="mom-input"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                className="mom-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <button type="submit" className="mom-btn-primary w-full">
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-alphaai-sm text-muted-foreground mt-4">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-brand font-medium"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
