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
        <input
          placeholder="Nova etapa da jornada"
          value={newJourneyText}
          onChange={(e) => setNewJourneyText(e.target.value)}
          style={{ ...formFieldStyle, width: 360, marginBottom: 0 }}
        />
        <button
          onClick={() => {
            if (!newJourneyText.trim()) return;
            setJourneyCards((prev) => [
              ...prev,
              {
                id: `stage-${Date.now()}`,
                text: newJourneyText.trim(),
              },
            ]);
            setNewJourneyText("");
          }}
          style={secondaryButton}
        >
          Add
        </button>
        <button
          onClick={() => setJourneyCards([])}
          style={secondaryButton}
        >
          Clear
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {journeyCards.map((card, index) => {
          const isFirst = index === 0;
          const isLast = index === journeyCards.length - 1;
          const background = isFirst ? "#dbeafe" : isLast ? "#bbf7d0" : "#fff9a8";
          return (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", card.id);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData("text/plain");
                if (!draggedId || draggedId === card.id) return;
                setJourneyCards((prev) => {
                  const fromIndex = prev.findIndex((c) => c.id === draggedId);
                  const toIndex = prev.findIndex((c) => c.id === card.id);
                  if (fromIndex === -1 || toIndex === -1) return prev;
                  const next = [...prev];
                  const [moved] = next.splice(fromIndex, 1);
                  next.splice(toIndex, 0, moved);
                  return next;
                });
              }}
              style={{
                background,
                border: "1px solid #111827",
                borderRadius: 8,
                padding: 12,
                minHeight: 80,
                cursor: "grab",
                boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ fontWeight: 600 }}>{index + 1}. {card.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>
        Arraste os cartões para reordenar a jornada.
      </div>

      {journeyCards.length === 0 && (
        <textarea
          placeholder="Stage | Emotion | Pain (one per line)"
          value={journeyText}
          onChange={(e) => setJourneyText(e.target.value)}
          style={{ ...formFieldStyle, width: "100%", minHeight: 140, marginTop: 12 }}
        />
      )}
    </div>
  );
}
