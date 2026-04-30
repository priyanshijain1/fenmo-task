"use client";

import React, { useMemo } from "react";
import type { Expense } from "@/types/expense";

type CategoryTotalsProps = {
  expenses: Expense[];
};

function formatCurrency(amountInPaise: number): string {
  return `\u20B9${(amountInPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CategoryTotals({ expenses }: CategoryTotalsProps) {
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [expenses]);

  if (totals.length === 0) return null;

  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "var(--shadow)",
        padding: 20,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--muted)" }}>
        Totals by Category
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {totals.map(([category, total]) => (
          <div key={category} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Arial, sans-serif" }}>{category}</span>
            <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>{formatCurrency(total)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
