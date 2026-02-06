export interface Workspace {
  id: number;
  name: string;
}

export function useWorkspace(): Workspace {
  return { id: 1, name: "Default" };
}
