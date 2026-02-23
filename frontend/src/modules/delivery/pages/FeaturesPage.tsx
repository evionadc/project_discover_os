import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import { getPersonas, getUserJourneys } from "../../discovery/services/discoveryApi";
import type { Persona, UserJourney } from "../../discovery/types";
import { listInceptions } from "../../inceptions/services/inceptionApi";
import type { Inception } from "../../inceptions/types";
import FeatureForm from "../components/FeatureForm";
import FeatureCardGrid from "../components/FeatureCardGrid";
import {
  createFeature,
  deleteFeature,
  importFeaturesFromInception,
  listFeatures,
  updateFeature,
} from "../services/deliveryApi";
import type { Feature } from "../types";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [inceptions, setInceptions] = useState<Inception[]>([]);
  const [selectedInceptionId, setSelectedInceptionId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{ id: number | null; name: string }>(() => {
    if (typeof window === "undefined") return { id: null, name: "" };
    try {
      const raw = window.localStorage.getItem("selectedProduct");
      if (!raw) return { id: null, name: "" };
      const parsed = JSON.parse(raw) as { id: number | null; name: string };
      return { id: parsed.id ?? null, name: parsed.name ?? "" };
    } catch {
      return { id: null, name: "" };
    }
  });
  const [deleteTarget, setDeleteTarget] = useState<Feature | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (productId: number) => {
      const [featureData, personaData, journeyData, inceptionData] = await Promise.all([
        listFeatures(productId),
        getPersonas(),
        getUserJourneys(),
        listInceptions("lean_inception", true),
      ]);
      setFeatures(featureData);
      setPersonas(personaData);
      setJourneys(journeyData);
      const sorted = (inceptionData as Inception[]).sort((a, b) => a.title.localeCompare(b.title));
      setInceptions(sorted);
      if (sorted.length > 0 && !selectedInceptionId) {
        setSelectedInceptionId(sorted[0].id);
      }
    },
    [selectedInceptionId]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: number; name: string }>;
      if (!customEvent.detail) return;
      setSelectedProduct({ id: customEvent.detail.id, name: customEvent.detail.name });
    };
    window.addEventListener("product:selected", handler as EventListener);
    return () => window.removeEventListener("product:selected", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!selectedProduct.id) {
      setFeatures([]);
      setPersonas([]);
      setJourneys([]);
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    loadData(selectedProduct.id)
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load features");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProduct.id, loadData]);

  const handleCreate = async (payload: {
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
  }) => {
    const created = await createFeature(payload);
    setFeatures((prev) => [...prev, created]);
  };

  const handleUpdate = async (
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
  ) => {
    const updated = await updateFeature(featureId, {
      persona_id: payload.persona_id,
      journey_id: payload.journey_id,
      title: payload.title,
      description: payload.description,
      complexity: payload.complexity,
      business_estimate: payload.business_estimate,
      effort_estimate: payload.effort_estimate,
      ux_estimate: payload.ux_estimate,
      status: payload.status,
    });
    setFeatures((prev) => prev.map((feature) => (feature.id === updated.id ? updated : feature)));
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeature(deleteTarget.id);
      setFeatures((prev) => prev.filter((feature) => feature.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao excluir feature";
      setSyncMessage(message);
    }
  };

  const handleImportFromLeanInception = async () => {
    if (!selectedProduct.id) return;
    if (!selectedInceptionId) {
      setSyncMessage("Selecione uma Lean Inception para importar.");
      return;
    }
    setSyncMessage(null);
    setSyncing(true);
    try {
      const result = await importFeaturesFromInception({
        product_id: selectedProduct.id,
        inception_id: selectedInceptionId,
        overwrite_existing: false,
      });
      await loadData(selectedProduct.id);
      setSyncMessage(`Importadas: ${result.imported_count}. Ignoradas: ${result.skipped_count}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao importar features";
      setSyncMessage(message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageHeader title="Features" subtitle="Delivery -> Catalogo de funcionalidades" />

      {!selectedProduct.id ? (
        <EmptyState
          title="Nenhum produto selecionado"
          description="Selecione um produto para gerenciar as features."
        />
      ) : (
        <>
          <section className="card" style={{ padding: 14, display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <select
              value={selectedInceptionId}
              onChange={(e) => setSelectedInceptionId(e.target.value)}
              style={{
                width: 340,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontSize: 14,
              }}
            >
              <option value="">Selecione a Lean Inception...</option>
              {inceptions.map((inception) => (
                <option key={inception.id} value={inception.id}>
                  {inception.title} ({inception.status ?? "active"})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleImportFromLeanInception}
              disabled={syncing || !selectedInceptionId}
            >
              {syncing ? "Importando..." : "Criar a partir da Lean Inception"}
            </button>
            {syncMessage && <span style={{ color: "#334155", fontSize: 13 }}>{syncMessage}</span>}
          </section>

          <FeatureForm
            productId={selectedProduct.id}
            personas={personas}
            journeys={journeys}
            submitLabel="Criar feature"
            onSubmit={handleCreate}
          />
        </>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && selectedProduct.id && features.length === 0 && (
        <EmptyState title="Nenhuma feature criada" description="Crie features para o seu produto." />
      )}
      {!loading && !error && features.length > 0 && (
        <FeatureCardGrid
          features={features}
          personas={personas}
          journeys={journeys}
          onSave={handleUpdate}
          onDelete={setDeleteTarget}
        />
      )}

      {deleteTarget && (
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
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Excluir feature</h3>
            <p style={{ margin: 0 }}>Tem certeza que deseja excluir "{deleteTarget.title}"?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={handleDeleteConfirmed}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
