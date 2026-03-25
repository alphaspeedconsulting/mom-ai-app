/**
 * IndexedDB-powered offline storage for Mom.alpha PWA.
 *
 * - Caches last-fetched calendar events and grocery lists for offline read
 * - Queues deterministic write operations for replay on reconnect
 * - Last-write-wins conflict policy (v1)
 */

const DB_NAME = "mom-alpha-offline";
const DB_VERSION = 1;

// Store names
const CACHE_STORE = "cache";
const QUEUE_STORE = "offline_queue";

// ---------------------------------------------------------------------------
// DB init
// ---------------------------------------------------------------------------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Cached data (offline reads)
// ---------------------------------------------------------------------------

export interface CachedData<T> {
  key: string;
  data: T;
  updatedAt: string; // ISO datetime
}

export async function cacheData<T>(key: string, data: T): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CACHE_STORE, "readwrite");
  const store = tx.objectStore(CACHE_STORE);

  store.put({
    key,
    data,
    updatedAt: new Date().toISOString(),
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedData<T>(
  key: string
): Promise<CachedData<T> | null> {
  const db = await openDB();
  const tx = db.transaction(CACHE_STORE, "readonly");
  const store = tx.objectStore(CACHE_STORE);
  const req = store.get(key);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Offline write queue
// ---------------------------------------------------------------------------

export interface QueuedOperation {
  id?: number;
  method: "POST" | "PUT" | "DELETE";
  path: string;
  body?: string;
  createdAt: string;
}

export async function enqueueOperation(
  op: Omit<QueuedOperation, "id" | "createdAt">
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);

  store.add({
    ...op,
    createdAt: new Date().toISOString(),
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readonly");
  const store = tx.objectStore(QUEUE_STORE);
  const req = store.getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  store.clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  store.delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Sync replay — sequential with visible status
// ---------------------------------------------------------------------------

export async function replayQueue(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  const ops = await getQueuedOperations();
  if (ops.length === 0) return { synced: 0, failed: 0 };

  const token =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mom-alpha-auth") ?? "{}")?.state
          ?.token
      : null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  let synced = 0;
  let failed = 0;

  for (const op of ops) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}${op.path}`, {
        method: op.method,
        headers,
        body: op.body,
      });

      if (res.ok && op.id != null) {
        await removeFromQueue(op.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    onProgress?.(synced, ops.length);
  }

  return { synced, failed };
}
