import type { Problem } from "../types";

interface ProblemTableProps {
  problems: Problem[];
  onEdit?: (problem: Problem) => void;
  onDelete?: (problem: Problem) => void;
}

export default function ProblemTable({ problems, onEdit, onDelete }: ProblemTableProps) {
  if (problems.length === 0) {
    return <p>No problems yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Title</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {problems.map((p) => (
          <tr key={p.id}>
            <td style={{ padding: "8px 0" }}>{p.title}</td>
            <td style={{ padding: "8px 0" }}>{p.status ?? "open"}</td>
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
