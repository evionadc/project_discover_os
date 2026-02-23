import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addWorkspaceMember,
  createWorkspaceProduct,
  getWorkspaceProduct,
  listWorkspaceMembers,
  listWorkspaceProducts,
  updateWorkspaceProduct,
} from "./workspaceApi";

describe("workspaceApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("listWorkspaceMembers calls API endpoint", async () => {
    const payload = [{ workspace_id: 1, user_id: 2, created_at: "2026-01-01T00:00:00Z" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listWorkspaceMembers(1);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/workspaces/1/members");
    expect(result).toEqual(payload);
  });

  it("addWorkspaceMember sends POST with user_id", async () => {
    const payload = { workspace_id: 1, user_id: 2, created_at: "2026-01-01T00:00:00Z" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await addWorkspaceMember(1, 2);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/workspaces/1/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 2 }),
    });
    expect(result).toEqual(payload);
  });

  it("createWorkspaceProduct sends POST with product payload", async () => {
    const payload = {
      id: 1,
      workspace_id: 1,
      name: "Produto A",
      description: "Desc",
      status: "active",
      created_at: "2026-01-01T00:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { name: "Produto A", description: "Desc" };
    const result = await createWorkspaceProduct(1, data);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/workspaces/1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("listWorkspaceProducts throws on error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listWorkspaceProducts(1)).rejects.toThrow("Failed to load workspace products");
  });

  it("getWorkspaceProduct calls detail endpoint", async () => {
    const payload = {
      id: 1,
      workspace_id: 1,
      name: "Produto A",
      description: "Desc",
      vision: "Visao",
      status: "active",
      created_at: "2026-01-01T00:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getWorkspaceProduct(1, 1);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/workspaces/1/products/1");
    expect(result).toEqual(payload);
  });

  it("updateWorkspaceProduct sends PUT payload", async () => {
    const payload = {
      id: 1,
      workspace_id: 1,
      name: "Produto B",
      description: "Desc 2",
      vision: "Visao 2",
      status: "active",
      created_at: "2026-01-01T00:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    const body = { name: "Produto B", vision: "Visao 2" };
    const result = await updateWorkspaceProduct(1, 1, body);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/workspaces/1/products/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(result).toEqual(payload);
  });
});
