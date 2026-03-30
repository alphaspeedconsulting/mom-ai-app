"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgentsStore } from "@/stores/agents-store";
import { useAuthStore } from "@/stores/auth-store";
import type { AgentCard, AgentType } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DailyBrief } from "@/components/dashboard/DailyBrief";
import { WinsTeaser } from "@/components/dashboard/WinsTeaser";
import { BalanceTeaser } from "@/components/dashboard/BalanceTeaser";
import { ReferralBanner } from "@/components/dashboard/ReferralBanner";
import { SeasonalBanner } from "@/components/dashboard/SeasonalBanner";
import { EmergencyButton } from "@/components/dashboard/EmergencyButton";

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
  const { agents, isLoading, error, fetchAgents, toggleAgent, upgradeRequired, clearUpgradeRequired } = useAgentsStore();
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
      <div className="min-h-screen flex items-center justify-center">
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
      <header className="fixed top-0 left-0 right-0 z-40 rounded-none border-b border-border-subtle/10 bg-background pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 mom-gradient-hero rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-on-primary">spa</span>
            </div>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Alpha<span className="text-brand">.Mom</span>
            </h1>
          </div>
          <Link
            href="/notifications"
            aria-label="Open notifications"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground" aria-hidden="true">
              notifications
            </span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-background" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-6">
        {/* Emergency mode alert (if active) */}
        <EmergencyButton />

        {/* Daily Brief — morning ritual trigger */}
        <DailyBrief />

        {/* Weekly Wins teaser */}
        <WinsTeaser />

        {/* Co-parent balance teaser */}
        <BalanceTeaser />

        {/* Referral banner */}
        <ReferralBanner />

        {/* Seasonal pack banner */}
        <SeasonalBanner />

        {/* Upgrade prompt — shown when a Pro-tier toggle is blocked */}
        {upgradeRequired && (
          <div className="mom-card p-4 border border-secondary-container flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-secondary flex-shrink-0 mt-0.5">upgrade</span>
            <div className="flex-1 min-w-0">
              <p className="text-alphaai-sm font-semibold text-foreground">Upgrade to enable this agent</p>
              <p className="text-alphaai-xs text-muted-foreground mt-0.5">This agent requires a Family or Family Pro plan.</p>
              <a href="/settings?section=billing" className="inline-flex items-center gap-1 text-alphaai-xs font-semibold text-secondary mt-2 hover:underline">
                View plans
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
            <button onClick={clearUpgradeRequired} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <label htmlFor="agent-search" className="sr-only">Search agents</label>
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground" aria-hidden="true">
            search
          </span>
          <input
            id="agent-search"
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
      <div className="mom-agent-avatar mom-agent-avatar-md bg-brand-glow/30">
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

