"use client";

import { create } from "zustand";
import type { AgentType } from "@/types/api-contracts";
import type { MemoryCategory, MemoryItem, InboxItem } from "@/lib/memory-store";
import * as memoryDB from "@/lib/memory-store";

interface MemoryState {
  items: MemoryItem[];
  inbox: InboxItem[];
  isLoaded: boolean;

  /** Load all memories + inbox from IndexedDB into state */
  hydrate: () => Promise<void>;

  // --- Memory CRUD ---
  add: (
    item: Omit<MemoryItem, "id" | "created_at" | "updated_at">
  ) => Promise<MemoryItem>;
  update: (
    id: string,
    patch: Partial<Pick<MemoryItem, "content" | "category" | "tags" | "pinned">>
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  search: (query: string) => Promise<MemoryItem[]>;
  getAgentContext: (agentType: AgentType) => Promise<MemoryItem[]>;
  getByCategory: (category: MemoryCategory) => Promise<MemoryItem[]>;

  // --- Inbox CRUD ---
  addInbox: (content: string, assignedAgent?: AgentType) => Promise<InboxItem>;
  updateInbox: (
    id: string,
    patch: Partial<Pick<InboxItem, "status" | "assigned_agent" | "agent_response" | "content" | "assigned_to" | "assigned_to_name" | "created_by_name" | "shared_id">>
  ) => Promise<void>;
  removeInbox: (id: string) => Promise<void>;
  refreshInbox: () => Promise<void>;
}

export const useMemoryStore = create<MemoryState>()((set, get) => ({
  items: [],
  inbox: [],
  isLoaded: false,

  hydrate: async () => {
    if (get().isLoaded) return;
    const [items, inbox] = await Promise.all([
      memoryDB.getAllMemories(),
      memoryDB.getAllInboxItems(),
    ]);
    set({ items, inbox, isLoaded: true });
  },

  // --- Memory ---
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

  // --- Inbox ---
  addInbox: async (content, assignedAgent) => {
    const item = await memoryDB.addInboxItem(content, assignedAgent);
    set((state) => ({ inbox: [item, ...state.inbox] }));
    return item;
  },

  updateInbox: async (id, patch) => {
    await memoryDB.updateInboxItem(id, patch);
    set((state) => ({
      inbox: state.inbox.map((item) =>
        item.id === id
          ? { ...item, ...patch, updated_at: new Date().toISOString() }
          : item
      ),
    }));
  },

  removeInbox: async (id) => {
    await memoryDB.deleteInboxItem(id);
    set((state) => ({ inbox: state.inbox.filter((item) => item.id !== id) }));
  },

  refreshInbox: async () => {
    const inbox = await memoryDB.getAllInboxItems();
    set({ inbox });
  },
}));
