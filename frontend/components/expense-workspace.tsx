"use client";

import { useState } from "react";

import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { SummaryCard } from "@/components/summary-card";
import type { Expense } from "@/types/expense";

export function ExpenseWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const visibleTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = new Set(expenses.map((expense) => expense.category)).size;

  return (
    <>
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "32px 32px 0",
            display: "grid",
            gap: 12,
          }}
        >
          <span
            style={{
              width: "fit-content",
              padding: "8px 12px",
              borderRadius: 999,
              background: "var(--accent-soft)",
              color: "var(--accent)",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
            }}
          >
            Frontend Starter
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.5rem, 6vw, 4.8rem)",
              lineHeight: 0.95,
              fontWeight: 600,
            }}
          >
            A clean Next.js base for a production-minded expense tracker.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 760,
              color: "var(--muted)",
              fontSize: 18,
              lineHeight: 1.6,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Expenses are loaded from the backend and refreshed after successful
            submissions so the interface behaves like a real working tool.
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 32,
            display: "grid",
            gap: 18,
            background: "var(--surface-strong)",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <SummaryCard
            label="Visible total"
            value={formatCurrency(visibleTotal)}
            helper="Current list snapshot"
          />
          <SummaryCard
            label="Categories"
            value={String(categories)}
            helper="Unique categories in the list"
          />
          <SummaryCard
            label="Backend status"
            value="Connected"
            helper="Live requests through the FastAPI API"
          />
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)",
          gap: 24,
        }}
      >
        <article
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "var(--shadow)",
            padding: 28,
            display: "grid",
            gap: 18,
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30 }}>Add Expense</h2>
            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.6,
              }}
            >
              Keep the UI simple for now: capture amount, category, description,
              and date in one clean entry form.
            </p>
          </div>
          <ExpenseForm onSuccess={() => setRefreshKey((current) => current + 1)} />
        </article>

        <article
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "var(--shadow)",
            padding: 28,
            display: "grid",
            gap: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 30 }}>Expenses</h2>
          <ExpenseList
            refreshKey={refreshKey}
            onExpensesChange={(nextExpenses) => setExpenses(nextExpenses)}
          />
        </article>
      </section>
    </>
  );
}

function formatCurrency(amountInPaise: number): string {
  return `Rs. ${(amountInPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
