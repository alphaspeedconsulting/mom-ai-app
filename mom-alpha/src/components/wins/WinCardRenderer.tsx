"use client";

import React, { useCallback, useState } from "react";
import { useShare } from "@/hooks/use-share";
import * as api from "@/lib/api-client";

interface WinCardRendererProps {
  /** CSS selector or element ID of the card to capture */
  cardElementId: string;
}

/**
 * Renders the Win Card DOM element to a PNG blob using html2canvas,
 * then triggers sharing via the Web Share API.
 */
export function WinCardRenderer({ cardElementId }: WinCardRendererProps) {
  const { share, canShare } = useShare();
  const [status, setStatus] = useState<"idle" | "rendering" | "sharing" | "copied" | "error">("idle");

  const handleShare = useCallback(async () => {
    const el = document.getElementById(cardElementId);
    if (!el) return;

    setStatus("rendering");

    try {
      // Dynamic import to avoid bundling html2canvas for non-sharing users
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      if (!blob) {
        setStatus("error");
        return;
      }

      setStatus("sharing");
      const file = new File([blob], "weekly-wins.png", { type: "image/png" });

      const result = await share({
        title: "My Weekly Wins — Alpha.Mom",
        text: "Check out what our family accomplished this week!",
        files: [file],
        url: "https://mom.alphaspeedai.com",
      });

      // Track the viral event (fire-and-forget)
      api.viral.track({
        event_type: "share_win_card",
        metadata: { method: result },
      }).catch(() => {});

      if (result === "copied") {
        setStatus("copied");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [cardElementId, share]);

  const handleDownload = useCallback(async () => {
    const el = document.getElementById(cardElementId);
    if (!el) return;

    setStatus("rendering");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = "weekly-wins.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      setStatus("idle");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [cardElementId]);

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleShare}
        disabled={status === "rendering" || status === "sharing"}
        className="mom-btn-primary flex-1"
      >
        <span className="material-symbols-outlined text-[20px]">
          {status === "copied" ? "check" : status === "error" ? "error" : "share"}
        </span>
        {status === "idle" && (canShare ? "Share" : "Copy Link")}
        {status === "rendering" && "Preparing..."}
        {status === "sharing" && "Sharing..."}
        {status === "copied" && "Copied!"}
        {status === "error" && "Try Again"}
      </button>
      <button
        onClick={handleDownload}
        disabled={status === "rendering"}
        className="mom-btn-outline px-4"
        aria-label="Download as image"
      >
        <span className="material-symbols-outlined text-[20px]">download</span>
      </button>
    </div>
  );
}
