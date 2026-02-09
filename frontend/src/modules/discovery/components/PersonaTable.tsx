import type { Persona } from "../types";

interface PersonaTableProps {
  personas: Persona[];
}

export default function PersonaTable({ personas }: PersonaTableProps) {
  if (personas.length === 0) {
    return <p>No personas yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Name</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Context</th>
        </tr>
      </thead>
      <tbody>
        {personas.map((p) => (
          <tr key={p.id}>
            <td style={{ padding: "8px 0" }}>{p.name}</td>
            <td style={{ padding: "8px 0" }}>{p.context ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
