"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { getExpenses } from "@/lib/api/expenses";
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

  useEffect(() => {
    let isActive = true;

    async function loadExpenses() {
      setIsLoading(true);
      setErrorMessage("");

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
        } catch {
          // ignore
        }
        onExpensesChange?.(data);
      } catch (error) {
        if (!isActive) {
          return;
        }
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load expenses right now.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      isActive = false;
    };
  }, [category, onExpensesChange, refreshKey, sort]);

  if (isLoading) {
    return (
      <p style={statusStyles}>
        Loading expenses...
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p
        style={{
          ...statusStyles,
          color: "#b42318",
          background: "rgba(180, 35, 24, 0.12)",
        }}
      >
        {errorMessage}
      </p>
    );
  }

  if (expenses.length === 0) {
    return (
      <p style={statusStyles}>
        No expenses yet. Add your first one from the form.
      </p>
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

function formatCurrency(amountInPaise: number): string {
  return `\u20B9${(amountInPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const statusStyles = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  fontFamily: "Arial, sans-serif",
} satisfies React.CSSProperties;
