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

export default function ProblemTabs() {
  return (
 <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
  <button style={filterButtonStyle(true)}>All</button>
  <button style={filterButtonStyle(false)}>Open</button>
  <button style={filterButtonStyle(false)}>Validated</button>
  <button style={filterButtonStyle(false)}>Discarded</button>
</div>

  );
}
