"use client";

import { create } from "zustand";
import type { TaskItem } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface TasksState {
  tasks: TaskItem[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  getActiveTasks: () => TaskItem[];
  getCompletedTasks: () => TaskItem[];
  getActiveCount: () => number;
  getCompletedTodayCount: () => number;
  updateTaskFromWS: (task: TaskItem) => void;
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  isLoading: true,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.tasks.list();
      set({ tasks: data.tasks, isLoading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load tasks", isLoading: false });
    }
  },

  getActiveTasks: () =>
    get().tasks.filter((t) => t.status === "in_progress" || t.status === "pending"),

  getCompletedTasks: () => get().tasks.filter((t) => t.status === "completed"),

  getActiveCount: () =>
    get().tasks.filter((t) => t.status === "in_progress" || t.status === "pending").length,

  getCompletedTodayCount: () => {
    const today = new Date().toDateString();
    return get().tasks.filter(
      (t) => t.status === "completed" && new Date(t.updated_at).toDateString() === today
    ).length;
  },

  updateTaskFromWS: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),
}));
