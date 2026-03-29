"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

type Platform = "ios" | "android" | "desktop" | "detecting";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export default function InstallPage() {
  const user = useAuthStore((s) => s.user);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [platform] = useState<Platform>(() =>
    typeof window === "undefined" ? "detecting" : detectPlatform()
  );
  const [installing, setInstalling] = useState(false);

  const getNext = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") ?? (user?.household_id ? "/dashboard" : "/onboarding/household");
  }, [user?.household_id]);

  const handleContinue = useCallback(() => {
    window.location.href = getNext();
  }, [getNext]);

  // If already installed, skip straight to the app
  useEffect(() => {
    if (isInstalled) handleContinue();
  }, [isInstalled, handleContinue]);

  const handleInstall = async () => {
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 mom-gradient-hero rounded-3xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[40px] text-on-primary">
              install_mobile
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-alphaai-3xl font-extrabold text-foreground mb-2">
            Add to your<br />home screen
          </h1>
          <p className="text-alphaai-sm text-muted-foreground">
            Install Alpha.Mom for the full app experience — works offline and opens like a native app.
          </p>
        </div>

        {/* Platform-specific instructions */}
        {platform === "ios" && (
          <div className="mom-card p-5 mb-6 space-y-4">
            <p className="text-alphaai-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Safari on iPhone / iPad
            </p>
            {[
              { icon: "ios_share", step: "1", text: 'Tap the Share button at the bottom of Safari' },
              { icon: "swipe_down", step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
              { icon: "add_circle", step: "3", text: 'Tap "Add" in the top right corner' },
            ].map(({ icon, step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-brand">{icon}</span>
                </div>
                <p className="text-alphaai-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}

        {platform === "android" && !isInstallable && (
          <div className="mom-card p-5 mb-6 space-y-4">
            <p className="text-alphaai-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Chrome on Android
            </p>
            {[
              { icon: "more_vert", step: "1", text: 'Tap the menu (⋮) in the top right of Chrome' },
              { icon: "add_to_home_screen", step: "2", text: 'Tap "Add to Home screen"' },
              { icon: "check_circle", step: "3", text: 'Tap "Add" to confirm' },
            ].map(({ icon, step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-brand">{icon}</span>
                </div>
                <p className="text-alphaai-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}

        {platform === "desktop" && (
          <div className="mom-card p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-brand">smartphone</span>
              </div>
              <p className="text-alphaai-sm text-foreground">
                Open <span className="font-semibold text-brand">mom.alphaspeedai.com</span> on your phone&apos;s browser to install the app on your home screen.
              </p>
            </div>
          </div>
        )}

        {/* Install button — Android with prompt available */}
        {platform === "android" && isInstallable && (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="mom-btn-primary w-full mb-4 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">install_mobile</span>
            {installing ? "Installing…" : "Install Alpha.Mom"}
          </button>
        )}

        {/* iOS: after reading instructions, continue */}
        {platform === "ios" && (
          <button onClick={handleContinue} className="mom-btn-primary w-full mb-4">
            I&apos;ve added it — Open App
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}

        {/* Android manual / desktop: primary continue */}
        {(platform === "desktop" || (platform === "android" && !isInstallable)) && (
          <button onClick={handleContinue} className="mom-btn-primary w-full mb-4">
            Continue to App
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}

        {/* Skip link — always available */}
        <button
          onClick={handleContinue}
          className="w-full text-center text-alphaai-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Skip for now — open in browser
        </button>
      </div>
    </div>
  );
}
