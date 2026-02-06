export type ProblemStatus = "open" | "validated" | "discarded" | string;

export interface Problem {
  id: string;
  workspace_id: number;
  title: string;
  description?: string | null;
  status?: ProblemStatus;
}

export interface ProblemCreate {
  workspace_id: number;
  title: string;
  description?: string | null;
}
