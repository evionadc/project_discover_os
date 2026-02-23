import type { CSSProperties } from "react";

interface JourneyCard {
  id: string;
  text: string;
}

interface JourneySectionProps {
  formFieldStyle: CSSProperties;
  secondaryButton: CSSProperties;
  journeyCards: JourneyCard[];
  setJourneyCards: (cards: JourneyCard[] | ((prev: JourneyCard[]) => JourneyCard[])) => void;
  newJourneyText: string;
  setNewJourneyText: (value: string) => void;
  journeyText: string;
  setJourneyText: (value: string) => void;
}

export default function JourneySection({
  formFieldStyle,
  secondaryButton,
  journeyCards,
  setJourneyCards,
  newJourneyText,
  setNewJourneyText,
  journeyText,
  setJourneyText,
}: JourneySectionProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        maxWidth: 980,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <textarea
          placeholder="Etapas da jornada (uma por linha)"
          value={newJourneyText}
          onChange={(e) => setNewJourneyText(e.target.value)}
          style={{ ...formFieldStyle, width: 320, minHeight: 110, marginBottom: 0 }}
        />
        <button
          onClick={() => {
            const stages = newJourneyText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            if (stages.length === 0) return;
            const now = Date.now();
            setJourneyCards((prev) => [...prev, ...stages.map((text, idx) => ({ id: `journey-${now}-${idx}`, text }))]);
            setNewJourneyText("");
          }}
          style={secondaryButton}
        >
          Adicionar jornada
        </button>
        <button onClick={() => setJourneyCards([])} style={secondaryButton}>
          Limpar
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {journeyCards.map((card) => (
          <div
            key={card.id}
            style={{
              background: "#ffffff",
              border: "1px solid #111827",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                value={card.text}
                onChange={(e) =>
                  setJourneyCards((prev) => prev.map((item) => (item.id === card.id ? { ...item, text: e.target.value } : item)))
                }
                style={{ ...formFieldStyle, width: 320, marginBottom: 0 }}
              />
              <button onClick={() => setJourneyCards((prev) => prev.filter((item) => item.id !== card.id))} style={secondaryButton}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Dica: use etapas concisas e coerentes.</div>
        <button onClick={() => setJourneyCards([])} style={{ ...secondaryButton, marginTop: 8 }}>
          Limpar tudo
        </button>
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Visão rápida</label>
          <textarea
            readOnly
            value={journeyCards.length ? journeyCards.map((c) => `- ${c.text}`).join("\n") : journeyText}
            onChange={(e) => setJourneyText(e.target.value)}
            style={{ ...formFieldStyle, width: "100%", minHeight: 140, background: "#f9fafb" }}
          />
        </div>
      </div>
    </div>
  );
}
