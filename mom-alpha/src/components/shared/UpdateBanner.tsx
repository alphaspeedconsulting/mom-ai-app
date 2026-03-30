"use client";

import { useSwUpdate } from "@/hooks/use-sw-update";

export function UpdateBanner() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useSwUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-radius-default bg-tertiary-container text-foreground px-4 py-3 shadow-lg flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[20px] text-tertiary">
          system_update
        </span>
        <p className="text-alphaai-sm font-medium">
          A new version is available
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={applyUpdate}
          className="px-3 py-1.5 bg-brand text-on-primary rounded-full text-alphaai-xs font-semibold"
        >
          Update
        </button>
        <button
          onClick={dismissUpdate}
          className="p-1 text-muted-foreground"
          aria-label="Dismiss update notification"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
