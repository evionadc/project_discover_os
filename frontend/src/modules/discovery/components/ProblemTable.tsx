import type { Problem } from "../types";

interface ProblemTableProps {
  problems: Problem[];
}

export default function ProblemTable({ problems }: ProblemTableProps) {
  if (problems.length === 0) {
    return <p>No problems yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Title</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {problems.map((p) => (
          <tr key={p.id}>
            <td style={{ padding: "8px 0" }}>{p.title}</td>
            <td style={{ padding: "8px 0" }}>{p.status ?? "open"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
