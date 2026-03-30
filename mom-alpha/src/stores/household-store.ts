"use client";

import { create } from "zustand";
import * as api from "@/lib/api-client";
import type {
  Household,
  HouseholdCreateRequest,
  HouseholdInviteRequest,
  HouseholdInviteResponse,
  HouseholdMembersResponse,
  HouseholdUsageDashboard,
  JoinHouseholdRequest,
  SyncDigestResponse,
} from "@/types/api-contracts";

interface HouseholdState {
  household: Household | null;
  members: HouseholdMembersResponse["members"];
  usage: HouseholdUsageDashboard | null;
  digest: SyncDigestResponse | null;
  latestInvite: HouseholdInviteResponse | null;
  isLoading: boolean;
  error: string | null;

  createHousehold: (name: string, members?: HouseholdCreateRequest["members"]) => Promise<Household | null>;
  joinHousehold: (body: JoinHouseholdRequest) => Promise<Household | null>;
  fetchHousehold: (householdId: string) => Promise<void>;
  fetchMembers: (householdId: string) => Promise<void>;
  inviteCoParent: (householdId: string, body: HouseholdInviteRequest) => Promise<HouseholdInviteResponse | null>;
  fetchUsage: (householdId: string) => Promise<void>;
  fetchSyncDigest: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useHouseholdStore = create<HouseholdState>()((set) => ({
  household: null,
  members: [],
  usage: null,
  digest: null,
  latestInvite: null,
  isLoading: false,
  error: null,

  createHousehold: async (name, members = []) => {
    set({ isLoading: true, error: null });
    try {
      const household = await api.household.create({ name, members });
      set({ household, isLoading: false });
      return household;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not create household.",
      });
      return null;
    }
  },

  joinHousehold: async (body) => {
    set({ isLoading: true, error: null });
    try {
      const household = await api.household.join(body);
      set({ household, isLoading: false });
      return household;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not join household.",
      });
      return null;
    }
  },

  fetchHousehold: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const household = await api.household.get(householdId);
      set({ household, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load household.",
      });
    }
  },

  fetchMembers: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.household.listMembers(householdId);
      set({ members: response.members, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load members.",
      });
    }
  },

  inviteCoParent: async (householdId, body) => {
    set({ isLoading: true, error: null });
    try {
      const invite = await api.household.invite(householdId, body);
      set({ latestInvite: invite, isLoading: false });
      return invite;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not create invite.",
      });
      return null;
    }
  },

  fetchUsage: async (householdId) => {
    // Usage endpoint may not exist yet (404) — fail silently since it's
    // non-critical data. Don't set error state as it pollutes the UI.
    try {
      const usage = await api.household.usageDashboard(householdId);
      set({ usage });
    } catch {
      // Silently ignore — usage data is optional
    }
  },

  fetchSyncDigest: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const digest = await api.household.syncDigest(householdId);
      set({ digest, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load sync digest.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
