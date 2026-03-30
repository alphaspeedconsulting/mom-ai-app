"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api-client";
import type { SharePreviewResponse } from "@/types/api-contracts";

const ITEM_ICONS: Record<string, string> = {
  grocery_list: "grocery",
  calendar_event: "calendar_month",
  task: "task_alt",
  win_card: "emoji_events",
};

/**
 * Public share preview page — uses ?token= query param.
 * Loads without auth, shows limited preview + signup CTA.
 */
export default function SharePreviewPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [preview, setPreview] = useState<SharePreviewResponse | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(token ? null : "No share token provided.");

  useEffect(() => {
    if (!token) return;
    api.share
      .preview(token)
      .then(setPreview)
      .catch((err) => setError(err instanceof Error ? err.message : "Link expired or invalid"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mom-card p-8 text-center">
          <div className="w-12 h-12 mom-skeleton rounded-full mx-auto mb-4" />
          <div className="h-5 w-40 mom-skeleton rounded mx-auto mb-2" />
          <div className="h-4 w-56 mom-skeleton rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="mom-card p-8 text-center max-w-sm w-full">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground/30 mb-4">
            link_off
          </span>
          <h1 className="font-headline text-alphaai-lg font-bold text-foreground mb-2">
            Link Expired
          </h1>
          <p className="text-alphaai-sm text-muted-foreground mb-6">
            {error ?? "This share link is no longer available."}
          </p>
          <Link href="/login?mode=signup" className="mom-btn-primary">
            Join Alpha.Mom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mom-card overflow-hidden max-w-sm w-full">
        {/* Header */}
        <div className="mom-gradient-hero px-6 py-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-on-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-on-primary">
                {ITEM_ICONS[preview.item_type] ?? "share"}
              </span>
            </div>
            <div>
              <p className="text-alphaai-3xs text-on-primary/70 uppercase tracking-wider">
                Shared by {preview.sharer_name}
              </p>
              <p className="text-alphaai-xs text-on-primary/80">
                {preview.household_name}
              </p>
            </div>
          </div>
          <h1 className="font-headline text-alphaai-xl font-bold text-on-primary">
            {preview.title}
          </h1>
        </div>

        {/* Preview content */}
        <div className="px-6 py-5">
          <PreviewContent data={preview.preview_data} type={preview.item_type} />

          {/* CTA */}
          <div className="mt-6 text-center">
            <p className="text-alphaai-xs text-muted-foreground mb-3">
              Join Alpha.Mom to manage your household with AI
            </p>
            <Link href="/login?mode=signup" className="mom-btn-primary w-full">
              <span className="material-symbols-outlined text-[18px]">spa</span>
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewContent({
  data,
  type,
}: {
  data: Record<string, unknown>;
  type: string;
}) {
  if (type === "grocery_list" && Array.isArray(data.items)) {
    return (
      <div className="space-y-1.5">
        {(data.items as Array<{ text: string }>).slice(0, 6).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
            <span className="text-alphaai-sm text-foreground">{item.text}</span>
          </div>
        ))}
        {(data.items as unknown[]).length > 6 && (
          <p className="text-alphaai-3xs text-muted-foreground">
            +{(data.items as unknown[]).length - 6} more items
          </p>
        )}
      </div>
    );
  }

  if (type === "calendar_event") {
    return (
      <div className="space-y-2">
        {"date" in data && data.date != null && (
          <p className="text-alphaai-sm text-foreground">{String(data.date)}</p>
        )}
        {"description" in data && data.description != null && (
          <p className="text-alphaai-xs text-muted-foreground">{String(data.description)}</p>
        )}
      </div>
    );
  }

  return (
    <p className="text-alphaai-sm text-muted-foreground">
      Sign up to see the full details.
    </p>
  );
}
