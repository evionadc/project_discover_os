export interface Inception {
  id: string;
  workspace_id: number;
  type: string;
  title: string;
  description?: string | null;
  status?: string;
}

export interface InceptionCreate {
  workspace_id: number;
  type: string;
  title: string;
  description?: string | null;
}

export interface InceptionStep {
  id: string;
  inception_id: string;
  step_key: string;
  payload: Record<string, unknown>;
}
