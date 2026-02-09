import { useState } from "react";
import type { HypothesisCreate } from "../types";

interface HypothesisFormProps {
  problemId: string;
  onCreate: (payload: HypothesisCreate) => Promise<void>;
}

export default function HypothesisForm({ problemId, onCreate }: HypothesisFormProps) {
  const [statement, setStatement] = useState("");
  const [metric, setMetric] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = problemId.trim().length > 0 && statement.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        problem_id: problemId,
        statement,
        metric: metric.trim().length > 0 ? metric : undefined,
        success_criteria: successCriteria.trim().length > 0 ? successCriteria : undefined,
      });
      setProblemId("");
      setStatement("");
      setMetric("");
      setSuccessCriteria("");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    width: 360,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    fontSize: 14,
  };

  const buttonStyle: React.CSSProperties = {
    background: "#2563eb",
    border: "1px solid #1d4ed8",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <section style={{ marginTop: 16 }} id="new-hypothesis">
      <textarea
        placeholder="Hypothesis statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        style={{ ...fieldStyle, width: 480, minHeight: 80 }}
      />
      <input
        placeholder="Metric"
        value={metric}
        onChange={(e) => setMetric(e.target.value)}
        style={fieldStyle}
      />
      <input
        placeholder="Success criteria"
        value={successCriteria}
        onChange={(e) => setSuccessCriteria(e.target.value)}
        style={fieldStyle}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={buttonStyle}>
        {submitting ? "Creating..." : "Create hypothesis"}
      </button>
    </section>
  );
}
