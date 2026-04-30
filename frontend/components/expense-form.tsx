export function ExpenseForm() {
  return (
    <form
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
        <input id="date" name="date" type="date" style={inputStyles} />
      </div>

      <button
        type="submit"
        style={{
          border: "none",
          borderRadius: 14,
          padding: "14px 18px",
          background: "var(--accent)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Add Expense
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
