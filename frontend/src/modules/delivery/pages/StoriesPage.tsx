import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import StoryForm from "../components/StoryForm";
import { createStory, deleteStory, listStories, listFeatures, updateStory } from "../services/deliveryApi";
import type { Feature, Story, StoryCreate } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import StoryCardGrid from "../components/StoryCardGrid";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [associateProduct, setAssociateProduct] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null);
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
      feature_id: payload.feature_id ?? undefined,
      workspace_id: payload.workspace_id ?? undefined,
      description: payload.description ?? undefined,
      acceptance_criteria: payload.acceptance_criteria ?? undefined,
      estimate: payload.estimate ?? undefined,
    };
    const created = await createStory(normalized);
    setStories((prev) => [...prev, created]);
  };

  const handleUpdate = async (
    storyId: string,
    payload: {
      feature_id?: string | null;
      workspace_id?: number | null;
      title?: string;
      description?: string;
      acceptance_criteria?: string;
      estimate?: number;
      status?: string;
    }
  ) => {
    const updated = await updateStory(storyId, payload);
    setStories((prev) => prev.map((story) => (story.id === updated.id ? updated : story)));
    setEditingStory(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteStory(deleteTarget.id);
    setStories((prev) => prev.filter((story) => story.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const canShowForm = selectedFeatureId || associateProduct;

  return (
    <>
      <PageHeader title="Stories" subtitle="Delivery -> Catalogo de historias" />

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
      {!loading && !error && stories.length > 0 && (
        <StoryCardGrid
          stories={stories}
          features={features}
          onEdit={setEditingStory}
          onDelete={setDeleteTarget}
        />
      )}

      {editingStory && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}
          onClick={() => setEditingStory(null)}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 720, maxHeight: "88vh", overflow: "auto", padding: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Editar story</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Nome</label>
                <input
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Status</label>
                <select
                  value={editingStory.status ?? "todo"}
                  onChange={(e) => setEditingStory({ ...editingStory, status: e.target.value })}
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
                value={editingStory.description ?? ""}
                onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                style={{ width: "100%", minHeight: 80, padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Critérios de aceite</label>
              <textarea
                value={editingStory.acceptance_criteria ?? ""}
                onChange={(e) => setEditingStory({ ...editingStory, acceptance_criteria: e.target.value })}
                style={{ width: "100%", minHeight: 80, padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Estimativa</label>
                <input
                  type="number"
                  min={0}
                  value={editingStory.estimate ?? ""}
                  onChange={(e) => setEditingStory({ ...editingStory, estimate: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#475569" }}>Feature</label>
                <select
                  value={editingStory.feature_id ?? ""}
                  onChange={(e) => setEditingStory({ ...editingStory, feature_id: e.target.value || null })}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                >
                  <option value="">Sem vinculo</option>
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.id}>{feature.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" type="button" onClick={() => setEditingStory(null)}>Cancelar</button>
              <button
                className="btn btn--primary"
                type="button"
                onClick={() =>
                  handleUpdate(editingStory.id, {
                    title: editingStory.title,
                    description: editingStory.description ?? undefined,
                    acceptance_criteria: editingStory.acceptance_criteria ?? undefined,
                    estimate: editingStory.estimate ?? undefined,
                    status: editingStory.status ?? undefined,
                    feature_id: editingStory.feature_id ?? undefined,
                  })
                }
                disabled={!editingStory.title.trim()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Excluir story</h3>
            <p style={{ margin: 0 }}>Tem certeza que deseja excluir "{deleteTarget.title}"?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
