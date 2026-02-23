import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import { getWorkspaceProduct, updateWorkspaceProduct } from "../services/workspaceApi";

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const joinLines = (items?: string[]) => (items && items.length > 0 ? items.join("\n") : "");

export default function ProductEditPage({
  productId,
  onProductUpdated,
}: {
  productId: number | null;
  onProductUpdated?: (product: { id: number; name: string }) => void;
}) {
  const workspace = useWorkspace();
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [isText, setIsText] = useState("");
  const [isNotText, setIsNotText] = useState("");
  const [doesText, setDoesText] = useState("");
  const [doesNotText, setDoesNotText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setName("");
      setVision("");
      setIsText("");
      setIsNotText("");
      setDoesText("");
      setDoesNotText("");
      return;
    }
    let isMounted = true;
    setLoading(true);
    getWorkspaceProduct(workspace.id, productId)
      .then((product) => {
        if (!isMounted) return;
        setName(product.name);
        setVision(product.vision ?? "");
        setIsText(joinLines(product.boundaries?.is));
        setIsNotText(joinLines(product.boundaries?.is_not));
        setDoesText(joinLines(product.boundaries?.does));
        setDoesNotText(joinLines(product.boundaries?.does_not));
        setError(null);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message ?? "Falha ao carregar produto");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, workspace.id]);

  const handleSave = async () => {
    if (!productId || !name.trim()) return;
    setSaving(true);
    setSuccess(null);
    try {
      const updated = await updateWorkspaceProduct(workspace.id, productId, {
        name: name.trim(),
        vision,
        boundaries: {
          is: splitLines(isText),
          is_not: splitLines(isNotText),
          does: splitLines(doesText),
          does_not: splitLines(doesNotText),
        },
      });
      setName(updated.name);
      setVision(updated.vision ?? "");
      setIsText(joinLines(updated.boundaries?.is));
      setIsNotText(joinLines(updated.boundaries?.is_not));
      setDoesText(joinLines(updated.boundaries?.does));
      setDoesNotText(joinLines(updated.boundaries?.does_not));
      setSuccess("Produto atualizado com sucesso.");
      setError(null);
      onProductUpdated?.({ id: updated.id, name: updated.name });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("product:selected", {
            detail: { id: updated.id, name: updated.name },
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar produto");
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <>
        <PageHeader title="Editar produto" subtitle="Selecione um produto no Workspace para editar." />
        <div className="card" style={{ padding: 16 }}>
          Nenhum produto selecionado.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Editar produto" subtitle="Ajuste nome e Product Vision do produto selecionado." />

      {error && (
        <div className="card" style={{ padding: 10, marginBottom: 14, color: "var(--danger)", borderColor: "#fecaca" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="card" style={{ padding: 10, marginBottom: 14, color: "#166534", borderColor: "#bbf7d0" }}>
          {success}
        </div>
      )}

      <section className="card" style={{ padding: 16, maxWidth: 920 }}>
        {loading ? (
          <p>Carregando produto...</p>
        ) : (
          <>
            <label style={{ display: "block", marginBottom: 6 }}>Nome do produto</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
              placeholder="Nome do produto"
            />

            <label style={{ display: "block", marginBottom: 6 }}>Product Vision</label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              style={{ width: "100%", minHeight: 180, marginBottom: 12 }}
              placeholder="Visao do produto"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: 6 }}>E</label>
                <textarea
                  value={isText}
                  onChange={(e) => setIsText(e.target.value)}
                  style={{ width: "100%", minHeight: 120 }}
                  placeholder="Um item por linha"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 }}>Nao e</label>
                <textarea
                  value={isNotText}
                  onChange={(e) => setIsNotText(e.target.value)}
                  style={{ width: "100%", minHeight: 120 }}
                  placeholder="Um item por linha"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 }}>Faz</label>
                <textarea
                  value={doesText}
                  onChange={(e) => setDoesText(e.target.value)}
                  style={{ width: "100%", minHeight: 120 }}
                  placeholder="Um item por linha"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 }}>Nao faz</label>
                <textarea
                  value={doesNotText}
                  onChange={(e) => setDoesNotText(e.target.value)}
                  style={{ width: "100%", minHeight: 120 }}
                  placeholder="Um item por linha"
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </>
        )}
      </section>
    </>
  );
}
