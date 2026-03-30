"use client";

import React from "react";

interface BalanceDoughnutProps {
  parentAPct: number;
  parentBPct: number;
  parentAName: string;
  parentBName: string;
  /** Size of the doughnut in rem */
  size?: "sm" | "lg";
}

/**
 * Circular progress doughnut showing task split between co-parents.
 * Uses CSS conic-gradient — no charting library needed.
 */
export function BalanceDoughnut({
  parentAPct,
  parentBPct,
  parentAName,
  parentBName,
  size = "lg",
}: BalanceDoughnutProps) {
  const sizeClass = size === "lg" ? "w-40 h-40" : "w-24 h-24";
  const innerClass = size === "lg" ? "w-28 h-28" : "w-16 h-16";
  const textClass = size === "lg" ? "text-alphaai-xl" : "text-alphaai-sm";

  // Clamp to valid range
  const aPct = Math.min(100, Math.max(0, parentAPct));
  const bPct = Math.min(100, Math.max(0, parentBPct));

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center relative`}
        style={{
          background: `conic-gradient(
            hsl(var(--brand)) 0deg ${aPct * 3.6}deg,
            hsl(var(--secondary)) ${aPct * 3.6}deg 360deg
          )`,
        }}
        role="img"
        aria-label={`${parentAName} ${aPct}%, ${parentBName} ${bPct}%`}
      >
        {/* Inner circle for doughnut effect */}
        <div className={`${innerClass} rounded-full bg-surface flex items-center justify-center`}>
          <div className="text-center">
            <p className={`${textClass} font-bold text-foreground leading-none`}>
              {aPct}%
            </p>
            <p className="text-alphaai-3xs text-muted-foreground mt-0.5">
              {parentAName.split(" ")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand" />
          <span className="text-alphaai-xs text-foreground">{parentAName.split(" ")[0]}</span>
          <span className="text-alphaai-3xs text-muted-foreground">{aPct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <span className="text-alphaai-xs text-foreground">{parentBName.split(" ")[0]}</span>
          <span className="text-alphaai-3xs text-muted-foreground">{bPct}%</span>
        </div>
      </div>
    </div>
  );
}
