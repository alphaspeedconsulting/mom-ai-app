"use client";

import React, { useCallback, useState } from "react";
import { useShare } from "@/hooks/use-share";
import * as api from "@/lib/api-client";
import type { ShareableItemType, ViralEventType } from "@/types/api-contracts";

interface ShareButtonProps {
  itemType: ShareableItemType;
  title: string;
  text?: string;
  url?: string;
  /** Viral event type to track on share */
  trackEvent?: ViralEventType;
  className?: string;
  /** Compact mode — icon only */
  compact?: boolean;
}

/**
 * Reusable share button — uses Web Share API with clipboard fallback.
 * Can be placed next to any shareable item (grocery list, event, task).
 */
export function ShareButton({
  itemType,
  title,
  text,
  url,
  trackEvent = "share_link",
  className = "",
  compact = false,
}: ShareButtonProps) {
  const { share, canShare } = useShare();
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  const handleShare = useCallback(async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

    const result = await share({
      title,
      text: text ?? `Check this out on Alpha.Mom: ${title}`,
      url: shareUrl,
    });

    if (result === "copied") {
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    }

    // Track viral event (fire-and-forget)
    api.viral.track({
      event_type: trackEvent,
      metadata: { item_type: itemType, method: result },
    }).catch(() => {});
  }, [share, title, text, url, trackEvent, itemType]);

  if (compact) {
    return (
      <button
        onClick={handleShare}
        className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-muted-foreground hover:text-brand transition-colors ${className}`}
        aria-label={status === "copied" ? "Link copied" : canShare ? "Share" : "Copy link"}
      >
        <span className="material-symbols-outlined text-[16px]">
          {status === "copied" ? "check" : "share"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-alphaai-xs text-muted-foreground hover:text-brand hover:bg-surface-active transition-colors ${className}`}
      aria-label={status === "copied" ? "Link copied" : canShare ? "Share" : "Copy link"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {status === "copied" ? "check" : "share"}
      </span>
      {status === "copied" ? "Copied!" : canShare ? "Share" : "Copy Link"}
    </button>
  );
}
