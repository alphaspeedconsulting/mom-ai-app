"use client";

import { useEffect } from "react";
import { useMemoryStore } from "@/stores/memory-store";

/**
 * Client component that hydrates the memory store from IndexedDB on app mount.
 * Renders nothing — exists purely for the side effect.
 */
export function MemoryHydrator() {
  const hydrate = useMemoryStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
