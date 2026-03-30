"use client";

import React, { useEffect, useState } from "react";

interface CelebrationToastProps {
  message: string;
  icon?: string;
  visible: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * Slide-up toast for celebrating achievements.
 * Auto-dismisses after a configurable duration.
 */
export function CelebrationToast({
  message,
  icon = "celebration",
  visible,
  onDismiss,
  autoDismissMs = 4000,
}: CelebrationToastProps) {
  const [show, setShow] = useState(false);

  // Animate in on rising edge of visible, auto-dismiss after delay
  useEffect(() => {
    if (!visible) return;

    const enterFrame = requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onDismiss(), 300);
    }, autoDismissMs);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(timer);
    };
    // onDismiss is stable (useCallback in parent) — safe to omit for re-render avoidance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoDismissMs]);

  if (!visible) return null;

  return (
    <div
      className={`mom-celebration-toast ${show ? "mom-celebration-toast--visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-glow/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[24px] text-brand" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <p className="text-alphaai-sm font-semibold text-foreground flex-1">
          {message}
        </p>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onDismiss, 300);
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
