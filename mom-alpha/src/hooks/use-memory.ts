"use client";

import { useEffect } from "react";
import { useMemoryStore } from "@/stores/memory-store";

/**
 * Hook to hydrate the memory store from IndexedDB on mount.
 * Call this once in a layout or top-level component.
 *
 * Returns the store state and actions for convenience.
 */
export function useMemory() {
  const store = useMemoryStore();

  useEffect(() => {
    store.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
