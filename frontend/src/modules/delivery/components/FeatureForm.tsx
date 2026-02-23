import { useEffect, useMemo, useState } from "react";
import type { Feature } from "../types";
import type { Persona, UserJourney } from "../../discovery/types";

interface FeatureFormProps {
  productId: number;
  personas: Persona[];
  journeys: UserJourney[];
  initialValues?: Feature | null;
  submitLabel?: string;
  onSubmit: (payload: {
    product_id: number;
    persona_id?: string;
    journey_id?: string;
    title: string;
    description?: string;
    complexity: "low" | "medium" | "high";
    business_estimate?: number;
    effort_estimate?: number;
    ux_estimate?: number;
    status?: "todo" | "doing" | "done";
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function FeatureForm({
  productId,
  personas,
  journeys,
  initialValues,
  submitLabel = "Salvar feature",
  onSubmit,
  onCancel,
}: FeatureFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [businessEstimate, setBusinessEstimate] = useState<number | "">("");
  const [effortEstimate, setEffortEstimate] = useState<number | "">("");
  const [uxEstimate, setUxEstimate] = useState<number | "">("");
  const [personaId, setPersonaId] = useState("");
  const [journeyId, setJourneyId] = useState("");
  const [status, setStatus] = useState<"todo" | "doing" | "done">("todo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setComplexity(initialValues?.complexity ?? "medium");
    setBusinessEstimate(initialValues?.business_estimate ?? "");
    setEffortEstimate(initialValues?.effort_estimate ?? "");
    setUxEstimate(initialValues?.ux_estimate ?? "");
    setPersonaId(initialValues?.persona_id ?? "");
    setJourneyId(initialValues?.journey_id ?? "");
    setStatus((initialValues?.status as "todo" | "doing" | "done" | undefined) ?? "todo");
  }, [initialValues]);

  const filteredJourneys = useMemo(() => {
    if (!personaId) return journeys;
    return journeys.filter((journey) => journey.persona_id === personaId);
  }, [journeys, personaId]);

  const canSubmit = title.trim().length > 0 && !submitting;

  const fieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    fontSize: 14,
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        product_id: productId,
        persona_id: personaId || undefined,
        journey_id: journeyId || undefined,
        title,
        description: description.trim().length > 0 ? description : undefined,
        complexity,
        business_estimate: businessEstimate === "" ? undefined : businessEstimate,
        effort_estimate: effortEstimate === "" ? undefined : effortEstimate,
        ux_estimate: uxEstimate === "" ? undefined : uxEstimate,
        status,
      });
      if (!initialValues) {
        setTitle("");
        setDescription("");
        setComplexity("medium");
        setBusinessEstimate("");
        setEffortEstimate("");
        setUxEstimate("");
        setPersonaId("");
        setJourneyId("");
        setStatus("todo");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card" style={{ marginTop: 16, padding: 16 }} id="feature-form">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Nome da feature</label>
          <input placeholder="Nome" value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Complexidade</label>
          <select value={complexity} onChange={(e) => setComplexity(e.target.value as "low" | "medium" | "high")} style={fieldStyle}>
            <option value="high">Alta (vermelho)</option>
            <option value="medium">Media (amarelo)</option>
            <option value="low">Baixa (verde)</option>
          </select>
        </div>
      </div>

      <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Descricao</label>
      <textarea
        placeholder="Descricao"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...fieldStyle, minHeight: 80 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Negocio (1-3)</label>
          <select value={businessEstimate} onChange={(e) => setBusinessEstimate(e.target.value ? Number(e.target.value) : "")} style={fieldStyle}>
            <option value="">Selecione...</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Esforco (1-3)</label>
          <select value={effortEstimate} onChange={(e) => setEffortEstimate(e.target.value ? Number(e.target.value) : "")} style={fieldStyle}>
            <option value="">Selecione...</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>UX (1-3)</label>
          <select value={uxEstimate} onChange={(e) => setUxEstimate(e.target.value ? Number(e.target.value) : "")} style={fieldStyle}>
            <option value="">Selecione...</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Persona</label>
          <select value={personaId} onChange={(e) => setPersonaId(e.target.value)} style={fieldStyle}>
            <option value="">Selecione...</option>
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Jornada</label>
          <select value={journeyId} onChange={(e) => setJourneyId(e.target.value)} style={fieldStyle}>
            <option value="">Selecione...</option>
            {filteredJourneys.map((journey) => (
              <option key={journey.id} value={journey.id}>
                {journey.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "todo" | "doing" | "done")} style={fieldStyle}>
            <option value="todo">A fazer</option>
            <option value="doing">Fazendo</option>
            <option value="done">Pronta</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={handleSubmit} disabled={!canSubmit} className="btn btn--primary">
          {submitting ? "Salvando..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </section>
  );
}
