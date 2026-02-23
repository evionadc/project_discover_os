import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import ProblemForm from "../components/ProblemForm";
import ProblemTabs, { type ProblemFilter } from "../components/ProblemTabs";
import { createProblem, deleteProblem, getProblems, updateProblem } from "../services/discoveryApi";
import type { Problem, ProblemCreate } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";

export default function ProblemsPage() {
  const workspace = useWorkspace();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProblemFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Problem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Problem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Problem["status"]>("open");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProblems()
      .then((data) => mounted && setProblems(data))
      .catch((err: Error) => mounted && setError(err.message ?? "Erro ao carregar problemas"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return problems;
    return problems.filter((p) => (p.status ?? "open").toLowerCase() === activeFilter);
  }, [activeFilter, problems]);

  const handleCreate = async (payload: ProblemCreate) => {
    const normalized = { ...payload, description: payload.description || undefined };
    const created = await createProblem(normalized);
    setProblems((prev) => [...prev, created]);
  };

  const openEdit = (problem: Problem) => {
    setEditTarget(problem);
    setTitle(problem.title);
    setDescription(problem.description ?? "");
    setStatus(problem.status ?? "open");
  };

  const handleUpdate = async () => {
    if (!editTarget || !title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProblem(editTarget.id, {
        workspace_id: workspace.id,
        title: title.trim(),
        description: description.trim() ? description : undefined,
        status,
      });
      setProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar problema");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProblem(deleteTarget.id);
      setProblems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir problema");
    } finally {
      setDeleteTarget(null);
    }
  };

  const statusLabel = (value?: string) => {
    const map: Record<string, string> = { open: "Aberto", validated: "Validado", discarded: "Descartado" };
    return map[value ?? "open"] ?? "Aberto";
  };

  const statusColor = (value?: string) => {
    const v = (value ?? "open").toLowerCase();
    if (v === "validated") return "#dcfce7";
    if (v === "discarded") return "#fee2e2";
    return "#e0f2fe";
  };

  return (
    <>
      <PageHeader title="Problemas" subtitle="Discovery → Catálogo de problemas" />

      <ProblemTabs value={activeFilter} onChange={setActiveFilter} />

      <ProblemForm workspaceId={workspace.id} onCreate={handleCreate} />

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {!loading && filtered.length === 0 && <p style={{ color: "#475569" }}>Nenhum problema encontrado.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: 16 }}>
          {filtered.map((problem) => (
            <div
              key={problem.id}
              className="card"
              onDoubleClick={() => openEdit(problem)}
              style={{
                padding: 14,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: statusColor(problem.status),
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{problem.title}</strong>
                <span style={{ fontSize: 12, color: "#334155" }}>{statusLabel(problem.status)}</span>
              </div>
              {problem.description && (
                <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{problem.description}</p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn btn--ghost" onClick={() => openEdit(problem)}>
                  Editar
                </button>
                <button className="btn btn--danger" onClick={() => setDeleteTarget(problem)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setEditTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 520, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Editar problema</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="form-label">Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label className="form-label">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  style={{ minHeight: 90, width: "100%" }}
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Problem["status"])}
                  className="form-control"
                  style={{ width: "100%" }}
                >
                  <option value="open">Aberto</option>
                  <option value="validated">Validado</option>
                  <option value="discarded">Descartado</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => setEditTarget(null)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={handleUpdate} disabled={saving || !title.trim()}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Excluir problema</h3>
            <p style={{ margin: 0 }}>Tem certeza que deseja excluir "{deleteTarget.title}"?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="btn btn--danger" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
