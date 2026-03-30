"use client";

import { create } from "zustand";
import type { WeeklyWinSummary } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface WinsState {
  weeklyWin: WeeklyWinSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchWeeklyWin: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useWinsStore = create<WinsState>()((set) => ({
  weeklyWin: null,
  isLoading: false,
  error: null,

  fetchWeeklyWin: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.wins.weekly(householdId);
      set({ weeklyWin: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load weekly wins.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
