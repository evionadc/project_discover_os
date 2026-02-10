import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

interface FeatureCard {
  id: string;
  text: string;
}

interface ReviewCard {
  id: string;
  text: string;
  what: "low" | "medium" | "high";
  how: "low" | "medium" | "high";
  effort?: 1 | 2 | 3;
  business?: 1 | 2 | 3;
  ux?: 1 | 2 | 3;
}

interface Wave {
  id: string;
  cards: string[];
}

interface SequencingSectionProps {
  formFieldStyle: CSSProperties;
  featureCards: FeatureCard[];
  reviewCards: ReviewCard[];
  waves: Wave[];
  setWaves: (waves: Wave[] | ((prev: Wave[]) => Wave[])) => void;
  deps: Record<string, string | "">;
  setDeps: (deps: Record<string, string | ""> | ((prev: Record<string, string | "">) => Record<string, string | "">)) => void;
}

const isParking = (card: ReviewCard) =>
  (card.what === "low" && (card.how === "low" || card.how === "medium")) ||
  (card.what === "medium" && card.how === "medium") ||
  (card.what === "low" && card.how === "high");

const cardColor = (card: ReviewCard) => {
  if (card.what === "high" && card.how === "high") return "green";
  if (card.what === "medium" && card.how === "high") return "yellow";
  return "red";
};

