"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMemoryStore } from "@/stores/memory-store";
import type { AgentType } from "@/types/api-contracts";
import type { InboxItem, InboxStatus } from "@/lib/memory-store";

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

const STATUS_CONFIG: Record<InboxStatus, { label: string; icon: string; color: string }> = {
  captured: { label: "Inbox", icon: "inbox", color: "text-muted-foreground" },
  delegated: { label: "Delegated", icon: "send", color: "text-brand" },
  in_progress: { label: "Working", icon: "pending", color: "text-secondary" },
  done: { label: "Done", icon: "check_circle", color: "text-brand" },
  dismissed: { label: "Dismissed", icon: "close", color: "text-muted-foreground" },
};

export function InboxPanel() {
  const router = useRouter();
  const { inbox, addInbox, updateInbox, removeInbox } = useMemoryStore();
  const [newTask, setNewTask] = useState("");
  const [delegatingId, setDelegatingId] = useState<string | null>(null);

  const activeItems = inbox.filter((i) => i.status !== "done" && i.status !== "dismissed");
  const completedItems = inbox.filter((i) => i.status === "done" || i.status === "dismissed");

  const handleCapture = async () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    await addInbox(trimmed);
    setNewTask("");
  };

  const handleDelegate = async (item: InboxItem, agentType: AgentType) => {
    await updateInbox(item.id, {
      assigned_agent: agentType,
      status: "delegated",
    });
    setDelegatingId(null);

    // Navigate to the agent's chat with the task pre-filled
    router.push(`/chat/${agentType}?task=${encodeURIComponent(item.content)}`);
  };

  const handleMarkDone = async (id: string) => {
    await updateInbox(id, { status: "done" });
  };

  const handleDismiss = async (id: string) => {
    await updateInbox(id, { status: "dismissed" });
  };

  return (
    <div className="space-y-4">
      {/* Quick capture input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCapture();
          }}
          placeholder="Quick capture: what needs to get done?"
          className="mom-input flex-1 text-alphaai-sm"
        />
        <button
          onClick={handleCapture}
          disabled={!newTask.trim()}
          className="w-11 h-11 mom-gradient-hero rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px] text-on-primary">add</span>
        </button>
      </div>

      {/* Active items */}
      {activeItems.length === 0 && completedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground/40 mb-3">
            inbox
          </span>
          <p className="text-alphaai-sm font-medium text-foreground mb-1">
            Inbox zero!
          </p>
          <p className="text-alphaai-3xs text-muted-foreground max-w-xs">
            Capture tasks here and delegate them to your AI agents.
            They&apos;ll handle it while you focus on what matters.
          </p>
        </div>
      ) : (
        <>
          {activeItems.map((item) => (
            <div key={item.id} className="mom-card p-4">
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <button
                  onClick={() => handleMarkDone(item.id)}
                  className="w-6 h-6 rounded-full border-2 border-border-subtle flex items-center justify-center flex-shrink-0 mt-0.5 hover:border-brand hover:bg-brand-glow/10 transition-colors"
                  aria-label="Mark done"
                >
                  {item.status === "done" && (
                    <span className="material-symbols-outlined text-[14px] text-brand">check</span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-alphaai-sm text-foreground">{item.content}</p>

                  {/* Status + agent badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1 text-alphaai-3xs ${STATUS_CONFIG[item.status].color}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {STATUS_CONFIG[item.status].icon}
                      </span>
                      {STATUS_CONFIG[item.status].label}
                    </span>
                    {item.assigned_agent && (
                      <span className="mom-chip text-alphaai-3xs px-2 py-0.5">
                        {AGENTS.find((a) => a.type === item.assigned_agent)?.name ?? item.assigned_agent}
                      </span>
                    )}
                  </div>

                  {/* Agent response */}
                  {item.agent_response && (
                    <div className="mt-2 p-2 bg-surface-container rounded-lg">
                      <p className="text-alphaai-3xs text-muted-foreground">{item.agent_response}</p>
                    </div>
                  )}

                  {/* Delegate picker */}
                  {delegatingId === item.id && (
                    <div className="mt-3 p-3 bg-surface-container rounded-xl">
                      <p className="text-alphaai-3xs font-medium text-foreground mb-2">
                        Delegate to:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {AGENTS.map((agent) => (
                          <button
                            key={agent.type}
                            onClick={() => handleDelegate(item, agent.type)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-active text-alphaai-3xs font-medium text-foreground hover:bg-brand hover:text-on-primary transition-colors"
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
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {item.status === "captured" && (
                    <button
                      onClick={() =>
                        setDelegatingId(delegatingId === item.id ? null : item.id)
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                      aria-label="Delegate to agent"
                    >
                      <span className="material-symbols-outlined text-[18px] text-brand">
                        send
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                    aria-label="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                      close
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Completed section */}
          {completedItems.length > 0 && (
            <div className="pt-2">
              <p className="text-alphaai-3xs font-medium text-muted-foreground mb-2 px-1">
                Completed ({completedItems.length})
              </p>
              {completedItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2 opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px] text-brand">
                    check_circle
                  </span>
                  <span className="text-alphaai-xs text-muted-foreground line-through flex-1">
                    {item.content}
                  </span>
                  <button
                    onClick={() => removeInbox(item.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                    aria-label="Remove"
                  >
                    <span className="material-symbols-outlined text-[14px] text-muted-foreground">
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
