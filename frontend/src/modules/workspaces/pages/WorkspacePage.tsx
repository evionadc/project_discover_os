import { useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { useWorkspace } from "../../shared/hooks/useWorkspace";

export default function WorkspacePage() {
  const current = useWorkspace();
  const [name, setName] = useState(current.name);
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setSubmitting(false);
      setEditing(false);
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

  const ghostButton: React.CSSProperties = {
    background: "transparent",
    border: "1px solid #d1d5db",
    color: "#111827",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <>
      <PageHeader title="Workspace" subtitle="Criação e edição" />

      <section style={{ marginTop: 16 }}>
        <input
          placeholder="Nome do workspace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={fieldStyle}
          disabled={!editing}
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...fieldStyle, width: 480, minHeight: 80, marginBottom: 12 }}
          disabled={!editing}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
            {submitting ? "Saving..." : "Save workspace"}
          </button>
          <button onClick={() => setEditing((prev) => !prev)} style={ghostButton}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </section>
    </>
  );
}
