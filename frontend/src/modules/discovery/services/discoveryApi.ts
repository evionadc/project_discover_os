// src/modules/discovery/services/discoveryApi.ts
import type { Problem } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getProblems(): Promise<Problem[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/problems`);
  if (!response.ok) {
    throw new Error("Erro ao buscar problemas");
  }
  return response.json();
}

export async function createProblem(data: {
  title: string;
  description?: string;
  persona?: string;
}): Promise<Problem> {
  const response = await fetch(`${API_BASE_URL}/discovery/problems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar problema");
  }

  return response.json();
}