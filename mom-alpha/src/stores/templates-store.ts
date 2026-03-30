"use client";

import { create } from "zustand";
import type { FamilyTemplate } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface TemplatesState {
  templates: FamilyTemplate[];
  selected: FamilyTemplate | null;
  isLoading: boolean;
  error: string | null;

  fetchTemplates: (params?: { category?: string; query?: string }) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

export const useTemplatesStore = create<TemplatesState>()((set) => ({
  templates: [],
  selected: null,
  isLoading: false,
  error: null,

  fetchTemplates: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.templates.list(params);
      set({ templates: data.templates, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load templates.",
      });
    }
  },

  fetchTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.templates.get(id);
      set({ selected: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load template.",
      });
    }
  },

  clearSelected: () => set({ selected: null }),
  clearError: () => set({ error: null }),
}));
