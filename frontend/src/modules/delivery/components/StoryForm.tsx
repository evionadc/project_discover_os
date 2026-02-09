import { useState } from "react";
import type { StoryCreate } from "../types";

interface StoryFormProps {
  featureId?: string;
  workspaceId?: number;
  onCreate: (payload: StoryCreate) => Promise<void>;
}

export default function StoryForm({ featureId, workspaceId, onCreate }: StoryFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [estimate, setEstimate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length > 0 && (!!featureId || !!workspaceId) && !submitting;

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
      const parsedEstimate = Number.parseInt(estimate, 10);
      await onCreate({
        feature_id: featureId ?? undefined,
        workspace_id: workspaceId ?? undefined,
        title,
        description: description.trim().length > 0 ? description : undefined,
        acceptance_criteria: acceptanceCriteria.trim().length > 0 ? acceptanceCriteria : undefined,
        estimate: Number.isNaN(parsedEstimate) ? undefined : parsedEstimate,
      });
      setTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setEstimate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }} id="new-story">
      <input
        placeholder="Story title"
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
      <textarea
        placeholder="Acceptance criteria"
        value={acceptanceCriteria}
        onChange={(e) => setAcceptanceCriteria(e.target.value)}
        style={{ ...fieldStyle, width: 480, minHeight: 80 }}
      />
      <input
        placeholder="Estimate"
        value={estimate}
        onChange={(e) => setEstimate(e.target.value)}
        style={fieldStyle}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
        {submitting ? "Creating..." : "Create story"}
      </button>
    </section>
  );
}
