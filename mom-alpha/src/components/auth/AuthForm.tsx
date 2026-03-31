"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth-store";
import { auth, consent as consentApi, ApiError } from "@/lib/api-client";
import type { AuthResponse } from "@/types/api-contracts";

type AuthMode = "login" | "signup";

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  ai_disclosure: boolean;
}

interface AuthFormProps {
  initialMode: AuthMode;
  initialPromo: string;
  showModeToggle: boolean;
}

/** Check if the user has previously accepted consent (localStorage fallback) */
function hasLocalConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("mom-alpha-consent-accepted") === "true";
}

/** Record consent acceptance locally so returning users never see it again */
function setLocalConsent() {
  if (typeof window !== "undefined") {
    localStorage.setItem("mom-alpha-consent-accepted", "true");
  }
}

/** Remember email for returning users */
function getLastEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("mom-alpha-last-email") ?? "";
}

function setLastEmail(email: string) {
  if (typeof window !== "undefined" && email) {
    localStorage.setItem("mom-alpha-last-email", email);
  }
}

export function AuthForm({ initialMode, initialPromo, showModeToggle }: AuthFormProps) {
  // If we have a remembered email and mode is login, prefill it
  const rememberedEmail = initialMode === "login" ? getLastEmail() : "";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(() => {
    if (initialPromo) return initialPromo;
    if (typeof window !== "undefined") {
      return localStorage.getItem("mom-alpha-promo-code") ?? "";
    }
    return "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [authPending, setAuthPending] = useState<AuthResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    ai_disclosure: false,
  });

  const login = useAuthStore((s) => s.login);
  const allConsented = consent.terms && consent.privacy && consent.ai_disclosure;

  const consentModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(consentModalRef, showConsent);

  /** After auth succeeds, either show consent dialog or go straight to app */
  const handleAuthSuccess = (response: AuthResponse) => {
    setAuthPending(response);
    // Remember email for next login
    setLastEmail(response.user.email);

    // Skip consent if: backend says current, OR user has accepted locally before
    if (response.user.consent_current || hasLocalConsent()) {
      completeLogin(response);
    } else {
      setShowConsent(true);
    }
  };

  /** Finish login: store token, redirect appropriately */
  const completeLogin = (response: AuthResponse) => {
    login(response.access_token, response.user);
    if (inviteCode.trim()) {
      localStorage.setItem("mom-alpha-promo-code", inviteCode.trim().toUpperCase());
    }

    // Check if user needs the install page (first time, not yet installed as PWA)
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone));

    if (mode === "signup") {
      const next = response.user.household_id ? "/dashboard" : "/onboarding/household";
      window.location.href = `/install?next=${encodeURIComponent(next)}`;
      return;
    }

    // For returning login users: show install page if not already installed as PWA
    if (!isStandalone && !localStorage.getItem("mom-alpha-install-seen")) {
      localStorage.setItem("mom-alpha-install-seen", "true");
      const next = response.user.household_id ? "/dashboard" : "/onboarding/household";
      window.location.href = `/install?next=${encodeURIComponent(next)}`;
      return;
    }

    if (!response.user.household_id) {
      window.location.href = "/onboarding/household";
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await auth.loginGoogle({ id_token: credentialResponse.credential });
      handleAuthSuccess(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.detail);
      } else {
        setSubmitError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response =
        mode === "signup"
          ? await auth.signup({
              email,
              password,
              name: name.trim() || "Mom",
              ...(inviteCode.trim() ? { promotion_code: inviteCode.trim().toUpperCase() } : {}),
            })
          : await auth.loginEmail({ email, password });
      handleAuthSuccess(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.detail);
      } else {
        setSubmitError("Could not sign in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentSubmit = async () => {
    if (!authPending) return;

    // Record consent locally so it never shows again for this browser
    setLocalConsent();

    // Record consent acceptance with the backend
    login(authPending.access_token, { ...authPending.user, consent_current: true });

    consentApi.accept({
      consents: [
        { document_type: "terms_of_service", document_version: "1.0.0", document_hash: "" },
        { document_type: "privacy_policy", document_version: "1.0.0", document_hash: "" },
        { document_type: "ai_disclosure", document_version: "1.0.0", document_hash: "" },
      ],
    }).catch(() => {
      // Non-blocking — consent is recorded locally even if API fails
    });

    completeLogin({ ...authPending, user: { ...authPending.user, consent_current: true } });
  };

  // ── Consent dialog ──────────────────────────────────────────────────────
  if (showConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          ref={consentModalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-title"
          tabIndex={-1}
          className="mom-glass-panel border border-white/30 p-8 w-full max-w-md outline-none"
        >
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[48px] text-brand mb-4 block">
              verified_user
            </span>
            <h1 id="consent-title" className="font-headline text-alphaai-2xl font-bold text-foreground mb-2">
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
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-brand font-medium underline underline-offset-2">
                  Terms of Service
                </a>
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
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-brand font-medium underline underline-offset-2">
                  Privacy Policy
                </a>
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
                <a href="/legal/ai-disclosure" target="_blank" rel="noopener noreferrer" className="text-brand font-medium underline underline-offset-2">
                  AI Disclosure
                </a>{" "}
                — AI suggestions are not professional advice
              </span>
            </label>
          </div>

          <button
            onClick={handleConsentSubmit}
            disabled={!allConsented}
            className="mom-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "signup" ? "Continue — Start 7-Day Free Trial" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  // ── Login / Signup form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">
              {mode === "signup" ? "family_restroom" : "waving_hand"}
            </span>
          </div>
          <h1 className="font-headline text-alphaai-3xl font-extrabold text-foreground">
            {mode === "signup" ? "Join Alpha.Mom" : "Welcome Back"}
          </h1>
          <p className="text-alphaai-sm text-muted-foreground mt-1">
            {mode === "signup"
              ? "Your household AI assistant starts here."
              : "Sign in to pick up where you left off."}
          </p>
        </div>

        <div className="mom-glass-panel border border-white/30 p-6">
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setSubmitError("Google sign-in failed. Please try again.")}
              width="360"
              text={mode === "login" ? "signin_with" : "continue_with"}
              shape="pill"
              theme="outline"
            />
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border-subtle/30" />
            <span className="text-alphaai-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border-subtle/30" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <label htmlFor="auth-name" className="sr-only">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="mom-input"
                />
              </>
            )}
            <label htmlFor="auth-email" className="sr-only">Email address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="mom-input"
            />
            <div className="relative">
              <label htmlFor="auth-password" className="sr-only">Password</label>
              <input
                id="auth-password"
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
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {mode === "signup" && (
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim().toUpperCase())}
                placeholder="Invite code (optional)"
                className="mom-input"
                aria-label="Beta invite code"
              />
            )}
            <button type="submit" disabled={isSubmitting} className="mom-btn-primary w-full disabled:opacity-60">
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account — 7-Day Free Trial"}
            </button>
            {submitError && (
              <p className="text-alphaai-xs text-error text-center">
                {submitError}
              </p>
            )}
          </form>

          {showModeToggle && (
            <p className="text-center text-alphaai-sm text-muted-foreground mt-4">
              {mode === "login" ? "Don\u2019t have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-brand font-medium"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}

          {!showModeToggle && (
            <p className="text-center text-alphaai-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-brand font-medium">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
