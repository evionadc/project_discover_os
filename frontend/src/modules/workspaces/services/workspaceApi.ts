const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export interface WorkspaceMember {
  workspace_id: number;
  user_id: number;
  created_at: string;
}

export interface WorkspaceProduct {
  id: number;
  workspace_id: number;
  name: string;
  description?: string | null;
  status: string;
  created_at: string;
}

export interface WorkspaceProductDetail extends WorkspaceProduct {
  vision?: string | null;
  boundaries?: {
    is?: string[];
    is_not?: string[];
    does?: string[];
    does_not?: string[];
  } | null;
}

export async function listWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`);
  if (!res.ok) throw new Error("Failed to load workspace members");
  return res.json();
}

export async function addWorkspaceMember(workspaceId: number, userId: number): Promise<WorkspaceMember> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to add workspace member");
  return res.json();
}

export async function listWorkspaceProducts(workspaceId: number): Promise<WorkspaceProduct[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/products`);
  if (!res.ok) throw new Error("Failed to load workspace products");
  return res.json();
}

export async function createWorkspaceProduct(
  workspaceId: number,
  data: { name: string; description?: string; status?: string }
): Promise<WorkspaceProduct> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create workspace product");
  return res.json();
}

export async function getWorkspaceProduct(workspaceId: number, productId: number): Promise<WorkspaceProductDetail> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/products/${productId}`);
  if (!res.ok) throw new Error("Failed to load workspace product");
  return res.json();
}

export async function updateWorkspaceProduct(
  workspaceId: number,
  productId: number,
  data: {
    name?: string;
    vision?: string;
    boundaries?: {
      is?: string[];
      is_not?: string[];
      does?: string[];
      does_not?: string[];
    };
  }
): Promise<WorkspaceProductDetail> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update workspace product");
  return res.json();
}
