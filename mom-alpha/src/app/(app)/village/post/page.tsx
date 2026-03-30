"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useVillageStore } from "@/stores/village-store";
import { VillagePostCard, CATEGORY_LABELS, CATEGORY_ICONS } from "@/components/village/VillagePostCard";
import { CardSkeleton } from "@/components/shared/Skeleton";
import * as api from "@/lib/api-client";
import type { VillageComment, VillagePost, VillagePostCategory } from "@/types/api-contracts";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function VillagePostPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  // If postId is provided, show post detail with comments
  // Otherwise, show the compose form
  if (postId) {
    return <PostDetail postId={postId} />;
  }

  return <ComposePost />;
}

function PostDetail({ postId }: { postId: string }) {
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const [post, setPost] = useState<VillagePost | null>(null);
  const [comments, setComments] = useState<VillageComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isClient || !token) return;
    Promise.all([
      api.village.getPost(postId),
      api.village.comments(postId),
    ])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isClient, token, postId]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const comment = await api.village.addComment(postId, commentText.trim());
      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  }, [postId, commentText]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 pt-24 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-alphaai-sm text-muted-foreground">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/village"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to village"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1">
            Post
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-32 space-y-4">
        <VillagePostCard post={post} />

        {/* Comments */}
        <div className="space-y-3">
          <h3 className="text-alphaai-xs font-semibold text-foreground">
            Comments ({comments.length})
          </h3>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                <span className="text-alphaai-3xs font-bold text-muted-foreground">
                  {comment.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-alphaai-xs font-semibold text-foreground">
                    {comment.author_name}
                  </span>
                  <span className="text-alphaai-3xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-alphaai-xs text-foreground mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Comment input — fixed bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-surface border-t border-border-subtle/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Add a comment..."
            className="mom-input flex-1"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || submitting}
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center disabled:opacity-50"
            aria-label="Send comment"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposePost() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const addPost = useVillageStore((s) => s.addPost);
  const [category, setCategory] = useState<VillagePostCategory>("tip");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;
    if (!token) router.replace("/login?mode=signup");
  }, [isClient, token, router]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await api.village.create({
        category,
        content: content.trim(),
      });
      addPost(post);
      router.push("/village");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }, [category, content, addPost, router]);

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
            href="/village"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to village"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1">
            New Post
          </h1>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="px-4 py-2 rounded-full bg-brand text-on-primary text-alphaai-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-5">
        {/* Category */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as VillagePostCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-full text-alphaai-xs font-medium transition-colors flex items-center gap-1.5 ${
                  category === cat
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {CATEGORY_ICONS[cat]}
                </span>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a tip, ask a question, celebrate a win..."
            className="mom-input min-h-[160px] resize-none"
            rows={6}
            autoFocus
          />
          <p className="text-alphaai-3xs text-muted-foreground mt-1 text-right">
            {content.length}/500
          </p>
        </div>

        {/* Guidelines */}
        <div className="mom-card p-4 bg-brand-glow/5 border border-brand/10">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-brand mt-0.5">info</span>
            <div>
              <p className="text-alphaai-xs font-medium text-foreground mb-1">Community Guidelines</p>
              <p className="text-alphaai-3xs text-muted-foreground">
                Be kind and supportive. All posts are anonymous. No personal info, phone numbers, or
                addresses. Posts that violate guidelines will be removed.
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-alphaai-xs text-error">{error}</p>}
      </main>
    </div>
  );
}
