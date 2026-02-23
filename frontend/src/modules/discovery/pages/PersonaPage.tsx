import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import PersonaForm from "../components/PersonaForm";
import { createPersona, deletePersona, getPersonas, getProblems, updatePersona } from "../services/discoveryApi";
import type { Persona, PersonaCreate, Problem } from "../types";

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [editTarget, setEditTarget] = useState<Persona | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null);
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [mainPain, setMainPain] = useState("");
  const [editProblemId, setEditProblemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getPersonas(), getProblems()])
      .then(([personaData, problemData]) => {
        if (!mounted) return;
        setPersonas(personaData);
        setProblems(problemData);
      })
      .catch((err: Error) => mounted && setError(err.message ?? "Erro ao carregar personas"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!selectedProblemId) return personas;
    return personas.filter((p) => p.problem_id === selectedProblemId);
  }, [personas, selectedProblemId]);

  const handleCreate = async (payload: PersonaCreate) => {
    const normalized = {
      ...payload,
      context: payload.context || undefined,
      goal: payload.goal || undefined,
      main_pain: payload.main_pain || undefined,
    };
    const created = await createPersona(normalized);
    setPersonas((prev) => [...prev, created]);
  };

  const openEdit = (persona: Persona) => {
    setEditTarget(persona);
    setEditProblemId(persona.problem_id);
    setName(persona.name);
    setContext(persona.context ?? "");
    setGoal(persona.goal ?? "");
    setMainPain(persona.main_pain ?? "");
  };

  const handleUpdate = async () => {
    if (!editTarget || !name.trim() || !editProblemId) return;
    setSaving(true);
    try {
      const updated = await updatePersona(editTarget.id, {
        problem_id: editProblemId,
        name: name.trim(),
        context: context.trim() ? context : undefined,
        goal: goal.trim() ? goal : undefined,
        main_pain: mainPain.trim() ? mainPain : undefined,
      });
      setPersonas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar persona");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePersona(deleteTarget.id);
      setPersonas((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir persona");
    } finally {
      setDeleteTarget(null);
    }
  };

  const problemTitle = (id: string) => problems.find((p) => p.id === id)?.title ?? "";

  return (
    <>
      <PageHeader title="Personas" subtitle="Discovery → Personas vinculadas a problemas" />

      <section style={{ marginTop: 12 }}>
        <label className="form-label">Filtrar por problema</label>
        <select
          value={selectedProblemId}
          onChange={(e) => setSelectedProblemId(e.target.value)}
          className="form-control"
          style={{ maxWidth: 360 }}
        >
          <option value="">Todos</option>
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </select>
      </section>

      {selectedProblemId && <PersonaForm problemId={selectedProblemId} onCreate={handleCreate} />}

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma persona"
          description="Crie personas para representar seus principais usuários."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: 16 }}>
          {filtered.map((persona) => (
            <div
              key={persona.id}
              className="card"
              onDoubleClick={() => openEdit(persona)}
              style={{ padding: 14, border: "1px solid #e5e7eb", borderRadius: 10, background: "#f8fafc", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{persona.name}</strong>
                <span style={{ fontSize: 12, color: "#334155" }}>{problemTitle(persona.problem_id)}</span>
              </div>
              {persona.context && <p style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>{persona.context}</p>}
              {persona.goal && <p style={{ marginTop: 4, fontSize: 13, color: "#475569" }}><strong>Necessidades:</strong> {persona.goal}</p>}
              {persona.main_pain && <p style={{ marginTop: 4, fontSize: 13, color: "#475569" }}><strong>Comportamento:</strong> {persona.main_pain}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn btn--ghost" onClick={() => openEdit(persona)}>Editar</button>
                <button className="btn btn--danger" onClick={() => setDeleteTarget(persona)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
          onClick={() => setEditTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 560, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Editar persona</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="form-label">Problema associado</label>
                <select value={editProblemId} onChange={(e) => setEditProblemId(e.target.value)} className="form-control" style={{ width: "100%" }}>
                  <option value="">Selecione...</option>
                  {problems.map((problem) => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="form-control" style={{ width: "100%" }} />
              </div>
              <div>
                <label className="form-label">Perfil</label>
                <textarea value={context} onChange={(e) => setContext(e.target.value)} className="form-control" style={{ minHeight: 70, width: "100%" }} />
              </div>
              <div>
                <label className="form-label">Necessidades</label>
                <textarea value={goal} onChange={(e) => setGoal(e.target.value)} className="form-control" style={{ minHeight: 70, width: "100%" }} />
              </div>
              <div>
                <label className="form-label">Comportamentos</label>
                <textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} className="form-control" style={{ minHeight: 70, width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => setEditTarget(null)} disabled={saving}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleUpdate} disabled={saving || !name.trim() || !editProblemId}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Excluir persona</h3>
            <p style={{ margin: 0 }}>Tem certeza que deseja excluir "{deleteTarget.name}"?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
