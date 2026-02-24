export interface Workspace {
  id: number;
  name: string;
}

export function useWorkspace(): Workspace {
  if (typeof window === "undefined") {
    return { id: 0, name: "Sem workspace" };
  }
  try {
    const raw = window.localStorage.getItem("selectedWorkspace");
    if (!raw) return { id: 0, name: "Sem workspace" };
    const parsed = JSON.parse(raw) as { id?: number; name?: string };
    return {
      id: typeof parsed.id === "number" ? parsed.id : 0,
      name: parsed.name?.trim() || "Sem workspace",
    };
  } catch {
    return { id: 0, name: "Sem workspace" };
  }
}

