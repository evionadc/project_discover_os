import { useState } from "react";
import type { FeatureCreate } from "../types";

interface FeatureFormProps {
  hypothesisId?: string;
  mvpId?: string;
  onCreate: (payload: FeatureCreate) => Promise<void>;
}

export default function FeatureForm({ hypothesisId, mvpId, onCreate }: FeatureFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [businessValue, setBusinessValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length > 0 && (!!hypothesisId || !!mvpId) && !submitting;

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

  const primaryButton: React.CSSProperties = {
    background: "#2563eb",
    border: "1px solid #1d4ed8",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        hypothesis_id: hypothesisId ?? undefined,
        mvp_id: mvpId ?? undefined,
        title,
        description: description.trim().length > 0 ? description : undefined,
        business_value: businessValue.trim().length > 0 ? businessValue : undefined,
      });
      setTitle("");
      setDescription("");
      setBusinessValue("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }} id="new-feature">
      <input
        placeholder="Feature title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={fieldStyle}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...fieldStyle, width: 480, minHeight: 80 }}
      />
      <input
        placeholder="Business value"
        value={businessValue}
        onChange={(e) => setBusinessValue(e.target.value)}
        style={fieldStyle}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
        {submitting ? "Creating..." : "Create feature"}
      </button>
    </section>
  );
}
