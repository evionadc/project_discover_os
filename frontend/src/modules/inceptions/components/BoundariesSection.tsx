import type { CSSProperties } from "react";

interface BoundariesSectionProps {
  formFieldStyle: CSSProperties;
  isText: string;
  setIsText: (value: string) => void;
  isNotText: string;
  setIsNotText: (value: string) => void;
  doesText: string;
  setDoesText: (value: string) => void;
  doesNotText: string;
  setDoesNotText: (value: string) => void;
}

export default function BoundariesSection({
  formFieldStyle,
  isText,
  setIsText,
  isNotText,
  setIsNotText,
  doesText,
  setDoesText,
  doesNotText,
  setDoesNotText,
}: BoundariesSectionProps) {
  const stickyStyle: CSSProperties = {
    ...formFieldStyle,
    width: "100%",
    minHeight: 180,
    background: "#fff9a8",
    border: "1px solid #facc15",
    boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        width: "100%",
        maxWidth: 980,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "#111827",
            opacity: 0.75,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            background: "#111827",
            opacity: 0.75,
          }}
        />

        <div style={{ padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>É</h4>
          <textarea
            placeholder="Itens do tipo É (um por linha)"
            value={isText}
            onChange={(e) => setIsText(e.target.value)}
            style={stickyStyle}
          />
        </div>

        <div style={{ padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Não é</h4>
          <textarea
            placeholder="Itens do tipo Não é (um por linha)"
            value={isNotText}
            onChange={(e) => setIsNotText(e.target.value)}
            style={stickyStyle}
          />
        </div>

        <div style={{ padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Faz</h4>
          <textarea
            placeholder="Itens do tipo Faz (um por linha)"
            value={doesText}
            onChange={(e) => setDoesText(e.target.value)}
            style={stickyStyle}
          />
        </div>

        <div style={{ padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Não faz</h4>
          <textarea
            placeholder="Itens do tipo Não faz (um por linha)"
            value={doesNotText}
            onChange={(e) => setDoesNotText(e.target.value)}
            style={stickyStyle}
          />
        </div>
      </div>
    </div>
  );
}
