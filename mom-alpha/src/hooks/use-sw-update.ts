"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Detects when a new service worker is waiting and provides
 * a function to activate it (skip waiting + reload).
 */
export function useSwUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    async function watchForUpdates() {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      // If a worker is already waiting when we load
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }

      // Listen for a new service worker becoming available
      registration.addEventListener("updatefound", () => {
        const installing = registration!.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New SW installed but waiting to activate
            setWaitingWorker(installing);
            setUpdateAvailable(true);
          }
        });
      });
    }

    // Reload once the new SW takes control
    let refreshing = false;
    function onControllerChange() {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    watchForUpdates();

    // Check for updates periodically (every 30 minutes)
    const interval = setInterval(
      () => {
        registration?.update();
      },
      30 * 60 * 1000,
    );

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return { updateAvailable, applyUpdate, dismissUpdate };
}
