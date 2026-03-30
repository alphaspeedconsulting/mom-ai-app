"use client";

import { create } from "zustand";
import type { FamilyGoal } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface GoalsState {
  goals: FamilyGoal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.goals.list(householdId);
      set({ goals: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load goals.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
