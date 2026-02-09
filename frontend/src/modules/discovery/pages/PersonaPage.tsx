import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import PersonaForm from "../components/PersonaForm";
import PersonaTable from "../components/PersonaTable";
import { createPersona, getPersonas, getProblems } from "../services/discoveryApi";
import type { Persona, PersonaCreate, Problem } from "../types";

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getPersonas(), getProblems()])
      .then(([personaData, problemData]) => {
        if (!isMounted) return;
        setPersonas(personaData);
        setProblems(problemData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load personas");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: PersonaCreate) => {
    const normalized = {
      ...payload,
      context: payload.context ?? undefined,
      goal: payload.goal ?? undefined,
      main_pain: payload.main_pain ?? undefined,
    };
    const created = await createPersona(normalized);
    setPersonas((prev) => [...prev, created]);
  };

  return (
    <>
      <PageHeader
        title="Personas"
        subtitle="Discovery → Entendimento dos usuários"
      />

      <section style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
          Selecione o problema
        </label>
        <select
          value={selectedProblemId}
          onChange={(e) => setSelectedProblemId(e.target.value)}
          style={{
            width: 360,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            fontSize: 14,
          }}
        >
          <option value="">Selecione...</option>
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </select>
      </section>

      {selectedProblemId && (
        <PersonaForm problemId={selectedProblemId} onCreate={handleCreate} />
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && personas.length === 0 && (
        <EmptyState
          title="Nenhuma persona criada"
          description="Crie personas para representar seus principais tipos de usuários."
        />
      )}
      {!loading && !error && personas.length > 0 && <PersonaTable personas={personas} />}
    </>
  );
}
