const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function listInceptions(type?: string) {
  const url = type ? `${API_URL}/inceptions?type=${encodeURIComponent(type)}` : `${API_URL}/inceptions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load inceptions");
  return res.json();
}

export async function createInception(data: {
  workspace_id: number;
  type: string;
  title: string;
  description?: string;
}) {
  const res = await fetch(`${API_URL}/inceptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create inception");
  return res.json();
}

export async function listInceptionSteps(inceptionId: string) {
  const res = await fetch(`${API_URL}/inceptions/${inceptionId}/steps`);
  if (!res.ok) throw new Error("Failed to load inception steps");
  return res.json();
}

export async function upsertInceptionStep(inceptionId: string, stepKey: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/inceptions/${inceptionId}/steps/${stepKey}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload }),
  });
  if (!res.ok) throw new Error("Failed to save step");
  return res.json();
}
