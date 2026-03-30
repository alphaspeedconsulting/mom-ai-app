"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const PIECE_COUNT = 24;
const COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--brand-glow))",
  "hsl(var(--secondary))",
  "hsl(var(--tertiary))",
  "hsl(var(--on-primary))",
];

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  rotateEnd: number;
  color: string;
  size: number;
  drift: number;
}

function generatePieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 600,
    rotateEnd: Math.random() * 720 - 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 6 + 4,
    drift: Math.random() * 40 - 20,
  }));
}

/**
 * CSS-only confetti animation — lightweight, no external library.
 * Renders absolute-positioned spans that fall with rotation.
 */
export function Confetti({ active, onComplete, duration = 3000 }: ConfettiProps) {
  const [activationCount, setActivationCount] = useState(0);
  const prevActiveRef = useRef(false);

  // Detect rising edge of `active` prop
  if (active && !prevActiveRef.current) {
    setActivationCount((c) => c + 1);
  }
  prevActiveRef.current = active;

  // Generate pieces deterministically from activation count
  const pieces = useMemo(
    () => (activationCount > 0 && active ? generatePieces() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activationCount],
  );

  // Auto-complete timer
  useEffect(() => {
    if (!active || pieces.length === 0) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, pieces.length, duration, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="mom-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${duration - p.delay}ms`,
            "--confetti-drift": `${p.drift}px`,
            "--confetti-rotate": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
