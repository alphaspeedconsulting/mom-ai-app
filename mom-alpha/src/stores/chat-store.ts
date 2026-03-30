"use client";

import { create } from "zustand";
import type { AgentType, QuickAction } from "@/types/api-contracts";
import * as api from "@/lib/api-client";
import {
  saveChatMessage,
  getChatHistory,
  clearChatHistory as clearPersistedChat,
  getAgentContext,
} from "@/lib/memory-store";
import { processAgentResponse } from "@/lib/memory-extract";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agent_type: AgentType;
  quick_actions?: QuickAction[];
  timestamp: string;
  /** Set when the backend rejected the request due to tier/plan restrictions. */
  is_tier_error?: boolean;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  isTyping: boolean;

  /** Load persisted chat history for an agent from IndexedDB */
  loadHistory: (agentType: AgentType) => Promise<void>;

  sendMessage: (agentType: AgentType, message: string, householdId: string) => Promise<void>;
  clearChat: (agentType: AgentType) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: {},
  isTyping: false,

  loadHistory: async (agentType) => {
    // Skip if already loaded
    if ((get().messages[agentType] ?? []).length > 0) return;

    const persisted = await getChatHistory(agentType);
    if (persisted.length === 0) return;

    const msgs: ChatMessage[] = persisted.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      agent_type: m.agent_type,
      timestamp: m.timestamp,
    }));

    set((state) => ({
      messages: { ...state.messages, [agentType]: msgs },
    }));
  },

  sendMessage: async (agentType, message, householdId) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message,
      agent_type: agentType,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [agentType]: [...(state.messages[agentType] || []), userMsg],
      },
      isTyping: true,
    }));

    // Persist user message to IndexedDB
    saveChatMessage({
      id: userMsg.id,
      agent_type: agentType,
      role: "user",
      content: userMsg.content,
      timestamp: userMsg.timestamp,
    });

    try {
      // Fetch on-device memory context relevant to this agent
      const memories = await getAgentContext(agentType);
      const memoryContext = memories.length > 0
        ? memories.slice(0, 20).map((m) => ({
            category: m.category,
            content: m.content,
            pinned: m.pinned,
          }))
        : undefined;

      const response = await api.chat.send({
        household_id: householdId,
        agent_type: agentType,
        message,
        memory_context: memoryContext,
      });

      const agentMsg: ChatMessage = {
        id: response.message_id,
        role: "agent",
        content: response.content,
        agent_type: agentType,
        quick_actions: response.quick_actions,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [agentType]: [...(state.messages[agentType] || []), agentMsg],
        },
        isTyping: false,
      }));

      // Persist agent response to IndexedDB
      saveChatMessage({
        id: agentMsg.id,
        agent_type: agentType,
        role: "agent",
        content: agentMsg.content,
        timestamp: agentMsg.timestamp,
      });

      // Auto-extract insights from the agent response into local memory
      processAgentResponse(agentType, response.content, response.memory_hints);
    } catch (e) {
      const isTierError = e instanceof api.ApiError && e.isUpgradeRequired;
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: "agent",
        content: isTierError
          ? "This feature requires a higher plan."
          : e instanceof api.ApiError
            ? `Sorry, something went wrong: ${e.detail}`
            : "Sorry, I couldn't process that. Please try again.",
        agent_type: agentType,
        timestamp: new Date().toISOString(),
        is_tier_error: isTierError,
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [agentType]: [...(state.messages[agentType] || []), errorMsg],
        },
        isTyping: false,
      }));
    }
  },

  clearChat: (agentType) => {
    set((state) => ({
      messages: { ...state.messages, [agentType]: [] },
    }));
    // Clear persisted history too
    clearPersistedChat(agentType);
  },
}));
