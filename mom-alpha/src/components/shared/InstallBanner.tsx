"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallBanner() {
  const { isInstallable, promptInstall, dismissInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-brand text-on-primary px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[20px]">
          install_mobile
        </span>
        <p className="text-alphaai-sm font-medium truncate">
          Add Mom.alpha to your home screen
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={promptInstall}
          className="px-3 py-1.5 bg-on-primary/20 rounded-full text-alphaai-xs font-semibold"
        >
          Install
        </button>
        <button
          onClick={dismissInstall}
          className="p-1"
          aria-label="Dismiss install prompt"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
