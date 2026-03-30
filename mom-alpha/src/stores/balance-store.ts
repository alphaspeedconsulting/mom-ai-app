"use client";

import { create } from "zustand";
import type { CoParentBalance } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface BalanceState {
  balance: CoParentBalance | null;
  isLoading: boolean;
  error: string | null;

  fetchBalance: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useBalanceStore = create<BalanceState>()((set) => ({
  balance: null,
  isLoading: false,
  error: null,

  fetchBalance: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.balance.get(householdId);
      set({ balance: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load balance.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
