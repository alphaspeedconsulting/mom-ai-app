"use client";

import { useCallback } from "react";

interface ShareData {
  title: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Web Share API wrapper with clipboard fallback.
 * Returns share() and a boolean indicating native support.
 */
export function useShare() {
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const canShareFiles =
    typeof navigator !== "undefined" &&
    !!navigator.canShare;

  const share = useCallback(
    async (data: ShareData): Promise<"shared" | "copied" | "dismissed"> => {
      // Try native share (with files if supported)
      if (canShare) {
        try {
          if (data.files?.length && canShareFiles) {
            const testPayload = { files: data.files };
            if (navigator.canShare(testPayload)) {
              await navigator.share({
                title: data.title,
                text: data.text,
                files: data.files,
              });
              return "shared";
            }
          }
          // Share without files
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url,
          });
          return "shared";
        } catch (err) {
          // User cancelled the share dialog
          if (err instanceof Error && err.name === "AbortError") {
            return "dismissed";
          }
          // Fall through to clipboard
        }
      }

      // Fallback: copy URL or text to clipboard
      const copyText = data.url ?? data.text ?? data.title;
      try {
        await navigator.clipboard.writeText(copyText);
        return "copied";
      } catch {
        return "dismissed";
      }
    },
    [canShare, canShareFiles],
  );

  return { share, canShare };
}
