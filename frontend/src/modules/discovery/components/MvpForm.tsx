import { useState } from "react";
import type { MvpCreate } from "../types";

interface MvpFormProps {
  hypothesisId: string;
  onCreate: (payload: MvpCreate) => Promise<void>;
}

export default function MvpForm({ hypothesisId, onCreate }: MvpFormProps) {
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = hypothesisId.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        hypothesis_id: hypothesisId,
        description: description.trim().length > 0 ? description : undefined,
        scope: scope.trim().length > 0 ? scope : undefined,
      });
      setHypothesisId("");
      setDescription("");
      setScope("");
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
    <section style={{ marginTop: 16 }} id="new-mvp">
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...fieldStyle, width: 480, minHeight: 80 }}
      />
      <textarea
        placeholder="Scope"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        style={{ ...fieldStyle, width: 480, minHeight: 80 }}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={buttonStyle}>
        {submitting ? "Creating..." : "Create MVP"}
      </button>
    </section>
  );
}
