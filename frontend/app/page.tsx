import { ExpenseWorkspace } from "@/components/expense-workspace";

export default function HomePage() {
  return (
    <main style={{ padding: "32px 20px 56px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <ExpenseWorkspace />
      </div>
    </main>
  );
}
