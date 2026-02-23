import { useState } from "react";
import type { ProblemCreate } from "../types";

interface ProblemFormProps {
  workspaceId: number;
  onCreate: (payload: ProblemCreate) => Promise<void>;
}

export default function ProblemForm({ workspaceId, onCreate }: ProblemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({ workspace_id: workspaceId, title, description });
      setTitle("");
      setDescription("");
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
    <section style={{ marginTop: 16 }} id="new-problem">
      <input
        placeholder="Problem title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={fieldStyle}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...fieldStyle, width: 420, minHeight: 80 }}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={buttonStyle}>
        {submitting ? "Creating..." : "Create problem"}
      </button>
    </section>
  );
}
