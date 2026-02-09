export interface Feature {
  id: string;
  title: string;
  description?: string | null;
  business_value?: string | null;
  status?: string;
  hypothesis_id?: string | null;
  mvp_id?: string | null;
}

export interface FeatureCreate {
  hypothesis_id?: string | null;
  mvp_id?: string | null;
  title: string;
  description?: string | null;
  business_value?: string | null;
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
}
