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

const isParking = (card: ReviewCard) =>
  card.what === "low" && (card.how === "low" || card.how === "medium");

const cardColor = (card: ReviewCard) => {
  if (card.what === "high" && card.how === "high") return "green";
  if (card.what === "medium" && card.how === "high") return "yellow";
  if (card.how === "medium" && card.what === "high") return "yellow";
  return "red";
};

interface FeatureReviewSectionProps {
  formFieldStyle: CSSProperties;
  secondaryButton: CSSProperties;
  newFeatureText: string;
  setNewFeatureText: (value: string) => void;
  featureCards: FeatureCard[];
  setFeatureCards: (cards: FeatureCard[] | ((prev: FeatureCard[]) => FeatureCard[])) => void;
  reviewCards: ReviewCard[];
  setReviewCards: (cards: ReviewCard[] | ((prev: ReviewCard[]) => ReviewCard[])) => void;
  rawFeaturesText: string;
  setRawFeaturesText: (value: string) => void;
  waves: { id: string; cards: string[] }[];
  setWaves: (waves: { id: string; cards: string[] }[] | ((prev: { id: string; cards: string[] }[]) => { id: string; cards: string[] }[])) => void;
  deps: Record<string, string | "">;
  setDeps: (deps: Record<string, string | ""> | ((prev: Record<string, string | "">) => Record<string, string | "">)) => void;
}

