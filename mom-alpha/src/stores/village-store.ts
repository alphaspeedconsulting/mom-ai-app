"use client";

import { create } from "zustand";
import type { VillagePost, VillagePostCategory } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface VillageState {
  posts: VillagePost[];
  isLoading: boolean;
  error: string | null;
  nextCursor: string | null;
  category: VillagePostCategory | "all";

  fetchFeed: (category?: VillagePostCategory | "all") => Promise<void>;
  loadMore: () => Promise<void>;
  setCategory: (category: VillagePostCategory | "all") => void;
  updatePost: (post: VillagePost) => void;
  addPost: (post: VillagePost) => void;
  clearError: () => void;
}

export const useVillageStore = create<VillageState>()((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  nextCursor: null,
  category: "all",

  fetchFeed: async (category) => {
    const cat = category ?? get().category;
    set({ isLoading: true, error: null, category: cat });
    try {
      const data = await api.village.feed({
        category: cat === "all" ? undefined : cat,
      });
      set({ posts: data.posts, nextCursor: data.next_cursor, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load feed.",
      });
    }
  },

  loadMore: async () => {
    const { nextCursor, category, posts } = get();
    if (!nextCursor) return;
    try {
      const data = await api.village.feed({
        category: category === "all" ? undefined : category,
        cursor: nextCursor,
      });
      set({ posts: [...posts, ...data.posts], nextCursor: data.next_cursor });
    } catch {
      // Silently fail on load more
    }
  },

  setCategory: (category) => {
    set({ category });
    get().fetchFeed(category);
  },

  updatePost: (post) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === post.id ? post : p)),
    })),

  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),

  clearError: () => set({ error: null }),
}));
