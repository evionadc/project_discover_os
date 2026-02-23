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

export interface UserJourney {
  id: string;
  persona_id: string;
  name: string;
  stages: string[];
}

export interface UserJourneyCreate {
  persona_id: string;
  name: string;
  stages: string[];
}

export interface ProductOkr {
  id: string;
  product_id: number;
  objective: string;
  key_results: string[];
}

export interface ProductOkrCreate {
  product_id: number;
  objective: string;
  key_results: string[];
}
