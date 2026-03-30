"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useVillageStore } from "@/stores/village-store";
import { VillagePostCard } from "@/components/village/VillagePostCard";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { VillagePostCategory } from "@/types/api-contracts";

const FILTER_CATEGORIES: Array<{ value: VillagePostCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "tip", label: "Tips" },
  { value: "meal_idea", label: "Meals" },
  { value: "school_hack", label: "School" },
  { value: "activity", label: "Activities" },
  { value: "win", label: "Wins" },
  { value: "question", label: "Questions" },
  { value: "vent", label: "Vents" },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function VillagePage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const { posts, isLoading, nextCursor, category, fetchFeed, loadMore, setCategory } =
    useVillageStore();

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    fetchFeed();
  }, [isClient, token, fetchFeed, router]);

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
              Mom&apos;s Village
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Tips &amp; support from other moms
            </p>
          </div>
          <Link
            href="/village/post"
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
            aria-label="Create post"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">edit</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto mom-no-scrollbar -mx-4 px-4">
          {FILTER_CATEGORIES.map((cat) => (
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

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="groups"
            title="The village is quiet"
            description="Be the first to share a tip, meal idea, or school hack!"
          />
        ) : (
          <>
            <div className="space-y-3">
              {posts.map((post) => (
                <VillagePostCard key={post.id} post={post} />
              ))}
            </div>

            {nextCursor && (
              <button
                onClick={loadMore}
                className="mom-btn-outline w-full"
              >
                Load More
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
