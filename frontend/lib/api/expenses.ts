import { apiRequest } from "@/lib/api/client";
import type { Expense } from "@/types/expense";

export type GetExpensesParams = {
  category?: string;
  sort?: "date_desc" | "date_asc";
};

export type CreateExpenseInput = {
  amount: number;
  category: string;
  description: string;
  date: string;
};

function buildExpensesQuery(params: GetExpensesParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();
  return queryString ? `/expenses?${queryString}` : "/expenses";
}

export function getExpenses(params?: GetExpensesParams): Promise<Expense[]> {
  return apiRequest<Expense[]>(buildExpensesQuery(params), {
    method: "GET",
  });
}

export function createExpense(input: CreateExpenseInput): Promise<Expense> {
  return apiRequest<Expense>("/expenses", {
    method: "POST",
    body: input,
  });
}
