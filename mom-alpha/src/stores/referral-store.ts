"use client";

import { create } from "zustand";
import type { ReferralInfo } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface ReferralState {
  referral: ReferralInfo | null;
  isLoading: boolean;
  error: string | null;

  fetchReferral: () => Promise<void>;
  clearError: () => void;
}

export const useReferralStore = create<ReferralState>()((set) => ({
  referral: null,
  isLoading: false,
  error: null,

  fetchReferral: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.referral.get();
      set({ referral: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load referral info.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
