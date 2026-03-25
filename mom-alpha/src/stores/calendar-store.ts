"use client";

import { create } from "zustand";
import type { CalendarEvent } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

type FilterType = "all" | "shared" | "mom" | "kids";

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  filter: FilterType;
  isLoading: boolean;
  error: string | null;

  fetchEvents: (params?: { start_after?: string; start_before?: string }) => Promise<void>;
  createEvent: (body: { title: string; start_at: string; end_at: string; description?: string; all_day?: boolean; member_id?: string }) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  syncGoogle: () => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setFilter: (filter: FilterType) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  selectedDate: new Date(),
  filter: "all",
  isLoading: true,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.calendar.list(params);
      set({ events: data.events, isLoading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load events", isLoading: false });
    }
  },

  createEvent: async (body) => {
    try {
      await api.calendar.create(body);
      await get().fetchEvents();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to create event" });
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await api.calendar.delete(eventId);
      set((state) => ({ events: state.events.filter((e) => e.id !== eventId) }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to delete event" });
    }
  },

  syncGoogle: async () => {
    try {
      await api.calendar.syncGoogle();
      await get().fetchEvents();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to sync Google Calendar" });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  setFilter: (filter) => set({ filter }),

  getEventsForDate: (date) => {
    const { events, filter } = get();
    return events.filter((e) => {
      const eventDate = new Date(e.start_at);
      if (!isSameDay(eventDate, date)) return false;
      if (filter === "all") return true;
      if (filter === "shared") return !e.member_id;
      if (filter === "mom") return e.member_name === "Mom";
      if (filter === "kids") return e.member_name !== "Mom" && e.member_id !== null;
      return true;
    });
  },
}));
