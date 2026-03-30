"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useMemoryStore } from "@/stores/memory-store";
import { useVoiceInput } from "@/hooks/use-voice-input";
import type { MemoryCategory } from "@/lib/memory-store";
import type { AgentType } from "@/types/api-contracts";
import { usePathname } from "next/navigation";

type CaptureMode = "task" | "note";

const QUICK_CATEGORIES: { key: MemoryCategory; icon: string; label: string }[] = [
  { key: "quick_note", icon: "edit_note", label: "Note" },
  { key: "family_fact", icon: "family_restroom", label: "Fact" },
  { key: "routine", icon: "schedule", label: "Routine" },
  { key: "important_date", icon: "event", label: "Date" },
];

const AGENTS: { type: AgentType; name: string; icon: string }[] = [
  { type: "calendar_whiz", name: "Calendar", icon: "calendar_month" },
  { type: "grocery_guru", name: "Grocery", icon: "shopping_cart" },
  { type: "budget_buddy", name: "Budget", icon: "account_balance_wallet" },
  { type: "school_event_hub", name: "School", icon: "school" },
  { type: "tutor_finder", name: "Tutor", icon: "menu_book" },
  { type: "health_hub", name: "Health", icon: "favorite" },
  { type: "sleep_tracker", name: "Sleep", icon: "bedtime" },
  { type: "self_care_reminder", name: "Self-Care", icon: "spa" },
];

/**
 * Floating action button for instant brain-dump capture from any screen.
 * Supports: text, voice, task + memory modes, inline agent delegation.
 * Hidden on chat pages and the memory page.
 */
export function QuickCapture() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("task");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("quick_note");
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const add = useMemoryStore((s) => s.add);
  const addInbox = useMemoryStore((s) => s.addInbox);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice input
  const { isListening, isSupported, transcript, startListening, stopListening, clearTranscript } =
    useVoiceInput();

  // Auto-fill content when voice transcript arrives
  useEffect(() => {
    if (!transcript) return;
    startTransition(() => {
      setContent((prev) => (prev ? prev + " " + transcript : transcript));
      clearTranscript();
    });
  }, [transcript, clearTranscript]);

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
      const item = await addInbox(trimmed, selectedAgent ?? undefined);
      // If delegated to an agent, navigate to chat
      if (selectedAgent) {
        setContent("");
        setSelectedAgent(null);
        setShowAgentPicker(false);
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          setOpen(false);
          router.push(`/chat/${selectedAgent}?task=${encodeURIComponent(trimmed)}`);
        }, 800);
        return;
      }
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
    setSelectedAgent(null);
    setShowAgentPicker(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  const handleClose = () => {
    setOpen(false);
    setShowAgentPicker(false);
    setSelectedAgent(null);
    if (isListening) stopListening();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Quick capture panel */}
      {open && (
        <div className="fixed left-4 right-4 z-50 max-w-lg mx-auto" style={{ bottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="mom-card-elevated p-4 space-y-3">
            {saved ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <span className="material-symbols-outlined text-[24px] text-brand">
                  check_circle
                </span>
                <span className="text-alphaai-sm font-medium text-foreground">
                  {selectedAgent
                    ? "Delegated!"
                    : mode === "task"
                      ? "Added to inbox!"
                      : "Saved to your brain!"}
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

                {/* Text input + voice button */}
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening..."
                        : mode === "task"
                          ? "What needs to get done?"
                          : "Brain dump — what do you need to remember?"
                    }
                    rows={3}
                    className={`mom-input resize-none text-alphaai-sm pr-12 ${
                      isListening ? "ring-2 ring-error/50" : ""
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                    }}
                  />
                  {/* Voice button inside textarea */}
                  {isSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-2 top-2 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isListening
                          ? "bg-error text-on-primary animate-pulse"
                          : "bg-surface-container text-muted-foreground hover:bg-surface-active"
                      }`}
                      aria-label={isListening ? "Stop recording" : "Voice input"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isListening ? "stop" : "mic"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Category selector — memory mode */}
                {mode === "note" && (
                  <div className="flex gap-1.5 overflow-x-auto mom-no-scrollbar">
                    {QUICK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-alphaai-3xs font-medium whitespace-nowrap transition-colors ${
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

                {/* Agent delegation — task mode */}
                {mode === "task" && (
                  <>
                    {!showAgentPicker ? (
                      <button
                        onClick={() => setShowAgentPicker(true)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-active transition-colors"
                      >
                        {selectedAgent ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] text-brand">
                              {AGENTS.find((a) => a.type === selectedAgent)?.icon ?? "send"}
                            </span>
                            <span className="text-alphaai-xs text-foreground flex-1">
                              Delegate to {AGENTS.find((a) => a.type === selectedAgent)?.name}
                            </span>
                            <span className="material-symbols-outlined text-[14px] text-muted-foreground">
                              edit
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                              send
                            </span>
                            <span className="text-alphaai-xs text-muted-foreground flex-1">
                              Delegate to an agent (optional)
                            </span>
                            <span className="material-symbols-outlined text-[14px] text-muted-foreground">
                              chevron_right
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="p-3 bg-surface-container rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-alphaai-3xs font-medium text-foreground">
                            Delegate to:
                          </p>
                          <button
                            onClick={() => {
                              setSelectedAgent(null);
                              setShowAgentPicker(false);
                            }}
                            className="text-alphaai-3xs text-muted-foreground"
                          >
                            Skip
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {AGENTS.map((agent) => (
                            <button
                              key={agent.type}
                              onClick={() => {
                                setSelectedAgent(agent.type);
                                setShowAgentPicker(false);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-alphaai-3xs font-medium transition-colors ${
                                selectedAgent === agent.type
                                  ? "bg-brand text-on-primary"
                                  : "bg-surface-active text-foreground hover:bg-brand hover:text-on-primary"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {agent.icon}
                              </span>
                              {agent.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Save button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={!content.trim()}
                    className="mom-btn-primary px-4 py-2 text-alphaai-xs disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedAgent ? "send" : mode === "task" ? "add_task" : "save"}
                    </span>
                    {selectedAgent ? "Delegate" : mode === "task" ? "Capture" : "Save"}
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
          className="fixed right-4 z-40 w-14 h-14 mom-gradient-hero rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
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
