import { useEffect, useState } from "react";
import ProblemForm from "../components/ProblemForm";
import ProblemTable from "../components/ProblemTable";
import ProblemTabs from "../components/ProblemTabs";
import { createProblem, getProblems } from "../services/discoveryApi";
import type { Problem, ProblemCreate } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workspace = useWorkspace();

  useEffect(() => {
    let isMounted = true;
    getProblems()
      .then((data: Problem[]) => {
        if (isMounted) setProblems(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load problems");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (payload: ProblemCreate) => {
    const normalized = {
      ...payload,
      description: payload.description ?? undefined,
    };
    const created = await createProblem(normalized);
    setProblems((prev) => [...prev, created]);
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Problemas</h1>
          <small>Workspace: {workspace.name}</small>
        </div>
      </header>

      <ProblemTabs />

      <ProblemForm workspaceId={workspace.id} onCreate={handleCreate} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && <ProblemTable problems={problems} />}
    </div>
  );
}
