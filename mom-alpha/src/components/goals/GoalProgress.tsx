"use client";

import React from "react";

interface GoalProgressProps {
  current: number;
  target: number;
  /** Size in pixels */
  size?: number;
}

/**
 * Animated SVG progress ring for goal tracking.
 */
export function GoalProgress({ current, target, size = 64 }: GoalProgressProps) {
  const pct = Math.min(100, Math.max(0, target > 0 ? (current / target) * 100 : 0));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-container))"
          strokeWidth={4}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct >= 100 ? "hsl(var(--brand))" : "hsl(var(--brand-glow))"}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-alphaai-3xs font-bold text-foreground">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
