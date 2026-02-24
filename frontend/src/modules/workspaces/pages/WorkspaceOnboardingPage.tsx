import { useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";

interface WorkspaceOnboardingPageProps {
  onCreateWorkspace: (name: string) => Promise<void>;
}

export default function WorkspaceOnboardingPage({
  onCreateWorkspace,
}: WorkspaceOnboardingPageProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 1 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setError(null);
      await onCreateWorkspace(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar workspace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fb",
        padding: 24,
      }}
    >
      <section
        style={{
          width: 460,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 24,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <PageHeader
          title="Bem-vindo ao Discover OS"
          subtitle="Crie seu primeiro workspace para começar"
        />

        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Nome do workspace</label>
        <input
          type="text"
          placeholder="Ex.: Time de Produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            marginBottom: 12,
          }}
        />

        {error && <p style={{ color: "#b91c1c", marginTop: 0 }}>{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background: "#2563eb",
            border: "1px solid #1d4ed8",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {submitting ? "Criando..." : "Criar workspace"}
        </button>
      </section>
    </div>
  );
}
