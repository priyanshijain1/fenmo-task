"use client";

import { type FormEvent, useState } from "react";
import { useRef } from "react";

import { ApiError } from "@/lib/api/client";
import { createExpense } from "@/lib/api/expenses";

type ExpenseFormState = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

type ExpenseFormProps = {
  onSuccess?: () => void;
  onPreviewExpense?: (expense: import("@/types/expense").Expense) => void;
  onSuccessWithExpense?: (expense: import("@/types/expense").Expense) => void;
  onError?: (tempId: string) => void;
};

const initialFormState: ExpenseFormState = {
  amount: "",
  category: "",
  description: "",
  date: "",
};

type ExpenseType = import("@/types/expense").Expense;

export function ExpenseForm({ onSuccess, onPreviewExpense, onSuccessWithExpense, onError }: ExpenseFormProps) {
  const [formState, setFormState] = useState<ExpenseFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Guard to prevent rapid repeated submissions even if user double-clicks quickly
  const submittingRef = useRef(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // If already submitting (guard against rapid clicks / double submissions)
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

  let provisionalId: string | null = null;
  try {
      // Create a provisional expense for optimistic UI
      provisionalId = `temp_${Date.now()}`;
      const provisionalExpense: ExpenseType = {
        id: provisionalId,
        amount: Number(formState.amount),
        category: formState.category,
        description: formState.description,
        date: formState.date,
        created_at: new Date().toISOString(),
        tempId: provisionalId,
      };
      onPreviewExpense?.(provisionalExpense);

      const created = await createExpense({
        amount: Number(formState.amount),
        category: formState.category,
        description: formState.description,
        date: formState.date,
      });

      setSuccessMessage("Expense added successfully.");
      // Notify parent of the confirmed expense and provide a reconciled object
      onSuccessWithExpense?.(Object.assign({}, created, { tempId: provisionalId as any }));
      setFormState(initialFormState);
      onSuccess?.();
    } catch (error) {
      if (provisionalId) {
        onError?.(provisionalId);
      }
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong while saving the expense.");
      }
    } finally {
      // Reset submitting guard and UI state
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="expense-form"
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor="amount"
          style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}
        >
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="123.45"
          value={formState.amount}
          onChange={(event) =>
            setFormState((current) => ({ ...current, amount: event.target.value }))
          }
          style={inputStyles}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor="category"
          style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}
        >
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          placeholder="Food"
          value={formState.category}
          onChange={(event) =>
            setFormState((current) => ({ ...current, category: event.target.value }))
          }
          style={inputStyles}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor="description"
          style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Lunch with team"
          value={formState.description}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          style={{ ...inputStyles, resize: "vertical", minHeight: 112 }}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor="date"
          style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}
        >
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={formState.date}
          onChange={(event) =>
            setFormState((current) => ({ ...current, date: event.target.value }))
          }
          style={inputStyles}
        />
      </div>

      {successMessage ? (
        <p
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(15, 118, 110, 0.12)",
            color: "var(--accent)",
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
          }}
        >
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(180, 35, 24, 0.12)",
            color: "#b42318",
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
          }}
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          border: "none",
          borderRadius: 14,
          padding: "14px 18px",
          background: isSubmitting ? "#7faaa6" : "var(--accent)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: 15,
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" aria-label="loading" /> Saving...
          </>
        ) : (
          "Add Expense"
        )}
      </button>
    </form>
  );
}

const inputStyles = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "12px 14px",
  background: "#ffffff",
  color: "var(--text)",
  fontSize: 15,
  fontFamily: "Arial, sans-serif",
} satisfies React.CSSProperties;