export default function FeatureReviewSection({
  formFieldStyle,
  secondaryButton,
  newFeatureText,
  setNewFeatureText,
  featureCards,
  setFeatureCards,
  reviewCards,
  setReviewCards,
  rawFeaturesText,
  setRawFeaturesText,
  waves,
  setWaves,
  deps,
  setDeps,
}: FeatureReviewSectionProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [sequenceError, setSequenceError] = useState<string | null>(null);

  const reviewMap = useMemo(() => new Map(reviewCards.map((card) => [card.text, card])), [reviewCards]);

  const eligibleCards = useMemo(() => {
    return featureCards.filter((card) => {
      const review = reviewMap.get(card.text);
      if (!review) return false;
      return !isParking(review);
    });
  }, [featureCards, reviewMap]);
  const eligibleIds = useMemo(() => new Set(eligibleCards.map((card) => card.id)), [eligibleCards]);

  const waveCount = 8;
  const ensureWaves = (list: { id: string; cards: string[] }[]) => {
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
    if (wave.cards.length >= 3 && !wave.cards.includes(cardId)) {
      return "Regra 1: a onda pode conter no máximo três cartões.";
    }
    const nextColors = [...colors, cardColor(review)];
    if (nextColors.length === 3 && nextColors.every((c) => c !== "green")) {
      return "Regra 3: a onda não pode ter três cartões apenas amarelos/vermelhos.";
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
    const nextCount = wave.cards.includes(cardId) ? wave.cards.length : wave.cards.length + 1;
    if (nextCount >= 2 && (businessSum < 4 || uxSum < 4)) {
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
    setSequenceError(null);
    if (waveIndex !== null) {
      const message = validateAdd(cardId, waveIndex);
      if (message) {
        setSequenceError(message);
        return;
      }
    }
    setWaves((prev) => {
      const next = ensureWaves(prev.map((wave) => ({ ...wave, cards: [...wave.cards] })));
      next.forEach((wave) => {
        wave.cards = wave.cards.filter((id) => id !== cardId);
      });
      if (waveIndex === null) return next;
      next[waveIndex].cards.push(cardId);
      return next;
    });
  };
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
          placeholder="Nova feature"
          value={newFeatureText}
          onChange={(e) => setNewFeatureText(e.target.value)}
          style={{ ...formFieldStyle, width: 360, marginBottom: 0 }}
        />
        <button
          onClick={() => {
            if (!newFeatureText.trim()) return;
            const text = newFeatureText.trim();
            const id = `feature-${Date.now()}`;
            setFeatureCards((prev) => [
              ...prev,
              { id, text },
            ]);
            setReviewCards((prev) => [
              ...prev,
              {
                id: `review-${id}`,
                text,
                what: "medium",
                how: "medium",
                effort: undefined,
                business: undefined,
                ux: undefined,
              },
            ]);
            setNewFeatureText("");
          }}
          style={secondaryButton}
        >
          Add
        </button>
        <button
          onClick={() => {
            setFeatureCards([]);
            setReviewCards([]);
          }}
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
        {featureCards.map((card, index) => (
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
              setFeatureCards((prev) => {
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
              background: "#fff9a8",
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
        ))}
      </div>

      {featureCards.length === 0 && (
        <textarea
          placeholder="Feature ideas (one per line)"
          value={rawFeaturesText}
          onChange={(e) => setRawFeaturesText(e.target.value)}
          style={{ ...formFieldStyle, width: "100%", minHeight: 140, marginTop: 12 }}
        />
      )}

      {featureCards.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 6 }}>Tech/UX/Business Review</h3>
          <p style={{ color: "#6b7280", marginTop: 0 }}>
            Classifique "o que fazer" vs "como fazer" e vote (1 a 3).
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {featureCards.map((card) => {
              const review = reviewCards.find((item) => item.text === card.text) ?? {
                id: `review-${card.id}`,
                text: card.text,
                what: "medium" as const,
                how: "medium" as const,
              };
              const isCardParking = isParking(review);
              const statusColor =
                review.what === "high" && review.how === "high"
                  ? "#bbf7d0"
                  : review.what === "medium" && review.how === "high"
                  ? "#fde68a"
                  : review.how === "medium" && review.what === "high"
                  ? "#fde68a"
                  : "#fecaca";

              return (
                <div
                  key={`review-${card.id}`}
                  style={{
                    background: statusColor,
                    border: "1px solid #111827",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 220,
                    flex: "1 1 220px",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{card.text}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <label style={{ fontSize: 12 }}>
                      O que fazer
                      <select
                        value={review.what}
                        onChange={(e) => {
                          const value = e.target.value as "low" | "medium" | "high";
                          setReviewCards((prev) => {
                            const next = prev.filter((c) => c.text !== card.text);
                            next.push({ ...review, what: value });
                            return next;
                          });
                        }}
                        style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                      >
                        <option value="low">Baixo</option>
                        <option value="medium">Médio</option>
                        <option value="high">Alto</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12 }}>
                      Como fazer
                      <select
                        value={review.how}
                        onChange={(e) => {
                          const value = e.target.value as "low" | "medium" | "high";
                          setReviewCards((prev) => {
                            const next = prev.filter((c) => c.text !== card.text);
                            next.push({ ...review, how: value });
                            return next;
                          });
                        }}
                        style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                      >
                        <option value="low">Baixo</option>
                        <option value="medium">Médio</option>
                        <option value="high">Alto</option>
                      </select>
                    </label>
                  </div>
                  {isCardParking ? (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#7f1d1d" }}>
                      Parking lot
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, marginBottom: 6 }}>Votos (1 a 3)</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        {(["effort", "business", "ux"] as const).map((field) => (
                          <label key={field} style={{ fontSize: 12 }}>
                            {field === "effort" ? "Esforço" : field === "business" ? "Negócio" : "UX"}
                            <select
                              value={review[field] ?? ""}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) as 1 | 2 | 3 : undefined;
                                setReviewCards((prev) => {
                                  const next = prev.filter((c) => c.text !== card.text);
                                  next.push({ ...review, [field]: value });
                                  return next;
                                });
                              }}
                              style={{ ...formFieldStyle, width: "100%", marginBottom: 0 }}
                            >
                              <option value="">-</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 6 }}>Parking Lot</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {reviewCards
                .filter((card) => isParking(card))
                .map((card) => (
                  <div
                    key={`parking-${card.id}`}
                    style={{
                      background: "#fecaca",
                      border: "1px solid #111827",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 13,
                    }}
                  >
                    {card.text}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 6 }}>Sequencing</h3>
        <p style={{ color: "#6b7280", marginTop: 0 }}>
          Arraste os cartões para as ondas. Itens em parking lot não aparecem.
        </p>
        {sequenceError && (
          <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>{sequenceError}</div>
        )}

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedId = e.dataTransfer.getData("text/plain") || draggingId;
            if (droppedId) assignCard(droppedId, null);
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
            marginBottom: 12,
          }}
        >
          {eligibleCards
            .filter((card) => getWaveIndexByCard(card.id) === -1)
            .map((card) => {
              const review = reviewMap.get(card.text);
              const color = review ? cardColor(review) : "red";
              const background =
                color === "green" ? "#bbf7d0" : color === "yellow" ? "#fde68a" : "#fecaca";
              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", card.id);
                    setDraggingId(card.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  style={{
                    background,
                    border: "1px solid #111827",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    cursor: "grab",
                    minWidth: 140,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{card.text}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 12 }}>
                    <span>E {review?.effort ?? "-"}</span>
                    <span>$ {review?.business ?? "-"}</span>
                    <span>s2 {review?.ux ?? "-"}</span>
                  </div>
                </div>
              );
            })}
          {eligibleCards.filter((card) => getWaveIndexByCard(card.id) === -1).length === 0 && (
            <span style={{ color: "#6b7280" }}>Sem cards livres</span>
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
              onDrop={(e) => {
                e.preventDefault();
                const droppedId = e.dataTransfer.getData("text/plain") || draggingId;
                if (!droppedId) return;
                assignCard(droppedId, index);
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
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", id);
                          setDraggingId(id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        style={{
                          background,
                          border: "1px solid #111827",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 13,
                          cursor: "grab",
                          minWidth: 140,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{card?.text ?? id}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 12 }}>
                          <span>E {review?.effort ?? "-"}</span>
                          <span>$ {review?.business ?? "-"}</span>
                          <span>s2 {review?.ux ?? "-"}</span>
                        </div>
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
    </div>
  );
}

