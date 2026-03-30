"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { EmergencyStatus } from "@/types/api-contracts";

/**
 * Emergency mode indicator/trigger on the dashboard.
 * Shows status when active, or a subtle link when inactive.
 */
export function EmergencyButton() {
  const householdId = useAuthStore((s) => s.user?.household_id);
  const [status, setStatus] = useState<EmergencyStatus | null>(null);

  useEffect(() => {
    if (!householdId) return;
    api.emergency.status(householdId).then(setStatus).catch(() => {});
  }, [householdId]);

  // Don't show if no data yet
  if (!status) return null;

  if (status.active) {
    return (
      <Link href="/emergency" className="block">
        <div className="mom-card p-4 flex items-center gap-3 bg-error/5 border border-error/20">
          <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-alphaai-sm font-semibold text-error">
              Emergency Mode Active
            </p>
            <p className="text-alphaai-3xs text-muted-foreground">
              {status.delegated_tasks} tasks delegated · Tap to manage
            </p>
          </div>
          <span className="material-symbols-outlined text-[18px] text-error">
            chevron_right
          </span>
        </div>
      </Link>
    );
  }

  return null;
}
