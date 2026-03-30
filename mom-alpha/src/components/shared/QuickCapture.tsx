"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMemoryStore } from "@/stores/memory-store";
import type { MemoryCategory } from "@/lib/memory-store";
import { usePathname } from "next/navigation";

type CaptureMode = "note" | "task";

const QUICK_CATEGORIES: { key: MemoryCategory; icon: string; label: string }[] = [
  { key: "quick_note", icon: "edit_note", label: "Note" },
  { key: "family_fact", icon: "family_restroom", label: "Fact" },
  { key: "routine", icon: "schedule", label: "Routine" },
  { key: "important_date", icon: "event", label: "Date" },
];

/**
 * Floating action button for instant brain-dump capture from any screen.
 * Supports two modes: memory notes and inbox tasks.
 * Hidden on chat pages and the memory page.
 */
export function QuickCapture() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("task");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("quick_note");
  const [saved, setSaved] = useState(false);
  const add = useMemoryStore((s) => s.add);
  const addInbox = useMemoryStore((s) => s.addInbox);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hidden =
    pathname?.startsWith("/chat") ||
    pathname?.startsWith("/memory");

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (hidden) return null;

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (mode === "task") {
      await addInbox(trimmed);
    } else {
      await add({
        category,
        content: trimmed,
        tags: [],
        pinned: false,
      });
    }

    setContent("");
    setCategory("quick_note");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Quick capture panel */}
      {open && (
        <div className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto">
          <div className="mom-card-elevated p-4 space-y-3">
            {saved ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <span className="material-symbols-outlined text-[24px] text-brand">
                  check_circle
                </span>
                <span className="text-alphaai-sm font-medium text-foreground">
                  {mode === "task" ? "Added to inbox!" : "Saved to your brain!"}
                </span>
              </div>
            ) : (
              <>
                {/* Mode toggle */}
                <div className="flex gap-1 p-0.5 bg-surface-container rounded-lg">
                  <button
                    onClick={() => setMode("task")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-alphaai-3xs font-medium transition-colors ${
                      mode === "task"
                        ? "bg-brand text-on-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">inbox</span>
                    Task
                  </button>
                  <button
                    onClick={() => setMode("note")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-alphaai-3xs font-medium transition-colors ${
                      mode === "note"
                        ? "bg-brand text-on-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">neurology</span>
                    Memory
                  </button>
                </div>

                <textarea
                  ref={inputRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    mode === "task"
                      ? "What needs to get done?"
                      : "Brain dump — what do you need to remember?"
                  }
                  rows={3}
                  className="mom-input resize-none text-alphaai-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                  }}
                />

                {/* Category selector — only for memory mode */}
                {mode === "note" && (
                  <div className="flex gap-1.5">
                    {QUICK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-alphaai-3xs font-medium transition-colors ${
                          category === cat.key
                            ? "bg-brand text-on-primary"
                            : "bg-surface-container text-muted-foreground"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {cat.icon}
                        </span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {mode === "task" && (
                  <p className="text-alphaai-3xs text-muted-foreground">
                    Captured to your inbox — delegate to an agent from the Brain tab
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={!content.trim()}
                    className="mom-btn-primary px-4 py-2 text-alphaai-xs disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {mode === "task" ? "add_task" : "save"}
                    </span>
                    {mode === "task" ? "Capture" : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 mom-gradient-hero rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          aria-label="Quick capture"
        >
          <span className="material-symbols-outlined text-[24px] text-on-primary">
            add
          </span>
        </button>
      )}
    </>
  );
}
