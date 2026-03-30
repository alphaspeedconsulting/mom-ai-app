"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Dismissible referral banner on the dashboard.
 * Prompts users to invite friends for free weeks.
 */
export function ReferralBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mom-referral-banner-dismissed") === "true";
  });

  if (dismissed) return null;

  return (
    <Link href="/referral" className="block">
      <div className="mom-card p-4 flex items-center gap-3 bg-brand-glow/5 border border-brand/10 hover:bg-brand-glow/10 transition-colors relative">
        <div className="w-10 h-10 rounded-full bg-brand-glow/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-brand" style={{ fontVariationSettings: "'FILL' 1" }}>
            card_giftcard
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-alphaai-sm font-semibold text-foreground">
            Invite friends, get free weeks!
          </p>
          <p className="text-alphaai-3xs text-muted-foreground">
            Share your code — both you and your friend earn 2 weeks of Pro
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem("mom-referral-banner-dismissed", "true");
            setDismissed(true);
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Dismiss referral banner"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </Link>
  );
}
