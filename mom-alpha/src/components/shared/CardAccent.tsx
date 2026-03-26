import type { ReactNode } from "react";

type CardAccentProps = {
  colorVar: string;
  children: ReactNode;
  className?: string;
};

/**
 * Left color strip + content — matches in-app event / list rows (Family Calendar, School Hub)
 * instead of border-l on rounded cards (avoids corner “arc” artifacts).
 */
export function CardAccent({ colorVar, children, className = "" }: CardAccentProps) {
  return (
    <div className={`mom-card flex min-w-0 overflow-hidden ${className}`.trim()}>
      <div className="w-1 shrink-0 self-stretch" style={{ backgroundColor: colorVar }} aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
