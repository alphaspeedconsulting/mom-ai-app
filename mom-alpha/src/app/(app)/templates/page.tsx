"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useTemplatesStore } from "@/stores/templates-store";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { TemplateCategory } from "@/types/api-contracts";

const CATEGORIES: Array<{ value: TemplateCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "routine", label: "Routines" },
  { value: "meal_plan", label: "Meal Plans" },
  { value: "chore_chart", label: "Chores" },
  { value: "bedtime", label: "Bedtime" },
  { value: "school_prep", label: "School" },
  { value: "budget", label: "Budget" },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const { templates, isLoading, fetchTemplates } = useTemplatesStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    fetchTemplates({
      category: category === "all" ? undefined : category,
      query: search || undefined,
    });
  }, [isClient, token, category, search, fetchTemplates, router]);

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
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to dashboard"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
              Templates
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Routines &amp; plans from other families
            </p>
          </div>
          <Link
            href="/templates/create"
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
            aria-label="Create template"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">add</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Search */}
        <div className="relative">
          <label htmlFor="template-search" className="sr-only">Search templates</label>
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground" aria-hidden="true">
            search
          </span>
          <input
            id="template-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routines, meal plans..."
            className="mom-input pl-11"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto mom-no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-alphaai-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.value
                  ? "bg-brand text-on-primary"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon="library_books"
            title="No templates found"
            description={search ? "Try different search terms." : "Be the first to share a template!"}
          />
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
