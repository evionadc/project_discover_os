import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import HypothesisForm from "../components/HypothesisForm";
import HypothesisTable from "../components/HypothesisTable";
import { createHypothesis, getHypotheses, getProblems } from "../services/discoveryApi";
import type { Hypothesis, HypothesisCreate, Problem } from "../types";

export default function HypothesesPage() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getHypotheses(), getProblems()])
      .then(([hypothesisData, problemData]) => {
        if (!isMounted) return;
        setHypotheses(hypothesisData);
        setProblems(problemData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load hypotheses");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: HypothesisCreate) => {
    const normalized = {
      ...payload,
      metric: payload.metric ?? undefined,
      success_criteria: payload.success_criteria ?? undefined,
    };
    const created = await createHypothesis(normalized);
    setHypotheses((prev) => [...prev, created]);
  };

  return (
    <>
      <PageHeader
        title="Hipóteses"
        subtitle="Discovery → Validação das suposições"
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
        <HypothesisForm problemId={selectedProblemId} onCreate={handleCreate} />
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && hypotheses.length === 0 && (
        <EmptyState
          title="Nenhuma hipótese criada"
          description="Crie hipóteses para validar seus problemas."
        />
      )}
      {!loading && !error && hypotheses.length > 0 && <HypothesisTable hypotheses={hypotheses} />}
    </>
  );
}
