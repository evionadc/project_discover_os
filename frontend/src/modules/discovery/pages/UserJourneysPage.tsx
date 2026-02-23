import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import {
  createUserJourney,
  deleteUserJourney,
  getPersonas,
  getUserJourneys,
  updateUserJourney,
} from "../services/discoveryApi";
import type { Persona, UserJourney } from "../types";

export default function UserJourneysPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [newJourneyName, setNewJourneyName] = useState("");
  const [newJourneyPersonaId, setNewJourneyPersonaId] = useState("");
  const [newStepByJourney, setNewStepByJourney] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getPersonas(), getUserJourneys()])
      .then(([personaData, journeyData]) => {
        if (!isMounted) return;
        setPersonas(personaData);
        setJourneys(journeyData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Falha ao carregar jornadas");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const personaNameById = useMemo(() => {
    const map = new Map<string, string>();
    personas.forEach((persona) => map.set(persona.id, persona.name));
    return map;
  }, [personas]);

  const handleCreateJourney = async () => {
    const name = newJourneyName.trim();
    if (!name || !newJourneyPersonaId) return;
    try {
      const created = await createUserJourney({
        name,
        persona_id: newJourneyPersonaId,
        stages: [],
      });
      setJourneys((prev) => [...prev, created]);
      setNewJourneyName("");
      setNewJourneyPersonaId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar jornada");
    }
  };

  const handleSaveJourney = async (journey: UserJourney) => {
    if (!journey.name.trim() || !journey.persona_id) return;
    setSavingId(journey.id);
    try {
      const updated = await updateUserJourney(journey.id, {
        name: journey.name.trim(),
        persona_id: journey.persona_id,
        stages: journey.stages,
      });
      setJourneys((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar jornada");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteJourney = async (journey: UserJourney) => {
    const ok = window.confirm(`Excluir jornada "${journey.name}"?`);
    if (!ok) return;
    setSavingId(journey.id);
    try {
      await deleteUserJourney(journey.id);
      setJourneys((prev) => prev.filter((item) => item.id !== journey.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir jornada");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <PageHeader title="Jornadas" subtitle="Discovery ? Jornadas do usuário" />

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <section className="card" style={{ padding: 16, maxWidth: 980, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Nova jornada</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Nome da jornada"
            value={newJourneyName}
            onChange={(e) => setNewJourneyName(e.target.value)}
            style={{ width: 260 }}
          />
          <select
            value={newJourneyPersonaId}
            onChange={(e) => setNewJourneyPersonaId(e.target.value)}
            style={{ width: 260 }}
          >
            <option value="">Selecione a persona</option>
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn--primary" onClick={handleCreateJourney}>
            Criar jornada
          </button>
        </div>
      </section>

      {loading && <p>Loading...</p>}
      {!loading && journeys.length === 0 && (
        <EmptyState
          title="Nenhuma jornada criada"
          description="Crie jornadas vinculadas às personas para mapear a experiência do usuário."
        />
      )}

      <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
        {journeys.map((journey) => {
          const personaName = personaNameById.get(journey.persona_id) ?? "Sem persona";
          return (
            <section key={journey.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={journey.name}
                  onChange={(e) =>
                    setJourneys((prev) =>
                      prev.map((item) => (item.id === journey.id ? { ...item, name: e.target.value } : item))
                    )
                  }
                  style={{ flex: 1, minWidth: 220 }}
                />
                <select
                  value={journey.persona_id}
                  onChange={(e) =>
                    setJourneys((prev) =>
                      prev.map((item) =>
                        item.id === journey.id ? { ...item, persona_id: e.target.value } : item
                      )
                    )
                  }
                  style={{ width: 220 }}
                >
                  <option value="">Selecione a persona</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => handleSaveJourney(journey)}
                  disabled={savingId === journey.id}
                >
                  {savingId === journey.id ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => handleDeleteJourney(journey)}
                  disabled={savingId === journey.id}
                >
                  Excluir
                </button>
              </div>

              <div style={{ marginBottom: 8, color: "#64748b", fontSize: 13 }}>
                Persona: <strong style={{ color: "#111827" }}>{personaName}</strong>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Adicionar etapa"
                  value={newStepByJourney[journey.id] ?? ""}
                  onChange={(e) =>
                    setNewStepByJourney((prev) => ({
                      ...prev,
                      [journey.id]: e.target.value,
                    }))
                  }
                  style={{ width: "100%" }}
                />
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    const text = (newStepByJourney[journey.id] ?? "").trim();
                    if (!text) return;
                    setJourneys((prev) =>
                      prev.map((item) =>
                        item.id === journey.id ? { ...item, stages: [...item.stages, text] } : item
                      )
                    );
                    setNewStepByJourney((prev) => ({ ...prev, [journey.id]: "" }));
                  }}
                >
                  Add step
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {journey.stages.map((stage, index) => (
                  <div
                    key={`${journey.id}-${index}-${stage}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      const to = index;
                      if (Number.isNaN(from) || from === to) return;
                      setJourneys((prev) =>
                        prev.map((item) => {
                          if (item.id !== journey.id) return item;
                          const nextStages = [...item.stages];
                          const [moved] = nextStages.splice(from, 1);
                          nextStages.splice(to, 0, moved);
                          return { ...item, stages: nextStages };
                        })
                      );
                    }}
                    style={{
                      background: index === 0 ? "#dbeafe" : index === journey.stages.length - 1 ? "#bbf7d0" : "#fff9a8",
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
                      value={stage}
                      onChange={(e) =>
                        setJourneys((prev) =>
                          prev.map((item) =>
                            item.id === journey.id
                              ? {
                                  ...item,
                                  stages: item.stages.map((s, idx) => (idx === index ? e.target.value : s)),
                                }
                              : item
                          )
                        )
                      }
                      style={{ width: "100%" }}
                    />
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() =>
                        setJourneys((prev) =>
                          prev.map((item) =>
                            item.id === journey.id
                              ? { ...item, stages: item.stages.filter((_, idx) => idx !== index) }
                              : item
                          )
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {journey.stages.length === 0 && <p style={{ marginBottom: 0 }}>Nenhuma etapa nesta jornada.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

