// src/modules/discovery/services/discoveryApi.ts
import type { Hypothesis, Mvp, Persona, Problem } from "../types";

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

export async function getPersonas(): Promise<Persona[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/personas`);
  if (!response.ok) {
    throw new Error("Erro ao buscar personas");
  }
  return response.json();
}

export async function createPersona(data: {
  problem_id: string;
  name: string;
  context?: string;
  goal?: string;
  main_pain?: string;
}): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/discovery/personas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar persona");
  }

  return response.json();
}

export async function getHypotheses(): Promise<Hypothesis[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/hypotheses`);
  if (!response.ok) {
    throw new Error("Erro ao buscar hipóteses");
  }
  return response.json();
}

export async function createHypothesis(data: {
  problem_id: string;
  statement: string;
  metric?: string;
  success_criteria?: string;
}): Promise<Hypothesis> {
  const response = await fetch(`${API_BASE_URL}/discovery/hypotheses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar hipótese");
  }

  return response.json();
}

export async function getMvps(): Promise<Mvp[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/mvps`);
  if (!response.ok) {
    throw new Error("Erro ao buscar MVPs");
  }
  return response.json();
}

export async function createMvp(data: {
  hypothesis_id: string;
  description?: string;
  scope?: string;
}): Promise<Mvp> {
  const response = await fetch(`${API_BASE_URL}/discovery/mvps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar MVP");
  }

  return response.json();
}
