import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteInception, listInceptions, publishInceptionProduct, upsertInceptionStep } from "./inceptionApi";

describe("inceptionApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("listInceptions appends type query param", async () => {
    const payload = [{ id: "1", type: "lean_inception", title: "Lean Inception" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listInceptions("lean_inception");

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/inceptions?type=lean_inception");
    expect(result).toEqual(payload);
  });

  it("upsertInceptionStep sends PUT with wrapped payload", async () => {
    const payload = { id: "1", step_key: "product_vision", payload: { key: "value" } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await upsertInceptionStep("abc", "product_vision", { key: "value" });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/inceptions/abc/steps/product_vision", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { key: "value" } }),
    });
    expect(result).toEqual(payload);
  });

  it("listInceptions throws on non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listInceptions()).rejects.toThrow("Failed to load inceptions");
  });

  it("deleteInception sends DELETE request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteInception("abc");

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/inceptions/abc", {
      method: "DELETE",
    });
  });

  it("publishInceptionProduct sends POST request", async () => {
    const payload = { product_id: 7, workspace_id: 1, name: "Produto A", blueprint_id: 3 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishInceptionProduct("abc", { name: "Produto A" });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/inceptions/abc/publish-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Produto A" }),
    });
    expect(result).toEqual(payload);
  });
});
