import type { Persona } from "../types";

interface PersonaTableProps {
  personas: Persona[];
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
}

export default function PersonaTable({ personas, onEdit, onDelete }: PersonaTableProps) {
  if (personas.length === 0) {
    return <p>No personas yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Name</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Context</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {personas.map((p) => (
          <tr key={p.id}>
            <td style={{ padding: "8px 0" }}>{p.name}</td>
            <td style={{ padding: "8px 0" }}>{p.context ?? "-"}</td>
            <td style={{ padding: "8px 0", display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => onEdit?.(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => onDelete?.(p)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
