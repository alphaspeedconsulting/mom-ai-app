"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api-client";
import type { SeasonalPack } from "@/types/api-contracts";

/**
 * Dashboard banner showing the current seasonal pack.
 * Only renders when active seasonal packs exist.
 */
export function SeasonalBanner() {
  const [pack, setPack] = useState<SeasonalPack | null>(null);

  useEffect(() => {
    api.seasonal
      .current()
      .then((data) => {
        if (data.packs.length > 0) setPack(data.packs[0]);
      })
      .catch(() => {});
  }, []);

  if (!pack) return null;

  return (
    <Link href="/seasonal" className="block">
      <div className="mom-card p-4 flex items-center gap-3 bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            {pack.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-alphaai-sm font-semibold text-foreground truncate">
            {pack.title}
          </p>
          <p className="text-alphaai-3xs text-muted-foreground">
            {pack.checklist_items.length} items · {pack.season}
          </p>
        </div>
        <span className="material-symbols-outlined text-[18px] text-secondary">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
