import { useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";

export default function ProfilePage() {
  const [name, setName] = useState("PM");
  const [email, setEmail] = useState("pm@empresa.com");
  const [role, setRole] = useState("Product Manager");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
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

  return (
    <>
      <PageHeader title="Perfil" subtitle="Edite seus dados" />

      <section style={{ marginTop: 16 }}>
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={fieldStyle}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
        />
        <input
          placeholder="Cargo"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ ...fieldStyle, marginBottom: 12 }}
        />
        <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
          {submitting ? "Saving..." : "Save profile"}
        </button>
      </section>
    </>
  );
}
