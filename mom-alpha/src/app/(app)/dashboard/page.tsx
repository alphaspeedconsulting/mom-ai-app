"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgentsStore } from "@/stores/agents-store";
import { useAuthStore } from "@/stores/auth-store";
import type { AgentCard, AgentType } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const CATEGORIES = ["All", "Household", "Education", "Wellness"] as const;

const SUGGESTED_AGENTS: AgentType[] = [
  "calendar_whiz",
  "grocery_guru",
  "budget_buddy",
  "school_event_hub",
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { agents, isLoading, error, fetchAgents, toggleAgent } = useAgentsStore();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const isClient = useIsClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    fetchAgents();
  }, [isClient, token, fetchAgents, router]);

  useEffect(() => {
    if (!error) return;
    // Invalid/expired/malformed tokens should return user to auth screen.
    const normalized = error.toLowerCase();
    if (
      normalized.includes("401") ||
      normalized.includes("422") ||
      normalized.includes("invalid") ||
      normalized.includes("unauthorized")
    ) {
      logout();
      router.replace("/login?mode=signup");
    }
  }, [error, logout, router]);

  if (!isClient || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  const filteredAgents = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    return matchSearch && matchCategory;
  });

  const suggested = agents.filter((a) => SUGGESTED_AGENTS.includes(a.agent_type));

  return (
    <div className="min-h-screen bg-background">
      {/* Top app bar — frosted */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-alphaai-xs text-muted-foreground">
              Good {getGreeting()}, {user?.name ?? "there"}
            </p>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Mom.alpha
            </h1>
          </div>
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">
              notifications
            </span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-background" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="mom-input pl-11"
          />
        </div>

        {/* Suggested for You — horizontal carousel */}
        {!search && (
          <section>
            <h2 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Suggested for You
            </h2>
            <div className="flex gap-3 overflow-x-auto mom-no-scrollbar pb-1">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-none w-[85%] max-w-[340px]">
                      <CardSkeleton />
                    </div>
                  ))
                : suggested.map((agent) => (
                    <SuggestedCard
                      key={agent.agent_type}
                      agent={agent}
                      onToggle={() => toggleAgent(agent.agent_type)}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto mom-no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-alphaai-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-brand text-on-primary"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Agent grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <EmptyState
              icon="smart_toy"
              title="No agents found"
              description="Try a different search or category filter."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredAgents.map((agent) => (
                <AgentListCard
                  key={agent.agent_type}
                  agent={agent}
                  onToggle={() => toggleAgent(agent.agent_type)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SuggestedCard({
  agent,
  onToggle,
}: {
  agent: AgentCard;
  onToggle: () => void;
}) {
  return (
    <div className="flex-none w-[85%] max-w-[340px] mom-gradient-hero rounded-2xl p-5 text-on-primary">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-on-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">{agent.icon}</span>
        </div>
        <button
          onClick={onToggle}
          className="mom-toggle"
          data-active={agent.is_active}
          aria-label={`Toggle ${agent.name}`}
        />
      </div>
      <h3 className="font-headline text-alphaai-lg font-bold mb-1">{agent.name}</h3>
      <p className="text-alphaai-sm opacity-80 line-clamp-2">{agent.description}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {agent.capabilities.slice(0, 2).map((c) => (
          <span key={c} className="text-alphaai-3xs bg-on-primary/15 px-2.5 py-1 rounded-full">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function AgentListCard({
  agent,
  onToggle,
}: {
  agent: AgentCard;
  onToggle: () => void;
}) {
  const tierBadge = agent.required_tier === "family_pro";

  return (
    <Link
      href={`/chat/${agent.agent_type}`}
      className="mom-card p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
    >
      <div className="mom-agent-avatar bg-brand-glow/30">
        <span className="material-symbols-outlined text-[20px] text-brand">
          {agent.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
            {agent.name}
          </h3>
          {tierBadge && (
            <span className="mom-chip-secondary text-alphaai-3xs py-0.5 px-2">PRO</span>
          )}
        </div>
        <p className="text-alphaai-xs text-muted-foreground truncate">{agent.description}</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="mom-toggle flex-shrink-0"
        data-active={agent.is_active}
        aria-label={`Toggle ${agent.name}`}
      />
    </Link>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
