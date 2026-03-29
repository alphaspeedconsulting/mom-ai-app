"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Traps keyboard focus within `containerRef` while `isActive` is true.
 *
 * On activation:  moves focus to the first focusable element inside the container.
 * On Tab:         cycles forward through focusable elements, wrapping at the end.
 * On Shift+Tab:   cycles backward, wrapping at the start.
 * On deactivation: restores focus to the element that was focused before activation.
 *
 * iOS Safari note: elements that are not natively focusable require tabIndex="-1"
 * on the container to accept programmatic focus() calls.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Capture currently focused element so we can restore it on close.
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus into the container (requires tabIndex="-1" on non-interactive containers).
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      container.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const focusable = Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the element that was active before the trap opened.
      previousFocusRef.current?.focus();
    };
  }, [isActive, containerRef]);
}