export default function SequencingSection({
  formFieldStyle,
  featureCards,
  reviewCards,
  waves,
  setWaves,
  deps,
  setDeps,
}: SequencingSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const reviewMap = useMemo(() => {
    return new Map(reviewCards.map((card) => [card.text, card]));
  }, [reviewCards]);

  const eligibleCards = useMemo(() => {
    return featureCards.filter((card) => {
      const review = reviewMap.get(card.text);
      return review ? !isParking(review) : false;
    });
  }, [featureCards, reviewMap]);

  const waveCount = 8;
  const ensureWaves = (list: Wave[]) => {
    if (list.length >= waveCount) return list;
    const missing = waveCount - list.length;
    return [
      ...list,
      ...Array.from({ length: missing }).map((_, idx) => ({
        id: `wave-${list.length + idx + 1}`,
        cards: [],
      })),
    ];
  };

  const normalizedWaves = ensureWaves(waves);

  const getWaveIndexByCard = (cardId: string) =>
    normalizedWaves.findIndex((wave) => wave.cards.includes(cardId));

  const validateAdd = (cardId: string, waveIndex: number) => {
    const wave = normalizedWaves[waveIndex];
    if (!wave) return "Onda inválida.";
    if (wave.cards.length >= 3 && !wave.cards.includes(cardId)) {
      return "Regra 1: a onda pode conter no máximo três cartões.";
    }

    const review = reviewMap.get(eligibleCards.find((c) => c.id === cardId)?.text ?? "");
    if (!review) return "Card sem avaliação.";

    const colors = wave.cards.map((id) => {
      const card = eligibleCards.find((c) => c.id === id);
      const rev = card ? reviewMap.get(card.text) : undefined;
      return rev ? cardColor(rev) : "red";
    });
    const redCount = colors.filter((c) => c === "red").length + (cardColor(review) === "red" ? 1 : 0);
    if (redCount > 1) {
      return "Regra 2: uma onda não pode conter mais de um cartão vermelho.";
    }

    const nextColors = [...colors, cardColor(review)];
    if (nextColors.length === 3 && nextColors.every((c) => c !== "green")) {
      return "Regra 3: uma onda não pode ter três cartões apenas amarelos/vermelhos.";
    }

    const effortSum =
      wave.cards.reduce((sum, id) => {
        const card = eligibleCards.find((c) => c.id === id);
        const rev = card ? reviewMap.get(card.text) : undefined;
        return sum + (rev?.effort ?? 0);
      }, 0) + (review.effort ?? 0);
    if (effortSum > 5) {
      return "Regra 4: soma de esforço não pode ultrapassar 5 Es.";
    }

    const businessSum =
      wave.cards.reduce((sum, id) => {
        const card = eligibleCards.find((c) => c.id === id);
        const rev = card ? reviewMap.get(card.text) : undefined;
        return sum + (rev?.business ?? 0);
      }, 0) + (review.business ?? 0);
    const uxSum =
      wave.cards.reduce((sum, id) => {
        const card = eligibleCards.find((c) => c.id === id);
        const rev = card ? reviewMap.get(card.text) : undefined;
        return sum + (rev?.ux ?? 0);
      }, 0) + (review.ux ?? 0);
    if (businessSum < 4 || uxSum < 4) {
      return "Regra 5: soma de Negócio e UX deve ser >= 4.";
    }

    const depId = deps[cardId];
    if (depId) {
      const depWaveIndex = getWaveIndexByCard(depId);
      if (depWaveIndex === -1 || depWaveIndex >= waveIndex) {
        return "Regra 6: dependência deve estar em uma onda anterior.";
      }
    }

    return null;
  };

  const assignCard = (cardId: string, waveIndex: number | null) => {
    setError(null);
    setWaves((prev) => {
      const next = ensureWaves(prev.map((wave) => ({ ...wave, cards: [...wave.cards] })));
      // remove from any wave
      next.forEach((wave) => {
        wave.cards = wave.cards.filter((id) => id !== cardId);
      });
      if (waveIndex === null) return next;
      const message = validateAdd(cardId, waveIndex);
      if (message) {
        setError(message);
        return next;
      }
      next[waveIndex].cards.push(cardId);
      return next;
    });
  };

  const eligibleIds = new Set(eligibleCards.map((card) => card.id));

  return (
    <div>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
          maxWidth: 980,
          width: "100%",
          marginBottom: 16,
        }}
      >
        <h4 style={{ marginTop: 0 }}>Features disponíveis</h4>
        {eligibleCards.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Nenhuma feature elegível (parking lot não entra).</p>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) assignCard(draggingId, null);
              setDraggingId(null);
            }}
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              padding: 8,
              border: "1px dashed #cbd5f5",
              borderRadius: 8,
              minHeight: 64,
            }}
          >
            {eligibleCards
              .filter((card) => getWaveIndexByCard(card.id) === -1)
              .map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDraggingId(card.id)}
                  onDragEnd={() => setDraggingId(null)}
                  style={{
                    background: "#fff9a8",
                    border: "1px solid #111827",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    cursor: "grab",
                  }}
                >
                  {card.text}
                </div>
              ))}
            {eligibleCards.filter((card) => getWaveIndexByCard(card.id) === -1).length === 0 && (
              <span style={{ color: "#6b7280" }}>Arraste cards aqui para remover da onda</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {normalizedWaves.map((wave, index) => (
          <div
            key={wave.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!draggingId) return;
              assignCard(draggingId, index);
              setDraggingId(null);
            }}
          >
            <strong>Onda {index + 1}</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {wave.cards
                .filter((id) => eligibleIds.has(id))
                .map((id) => {
                  const card = eligibleCards.find((c) => c.id === id);
                  const review = card ? reviewMap.get(card.text) : undefined;
                  const color = review ? cardColor(review) : "red";
                  const background =
                    color === "green" ? "#bbf7d0" : color === "yellow" ? "#fde68a" : "#fecaca";
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={() => setDraggingId(id)}
                      onDragEnd={() => setDraggingId(null)}
                      style={{
                        background,
                        border: "1px solid #111827",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 13,
                        cursor: "grab",
                      }}
                    >
                      {card?.text ?? id}
                    </div>
                  );
                })}
              {wave.cards.filter((id) => eligibleIds.has(id)).length === 0 && (
                <span style={{ color: "#6b7280" }}>Sem cards</span>
              )}
            </div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {wave.cards.map((id) => {
                const card = eligibleCards.find((c) => c.id === id);
                if (!card) return null;
                return (
                  <select
                    key={`dep-${id}`}
                    value={deps[id] ?? ""}
                    onChange={(e) => setDeps((prev) => ({ ...prev, [id]: e.target.value }))}
                    style={{ ...formFieldStyle, width: 260, marginBottom: 0 }}
                  >
                    <option value="">Sem dependência</option>
                    {eligibleCards
                      .filter((c) => c.id !== id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          Depende de: {c.text}
                        </option>
                      ))}
                  </select>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
