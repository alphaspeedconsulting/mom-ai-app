/**
 * Local Memory Store — Mom's Second Brain
 *
 * IndexedDB-backed persistent memory that stays on-device.
 * Stores family context, quick notes, preferences, and chat history
 * so agents can share knowledge and nothing is lost on reload.
 *
 * Stores:
 *  - memory_items: Family facts, preferences, notes (cross-agent context)
 *  - chat_history: Persisted chat messages per agent
 */

import type { AgentType } from "@/types/api-contracts";

const DB_NAME = "mom-alpha-memory";
const DB_VERSION = 1;

const MEMORY_STORE = "memory_items";
const CHAT_HISTORY_STORE = "chat_history";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryCategory =
  | "family_fact"      // "Jake is allergic to peanuts"
  | "preference"       // "We prefer organic produce"
  | "quick_note"       // Brain-dump capture
  | "agent_insight"    // Auto-extracted from agent conversations
  | "routine"          // "Soccer practice every Tuesday at 4pm"
  | "important_date";  // Birthdays, anniversaries, deadlines

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  tags: string[];              // Searchable tags (e.g., agent types, member names)
  source_agent?: AgentType;    // Which agent created this (if auto-extracted)
  pinned: boolean;             // User-pinned items surface first
  created_at: string;          // ISO datetime
  updated_at: string;
}

export interface PersistedChatMessage {
  id: string;
  agent_type: AgentType;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// DB init
// ---------------------------------------------------------------------------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(MEMORY_STORE)) {
        const store = db.createObjectStore(MEMORY_STORE, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("tags", "tags", { unique: false, multiEntry: true });
        store.createIndex("pinned", "pinned", { unique: false });
        store.createIndex("updated_at", "updated_at", { unique: false });
      }

      if (!db.objectStoreNames.contains(CHAT_HISTORY_STORE)) {
        const store = db.createObjectStore(CHAT_HISTORY_STORE, { keyPath: "id" });
        store.createIndex("agent_type", "agent_type", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Memory Items CRUD
// ---------------------------------------------------------------------------

export async function addMemory(
  item: Omit<MemoryItem, "id" | "created_at" | "updated_at">
): Promise<MemoryItem> {
  const db = await openDB();
  const now = new Date().toISOString();
  const record: MemoryItem = {
    ...item,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    created_at: now,
    updated_at: now,
  };

  const tx = db.transaction(MEMORY_STORE, "readwrite");
  tx.objectStore(MEMORY_STORE).put(record);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateMemory(
  id: string,
  patch: Partial<Pick<MemoryItem, "content" | "category" | "tags" | "pinned">>
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MEMORY_STORE, "readwrite");
  const store = tx.objectStore(MEMORY_STORE);
  const req = store.get(id);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      if (!req.result) {
        reject(new Error(`Memory item ${id} not found`));
        return;
      }
      const updated = {
        ...req.result,
        ...patch,
        updated_at: new Date().toISOString(),
      };
      store.put(updated);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMemory(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MEMORY_STORE, "readwrite");
  tx.objectStore(MEMORY_STORE).delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMemories(): Promise<MemoryItem[]> {
  const db = await openDB();
  const tx = db.transaction(MEMORY_STORE, "readonly");
  const req = tx.objectStore(MEMORY_STORE).getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const items = (req.result as MemoryItem[]) ?? [];
      // Pinned first, then by most recently updated
      items.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updated_at.localeCompare(a.updated_at);
      });
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getMemoriesByCategory(
  category: MemoryCategory
): Promise<MemoryItem[]> {
  const db = await openDB();
  const tx = db.transaction(MEMORY_STORE, "readonly");
  const index = tx.objectStore(MEMORY_STORE).index("category");
  const req = index.getAll(category);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as MemoryItem[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function getMemoriesByTag(tag: string): Promise<MemoryItem[]> {
  const db = await openDB();
  const tx = db.transaction(MEMORY_STORE, "readonly");
  const index = tx.objectStore(MEMORY_STORE).index("tags");
  const req = index.getAll(tag);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as MemoryItem[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Search memories by text content (simple substring match).
 * Good enough for local search; no external dependencies needed.
 */
export async function searchMemories(query: string): Promise<MemoryItem[]> {
  const all = await getAllMemories();
  const lower = query.toLowerCase();
  return all.filter(
    (item) =>
      item.content.toLowerCase().includes(lower) ||
      item.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

/**
 * Get context relevant to a specific agent — returns memories tagged
 * with the agent type plus all pinned and family_fact items.
 * This is what gets injected into agent conversations.
 */
export async function getAgentContext(agentType: AgentType): Promise<MemoryItem[]> {
  const all = await getAllMemories();
  return all.filter(
    (item) =>
      item.pinned ||
      item.category === "family_fact" ||
      item.category === "routine" ||
      item.category === "important_date" ||
      item.tags.includes(agentType)
  );
}

// ---------------------------------------------------------------------------
// Chat History Persistence
// ---------------------------------------------------------------------------

export async function saveChatMessage(
  msg: PersistedChatMessage
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHAT_HISTORY_STORE, "readwrite");
  tx.objectStore(CHAT_HISTORY_STORE).put(msg);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChatHistory(
  agentType: AgentType
): Promise<PersistedChatMessage[]> {
  const db = await openDB();
  const tx = db.transaction(CHAT_HISTORY_STORE, "readonly");
  const index = tx.objectStore(CHAT_HISTORY_STORE).index("agent_type");
  const req = index.getAll(agentType);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const msgs = (req.result as PersistedChatMessage[]) ?? [];
      msgs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      resolve(msgs);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearChatHistory(agentType: AgentType): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHAT_HISTORY_STORE, "readwrite");
  const store = tx.objectStore(CHAT_HISTORY_STORE);
  const index = store.index("agent_type");
  const req = index.getAllKeys(agentType);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      for (const key of req.result) {
        store.delete(key);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllChatHistory(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHAT_HISTORY_STORE, "readwrite");
  tx.objectStore(CHAT_HISTORY_STORE).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
