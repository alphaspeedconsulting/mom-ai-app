"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { Expense, ExpenseSummary } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const CATEGORY_ICONS: Record<string, string> = {
  groceries: "shopping_cart",
  dining: "restaurant",
  gas: "local_gas_station",
  education: "school",
  health: "health_and_safety",
  entertainment: "movie",
  shopping: "shopping_bag",
  utilities: "bolt",
  transport: "directions_car",
  other: "category",
  uncategorized: "category",
};

export default function BudgetBuddyPage() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.household_id) return;

    async function load() {
      try {
        const [summaryData, expensesData] = await Promise.all([
          api.expenses.summary(user!.household_id!),
          api.expenses.list(user!.household_id!),
        ]);
        setSummary(summaryData);
        setExpenses(expensesData);
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user?.household_id]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.household_id) return;

    try {
      const newExpense = await api.expenses.uploadReceipt(user.household_id, file);
      setExpenses((prev) => [newExpense as Expense, ...prev]);
      // Refresh summary
      const newSummary = await api.expenses.summary(user.household_id);
      setSummary(newSummary);
    } catch {
      // Handle error
    }
  };

  const categories = summary?.by_category
    ? Object.entries(summary.by_category)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  const trendIcon =
    summary?.trend === "up"
      ? "trending_up"
      : summary?.trend === "down"
        ? "trending_down"
        : "trending_flat";

  const trendColor =
    summary?.trend === "up"
      ? "text-error"
      : summary?.trend === "down"
        ? "text-brand"
        : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">
              arrow_back
            </span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Budget Buddy
            </h1>
          </div>
          <Link
            href="/chat/budget_buddy"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">
              chat
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Household Health Hero */}
        <section className="mom-gradient-hero rounded-2xl p-5 text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-alphaai-3xs font-bold uppercase tracking-widest opacity-80 mb-1">
              Household Health
            </p>
            {isLoading ? (
              <div className="h-8 w-32 bg-on-primary/20 rounded animate-pulse" />
            ) : (
              <>
                <h2 className="font-headline text-alphaai-xl font-bold">
                  ${summary?.total_month.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "0.00"}
                </h2>
                <div className="flex items-center gap-1 mt-1 opacity-80">
                  <span className={`material-symbols-outlined text-[18px] ${summary?.trend === "up" ? "" : "text-on-primary"}`}>
                    {trendIcon}
                  </span>
                  <span className="text-alphaai-sm">
                    {summary?.trend === "up" ? "Spending up" : summary?.trend === "down" ? "Spending down" : "On track"} this month
                  </span>
                </div>
              </>
            )}
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[8rem] opacity-10">
            account_balance_wallet
          </span>
        </section>

        {/* Scan Receipt Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full mom-card p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
        >
          <div className="w-12 h-12 bg-brand-glow/30 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-brand">
              receipt_long
            </span>
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-headline text-alphaai-base font-semibold text-foreground">
              Scan Receipt
            </h4>
            <p className="text-alphaai-xs text-muted-foreground">
              Take a photo to auto-categorize expenses
            </p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">
            photo_camera
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleReceiptUpload}
        />

        {/* Category Breakdown */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Spending Breakdown
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon="account_balance_wallet"
              title="No expenses yet"
              description="Start tracking by scanning a receipt or adding expenses."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map(([category, amount]) => (
                <div key={category} className="mom-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[18px] text-brand">
                      {CATEGORY_ICONS[category] ?? "category"}
                    </span>
                    <span className="text-alphaai-xs text-muted-foreground capitalize">
                      {category}
                    </span>
                  </div>
                  <p className="font-headline text-alphaai-lg font-bold text-foreground">
                    ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recurring Pulse */}
        {summary && summary.recurring_total > 0 && (
          <section className="mom-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    autorenew
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-alphaai-base font-semibold text-foreground">
                    Recurring Pulse
                  </h4>
                  <p className="text-alphaai-xs text-muted-foreground">
                    Monthly recurring expenses
                  </p>
                </div>
              </div>
              <p className="font-headline text-alphaai-lg font-bold text-foreground">
                ${summary.recurring_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Recent Transactions
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No transactions"
              description="Your expense history will appear here."
            />
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="mom-card p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                      {CATEGORY_ICONS[expense.category] ?? "category"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-alphaai-sm font-medium text-foreground truncate">
                      {expense.merchant ?? expense.category}
                    </p>
                    <p className="text-alphaai-3xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {expense.source === "ocr" && " · Scanned"}
                    </p>
                  </div>
                  <p className="font-headline text-alphaai-base font-semibold text-foreground">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
