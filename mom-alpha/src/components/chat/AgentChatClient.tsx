"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chat-store";
import { useAgentsStore } from "@/stores/agents-store";
import { useAuthStore } from "@/stores/auth-store";
import { useVoiceInput } from "@/hooks/use-voice-input";
import type { AgentType, QuickAction } from "@/types/api-contracts";

export function AgentChatClient({ agentType }: { agentType: AgentType }) {
  const router = useRouter();

  const { messages, isTyping, sendMessage, loadHistory } = useChatStore();
  const { agents, fetchAgents } = useAgentsStore();
  const householdId = useAuthStore((s) => s.user?.household_id);
  const tier = useAuthStore((s) => s.user?.tier);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isListening, isSupported, transcript, startListening, stopListening, clearTranscript } = useVoiceInput();
  const isPro = tier === "family_pro";

  // Auto-fill input when voice transcript arrives
  useEffect(() => {
    if (!transcript) return;
    startTransition(() => {
      setInput(transcript);
      clearTranscript();
    });
  }, [transcript, clearTranscript]);

  const agent = agents.find((a) => a.agent_type === agentType);
  const chatMessages = messages[agentType] || [];

  // Restore persisted chat history from IndexedDB
  useEffect(() => {
    loadHistory(agentType);
  }, [agentType, loadHistory]);

  useEffect(() => {
    if (agents.length === 0) fetchAgents();
  }, [agents.length, fetchAgents]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !householdId) return;
    sendMessage(agentType, trimmed, householdId);
    setInput("");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!householdId) return;
    sendMessage(agentType, action.label, householdId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 rounded-none border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground" aria-hidden="true">
              arrow_back
            </span>
          </button>
          {agent ? (
            <>
              <div className="mom-agent-avatar bg-brand-glow/30">
                <span className="material-symbols-outlined text-[18px] text-brand">
                  {agent.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
                  {agent.name}
                </h1>
                <p className="text-alphaai-3xs text-muted-foreground">
                  {isTyping ? "Thinking..." : "Online"}
                </p>
              </div>
            </>
          ) : (
            /* Skeleton shown while agents store is loading (BUG-013) */
            <>
              <div className="w-9 h-9 rounded-full bg-surface-container animate-pulse" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-4 w-28 bg-surface-container rounded animate-pulse" />
                <div className="h-3 w-12 bg-surface-container rounded animate-pulse" />
              </div>
            </>
          )}
          <button aria-label="More options" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-foreground" aria-hidden="true">
              more_vert
            </span>
          </button>
        </div>
      </header>

      {/* Chat timeline */}
      <main className="flex-1 overflow-y-auto px-4 pt-20 pb-32 max-w-lg mx-auto w-full">
        {chatMessages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-primary">
                {agent?.icon ?? "smart_toy"}
              </span>
            </div>
            <h2 className="font-headline text-alphaai-lg font-semibold text-foreground mb-2">
              {agent?.name ?? "Agent"}
            </h2>
            <p className="text-alphaai-sm text-muted-foreground max-w-xs">
              {agent?.description ?? "How can I help you today?"}
            </p>
            {/* Quick start chips */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {(agent?.starter_prompts?.length ? agent.starter_prompts : getStarterPrompts(agentType)).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => householdId && sendMessage(agentType, prompt, householdId)}
                  className="mom-chip hover:bg-tertiary-container/80 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="mom-chat-user text-alphaai-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-3 items-start">
                  <div className="mom-agent-avatar mom-agent-avatar-sm bg-brand-glow/30 flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-brand">
                      {agent?.icon ?? "smart_toy"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mom-chat-agent text-alphaai-sm">
                      {renderMarkdown(msg.content)}
                    </div>
                    {msg.quick_actions && msg.quick_actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.quick_actions.map((qa) => (
                          <button
                            key={qa.label}
                            onClick={() => handleQuickAction(qa)}
                            className="mom-chip bg-brand text-on-primary hover:opacity-90 transition-opacity"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="mom-agent-avatar bg-brand-glow/30 flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-brand">
                    {agent?.icon ?? "smart_toy"}
                  </span>
                </div>
                <div className="mom-chat-agent py-4 px-5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 rounded-none border-t border-border-subtle/10 bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent?.name ?? "agent"}...`}
              rows={1}
              className="mom-input resize-none pr-12 min-h-[44px] max-h-32"
            />
          </div>
          {/* Voice input — Family Pro only */}
          {isPro && isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isListening
                  ? "bg-error text-on-primary animate-pulse"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
              aria-label={isListening ? "Stop recording" : "Voice input"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isListening ? "stop" : "mic"}
              </span>
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 mom-gradient-hero rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight markdown renderer.
 *
 * Handles: ### headings (h3–h5), **bold**, *italic*, `inline code`,
 *          unordered bullets (- / * / •), ordered lists (1.), blank-line
 *          paragraph breaks, and <br> line-breaks within paragraphs.
 *
 * Downsizes headings (h3→h5) so they fit inside chat bubbles without
 * dominating the layout.
 */
function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Blank line → paragraph break (extra spacing)
    if (line.trim() === "") {
      nodes.push(<div key={`gap-${i}`} className="h-2" />);
      return;
    }

    // Headings: # ## ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      // Downsize: # → h5, ## → h5, ### → h5 (fits chat bubble)
      const cls =
        level === 1
          ? "font-semibold text-alphaai-base mt-2 mb-1"
          : level === 2
          ? "font-semibold text-alphaai-sm mt-2 mb-1"
          : "font-semibold text-alphaai-xs mt-1 mb-0.5";
      nodes.push(
        <div key={i} className={cls}>
          {renderInline(headingMatch[2])}
        </div>
      );
      return;
    }

    // Unordered list: lines starting with - * •
    if (/^[\-\*•]\s+/.test(line)) {
      nodes.push(
        <div key={i} className="flex gap-1.5 items-start">
          <span className="mt-0.5 shrink-0 text-muted-foreground">•</span>
          <span>{renderInline(line.replace(/^[\-\*•]\s+/, ""))}</span>
        </div>
      );
      return;
    }

    // Ordered list: lines starting with 1. 2. etc.
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      nodes.push(
        <div key={i} className="flex gap-1.5 items-start">
          <span className="mt-0.5 shrink-0 text-muted-foreground text-alphaai-xs">
            {olMatch[1]}.
          </span>
          <span>{renderInline(olMatch[2])}</span>
        </div>
      );
      return;
    }

    // Normal text line with <br> between consecutive non-blank lines
    const isLast = i === lines.length - 1;
    nodes.push(
      <span key={i}>
        {renderInline(line)}
        {!isLast && <br />}
      </span>
    );
  });

  return <>{nodes}</>;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, `code` spans (in that priority order)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={j}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={j}
          className="bg-surface-container text-alphaai-xs px-1 py-0.5 rounded font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function getStarterPrompts(agentType: string): string[] {
  const prompts: Record<string, string[]> = {
    calendar_whiz: ["What's on today?", "Add an event", "Check for conflicts"],
    grocery_guru: ["Show my grocery list", "Plan meals for the week", "Add milk"],
    budget_buddy: ["How much did I spend?", "Scan a receipt", "Show recurring bills"],
    school_event_hub: ["Pending permission slips", "Upcoming school events", "Check deadlines"],
    tutor_finder: ["Find a math tutor", "Compare tutors", "Book a session"],
    health_hub: ["Upcoming appointments", "Log wellness activity", "Check streaks"],
    sleep_tracker: ["Log last night's sleep", "Sleep patterns", "Set bedtime reminder"],
    self_care_reminder: ["Self-care ideas", "Set a mindfulness reminder", "My goals"],
  };
  return prompts[agentType] ?? ["How can you help?", "What can you do?"];
}
