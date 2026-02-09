import type { Mvp } from "../types";

interface MvpTableProps {
  mvps: Mvp[];
}

export default function MvpTable({ mvps }: MvpTableProps) {
  if (mvps.length === 0) {
    return <p>No MVPs yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Description</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {mvps.map((mvp) => (
          <tr key={mvp.id}>
            <td style={{ padding: "8px 0" }}>{mvp.description ?? "-"}</td>
            <td style={{ padding: "8px 0" }}>{mvp.status ?? "defined"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
