import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createProblem,
  createProductOkr,
  deletePersona,
  deleteProblem,
  deleteProductOkr,
  getProductOkrs,
  getProblems,
  updateProductOkr,
  updatePersona,
  updateProblem,
} from "./discoveryApi";

describe("discoveryApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("getProblems calls discovery endpoint and returns payload", async () => {
    const payload = [{ id: "1", title: "P1", workspace_id: 1, status: "open" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getProblems();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/problems");
    expect(result).toEqual(payload);
  });

  it("createProblem sends POST with JSON body", async () => {
    const payload = { id: "1", title: "P1", workspace_id: 1, status: "open" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { workspace_id: 1, title: "P1", description: "D1" };
    const result = await createProblem(data);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("getProblems throws when response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getProblems()).rejects.toThrow("Erro ao buscar problemas");
  });

  it("updatePersona sends PUT with JSON body", async () => {
    const payload = { id: "p1", problem_id: "pr1", name: "Persona 1" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { name: "Persona atualizada" };
    const result = await updatePersona("p1", data);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/personas/p1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("deletePersona sends DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deletePersona("p1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/personas/p1", {
      method: "DELETE",
    });
  });

  it("updateProblem sends PUT with JSON body", async () => {
    const payload = { id: "pr1", workspace_id: 1, title: "Problema", status: "open" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { title: "Problema atualizado", status: "validated" };
    const result = await updateProblem("pr1", data);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/problems/pr1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("deleteProblem sends DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteProblem("pr1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/problems/pr1", {
      method: "DELETE",
    });
  });

  it("getProductOkrs calls endpoint with product_id", async () => {
    const payload = [{ id: "o1", product_id: 1, objective: "Obj", key_results: [] }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getProductOkrs(1);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/okrs?product_id=1");
    expect(result).toEqual(payload);
  });

  it("createProductOkr sends POST", async () => {
    const payload = { id: "o1", product_id: 1, objective: "Obj", key_results: ["KR1"] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { product_id: 1, objective: "Obj", key_results: ["KR1"] };
    const result = await createProductOkr(data);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("updateProductOkr sends PUT", async () => {
    const payload = { id: "o1", product_id: 1, objective: "Obj2", key_results: ["KR1"] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = { objective: "Obj2", key_results: ["KR1"] };
    const result = await updateProductOkr("o1", data);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/okrs/o1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it("deleteProductOkr sends DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteProductOkr("o1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/discovery/okrs/o1", {
      method: "DELETE",
    });
  });
});
