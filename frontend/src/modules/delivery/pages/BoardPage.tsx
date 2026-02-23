import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import { listFeatures, listStories, updateStory } from "../services/deliveryApi";
import type { Feature, Story } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";

const columns = [
  { key: "todo", title: "A fazer", color: "#e2e8f0" },
  { key: "doing", title: "Fazendo", color: "#fde68a" },
  { key: "done", title: "Pronta", color: "#bbf7d0" },
] as const;

const laneTone: Record<string, { border: string; bg: string }> = {
  low: { border: "#16a34a", bg: "linear-gradient(180deg, #ecfdf3 0%, #dcfce7 100%)" },
  medium: { border: "#f59e0b", bg: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)" },
  high: { border: "#dc2626", bg: "linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)" },
};

export default function BoardPage() {
  const workspace = useWorkspace();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([listFeatures(), listStories()])
      .then(([fData, sData]) => {
        if (!mounted) return;
        setFeatures(fData);
        setStories(sData);
      })
      .catch((err: Error) => setError(err.message ?? "Failed to load board"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [workspace.id]);

  const featureLanes = useMemo(() => {
    const map = new Map<string, { feature: Feature; stories: Story[] }>();
    features.forEach((f) => map.set(f.id, { feature: f, stories: [] }));
    stories.forEach((s) => {
      const lane = s.feature_id ? map.get(s.feature_id) : undefined;
      if (lane) lane.stories.push(s);
    });
    return Array.from(map.values());
  }, [features, stories]);

  const handleDrop = async (storyId: string, status: "todo" | "doing" | "done") => {
    const story = stories.find((s) => s.id === storyId);
    if (!story || (story.status ?? "todo") === status) return;
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, status } : s)));
    try {
      await updateStory(storyId, { status });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao mover story";
      setError(msg);
      setStories((prev) => prev.map((s) => (s.id === storyId ? story : s)));
    }
  };

  if (loading) return <p>Loading board...</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>;
  if (featureLanes.length === 0) return <EmptyState title="Sem features" description="Crie features para usar o board." />;

  return (
    <>
      <PageHeader title="Board" subtitle="Delivery -> Kanban de features e stories" />
      <div
        style={{
          marginTop: 12,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(180deg,#e0f2fe 0%,#dbeafe 100%)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `220px repeat(${columns.length}, 1fr)`,
            alignItems: "stretch",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", background: "#f8fafc" }}>Features</div>
          {columns.map((col) => (
            <div
              key={col.key}
              style={{
                padding: "10px 12px",
                fontWeight: 700,
                textAlign: "center",
                background: col.color,
                borderLeft: "1px solid #e2e8f0",
              }}
            >
              {col.title}
            </div>
          ))}
        </div>

        {featureLanes.map(({ feature, stories: laneStories }) => (
          <div
            key={feature.id}
            style={{
              display: "grid",
              gridTemplateColumns: `220px repeat(${columns.length}, 1fr)`,
              minHeight: 140,
              borderBottom: "1px solid #e2e8f0",
              background: (laneTone[feature.complexity ?? "medium"] || laneTone.medium).bg,
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRight: "1px solid #e2e8f0",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                borderLeft: `6px solid ${(laneTone[feature.complexity ?? "medium"] || laneTone.medium).border}`,
              }}
            >
              <div style={{ fontWeight: 700, color: "#111827" }}>{feature.title}</div>
            </div>

            {columns.map((col) => (
              <div
                key={`${feature.id}-${col.key}`}
                style={{
                  minHeight: 120,
                  padding: 10,
                  borderLeft: "1px solid #e2e8f0",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData("text/plain") || draggingId;
                  if (droppedId) handleDrop(droppedId, col.key);
                  setDraggingId(null);
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  {laneStories
                    .filter((s) => (s.status ?? "todo") === col.key)
                    .map((story) => (
                      <article
                        key={story.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", story.id);
                          setDraggingId(story.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className="card"
                        style={{
                          padding: 10,
                          borderLeft: "4px solid #2563eb",
                          cursor: "grab",
                          background: "#fff",
                          boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
                          transform: draggingId === story.id ? "scale(1.02)" : "none",
                          transition: "transform 120ms ease",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{story.title}</div>
                        {story.estimate != null && (
                          <div style={{ fontSize: 12, color: "#475569" }}>Est: {story.estimate}</div>
                        )}
                      </article>
                    ))}
                  {laneStories.filter((s) => (s.status ?? "todo") === col.key).length === 0 && (
                    <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "12px 0" }}>Sem cards</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
