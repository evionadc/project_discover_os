import { useMemo } from "react";
import type { Story } from "../types";
import type { Feature } from "../types";

interface StoryCardGridProps {
  stories: Story[];
  features: Feature[];
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
}

const statusLabel: Record<string, string> = {
  todo: "A fazer",
  doing: "Fazendo",
  done: "Pronta",
};

export default function StoryCardGrid({ stories, features, onEdit, onDelete }: StoryCardGridProps) {
  const featureMap = useMemo(() => new Map(features.map((f) => [f.id, f.title])), [features]);

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {stories.map((story) => (
          <article
            key={story.id}
            className="card"
            onDoubleClick={() => onEdit(story)}
            style={{ padding: 14, borderLeft: "4px solid #2563eb", cursor: "pointer", background: "#ffffff" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 17 }}>{story.title}</h3>
              <span className="badge badge--default">{statusLabel[story.status ?? "todo"] ?? "A fazer"}</span>
            </div>
            {story.description && <p style={{ margin: "6px 0", color: "#334155" }}>{story.description}</p>}
            {story.acceptance_criteria && (
              <p style={{ margin: "6px 0", fontSize: 13, color: "#475569" }}>
                <strong>AC:</strong> {story.acceptance_criteria}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 13, color: "#334155" }}>
              <span><strong>Feature:</strong> {story.feature_id ? featureMap.get(story.feature_id) ?? "-" : "-"}</span>
              <span><strong>Estimativa:</strong> {story.estimate ?? "-"}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" className="btn btn--secondary" onClick={() => onEdit(story)}>Editar</button>
              <button type="button" className="btn btn--danger" onClick={() => onDelete(story)}>Excluir</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
