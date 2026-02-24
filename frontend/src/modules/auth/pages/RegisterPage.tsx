import { useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";

interface RegisterPageProps {
  onRegister: (data: { email: string; password: string }) => Promise<void>;
  onBackToLogin: () => void;
}

export default function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password.trim().length > 0 && password === confirm;
  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordsMatch &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setError(null);
      await onRegister({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar conta");
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

  const ghostButton: React.CSSProperties = {
    marginLeft: 8,
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
          width: 420,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 24,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <PageHeader title="Cadastro" subtitle="Crie sua conta" />

        <input
          placeholder="Nome completo"
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
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={fieldStyle}
        />
        <input
          placeholder="Confirmar senha"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ ...fieldStyle, marginBottom: 12 }}
        />
        {!passwordsMatch && confirm.trim().length > 0 && (
          <p style={{ color: "#b45309", marginTop: 0 }}>
            As senhas não coincidem.
          </p>
        )}
        {error && <p style={{ color: "#b91c1c", marginTop: 0 }}>{error}</p>}
        <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
          {submitting ? "Criando conta..." : "Criar conta"}
        </button>
        <button onClick={onBackToLogin} style={ghostButton}>
          Voltar para login
        </button>
      </section>
    </div>
  );
}

