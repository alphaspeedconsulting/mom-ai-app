"use client";

import { create } from "zustand";
import type { AgentType } from "@/types/api-contracts";
import type { MemoryCategory, MemoryItem } from "@/lib/memory-store";
import * as memoryDB from "@/lib/memory-store";

interface MemoryState {
  items: MemoryItem[];
  isLoaded: boolean;

  /** Load all memories from IndexedDB into state */
  hydrate: () => Promise<void>;

  /** Add a new memory item */
  add: (
    item: Omit<MemoryItem, "id" | "created_at" | "updated_at">
  ) => Promise<MemoryItem>;

  /** Update an existing memory */
  update: (
    id: string,
    patch: Partial<Pick<MemoryItem, "content" | "category" | "tags" | "pinned">>
  ) => Promise<void>;

  /** Delete a memory */
  remove: (id: string) => Promise<void>;

  /** Search memories by text */
  search: (query: string) => Promise<MemoryItem[]>;

  /** Get context relevant to a specific agent */
  getAgentContext: (agentType: AgentType) => Promise<MemoryItem[]>;

  /** Get memories by category */
  getByCategory: (category: MemoryCategory) => Promise<MemoryItem[]>;
}

export const useMemoryStore = create<MemoryState>()((set, get) => ({
  items: [],
  isLoaded: false,

  hydrate: async () => {
    if (get().isLoaded) return;
    const items = await memoryDB.getAllMemories();
    set({ items, isLoaded: true });
  },

  add: async (item) => {
    const record = await memoryDB.addMemory(item);
    set((state) => ({ items: [record, ...state.items] }));
    return record;
  },

  update: async (id, patch) => {
    await memoryDB.updateMemory(id, patch);
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...patch, updated_at: new Date().toISOString() }
          : item
      ),
    }));
  },

  remove: async (id) => {
    await memoryDB.deleteMemory(id);
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },

  search: (query) => memoryDB.searchMemories(query),

  getAgentContext: (agentType) => memoryDB.getAgentContext(agentType),

  getByCategory: (category) => memoryDB.getMemoriesByCategory(category),
}));
