"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShareButton } from "@/components/shared/ShareButton";
import * as api from "@/lib/api-client";
import type { SeasonalPack } from "@/types/api-contracts";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SeasonalPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const [packs, setPacks] = useState<SeasonalPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    api.seasonal
      .current()
      .then((data) => setPacks(data.packs))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isClient, token, router]);

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
              Seasonal Packs
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Timely checklists for busy families
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : packs.length === 0 ? (
          <EmptyState
            icon="wb_sunny"
            title="No seasonal packs right now"
            description="Check back soon — new packs appear for back-to-school, holidays, and more!"
          />
        ) : (
          packs.map((pack) => (
            <div key={pack.id} className="mom-card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === pack.id ? null : pack.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-secondary">
                    {pack.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-alphaai-sm font-semibold text-foreground truncate">
                      {pack.title}
                    </h3>
                    <span className="mom-chip-secondary text-alphaai-3xs px-2 py-0">{pack.season}</span>
                  </div>
                  <p className="text-alphaai-3xs text-muted-foreground line-clamp-1 mt-0.5">
                    {pack.description}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-muted-foreground flex-shrink-0">
                  {expandedId === pack.id ? "expand_less" : "expand_more"}
                </span>
              </button>

              {expandedId === pack.id && (
                <div className="px-5 pb-5 border-t border-border-subtle/10">
                  <p className="text-alphaai-xs text-muted-foreground mt-3 mb-4">
                    {pack.description}
                  </p>
                  <div className="space-y-2">
                    {pack.checklist_items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                        <div className="w-5 h-5 rounded border-2 border-brand/30 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-alphaai-xs text-foreground">{item.text}</p>
                          {item.agent_type && (
                            <Link
                              href={`/chat/${item.agent_type}`}
                              className="text-alphaai-3xs text-brand font-medium mt-0.5 inline-block"
                            >
                              Ask {item.agent_type.replace(/_/g, " ")} →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <ShareButton
                      itemType="task"
                      title={pack.title}
                      text={`Check out this seasonal pack on Alpha.Mom: "${pack.title}" — ${pack.checklist_items.length} items to get ready!`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
