"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMemoryStore } from "@/stores/memory-store";
import { InboxPanel } from "@/components/memory/InboxPanel";
import type { MemoryCategory, MemoryItem } from "@/lib/memory-store";

const CATEGORY_CONFIG: Record<MemoryCategory, { label: string; icon: string }> = {
  family_fact: { label: "Family Fact", icon: "family_restroom" },
  preference: { label: "Preference", icon: "tune" },
  quick_note: { label: "Quick Note", icon: "edit_note" },
  agent_insight: { label: "AI Insight", icon: "psychology" },
  routine: { label: "Routine", icon: "schedule" },
  important_date: { label: "Important Date", icon: "event" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as MemoryCategory[];

type FilterTab = "all" | "pinned" | MemoryCategory;
type MainTab = "inbox" | "brain";

export default function MemoryPage() {
  const { items, inbox, isLoaded, hydrate, add, update, remove } = useMemoryStore();
  const [mainTab, setMainTab] = useState<MainTab>("inbox");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("quick_note");
  const [newTags, setNewTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!isLoaded) hydrate();
  }, [isLoaded, hydrate]);

  const filtered = useMemo(() => {
    let result = items;

    if (filter === "pinned") {
      result = result.filter((i) => i.pinned);
    } else if (filter !== "all") {
      result = result.filter((i) => i.category === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.content.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, filter, search]);

  const handleAdd = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    await add({
      category: newCategory,
      content: trimmed,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      pinned: false,
    });

    setNewContent("");
    setNewTags("");
    setShowAddForm(false);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    await update(id, { content: editContent.trim() });
    setEditingId(null);
    setEditContent("");
  };

  const startEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "select_all" },
    { key: "pinned", label: "Pinned", icon: "push_pin" },
    { key: "family_fact", label: "Facts", icon: "family_restroom" },
    { key: "routine", label: "Routines", icon: "schedule" },
    { key: "important_date", label: "Dates", icon: "event" },
    { key: "preference", label: "Prefs", icon: "tune" },
    { key: "quick_note", label: "Notes", icon: "edit_note" },
    { key: "agent_insight", label: "AI", icon: "psychology" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 mom-gradient-hero rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px] text-on-primary">
            neurology
          </span>
        </div>
        <div>
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
            My Brain
          </h1>
          <p className="text-alphaai-xs text-muted-foreground">
            {mainTab === "inbox"
              ? `${inbox.filter((i) => i.status !== "done" && i.status !== "dismissed").length} active tasks`
              : `${items.length} ${items.length === 1 ? "memory" : "memories"} saved`}
          </p>
        </div>
      </div>

      {/* Main tabs: Inbox / Brain */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-xl mb-4">
        <button
          onClick={() => setMainTab("inbox")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-alphaai-sm font-medium transition-colors ${
            mainTab === "inbox"
              ? "bg-brand text-on-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inbox</span>
          Inbox
          {inbox.filter((i) => i.status !== "done" && i.status !== "dismissed").length > 0 && (
            <span className={`w-5 h-5 rounded-full text-alphaai-3xs font-bold flex items-center justify-center ${
              mainTab === "inbox" ? "bg-on-primary/20 text-on-primary" : "bg-brand text-on-primary"
            }`}>
              {inbox.filter((i) => i.status !== "done" && i.status !== "dismissed").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setMainTab("brain")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-alphaai-sm font-medium transition-colors ${
            mainTab === "brain"
              ? "bg-brand text-on-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">neurology</span>
          Memories
        </button>
      </div>

      {/* Inbox tab */}
      {mainTab === "inbox" && <InboxPanel />}

      {/* Brain / Memories tab */}
      {mainTab === "brain" && <>

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined text-[20px] text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
          search
        </span>
        <input
          type="text"
          placeholder="Search memories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mom-input pl-10"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mom-no-scrollbar mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-alphaai-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-brand text-on-primary"
                : "bg-surface-container text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Add button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mom-card p-4 mb-4 flex items-center gap-3 text-left hover:bg-surface-active/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-brand-glow/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-brand">add</span>
          </div>
          <div>
            <p className="text-alphaai-sm font-medium text-foreground">Add a memory</p>
            <p className="text-alphaai-3xs text-muted-foreground">
              Quick note, family fact, routine, or important date
            </p>
          </div>
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mom-card p-4 mb-4 space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What do you want to remember?"
            rows={3}
            className="mom-input resize-none"
            autoFocus
          />

          <div className="flex gap-2 overflow-x-auto mom-no-scrollbar">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-alphaai-3xs font-medium whitespace-nowrap transition-colors ${
                  newCategory === cat
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {CATEGORY_CONFIG[cat].icon}
                </span>
                {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma separated): e.g. jake, allergies"
            className="mom-input text-alphaai-xs"
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewContent("");
                setNewTags("");
              }}
              className="mom-btn-outline px-4 py-2 text-alphaai-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="mom-btn-primary px-4 py-2 text-alphaai-xs disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Memory list */}
      {!isLoaded ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mom-card p-4 h-24 mom-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground/40 mb-3">
            {search ? "search_off" : "neurology"}
          </span>
          <p className="text-alphaai-sm text-muted-foreground">
            {search
              ? "No memories match your search"
              : filter === "pinned"
                ? "No pinned memories yet"
                : "No memories yet — add your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="mom-card p-4">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mom-input resize-none text-alphaai-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-alphaai-3xs text-muted-foreground px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="mom-btn-primary px-3 py-1.5 text-alphaai-3xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.pinned ? "bg-secondary-container" : "bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-brand">
                        {CATEGORY_CONFIG[item.category]?.icon ?? "note"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-alphaai-sm text-foreground leading-relaxed">
                        {item.content}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="mom-chip text-alphaai-3xs px-2 py-0.5">
                          {CATEGORY_CONFIG[item.category]?.label ?? item.category}
                        </span>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="mom-chip-secondary text-alphaai-3xs px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.source_agent && (
                          <span className="text-alphaai-3xs text-muted-foreground/60 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">psychology</span>
                            {item.source_agent.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-border-subtle/10">
                    <button
                      onClick={() => update(item.id, { pinned: !item.pinned })}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                      aria-label={item.pinned ? "Unpin" : "Pin"}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          item.pinned ? "text-secondary" : "text-muted-foreground"
                        }`}
                        style={item.pinned ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        push_pin
                      </span>
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                      aria-label="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-active transition-colors"
                      aria-label="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                        delete
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      </>}
    </div>
  );
}
