const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function listInceptions(type?: string, includeArchived = false) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (includeArchived) params.set("include_archived", "true");
  const qs = params.toString();
  const url = qs ? `${API_URL}/inceptions?${qs}` : `${API_URL}/inceptions`;
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

export async function deleteInception(inceptionId: string) {
  const res = await fetch(`${API_URL}/inceptions/${inceptionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete inception");
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

export async function publishInceptionProduct(inceptionId: string, data?: { name?: string }) {
  const res = await fetch(`${API_URL}/inceptions/${inceptionId}/publish-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data ?? {}),
  });
  if (!res.ok) throw new Error("Failed to publish product from inception");
  return res.json() as Promise<{
    product_id: number;
    workspace_id: number;
    name: string;
    blueprint_id: number;
  }>;
}
