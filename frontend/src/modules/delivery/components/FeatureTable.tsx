import type { Feature } from "../types";

interface FeatureTableProps {
  features: Feature[];
}

export default function FeatureTable({ features }: FeatureTableProps) {
  if (features.length === 0) {
    return <p>No features yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Title</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Complexidade</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Negocio</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Esforco</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>UX</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr key={feature.id}>
            <td style={{ padding: "8px 0" }}>{feature.title}</td>
            <td style={{ padding: "8px 0" }}>
              {feature.complexity === "high" ? "Alta (vermelho)" : feature.complexity === "medium" ? "Media (amarelo)" : "Baixa (verde)"}
            </td>
            <td style={{ padding: "8px 0" }}>{feature.business_estimate ?? "-"}</td>
            <td style={{ padding: "8px 0" }}>{feature.effort_estimate ?? "-"}</td>
            <td style={{ padding: "8px 0" }}>{feature.ux_estimate ?? "-"}</td>
            <td style={{ padding: "8px 0" }}>
              {feature.status === "doing" ? "Fazendo" : feature.status === "done" ? "Pronta" : "A fazer"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
