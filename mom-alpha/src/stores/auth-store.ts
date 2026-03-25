"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubscriptionTier } from "@/types/api-contracts";

interface User {
  id: string;
  email: string;
  name: string;
  household_id: string | null;
  tier: SubscriptionTier;
  consent_current: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateConsent: (current: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      updateConsent: (consent_current) =>
        set((state) => ({
          user: state.user ? { ...state.user, consent_current } : null,
        })),
    }),
    {
      name: "mom-alpha-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
