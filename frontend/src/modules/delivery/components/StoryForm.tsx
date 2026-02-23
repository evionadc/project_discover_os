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
  const [status, setStatus] = useState<"todo" | "doing" | "done">("todo");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length > 0 && (!!featureId || !!workspaceId) && !submitting;

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
        status,
      });
      setTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setEstimate("");
      setStatus("todo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card" style={{ marginTop: 16, padding: 16 }} id="new-story">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Story title</label>
          <input
            placeholder="Story title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "todo" | "doing" | "done")}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
          >
            <option value="todo">A fazer</option>
            <option value="doing">Fazendo</option>
            <option value="done">Pronta</option>
          </select>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569", marginTop: 8 }}>Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", minHeight: 90, padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
      />

      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569", marginTop: 8 }}>Acceptance criteria</label>
      <textarea
        placeholder="Acceptance criteria"
        value={acceptanceCriteria}
        onChange={(e) => setAcceptanceCriteria(e.target.value)}
        style={{ width: "100%", minHeight: 90, padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 8 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Estimate</label>
          <input
            placeholder="Estimate"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleSubmit} disabled={!canSubmit} className="btn btn--primary">
          {submitting ? "Creating..." : "Create story"}
        </button>
      </div>
    </section>
  );
}
