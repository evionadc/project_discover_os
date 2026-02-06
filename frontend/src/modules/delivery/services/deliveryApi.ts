const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function listFeatures() {
  const res = await fetch(`${API_URL}/delivery/features`);
  if (!res.ok) throw new Error("Failed to load features");
  return res.json();
}
