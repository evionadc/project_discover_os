const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function listFeatures(productId?: number) {
  const query = productId ? `?product_id=${productId}` : "";
  const res = await fetch(`${API_URL}/delivery/features${query}`);
  if (!res.ok) throw new Error("Failed to load features");
  return res.json();
}

export async function createFeature(data: {
  product_id: number;
  persona_id?: string;
  journey_id?: string;
  title: string;
  description?: string;
  complexity: "low" | "medium" | "high";
  business_estimate?: number;
  effort_estimate?: number;
  ux_estimate?: number;
  status?: "todo" | "doing" | "done";
}) {
  const res = await fetch(`${API_URL}/delivery/features`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create feature");
  return res.json();
}

export async function updateFeature(
  featureId: string,
  data: {
    persona_id?: string | null;
    journey_id?: string | null;
    title?: string;
    description?: string;
    complexity?: "low" | "medium" | "high";
    business_estimate?: number;
    effort_estimate?: number;
    ux_estimate?: number;
    status?: "todo" | "doing" | "done";
  }
) {
  const res = await fetch(`${API_URL}/delivery/features/${featureId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update feature");
  return res.json();
}

export async function deleteFeature(featureId: string) {
  const res = await fetch(`${API_URL}/delivery/features/${featureId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete feature");
}

export async function importFeaturesFromInception(data: {
  product_id: number;
  inception_id?: string;
  overwrite_existing?: boolean;
}) {
  const res = await fetch(`${API_URL}/delivery/features/import-from-inception`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to import features from Lean Inception");
  return res.json() as Promise<{ imported_count: number; skipped_count: number }>;
}

export async function listStories() {
  const res = await fetch(`${API_URL}/delivery/stories`);
  if (!res.ok) throw new Error("Failed to load stories");
  return res.json();
}

export async function createStory(data: {
  feature_id?: string;
  workspace_id?: number;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  estimate?: number;
}) {
  const res = await fetch(`${API_URL}/delivery/stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create story");
  return res.json();
}

export async function updateStory(
  storyId: string,
  data: {
    feature_id?: string | null;
    workspace_id?: number | null;
    title?: string;
    description?: string;
    acceptance_criteria?: string;
    estimate?: number;
    status?: string;
  }
) {
  const res = await fetch(`${API_URL}/delivery/stories/${storyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update story");
  return res.json();
}

export async function deleteStory(storyId: string) {
  const res = await fetch(`${API_URL}/delivery/stories/${storyId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete story");
}
