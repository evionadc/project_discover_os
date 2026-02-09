const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function listFeatures() {
  const res = await fetch(`${API_URL}/delivery/features`);
  if (!res.ok) throw new Error("Failed to load features");
  return res.json();
}

export async function createFeature(data: {
  hypothesis_id?: string;
  mvp_id?: string;
  title: string;
  description?: string;
  business_value?: string;
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
