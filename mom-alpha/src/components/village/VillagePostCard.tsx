"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import type { VillagePost, VillagePostCategory } from "@/types/api-contracts";
import { useVillageStore } from "@/stores/village-store";
import * as api from "@/lib/api-client";

const CATEGORY_LABELS: Record<VillagePostCategory, string> = {
  tip: "Tip",
  meal_idea: "Meal Idea",
  school_hack: "School Hack",
  activity: "Activity",
  vent: "Vent",
  win: "Win",
  question: "Question",
};

const CATEGORY_ICONS: Record<VillagePostCategory, string> = {
  tip: "lightbulb",
  meal_idea: "restaurant",
  school_hack: "school",
  activity: "sports_soccer",
  vent: "mood",
  win: "emoji_events",
  question: "help",
};

interface VillagePostCardProps {
  post: VillagePost;
}

export function VillagePostCard({ post }: VillagePostCardProps) {
  const updatePost = useVillageStore((s) => s.updatePost);

  const handleReact = useCallback(
    async (reaction: "heart" | "helpful" | "same") => {
      try {
        const updated = await api.village.react(post.id, reaction);
        updatePost(updated);
      } catch {
        // Silently fail
      }
    },
    [post.id, updatePost],
  );

  const handleReport = useCallback(async () => {
    try {
      await api.village.report(post.id);
      updatePost({ ...post, reported: true });
    } catch {
      // Silently fail
    }
  }, [post, updatePost]);

  const timeAgo = formatTimeAgo(post.created_at);

  return (
    <div className="mom-card p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-brand-glow/20 flex items-center justify-center flex-shrink-0">
          <span className="text-alphaai-sm font-bold text-brand">
            {post.author_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-alphaai-xs font-semibold text-foreground">{post.author_name}</p>
          <div className="flex items-center gap-2">
            <span className="text-alphaai-3xs text-muted-foreground">{timeAgo}</span>
            {post.kids_ages && post.kids_ages.length > 0 && (
              <span className="text-alphaai-3xs text-muted-foreground">
                · Kids: {post.kids_ages.join(", ")}
              </span>
            )}
          </div>
        </div>
        <span className="mom-chip text-alphaai-3xs px-2 py-0.5">
          <span className="material-symbols-outlined text-[12px]">
            {CATEGORY_ICONS[post.category]}
          </span>
          {CATEGORY_LABELS[post.category]}
        </span>
      </div>

      {/* Content */}
      <p className="text-alphaai-sm text-foreground leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2 border-t border-border-subtle/10 pt-3">
        <ReactionButton
          emoji="❤️"
          count={post.reactions.heart}
          active={post.user_reaction === "heart"}
          onClick={() => handleReact("heart")}
        />
        <ReactionButton
          emoji="💡"
          count={post.reactions.helpful}
          active={post.user_reaction === "helpful"}
          onClick={() => handleReact("helpful")}
        />
        <ReactionButton
          emoji="🙋"
          count={post.reactions.same}
          active={post.user_reaction === "same"}
          onClick={() => handleReact("same")}
          label="Same"
        />

        <div className="flex-1" />

        {/* Comments link */}
        <Link
          href={`/village/post?id=${post.id}`}
          className="flex items-center gap-1 text-alphaai-3xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
          {post.comment_count > 0 ? post.comment_count : ""}
        </Link>

        {/* Report */}
        {!post.reported && (
          <button
            onClick={handleReport}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Report post"
          >
            <span className="material-symbols-outlined text-[14px]">flag</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ReactionButton({
  emoji,
  count,
  active,
  onClick,
  label,
}: {
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-alphaai-3xs transition-colors ${
        active
          ? "bg-brand-glow/15 text-brand font-medium"
          : "bg-surface-container text-muted-foreground hover:bg-surface-active"
      }`}
    >
      <span>{emoji}</span>
      {count > 0 && <span>{count}</span>}
      {label && !count && <span>{label}</span>}
    </button>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export { CATEGORY_LABELS, CATEGORY_ICONS };
