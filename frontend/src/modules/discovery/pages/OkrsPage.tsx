import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import {
  createProductOkr,
  deleteProductOkr,
  getProductOkrs,
  updateProductOkr,
} from "../services/discoveryApi";
import type { ProductOkr } from "../types";

export default function OkrsPage({ productId }: { productId: number | null }) {
  const [okrs, setOkrs] = useState<ProductOkr[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [newKrByOkr, setNewKrByOkr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setOkrs([]);
      return;
    }
    let isMounted = true;
    setLoading(true);
    getProductOkrs(productId)
      .then((data) => {
        if (isMounted) {
          setOkrs(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Falha ao carregar OKRs");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleCreate = async () => {
    if (!productId || !newObjective.trim()) return;
    try {
      const created = await createProductOkr({
        product_id: productId,
        objective: newObjective.trim(),
        key_results: [],
      });
      setOkrs((prev) => [...prev, created]);
      setNewObjective("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar OKR");
    }
  };

  const handleSave = async (okr: ProductOkr) => {
    if (!okr.objective.trim()) return;
    setSavingId(okr.id);
    try {
      const updated = await updateProductOkr(okr.id, {
        objective: okr.objective.trim(),
        key_results: okr.key_results,
      });
      setOkrs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar OKR");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (okr: ProductOkr) => {
    const ok = window.confirm(`Excluir objetivo "${okr.objective}"?`);
    if (!ok) return;
    setSavingId(okr.id);
    try {
      await deleteProductOkr(okr.id);
      setOkrs((prev) => prev.filter((item) => item.id !== okr.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir OKR");
    } finally {
      setSavingId(null);
    }
  };

  if (!productId) {
    return (
      <>
        <PageHeader title="OKRs" subtitle="Discovery ? Objetivos e Key Results" />
        <div className="card" style={{ padding: 16 }}>
          Selecione um produto para gerenciar os OKRs.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="OKRs" subtitle="Discovery ? Objetivos e Key Results" />

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <section className="card" style={{ padding: 16, maxWidth: 980, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Novo objetivo</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Adicionar objetivo"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          />
          <button type="button" className="btn btn--primary" onClick={handleCreate}>
            Criar objetivo
          </button>
        </div>
      </section>

      {loading && <p>Loading...</p>}
      {!loading && okrs.length === 0 && (
        <EmptyState
          title="Nenhum OKR"
          description="Crie objetivos e seus Key Results para acompanhar o resultado do produto."
        />
      )}

      <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
        {okrs.map((okr, index) => (
          <section key={okr.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span className="badge badge--default">Objetivo {index + 1}</span>
              <input
                value={okr.objective}
                onChange={(e) =>
                  setOkrs((prev) =>
                    prev.map((item) =>
                      item.id === okr.id ? { ...item, objective: e.target.value } : item
                    )
                  )
                }
                style={{ flex: 1, minWidth: 260 }}
              />
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave(okr)}
                disabled={savingId === okr.id}
              >
                {savingId === okr.id ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleDelete(okr)}
                disabled={savingId === okr.id}
              >
                Excluir
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Adicionar Key Result"
                value={newKrByOkr[okr.id] ?? ""}
                onChange={(e) =>
                  setNewKrByOkr((prev) => ({
                    ...prev,
                    [okr.id]: e.target.value,
                  }))
                }
                style={{ width: "100%" }}
              />
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  const text = (newKrByOkr[okr.id] ?? "").trim();
                  if (!text) return;
                  setOkrs((prev) =>
                    prev.map((item) =>
                      item.id === okr.id
                        ? { ...item, key_results: [...item.key_results, text] }
                        : item
                    )
                  );
                  setNewKrByOkr((prev) => ({ ...prev, [okr.id]: "" }));
                }}
              >
                Add KR
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {okr.key_results.map((kr, krIndex) => (
                <div key={`${okr.id}-${krIndex}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge badge--default">KR {krIndex + 1}</span>
                  <input
                    value={kr}
                    onChange={(e) =>
                      setOkrs((prev) =>
                        prev.map((item) =>
                          item.id === okr.id
                            ? {
                                ...item,
                                key_results: item.key_results.map((entry, idx) =>
                                  idx === krIndex ? e.target.value : entry
                                ),
                              }
                            : item
                        )
                      )
                    }
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() =>
                      setOkrs((prev) =>
                        prev.map((item) =>
                          item.id === okr.id
                            ? {
                                ...item,
                                key_results: item.key_results.filter((_, idx) => idx !== krIndex),
                              }
                            : item
                        )
                      )
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              {okr.key_results.length === 0 && <p style={{ marginBottom: 0 }}>Nenhum KR neste objetivo.</p>}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
