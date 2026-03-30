"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useTemplatesStore } from "@/stores/templates-store";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/components/templates/TemplateCard";
import { ShareButton } from "@/components/shared/ShareButton";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import * as api from "@/lib/api-client";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const { selected, isLoading, error, fetchTemplate } = useTemplatesStore();
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    if (templateId) fetchTemplate(templateId);
  }, [isClient, token, templateId, fetchTemplate, router]);

  const handleClone = useCallback(async () => {
    if (!templateId) return;
    setCloning(true);
    try {
      await api.templates.clone(templateId);
      setCloned(true);
    } catch {
      // Error handling
    } finally {
      setCloning(false);
    }
  }, [templateId]);

  const handleRate = useCallback(async (rating: number) => {
    if (!templateId) return;
    setUserRating(rating);
    await api.templates.rate(templateId, rating).catch(() => {});
  }, [templateId]);

  if (!isClient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 pt-24 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="max-w-lg mx-auto">
          <EmptyState icon="error" title="Template not found" description={error ?? "This template may have been removed."} />
        </div>
      </div>
    );
  }

  const t = selected;

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
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground flex-1 truncate">
            {t.title}
          </h1>
          <ShareButton
            itemType="task"
            title={t.title}
            text={`Check out this ${CATEGORY_LABELS[t.category]} template on Alpha.Mom: "${t.title}"`}
            trackEvent="template_share"
            compact
          />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-5">
        {/* Header card */}
        <div className="mom-card overflow-hidden">
          <div className="mom-gradient-hero px-5 py-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-on-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-on-primary">
                  {CATEGORY_ICONS[t.category]}
                </span>
              </div>
              <div>
                <span className="mom-chip text-alphaai-3xs bg-on-primary/15 text-on-primary px-2 py-0.5">
                  {CATEGORY_LABELS[t.category]}
                </span>
              </div>
            </div>
            <h2 className="font-headline text-alphaai-xl font-bold text-on-primary">{t.title}</h2>
            <p className="text-alphaai-xs text-on-primary/80 mt-1">{t.description}</p>
          </div>

          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-alphaai-xs text-muted-foreground">by {t.author_name}</span>
              <span className="flex items-center gap-0.5 text-alphaai-xs text-muted-foreground">
                <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {t.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5 text-alphaai-xs text-muted-foreground">
                <span className="material-symbols-outlined text-[14px]">group</span>
                {t.uses_count.toLocaleString()} families
              </span>
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="mom-card p-5">
          <h3 className="text-alphaai-xs font-semibold text-foreground mb-3">
            {t.items.length} Items
          </h3>
          <div className="space-y-2">
            {t.items.sort((a, b) => a.order - b.order).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                <span className="text-alphaai-3xs text-muted-foreground w-5 text-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-alphaai-sm text-foreground">{item.label}</p>
                  {(item.time || item.day) && (
                    <p className="text-alphaai-3xs text-muted-foreground mt-0.5">
                      {[item.day, item.time].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mom-card p-5">
          <h3 className="text-alphaai-xs font-semibold text-foreground mb-3">Rate this template</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="w-10 h-10 flex items-center justify-center"
                aria-label={`Rate ${star} stars`}
              >
                <span
                  className={`material-symbols-outlined text-[28px] ${
                    star <= userRating ? "text-secondary" : "text-muted-foreground/30"
                  }`}
                  style={{ fontVariationSettings: star <= userRating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Clone button */}
        <button
          onClick={handleClone}
          disabled={cloning || cloned}
          className="mom-btn-primary w-full disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">
            {cloned ? "check" : "content_copy"}
          </span>
          {cloned ? "Added to My Routines!" : cloning ? "Adding..." : "Use This Template"}
        </button>

        {/* Tags */}
        {t.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {t.tags.map((tag) => (
              <span key={tag} className="mom-chip text-alphaai-3xs px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
