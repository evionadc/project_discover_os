import { useEffect, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import {
  addWorkspaceMember,
  createWorkspaceProduct,
  listWorkspaceMembers,
  listWorkspaceProducts,
  type WorkspaceMember,
  type WorkspaceProduct,
} from "../services/workspaceApi";

export default function WorkspacePage({
  selectedProductId,
  onSelectProduct,
}: {
  selectedProductId?: number | null;
  onSelectProduct?: (product: { id: number; name: string }) => void;
}) {
  const workspace = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [products, setProducts] = useState<WorkspaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMemberId, setNewMemberId] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [savingMember, setSavingMember] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      listWorkspaceMembers(workspace.id),
      listWorkspaceProducts(workspace.id),
    ])
      .then(([memberData, productData]) => {
        if (!isMounted) return;
        setMembers(memberData);
        setProducts(productData);
        setError(null);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message ?? "Failed to load workspace data");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspace.id]);

  const handleAddMember = async () => {
    const userId = Number(newMemberId);
    if (!Number.isInteger(userId) || userId <= 0) return;
    setSavingMember(true);
    try {
      const created = await addWorkspaceMember(workspace.id, userId);
      setMembers((prev) => {
        if (prev.some((item) => item.user_id === created.user_id)) return prev;
        return [...prev, created].sort((a, b) => a.user_id - b.user_id);
      });
      setNewMemberId("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSavingMember(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setSavingProduct(true);
    try {
      const created = await createWorkspaceProduct(workspace.id, {
        name: newProductName.trim(),
        description: newProductDescription.trim() || undefined,
      });
      setProducts((prev) => [...prev, created]);
      setNewProductName("");
      setNewProductDescription("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Workspace: ${workspace.name}`}
        subtitle="Gerencie membros e produtos vinculados ao workspace"
      />

      {error && (
        <div
          className="card"
          style={{ padding: 10, marginBottom: 14, color: "var(--danger)", borderColor: "#fecaca" }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Membros do workspace</h3>
          <p>Cada usuario pode participar de 1 ou mais workspaces.</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              placeholder="ID do usuario"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              style={{ width: 180 }}
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAddMember}
              disabled={savingMember}
            >
              {savingMember ? "Adicionando..." : "Adicionar membro"}
            </button>
          </div>

          {loading ? (
            <p>Carregando membros...</p>
          ) : members.length === 0 ? (
            <p>Nenhum membro vinculado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={`${member.workspace_id}-${member.user_id}`}>
                    <td>{member.user_id}</td>
                    <td>{new Date(member.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Produtos do workspace</h3>
          <p>Um workspace pode ter de 1 a muitos produtos.</p>

          <input
            placeholder="Nome do produto"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            placeholder="Descricao"
            value={newProductDescription}
            onChange={(e) => setNewProductDescription(e.target.value)}
            style={{ width: "100%", minHeight: 80, marginBottom: 8 }}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleAddProduct}
            disabled={savingProduct}
          >
            {savingProduct ? "Criando..." : "Criar produto"}
          </button>

          <div style={{ marginTop: 14 }}>
            {loading ? (
              <p>Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p>Nenhum produto cadastrado.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={selectedProductId === product.id ? { background: "#eff6ff" } : undefined}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.status}</td>
                      <td>
                        <button
                          type="button"
                          className={selectedProductId === product.id ? "btn btn--secondary" : "btn btn--ghost"}
                          onClick={() => onSelectProduct?.({ id: product.id, name: product.name })}
                        >
                          {selectedProductId === product.id ? "Selecionado" : "Selecionar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
