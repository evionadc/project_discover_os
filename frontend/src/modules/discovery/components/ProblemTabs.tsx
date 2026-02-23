export type ProblemFilter = "all" | "open" | "validated" | "discarded";

const filterButtonStyle = (active?: boolean): React.CSSProperties => ({
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  border: "1px solid #1e293b",
  background: active ? "#1e293b" : "#020617",
  color: active ? "#ffffff" : "#cbd5e1",
  transition: "all 0.15s ease",
});

export default function ProblemTabs({
  value,
  onChange,
}: {
  value: ProblemFilter;
  onChange: (next: ProblemFilter) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <button type="button" style={filterButtonStyle(value === "all")} onClick={() => onChange("all")}>
        All
      </button>
      <button type="button" style={filterButtonStyle(value === "open")} onClick={() => onChange("open")}>
        Open
      </button>
      <button
        type="button"
        style={filterButtonStyle(value === "validated")}
        onClick={() => onChange("validated")}
      >
        Validated
      </button>
      <button
        type="button"
        style={filterButtonStyle(value === "discarded")}
        onClick={() => onChange("discarded")}
      >
        Discarded
      </button>
    </div>
  );
}
