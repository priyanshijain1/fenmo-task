type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 20,
        background: "rgba(255,255,255,0.88)",
        border: "1px solid var(--border)",
        display: "grid",
        gap: 8,
      }}
    >
      <span
        style={{
          color: "var(--muted)",
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <strong style={{ fontSize: 34, lineHeight: 1 }}>{value}</strong>
      <span style={{ color: "var(--muted)", fontFamily: "Arial, sans-serif" }}>
        {helper}
      </span>
    </div>
  );
}
