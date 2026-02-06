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

  return (
    <section style={{ marginTop: 16 }}>
      <input
        placeholder="Problem title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 320 }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 320 }}
      />
      <button onClick={handleSubmit} disabled={!canSubmit}>
        {submitting ? "Creating..." : "Create problem"}
      </button>
    </section>
  );
}
