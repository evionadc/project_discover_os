import { afterEach, describe, expect, it, vi } from "vitest";

import { createFeature, importFeaturesFromInception, listFeatures } from "./deliveryApi";

describe("deliveryApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("listFeatures calls delivery endpoint", async () => {
    const payload = [{ id: "1", title: "F1", status: "draft" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listFeatures();

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/delivery/features");
    expect(result).toEqual(payload);
  });

  it("createFeature sends POST body", async () => {
    const payload = { id: "1", title: "F1", status: "todo" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = {
      product_id: 7,
      title: "F1",
      description: "Feature description",
      complexity: "medium" as const,
      business_estimate: 2,
      effort_estimate: 1,
      ux_estimate: 3,
      status: "todo" as const,
    };
    const result = await createFeature(data);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/delivery/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("listFeatures throws on error response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listFeatures()).rejects.toThrow("Failed to load features");
  });

  it("importFeaturesFromInception sends POST body", async () => {
    const payload = { imported_count: 3, skipped_count: 1 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { product_id: 7, overwrite_existing: false };
    const result = await importFeaturesFromInception(data);

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/delivery/features/import-from-inception", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });
});
