import { SummaryCard } from "@/components/summary-card";

const previewExpenses = [
  {
    id: "1",
    category: "Food",
    description: "Lunch with team",
    amount: "₹540",
    date: "30 Apr 2026",
  },
  {
    id: "2",
    category: "Travel",
    description: "Metro recharge",
    amount: "₹250",
    date: "29 Apr 2026",
  },
  {
    id: "3",
    category: "Bills",
    description: "Electricity",
    amount: "₹1,820",
    date: "28 Apr 2026",
  },
];

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
              This app is scaffolded with the App Router, TypeScript, strict mode,
              and a simple component split so we can grow it into a real UI without
              reworking the foundation.
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
            <SummaryCard label="Visible total" value="₹2,610" helper="Current list snapshot" />
            <SummaryCard label="Categories" value="3" helper="Food, Travel, Bills" />
            <SummaryCard label="Backend status" value="Ready" helper="Connect this UI to FastAPI next" />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
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
            <div>
              <h2 style={{ margin: 0, fontSize: 30 }}>Suggested Structure</h2>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--muted)",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Keep API helpers, feature components, and page-level composition
                separate from day one. That keeps the frontend extendable without
                turning into a single large page file.
              </p>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 20,
                borderRadius: 18,
                background: "#1f2937",
                color: "#f9fafb",
                overflowX: "auto",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
{`frontend/
  app/
  components/
  lib/
  types/`}
            </pre>
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
            <h2 style={{ margin: 0, fontSize: 30 }}>Preview Expenses</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {previewExpenses.map((expense) => (
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
                    <div style={{ fontWeight: 700 }}>{expense.amount}</div>
                    <div style={{ color: "var(--muted)", marginTop: 4 }}>
                      {expense.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
