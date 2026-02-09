import { useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";

interface LoginPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      onLogin();
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
        <PageHeader title="Login" subtitle="Acesse sua conta" />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...fieldStyle, marginBottom: 12 }}
        />
        <button onClick={handleSubmit} disabled={!canSubmit} style={primaryButton}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <button onClick={onRegister} style={ghostButton}>
          Create account
        </button>
      </section>
    </div>
  );
}
