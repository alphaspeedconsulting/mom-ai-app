"use client";

import { useEffect, useState } from "react";
import * as api from "@/lib/api-client";
import type { NotificationItem } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.notifications.list();
        setNotifications(data.notifications);
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch {
      // Handle silently
    }
  };

  const newNotifs = notifications.filter((n) => !n.read_at);
  const earlierNotifs = notifications.filter((n) => n.read_at);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
            Notifications
          </h1>
          <p className="text-alphaai-xs text-brand font-semibold">The Daily Edit</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-4 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications_none"
            title="All quiet"
            description="You'll see updates from your agents here."
          />
        ) : (
          <>
            {/* New notifications */}
            {newNotifs.length > 0 && (
              <section>
                <h3 className="font-headline text-alphaai-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  New Updates
                </h3>
                <div className="space-y-2">
                  {newNotifs.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Earlier */}
            {earlierNotifs.length > 0 && (
              <section>
                <h3 className="font-headline text-alphaai-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Earlier
                </h3>
                <div className="space-y-2">
                  {earlierNotifs.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  school: "school",
  calendar: "calendar_month",
  budget: "account_balance_wallet",
  billing: "payment",
  daily_edit: "auto_stories",
  general: "notifications",
};

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !notification.read_at;
  const icon = CATEGORY_ICONS[notification.category] ?? "notifications";
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <button
      onClick={() => isUnread && onMarkRead(notification.id)}
      className={`w-full text-left mom-card p-4 flex gap-3 transition-colors ${
        isUnread ? "bg-brand/5 border-l-4 border-l-brand" : "opacity-70"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        isUnread ? "bg-brand-glow/30" : "bg-surface-container"
      }`}>
        <span className={`material-symbols-outlined text-[20px] ${
          isUnread ? "text-brand" : "text-muted-foreground"
        }`}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-alphaai-sm font-semibold text-foreground truncate">
            {notification.title}
          </h4>
          {isUnread && (
            <span className="w-2 h-2 bg-brand rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-alphaai-xs text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
        <span className="text-alphaai-3xs text-muted-foreground mt-1 inline-block">
          {timeAgo}
        </span>
      </div>
    </button>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
