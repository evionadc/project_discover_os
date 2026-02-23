import type { CSSProperties } from "react";
import type { Persona } from "../../discovery/types";

interface JourneyStep {
  id: string;
  text: string;
}

interface JourneyItem {
  id: string;
  name: string;
  personaId: string;
  steps: JourneyStep[];
}

interface JourneySectionProps {
  formFieldStyle: CSSProperties;
  secondaryButton: CSSProperties;
  personas: Persona[];
  journeys: JourneyItem[];
  setJourneys: (journeys: JourneyItem[] | ((prev: JourneyItem[]) => JourneyItem[])) => void;
  newJourneyName: string;
  setNewJourneyName: (value: string) => void;
  newJourneyPersonaId: string;
  setNewJourneyPersonaId: (value: string) => void;
  newStepByJourney: Record<string, string>;
  setNewStepByJourney: (value: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
}

export default function JourneySection({
  formFieldStyle,
  secondaryButton,
  personas,
  journeys,
  setJourneys,
  newJourneyName,
  setNewJourneyName,
  newJourneyPersonaId,
  setNewJourneyPersonaId,
  newStepByJourney,
  setNewStepByJourney,
}: JourneySectionProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        maxWidth: 980,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          placeholder="Nome da jornada"
          value={newJourneyName}
          onChange={(e) => setNewJourneyName(e.target.value)}
          style={{ ...formFieldStyle, width: 280, marginBottom: 0 }}
        />
        <select
          value={newJourneyPersonaId}
          onChange={(e) => setNewJourneyPersonaId(e.target.value)}
          style={{ ...formFieldStyle, width: 260, marginBottom: 0 }}
        >
          <option value="">Selecione a persona</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const name = newJourneyName.trim();
            if (!name || !newJourneyPersonaId) return;
            setJourneys((prev) => [
              ...prev,
              {
                id: `journey-${Date.now()}`,
                name,
                personaId: newJourneyPersonaId,
                steps: [],
              },
            ]);
            setNewJourneyName("");
            setNewJourneyPersonaId("");
          }}
          style={secondaryButton}
        >
          Add jornada
        </button>
        <button onClick={() => setJourneys([])} style={secondaryButton}>
          Clear
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        {journeys.map((journey) => {
          const personaName = personas.find((item) => item.id === journey.personaId)?.name ?? "Sem persona";
          return (
            <div
              key={journey.id}
              style={{
                background: "#ffffff",
                border: "1px solid #111827",
                borderRadius: 8,
                padding: 12,
                boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  value={journey.name}
                  onChange={(e) =>
                    setJourneys((prev) =>
                      prev.map((item) => (item.id === journey.id ? { ...item, name: e.target.value } : item))
                    )
                  }
                  style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                />
                <select
                  value={journey.personaId}
                  onChange={(e) =>
                    setJourneys((prev) =>
                      prev.map((item) => (item.id === journey.id ? { ...item, personaId: e.target.value } : item))
                    )
                  }
                  style={{ ...formFieldStyle, width: 220, marginBottom: 0 }}
                >
                  <option value="">Selecione a persona</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name}
                    </option>
                  ))}
                </select>
                <button className="btn btn--danger" onClick={() => setJourneys((prev) => prev.filter((item) => item.id !== journey.id))}>
                  Remover
                </button>
              </div>

              <div style={{ marginBottom: 8, color: "#64748b", fontSize: 13 }}>
                Persona: <strong style={{ color: "#111827" }}>{personaName}</strong>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Adicionar etapa da jornada"
                  value={newStepByJourney[journey.id] ?? ""}
                  onChange={(e) =>
                    setNewStepByJourney((prev) => ({
                      ...prev,
                      [journey.id]: e.target.value,
                    }))
                  }
                  style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                />
                <button
                  style={secondaryButton}
                  onClick={() => {
                    const text = (newStepByJourney[journey.id] ?? "").trim();
                    if (!text) return;
                    setJourneys((prev) =>
                      prev.map((item) =>
                        item.id === journey.id
                          ? { ...item, steps: [...item.steps, { id: `step-${Date.now()}`, text }] }
                          : item
                      )
                    );
                    setNewStepByJourney((prev) => ({ ...prev, [journey.id]: "" }));
                  }}
                >
                  Add step
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {journey.steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", step.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData("text/plain");
                      if (!draggedId || draggedId === step.id) return;
                      setJourneys((prev) =>
                        prev.map((item) => {
                          if (item.id !== journey.id) return item;
                          const fromIndex = item.steps.findIndex((s) => s.id === draggedId);
                          const toIndex = item.steps.findIndex((s) => s.id === step.id);
                          if (fromIndex === -1 || toIndex === -1) return item;
                          const nextSteps = [...item.steps];
                          const [moved] = nextSteps.splice(fromIndex, 1);
                          nextSteps.splice(toIndex, 0, moved);
                          return { ...item, steps: nextSteps };
                        })
                      );
                    }}
                    style={{
                      background: index === 0 ? "#dbeafe" : index === journey.steps.length - 1 ? "#bbf7d0" : "#fff9a8",
                      border: "1px solid #111827",
                      borderRadius: 8,
                      padding: 10,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{index + 1}.</span>
                    <input
                      value={step.text}
                      onChange={(e) =>
                        setJourneys((prev) =>
                          prev.map((item) =>
                            item.id === journey.id
                              ? {
                                  ...item,
                                  steps: item.steps.map((s) => (s.id === step.id ? { ...s, text: e.target.value } : s)),
                                }
                              : item
                          )
                        )
                      }
                      style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                    />
                    <button
                      className="btn btn--danger"
                      onClick={() =>
                        setJourneys((prev) =>
                          prev.map((item) =>
                            item.id === journey.id ? { ...item, steps: item.steps.filter((s) => s.id !== step.id) } : item
                          )
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {journey.steps.length === 0 && <p style={{ marginBottom: 0 }}>Nenhuma etapa nesta jornada.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>Arraste os steps para reordenar dentro da mesma jornada.</div>

      {journeys.length === 0 && (
        <p style={{ marginTop: 12, marginBottom: 0, color: "#6b7280" }}>
          Crie uma ou mais jornadas e vincule cada uma a uma persona.
        </p>
      )}
    </div>
  );
}
