"use client";

import { useEffect } from "react";
import { useTasksStore } from "@/stores/tasks-store";
import { useAgentsStore } from "@/stores/agents-store";
import type { TaskItem, TaskStep } from "@/types/api-contracts";
import { TaskCardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export default function TasksPage() {
  const { isLoading, fetchTasks, getActiveTasks, getCompletedTasks, getActiveCount, getCompletedTodayCount } =
    useTasksStore();
  const { agents, fetchAgents } = useAgentsStore();

  useEffect(() => {
    fetchTasks();
    if (agents.length === 0) fetchAgents();
  }, [fetchTasks, fetchAgents, agents.length]);

  const activeTasks = getActiveTasks();
  const completedTasks = getCompletedTasks();
  const activeCount = getActiveCount();
  const completedToday = getCompletedTodayCount();

  const getAgentIcon = (agentType: string) =>
    agents.find((a) => a.agent_type === agentType)?.icon ?? "smart_toy";

  const getAgentName = (agentType: string) =>
    agents.find((a) => a.agent_type === agentType)?.name ?? agentType.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Tasks</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Hero summary */}
        <div className="mom-gradient-hero rounded-2xl p-6 text-on-primary">
          <h2 className="font-headline text-alphaai-lg font-bold mb-4">Agent Activity</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-on-primary/15 backdrop-blur-md rounded-xl p-3 border border-on-primary/10">
              <p className="text-alphaai-3xl font-bold">{activeCount}</p>
              <p className="text-alphaai-xs opacity-80">Active Tasks</p>
            </div>
            <div className="bg-on-primary/15 backdrop-blur-md rounded-xl p-3 border border-on-primary/10">
              <p className="text-alphaai-3xl font-bold">{completedToday}</p>
              <p className="text-alphaai-xs opacity-80">Completed Today</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "calendar_month", label: "Calendar", href: "/calendar" },
            { icon: "shopping_cart", label: "Grocery List", href: "/chat/grocery_guru" },
            { icon: "receipt_long", label: "Scan Receipt", href: "/chat/budget_buddy" },
            { icon: "school", label: "School Events", href: "/chat/school_event_hub" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="mom-card p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-brand">
                  {action.icon}
                </span>
              </div>
              <span className="text-alphaai-sm font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Active tasks */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Active Tasks
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <EmptyState
              icon="task_alt"
              title="All caught up!"
              description="No active tasks right now. Your agents are standing by."
            />
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <ActiveTaskCard
                  key={task.id}
                  task={task}
                  agentIcon={getAgentIcon(task.agent_type)}
                  agentName={getAgentName(task.agent_type)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <section>
            <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Completed
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <CompletedTaskCard
                  key={task.id}
                  task={task}
                  agentIcon={getAgentIcon(task.agent_type)}
                  agentName={getAgentName(task.agent_type)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tip */}
        <div className="mom-banner bg-tertiary-container/20 border border-tertiary/10">
          <span className="material-symbols-outlined text-[20px] text-tertiary">lightbulb</span>
          <p className="text-alphaai-xs text-muted-foreground">
            <strong className="text-foreground">Mom Moment:</strong> Tasks update in real-time.
            Your agents work in the background so you can focus on what matters.
          </p>
        </div>
      </main>
    </div>
  );
}

function ActiveTaskCard({
  task,
  agentIcon,
  agentName,
}: {
  task: TaskItem;
  agentIcon: string;
  agentName: string;
}) {
  return (
    <div className="mom-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="mom-agent-avatar bg-brand-glow/30">
          <span className="material-symbols-outlined text-[18px] text-brand">{agentIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
            {task.title}
          </h4>
          <p className="text-alphaai-3xs text-muted-foreground">{agentName}</p>
        </div>
        <span className="mom-chip-secondary text-alphaai-3xs py-0.5 px-2 uppercase">
          {task.status === "in_progress" ? "Active" : "Pending"}
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {task.steps.map((step, i) => (
          <StepDot key={i} step={step} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mom-progress-track h-2.5">
        <div className="mom-progress-fill" style={{ width: `${task.progress_pct}%` }} />
      </div>

      {/* Current step label */}
      <p className="text-alphaai-xs text-muted-foreground">
        {task.steps.find((s) => s.status === "in_progress")?.label ?? task.steps[task.steps.length - 1]?.label}
      </p>
    </div>
  );
}

function StepDot({ step }: { step: TaskStep }) {
  const colors: Record<string, string> = {
    completed: "bg-brand",
    in_progress: "bg-secondary",
    pending: "bg-surface-input",
  };

  return (
    <div className="flex items-center gap-1 flex-1">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[step.status]}`} />
      <div className={`flex-1 h-0.5 ${step.status === "completed" ? "bg-brand" : "bg-surface-input"}`} />
    </div>
  );
}

function CompletedTaskCard({
  task,
  agentName,
}: {
  task: TaskItem;
  agentIcon: string;
  agentName: string;
}) {
  return (
    <div className="mom-card p-4 bg-surface-container-low/50 border border-border-subtle/10 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-glow/30 flex items-center justify-center">
        <span className="material-symbols-outlined text-[16px] text-brand">check_circle</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-alphaai-sm font-medium text-foreground truncate">{task.title}</p>
        <p className="text-alphaai-3xs text-muted-foreground">{agentName}</p>
      </div>
    </div>
  );
}
