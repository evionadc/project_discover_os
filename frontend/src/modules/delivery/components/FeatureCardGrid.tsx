import { useMemo, useState } from "react";
import type { Feature } from "../types";
import type { Persona, UserJourney } from "../../discovery/types";

interface FeatureCardGridProps {
  features: Feature[];
  personas: Persona[];
  journeys: UserJourney[];
  onSave: (
    featureId: string,
    payload: {
      persona_id?: string;
      journey_id?: string;
      title?: string;
      description?: string;
      complexity?: "low" | "medium" | "high";
      business_estimate?: number;
      effort_estimate?: number;
      ux_estimate?: number;
      status?: "todo" | "doing" | "done";
    }
  ) => Promise<void>;
  onDelete: (feature: Feature) => void;
}

const complexityStyle: Record<"low" | "medium" | "high", { bg: string; label: string; border: string }> = {
  low: { bg: "#dcfce7", label: "Baixa", border: "#16a34a" },
  medium: { bg: "#fef3c7", label: "Media", border: "#ca8a04" },
  high: { bg: "#fee2e2", label: "Alta", border: "#dc2626" },
};

const statusLabel: Record<string, string> = {
  todo: "A fazer",
  doing: "Fazendo",
  done: "Pronta",
};

type Draft = {
  title: string;
  description: string;
  complexity: "low" | "medium" | "high";
  business_estimate: number | "";
  effort_estimate: number | "";
  ux_estimate: number | "";
  persona_id: string;
  journey_id: string;
  status: "todo" | "doing" | "done";
};

export default function FeatureCardGrid({ features, personas, journeys, onSave, onDelete }: FeatureCardGridProps) {
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const personaMap = useMemo(() => new Map(personas.map((persona) => [persona.id, persona.name])), [personas]);
  const journeyMap = useMemo(() => new Map(journeys.map((journey) => [journey.id, journey.name])), [journeys]);

  const startEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setDraft({
      title: feature.title,
      description: feature.description ?? "",
      complexity: feature.complexity ?? "medium",
      business_estimate: feature.business_estimate ?? "",
      effort_estimate: feature.effort_estimate ?? "",
      ux_estimate: feature.ux_estimate ?? "",
      persona_id: feature.persona_id ?? "",
      journey_id: feature.journey_id ?? "",
      status: (feature.status as "todo" | "doing" | "done" | undefined) ?? "todo",
    });
  };

  const closeModal = () => {
    if (saving) return;
    setEditingFeature(null);
    setDraft(null);
  };

  const saveModal = async () => {
    if (!editingFeature || !draft || !draft.title.trim()) return;
    setSaving(true);
    try {
      await onSave(editingFeature.id, {
        title: draft.title,
        description: draft.description.trim() ? draft.description : undefined,
        complexity: draft.complexity,
        business_estimate: draft.business_estimate === "" ? undefined : draft.business_estimate,
        effort_estimate: draft.effort_estimate === "" ? undefined : draft.effort_estimate,
        ux_estimate: draft.ux_estimate === "" ? undefined : draft.ux_estimate,
        persona_id: draft.persona_id || undefined,
        journey_id: draft.journey_id || undefined,
        status: draft.status,
      });
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const filteredJourneys = draft?.persona_id
    ? journeys.filter((journey) => journey.persona_id === draft.persona_id)
    : journeys;

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {features.map((feature) => {
          const complexity = feature.complexity ?? "medium";
          const tone = complexityStyle[complexity];

          return (
            <article
              key={feature.id}
              className="card"
              onDoubleClick={() => startEdit(feature)}
              style={{
                padding: 14,
                borderLeft: `5px solid ${tone.border}`,
                background: tone.bg,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>{feature.title}</h3>
                <span className="badge badge--default">{statusLabel[feature.status ?? "todo"] ?? "A fazer"}</span>
              </div>

              {feature.description && <p style={{ margin: "8px 0 0", color: "#334155", minHeight: 42 }}>{feature.description}</p>}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                <div className="card" style={{ padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Negocio</div>
                  <div style={{ fontWeight: 700 }}>{feature.business_estimate ?? "-"}</div>
                </div>
                <div className="card" style={{ padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Esforco</div>
                  <div style={{ fontWeight: 700 }}>{feature.effort_estimate ?? "-"}</div>
                </div>
                <div className="card" style={{ padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>UX</div>
                  <div style={{ fontWeight: 700 }}>{feature.ux_estimate ?? "-"}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 13, color: "#334155" }}>
                <div><strong>Complexidade:</strong> {tone.label}</div>
                <div><strong>Persona:</strong> {feature.persona_id ? personaMap.get(feature.persona_id) ?? "-" : "-"}</div>
                <div><strong>Jornada:</strong> {feature.journey_id ? journeyMap.get(feature.journey_id) ?? "-" : "-"}</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn--secondary" onClick={() => startEdit(feature)}>
                  Editar
                </button>
                <button type="button" className="btn btn--danger" onClick={() => onDelete(feature)}>
                  Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {editingFeature && draft && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={closeModal}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 860, padding: 18, maxHeight: "88vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Editar feature</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Nome</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as "todo" | "doing" | "done" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="todo">A fazer</option>
                  <option value="doing">Fazendo</option>
                  <option value="done">Pronta</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Descricao</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                style={{ width: "100%", minHeight: 84, padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Complexidade</label>
                <select
                  value={draft.complexity}
                  onChange={(e) => setDraft({ ...draft, complexity: e.target.value as "low" | "medium" | "high" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Negocio</label>
                <select
                  value={draft.business_estimate}
                  onChange={(e) => setDraft({ ...draft, business_estimate: e.target.value ? Number(e.target.value) : "" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">-</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Esforco</label>
                <select
                  value={draft.effort_estimate}
                  onChange={(e) => setDraft({ ...draft, effort_estimate: e.target.value ? Number(e.target.value) : "" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">-</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>UX</label>
                <select
                  value={draft.ux_estimate}
                  onChange={(e) => setDraft({ ...draft, ux_estimate: e.target.value ? Number(e.target.value) : "" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">-</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Persona</label>
                <select
                  value={draft.persona_id}
                  onChange={(e) => setDraft({ ...draft, persona_id: e.target.value, journey_id: "" })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">Selecione...</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>{persona.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Jornada</label>
                <select
                  value={draft.journey_id}
                  onChange={(e) => setDraft({ ...draft, journey_id: e.target.value })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">Selecione...</option>
                  {filteredJourneys.map((journey) => (
                    <option key={journey.id} value={journey.id}>{journey.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" type="button" onClick={closeModal} disabled={saving}>Cancelar</button>
              <button className="btn btn--primary" type="button" onClick={saveModal} disabled={saving || !draft.title.trim()}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
