"use client";

import { useCallback, useRef, useState } from "react";

type VoiceState = "idle" | "loading" | "playing" | "paused" | "error";

/**
 * Web Speech Synthesis API hook for narrating the morning briefing.
 * Handles iOS Safari quirks (requires user gesture to start).
 */
export function useVoiceBriefing() {
  const [state, setState] = useState<VoiceState>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        setState("error");
        return;
      }

      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Try to pick a high-quality voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Google") ||
            v.name.includes("Enhanced")),
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setState("playing");
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("error");
      utterance.onpause = () => setState("paused");
      utterance.onresume = () => setState("playing");

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setState("loading");
    },
    [isSupported],
  );

  const pause = useCallback(() => {
    if (isSupported) window.speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) window.speechSynthesis.resume();
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setState("idle");
    }
  }, [isSupported]);

  return { state, isSupported, speak, pause, resume, stop };
}
