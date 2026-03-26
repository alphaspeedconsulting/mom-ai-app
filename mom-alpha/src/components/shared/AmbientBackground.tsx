/**
 * AmbientBackground — decorative gradient blur layer.
 * Renders behind page content to create the "Lullaby & Logic" depth effect.
 * Uses pointer-events-none so it never blocks interaction.
 *
 * Variants:
 *   hero   — strong gradient, for landing hero sections
 *   subtle — muted tonal depth, for app pages
 *   warm   — secondary/tertiary palette, for special pages
 */

type AmbientVariant = "hero" | "subtle" | "warm";

interface AmbientBackgroundProps {
  variant?: AmbientVariant;
  className?: string;
}

export function AmbientBackground({
  variant = "subtle",
  className = "",
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`mom-ambient-root ${className}`}
    >
      {variant === "hero" && (
        <>
          <div className="mom-ambient-blob mom-ambient-blob--hero-teal" />
          <div className="mom-ambient-blob mom-ambient-blob--hero-mint" />
          <div className="mom-ambient-blob mom-ambient-blob--hero-lavender" />
        </>
      )}
      {variant === "subtle" && (
        <>
          <div className="mom-ambient-blob mom-ambient-blob--subtle-teal" />
          <div className="mom-ambient-blob mom-ambient-blob--subtle-peach" />
        </>
      )}
      {variant === "warm" && (
        <>
          <div className="mom-ambient-blob mom-ambient-blob--warm-amber" />
          <div className="mom-ambient-blob mom-ambient-blob--warm-lavender" />
        </>
      )}
    </div>
  );
}
