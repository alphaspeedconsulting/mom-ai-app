"use client";

import { create } from "zustand";
import type { AgentCard, AgentType } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface AgentsState {
  agents: AgentCard[];
  isLoading: boolean;
  error: string | null;

  fetchAgents: () => Promise<void>;
  toggleAgent: (agentType: AgentType) => Promise<void>;
  getAgent: (agentType: AgentType) => AgentCard | undefined;
  getActiveAgents: () => AgentCard[];
}

export const useAgentsStore = create<AgentsState>()((set, get) => ({
  agents: [],
  isLoading: true,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.agents.list();
      set({ agents: data.agents, isLoading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load agents", isLoading: false });
    }
  },

  toggleAgent: async (agentType) => {
    const agent = get().agents.find((a) => a.agent_type === agentType);
    if (!agent) return;

    // Optimistic update
    set((state) => ({
      agents: state.agents.map((a) =>
        a.agent_type === agentType ? { ...a, is_active: !a.is_active } : a
      ),
    }));

    try {
      await api.agents.toggle({ agent_type: agentType, is_active: !agent.is_active });
    } catch {
      // Revert on failure
      set((state) => ({
        agents: state.agents.map((a) =>
          a.agent_type === agentType ? { ...a, is_active: agent.is_active } : a
        ),
      }));
    }
  },

  getAgent: (agentType) => get().agents.find((a) => a.agent_type === agentType),

  getActiveAgents: () => get().agents.filter((a) => a.is_active),
}));
