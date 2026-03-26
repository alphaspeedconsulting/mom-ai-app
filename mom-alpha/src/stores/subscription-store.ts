"use client";

import { create } from "zustand";
import type { BudgetResponse, CheckoutTrialRequest } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface SubscriptionState {
  budget: BudgetResponse | null;
  isLoading: boolean;

  fetchBudget: (householdId: string) => Promise<void>;
  startCheckout: (tier: "family" | "family_pro", billingCycle?: "monthly" | "yearly", promotionCode?: string) => Promise<void>;
  openPortal: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  budget: null,
  isLoading: false,

  fetchBudget: async (householdId) => {
    set({ isLoading: true });
    try {
      const data = await api.budget.get(householdId);
      set({ budget: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  startCheckout: async (tier, billingCycle = "monthly", promotionCode) => {
    const baseUrl = window.location.origin;
    const body: CheckoutTrialRequest = {
      tier,
      billing_cycle: billingCycle,
      success_url: `${baseUrl}/settings?checkout=success`,
      cancel_url: `${baseUrl}/settings?checkout=cancelled`,
    };
    if (promotionCode) body.promotion_code = promotionCode;
    const data = await api.stripe.createCheckout(body);
    window.location.href = data.checkout_url;
  },

  openPortal: async () => {
    const data = await api.stripe.getPortalUrl();
    window.location.href = data.url;
  },
}));
