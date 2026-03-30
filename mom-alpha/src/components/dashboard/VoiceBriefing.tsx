"use client";

import React, { useCallback, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useVoiceBriefing } from "@/hooks/use-voice-briefing";
import * as api from "@/lib/api-client";

/**
 * Play/pause button for the voice morning briefing.
 * Placed in the DailyBrief header gradient area.
 */
export function VoiceBriefingButton() {
  const householdId = useAuthStore((s) => s.user?.household_id);
  const { state, isSupported, speak, pause, resume } = useVoiceBriefing();
  const [fetching, setFetching] = useState(false);

  const handlePress = useCallback(async () => {
    if (state === "playing") {
      pause();
      return;
    }
    if (state === "paused") {
      resume();
      return;
    }

    if (!householdId) return;

    setFetching(true);
    try {
      const brief = await api.voiceBrief.get(householdId);
      speak(brief.text);
    } catch {
      // Silently fail — button just won't play
    } finally {
      setFetching(false);
    }
  }, [state, householdId, speak, pause, resume]);

  if (!isSupported) return null;

  const icon =
    state === "playing"
      ? "pause"
      : state === "paused"
        ? "play_arrow"
        : state === "loading" || fetching
          ? "hourglass_top"
          : "volume_up";

  return (
    <button
      onClick={handlePress}
      disabled={fetching}
      className="w-9 h-9 rounded-full bg-on-primary/20 backdrop-blur-md flex items-center justify-center text-on-primary hover:bg-on-primary/30 transition-colors disabled:opacity-50"
      aria-label={state === "playing" ? "Pause briefing" : "Play morning briefing"}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
    </button>
  );
}
