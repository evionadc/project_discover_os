import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import StoryForm from "../components/StoryForm";
import StoryTable from "../components/StoryTable";
import { createStory, listStories, listFeatures } from "../services/deliveryApi";
import type { Feature, Story, StoryCreate } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [associateProduct, setAssociateProduct] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workspace = useWorkspace();

  useEffect(() => {
    let isMounted = true;
    Promise.all([listStories(), listFeatures()])
      .then(([storyData, featureData]) => {
        if (!isMounted) return;
        setStories(storyData);
        setFeatures(featureData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load stories");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: StoryCreate) => {
    const normalized = {
      ...payload,
      description: payload.description ?? undefined,
      acceptance_criteria: payload.acceptance_criteria ?? undefined,
      estimate: payload.estimate ?? undefined,
    };
    const created = await createStory(normalized);
    setStories((prev) => [...prev, created]);
  };

  const canShowForm = selectedFeatureId || associateProduct;

  return (
    <>
      <PageHeader
        title="Stories"
        subtitle="Delivery → Catálogo de histórias"
      />

      <section style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
            Associe a feature (opcional)
          </label>
          <select
            value={selectedFeatureId}
            onChange={(e) => setSelectedFeatureId(e.target.value)}
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
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.title}
              </option>
            ))}
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
          <input
            type="checkbox"
            checked={associateProduct}
            onChange={(e) => setAssociateProduct(e.target.checked)}
          />
          Associar ao produto atual ({workspace.name})
        </label>
      </section>

      {canShowForm && (
        <StoryForm
          featureId={selectedFeatureId || undefined}
          workspaceId={associateProduct ? workspace.id : undefined}
          onCreate={handleCreate}
        />
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && stories.length === 0 && (
        <EmptyState
          title="Nenhuma story criada"
          description="Crie stories associadas a features e/ou produto."
        />
      )}
      {!loading && !error && stories.length > 0 && <StoryTable stories={stories} />}
    </>
  );
}
