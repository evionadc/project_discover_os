import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import MvpForm from "../components/MvpForm";
import MvpTable from "../components/MvpTable";
import { createMvp, getHypotheses, getMvps } from "../services/discoveryApi";
import type { Hypothesis, Mvp, MvpCreate } from "../types";

export default function MvpsPage() {
  const [mvps, setMvps] = useState<Mvp[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMvps(), getHypotheses()])
      .then(([mvpData, hypothesisData]) => {
        if (!isMounted) return;
        setMvps(mvpData);
        setHypotheses(hypothesisData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load MVPs");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: MvpCreate) => {
    const normalized = {
      ...payload,
      description: payload.description ?? undefined,
      scope: payload.scope ?? undefined,
    };
    const created = await createMvp(normalized);
    setMvps((prev) => [...prev, created]);
  };

  return (
    <>
      <PageHeader
        title="MVPs"
        subtitle="Discovery → Execução do experimento"
      />

      <section style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
          Selecione a hipótese
        </label>
        <select
          value={selectedHypothesisId}
          onChange={(e) => setSelectedHypothesisId(e.target.value)}
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
          {hypotheses.map((hypothesis) => (
            <option key={hypothesis.id} value={hypothesis.id}>
              {hypothesis.statement}
            </option>
          ))}
        </select>
      </section>

      {selectedHypothesisId && (
        <MvpForm hypothesisId={selectedHypothesisId} onCreate={handleCreate} />
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && mvps.length === 0 && (
        <EmptyState
          title="Nenhum MVP criado"
          description="Crie MVPs para testar suas hipóteses."
        />
      )}
      {!loading && !error && mvps.length > 0 && <MvpTable mvps={mvps} />}
    </>
  );
}
