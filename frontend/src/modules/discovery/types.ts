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

export interface Persona {
  id: string;
  problem_id: string;
  name: string;
  context?: string | null;
  goal?: string | null;
  main_pain?: string | null;
}

export interface PersonaCreate {
  problem_id: string;
  name: string;
  context?: string | null;
  goal?: string | null;
  main_pain?: string | null;
}

export interface Hypothesis {
  id: string;
  problem_id: string;
  statement: string;
  metric?: string | null;
  success_criteria?: string | null;
  status?: string;
}

export interface HypothesisCreate {
  problem_id: string;
  statement: string;
  metric?: string | null;
  success_criteria?: string | null;
}

export interface Mvp {
  id: string;
  hypothesis_id: string;
  description?: string | null;
  scope?: string | null;
  status?: string;
}

export interface MvpCreate {
  hypothesis_id: string;
  description?: string | null;
  scope?: string | null;
}
