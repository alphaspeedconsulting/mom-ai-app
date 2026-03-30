"use client";

import React, { useState, useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { CATEGORY_LABELS } from "@/components/templates/TemplateCard";
import { CardSkeleton } from "@/components/shared/Skeleton";
import * as api from "@/lib/api-client";
import type { TemplateCategory, TemplateItem } from "@/types/api-contracts";

const CATEGORY_OPTIONS: TemplateCategory[] = [
  "routine",
  "meal_plan",
  "chore_chart",
  "bedtime",
  "school_prep",
  "budget",
  "other",
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("routine");
  const [items, setItems] = useState<TemplateItem[]>([
    { label: "", order: 0 },
  ]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;
    if (!token) router.replace("/login?mode=signup");
  }, [isClient, token, router]);

  const addItem = () => {
    setItems((prev) => [...prev, { label: "", order: prev.length }]);
  };

  const updateItem = (index: number, field: keyof TemplateItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
    );
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.label.trim());
    if (!title.trim() || !description.trim() || validItems.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.templates.create({
        title: title.trim(),
        description: description.trim(),
        category,
        items: validItems.map((item, i) => ({ ...item, label: item.label.trim(), order: i })),
        tags,
      });
      api.viral.track({
        event_type: "template_share",
        metadata: { category },
      }).catch(() => {});
      router.push("/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isClient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/templates"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to templates"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1">
            Create Template
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="t-title" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Title
          </label>
          <input
            id="t-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Morning Routine for Ages 3-6"
            className="mom-input"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="t-desc" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Description
          </label>
          <textarea
            id="t-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A gentle morning routine that works for toddlers and preschoolers..."
            className="mom-input min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-full text-alphaai-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-alphaai-xs font-medium text-foreground">Steps / Items</p>
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-alphaai-xs text-brand font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-alphaai-3xs text-muted-foreground w-5 text-center flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(i, "label", e.target.value)}
                  placeholder="Step description..."
                  className="mom-input flex-1"
                />
                <input
                  type="text"
                  value={item.time ?? ""}
                  onChange={(e) => updateItem(i, "time", e.target.value)}
                  placeholder="Time"
                  className="mom-input w-20"
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-error"
                    aria-label={`Remove step ${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="t-tags" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              id="t-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="mom-input flex-1"
            />
            <button onClick={addTag} className="mom-btn-outline px-3 py-2">
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="mom-chip text-alphaai-3xs px-2 py-0.5 cursor-pointer hover:opacity-70"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-alphaai-xs text-error">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || items.every((i) => !i.label.trim()) || submitting}
          className="mom-btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Template"}
        </button>
      </main>
    </div>
  );
}
