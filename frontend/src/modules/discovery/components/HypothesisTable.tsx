import type { Hypothesis } from "../types";

interface HypothesisTableProps {
  hypotheses: Hypothesis[];
}

export default function HypothesisTable({ hypotheses }: HypothesisTableProps) {
  if (hypotheses.length === 0) {
    return <p>No hypotheses yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Statement</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Metric</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {hypotheses.map((h) => (
          <tr key={h.id}>
            <td style={{ padding: "8px 0" }}>{h.statement}</td>
            <td style={{ padding: "8px 0" }}>{h.metric ?? "-"}</td>
            <td style={{ padding: "8px 0" }}>{h.status ?? "testing"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
