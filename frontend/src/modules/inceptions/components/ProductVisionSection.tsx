import type { CSSProperties } from "react";

interface ProductVisionSectionProps {
  formFieldStyle: CSSProperties;
  targetAudience: string;
  setTargetAudience: (value: string) => void;
  problemStatement: string;
  setProblemStatement: (value: string) => void;
  productName: string;
  setProductName: (value: string) => void;
  productCategory: string;
  setProductCategory: (value: string) => void;
  keyBenefit: string;
  setKeyBenefit: (value: string) => void;
  alternatives: string;
  setAlternatives: (value: string) => void;
  differential: string;
  setDifferential: (value: string) => void;
}

export default function ProductVisionSection({
  formFieldStyle,
  targetAudience,
  setTargetAudience,
  problemStatement,
  setProblemStatement,
  productName,
  setProductName,
  productCategory,
  setProductCategory,
  keyBenefit,
  setKeyBenefit,
  alternatives,
  setAlternatives,
  differential,
  setDifferential,
}: ProductVisionSectionProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        width: "100%",
        maxWidth: 860,
      }}
    >
      <h3 style={{ marginTop: 0, textAlign: "center" }}>
        Visão do Produto
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 22,
          fontSize: 15,
          color: "#111827",
          lineHeight: 1.8,
        }}
      >
        <div>
          <strong>Para:</strong>{" "}
          <input
            placeholder="segmento de clientes"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 220,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          , que{" "}
          <input
            placeholder="problema que enfrentam"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 260,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          .
        </div>

        <div>
          <strong>O nosso produto</strong>{" "}
          <input
            placeholder="nome do produto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 220,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          , é um{" "}
          <input
            placeholder="categoria do produto"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 240,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          que{" "}
          <input
            placeholder="benefício chave"
            value={keyBenefit}
            onChange={(e) => setKeyBenefit(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 240,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          .
        </div>

        <div>
          <strong>Diferentemente de:</strong>{" "}
          <input
            placeholder="alternativas existentes"
            value={alternatives}
            onChange={(e) => setAlternatives(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 260,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          , o nosso produto{" "}
          <input
            placeholder="diferencial"
            value={differential}
            onChange={(e) => setDifferential(e.target.value)}
            style={{
              ...formFieldStyle,
              display: "inline-block",
              width: 240,
              maxWidth: "100%",
              marginBottom: 0,
              background: "#fff9a8",
              border: "1px solid #facc15",
              boxShadow: "0 4px 10px rgba(250, 204, 21, 0.25)",
            }}
          />
          .
        </div>
      </div>
    </div>
  );
}
