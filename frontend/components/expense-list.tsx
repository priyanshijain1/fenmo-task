"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { getExpenses } from "@/lib/api/expenses";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Expense } from "@/types/expense";

type ExpenseListProps = {
  category?: string;
  refreshKey?: number;
  onExpensesChange?: (expenses: Expense[]) => void;
  sort?: "date_desc" | "date_asc";
};

export function ExpenseList({
  category,
  refreshKey = 0,
  onExpensesChange,
  sort,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasCachedData, setHasCachedData] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadExpenses() {
      setIsLoading(true);
      setErrorMessage("");
      // Detect if cached data exists before fetching
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("expenses-cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as Expense[];
            setHasCachedData(parsed.length > 0);
          } catch {
            // ignore parse errors
          }
        } else {
          setHasCachedData(false);
        }
      }

      // Retry loop for transient API failures
      const MAX_RETRIES = 2;
      let attempt = 0;
      while (true) {
        try {
          const data = await getExpenses({
            category: category || undefined,
            sort: sort ?? "date_desc",
          });
          if (!isActive) {
            return;
          }
          setExpenses(data);
          try {
            localStorage.setItem("expenses-cache", JSON.stringify(data));
            setHasCachedData(true);
          } catch {
            // ignore cache write failures
          }
          onExpensesChange?.(data);
          break;
        } catch (error) {
          if (!isActive) {
            return;
          }
          const shouldRetry = error instanceof ApiError && (error.status >= 500 || error.status === 429);
          attempt++;
          if (!shouldRetry || attempt > MAX_RETRIES) {
            if (error instanceof ApiError) {
              setErrorMessage(error.message);
            } else {
              setErrorMessage("Unable to load expenses right now.");
            }
            break;
          }
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
      }

    void loadExpenses();

    return () => {
      isActive = false;
    };
  }, [category, onExpensesChange, refreshKey, sort, retryKey]);

  if (isLoading) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="spinner" aria-label="loading" />
          <p style={statusStyles}>Loading expenses...</p>
        </div>
        {/* simple skeleton items */}
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.75)", border: "1px solid var(--border)" }}>
            <div style={{ width: "60%", height: 12, background: "rgba(0,0,0,.04)", borderRadius: 6 }} />
            <div style={{ width: 80, height: 12, background: "rgba(0,0,0,.04)", borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <p
          style={{
            ...statusStyles,
            color: "#b42318",
            background: "rgba(180, 35, 24, 0.12)",
          }}
        >
          {errorMessage}
        </p>
        {hasCachedData ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--muted)" }}>
              Loaded cached data from previous load
            </span>
            <button
              onClick={() => {
                const cache = (typeof window !== "undefined") ? localStorage.getItem("expenses-cache") : null;
                if (cache) {
                  try {
                    const data = JSON.parse(cache) as Expense[];
                    setExpenses(data);
                    onExpensesChange?.(data);
                    setErrorMessage("");
                  } catch {
                    // ignore parse errors
                  }
                }
              }}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "6px 10px",
                background: "var(--surface)",
                color: "var(--text)",
                cursor: "pointer",
                fontFamily: "Arial, sans-serif",
                fontSize: 13,
              }}
            >
              Load cached data
            </button>
          </div>
          ) : null}
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 10px",
            background: "var(--surface)",
            color: "var(--text)",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <p style={statusStyles}>No expenses yet. Add your first one from the form.</p>
        <button
          onClick={() => {
            const el = typeof window !== "undefined" ? document.getElementById("expense-form") : null;
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              (el as HTMLElement).focus?.();
            }
          }}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            background: "var(--surface)",
            color: "var(--text)",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
          }}
        >
          Add Expense
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {expenses.map((expense) => (
        <div
          key={expense.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,0.75)",
            border: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontFamily: "Arial, sans-serif" }}>
              {expense.category}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>
              {expense.description}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{formatCurrency(expense.amount)}</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>
              {formatDate(expense.date)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// formatting helpers now imported from shared utils

  const statusStyles = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  fontFamily: "Arial, sans-serif",
} satisfies React.CSSProperties;
