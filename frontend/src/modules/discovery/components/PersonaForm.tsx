import { useState } from "react";
import type { PersonaCreate } from "../types";

interface PersonaFormProps {
  problemId: string;
  onCreate: (payload: PersonaCreate) => Promise<void>;
}

export default function PersonaForm({ problemId, onCreate }: PersonaFormProps) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({ problem_id: problemId, name, context });
      setName("");
      setContext("");
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
    <section style={{ marginTop: 16 }} id="new-persona">
      <input
        placeholder="Persona name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={fieldStyle}
      />
      <textarea
        placeholder="Context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        style={{ ...fieldStyle, width: 420, minHeight: 80 }}
      />
      <button onClick={handleSubmit} disabled={!canSubmit} style={buttonStyle}>
        {submitting ? "Creating..." : "Create persona"}
      </button>
    </section>
  );
}
