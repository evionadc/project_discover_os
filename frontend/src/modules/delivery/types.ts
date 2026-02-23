export interface Feature {
  id: string;
  product_id?: number | null;
  persona_id?: string | null;
  journey_id?: string | null;
  title: string;
  description?: string | null;
  complexity: "low" | "medium" | "high";
  business_estimate?: number | null;
  effort_estimate?: number | null;
  ux_estimate?: number | null;
  status?: string;
}

export interface FeatureCreate {
  product_id: number;
  persona_id?: string | null;
  journey_id?: string | null;
  title: string;
  description?: string | null;
  complexity: "low" | "medium" | "high";
  business_estimate?: number | null;
  effort_estimate?: number | null;
  ux_estimate?: number | null;
  status?: "todo" | "doing" | "done";
}

export interface Story {
  id: string;
  title: string;
  description?: string | null;
  acceptance_criteria?: string | null;
  estimate?: number | null;
  status?: string;
  feature_id?: string | null;
  workspace_id?: number | null;
}

export interface StoryCreate {
  feature_id?: string | null;
  workspace_id?: number | null;
  title: string;
  description?: string | null;
  acceptance_criteria?: string | null;
  estimate?: number | null;
  status?: "todo" | "doing" | "done";
}
