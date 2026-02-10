import { useState } from "react";
import type { PersonaCreate } from "../types";

interface PersonaFormProps {
  problemId: string;
  onCreate: (payload: PersonaCreate) => Promise<void>;
}

export default function PersonaForm({ problemId, onCreate }: PersonaFormProps) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [mainPain, setMainPain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        problem_id: problemId,
        name,
        context: context.trim().length > 0 ? context : undefined,
        goal: goal.trim().length > 0 ? goal : undefined,
        main_pain: mainPain.trim().length > 0 ? mainPain : undefined,
      });
      setName("");
      setContext("");
      setGoal("");
      setMainPain("");
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
      <div
        style={{
          background: "#ffffff",
          border: "2px solid #111827",
          borderRadius: 12,
          padding: 16,
          position: "relative",
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 2,
              background: "#111827",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              background: "#111827",
              opacity: 0.85,
            }}
          />

          <div style={{ padding: 12 }}>
            <input
              placeholder="Nome da persona"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...fieldStyle, width: 240, marginBottom: 12 }}
            />
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "2px solid #111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              🙂
            </div>
          </div>

          <div style={{ padding: 12 }}>
            <strong>Perfil</strong>
            <textarea
              placeholder="Idade, contexto, profissão"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{ ...fieldStyle, width: "100%", minHeight: 110 }}
            />
          </div>

          <div style={{ padding: 12 }}>
            <strong>Comportamento</strong>
            <textarea
              placeholder="Hábitos e comportamentos"
              value={mainPain}
              onChange={(e) => setMainPain(e.target.value)}
              style={{ ...fieldStyle, width: "100%", minHeight: 110 }}
            />
          </div>

          <div style={{ padding: 12 }}>
            <strong>Necessidades</strong>
            <textarea
              placeholder="Objetivos e necessidades"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ ...fieldStyle, width: "100%", minHeight: 110 }}
            />
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={!canSubmit} style={{ ...buttonStyle, marginTop: 12 }}>
        {submitting ? "Creating..." : "Create persona"}
      </button>
    </section>
  );
}
