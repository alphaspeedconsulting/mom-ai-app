"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsOffline(!window.navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isMounted || !isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-secondary-container text-secondary px-4 py-2 text-center text-alphaai-sm font-medium">
      <span className="material-symbols-outlined text-[16px] align-middle mr-1">
        cloud_off
      </span>
      You&apos;re offline — some features may be limited
    </div>
  );
}
