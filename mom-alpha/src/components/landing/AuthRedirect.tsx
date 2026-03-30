"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Redirects authenticated users away from the landing page to their dashboard.
 * Renders nothing — this is a side-effect-only component.
 */
export function AuthRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, token]);

  return null;
}
