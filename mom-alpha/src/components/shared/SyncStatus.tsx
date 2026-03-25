"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueuedOperations, replayQueue } from "@/lib/offline-store";

/**
 * Shows "Syncing N changes..." banner when coming back online
 * with queued offline operations.
 */
export function SyncStatus() {
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const checkQueue = useCallback(async () => {
    try {
      const ops = await getQueuedOperations();
      setQueueCount(ops.length);
    } catch {
      // IndexedDB unavailable
    }
  }, []);

  const doSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncedCount(0);

    try {
      await replayQueue((synced, _total) => {
        setSyncedCount(synced);
      });
    } finally {
      setSyncing(false);
      await checkQueue();
    }
  }, [syncing, checkQueue]);

  useEffect(() => {
    checkQueue();

    const handleOnline = () => {
      checkQueue().then(() => {
        // Auto-sync when coming back online
        doSync();
      });
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [checkQueue, doSync]);

  if (queueCount === 0 && !syncing) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="mom-card p-3 flex items-center gap-3 border border-border-subtle/20">
        {syncing ? (
          <>
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-alphaai-sm text-foreground font-medium">
              Syncing {syncedCount}/{queueCount} changes...
            </p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px] text-secondary flex-shrink-0">
              cloud_off
            </span>
            <p className="text-alphaai-sm text-foreground font-medium flex-1">
              {queueCount} offline {queueCount === 1 ? "change" : "changes"}{" "}
              pending
            </p>
            <button
              onClick={doSync}
              className="text-alphaai-xs font-semibold text-brand"
            >
              Sync now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
