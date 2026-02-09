import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import FeatureForm from "../components/FeatureForm";
import FeatureTable from "../components/FeatureTable";
import { createFeature, listFeatures } from "../services/deliveryApi";
import { getHypotheses, getMvps } from "../../discovery/services/discoveryApi";
import type { Feature, FeatureCreate } from "../types";
import type { Hypothesis, Mvp } from "../../discovery/types";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [mvps, setMvps] = useState<Mvp[]>([]);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("");
  const [selectedMvpId, setSelectedMvpId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listFeatures(), getHypotheses(), getMvps()])
      .then(([featureData, hypothesisData, mvpData]) => {
        if (!isMounted) return;
        setFeatures(featureData);
        setHypotheses(hypothesisData);
        setMvps(mvpData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load features");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: FeatureCreate) => {
    const normalized = {
      ...payload,
      description: payload.description ?? undefined,
      business_value: payload.business_value ?? undefined,
    };
    const created = await createFeature(normalized);
    setFeatures((prev) => [...prev, created]);
  };

  const canShowForm = selectedHypothesisId || selectedMvpId;

  return (
    <>
      <PageHeader
        title="Features"
        subtitle="Delivery → Catálogo de funcionalidades"
      />

      <section style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
            Associe a hipótese (opcional)
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
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
            Associe o MVP (opcional)
          </label>
          <select
            value={selectedMvpId}
            onChange={(e) => setSelectedMvpId(e.target.value)}
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
            {mvps.map((mvp) => (
              <option key={mvp.id} value={mvp.id}>
                {mvp.description ?? mvp.id}
              </option>
            ))}
          </select>
        </div>
      </section>

      {canShowForm && (
        <FeatureForm
          hypothesisId={selectedHypothesisId || undefined}
          mvpId={selectedMvpId || undefined}
          onCreate={handleCreate}
        />
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && features.length === 0 && (
        <EmptyState
          title="Nenhuma feature criada"
          description="Crie features associando hipóteses e/ou MVPs."
        />
      )}
      {!loading && !error && features.length > 0 && <FeatureTable features={features} />}
    </>
  );
}
