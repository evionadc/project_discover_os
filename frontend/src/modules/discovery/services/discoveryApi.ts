// src/modules/discovery/services/discoveryApi.ts
import type { Persona, Problem, ProductOkr, UserJourney } from "../types";

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

export async function getProblem(problemId: string): Promise<Problem> {
  const response = await fetch(`${API_BASE_URL}/discovery/problems/${problemId}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar problema");
  }
  return response.json();
}

export async function updateProblem(
  problemId: string,
  data: {
    workspace_id?: number;
    title?: string;
    description?: string;
    status?: string;
  }
): Promise<Problem> {
  const response = await fetch(`${API_BASE_URL}/discovery/problems/${problemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar problema");
  }

  return response.json();
}

export async function deleteProblem(problemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/discovery/problems/${problemId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erro ao excluir problema");
  }
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

export async function getPersona(personaId: string): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/discovery/personas/${personaId}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar persona");
  }
  return response.json();
}

export async function updatePersona(
  personaId: string,
  data: {
    problem_id?: string;
    name?: string;
    context?: string;
    goal?: string;
    main_pain?: string;
  }
): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/discovery/personas/${personaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar persona");
  }

  return response.json();
}

export async function deletePersona(personaId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/discovery/personas/${personaId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erro ao excluir persona");
  }
}

export async function getUserJourneys(): Promise<UserJourney[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/journeys`);
  if (!response.ok) {
    throw new Error("Erro ao buscar jornadas");
  }
  return response.json();
}

export async function createUserJourney(data: {
  persona_id: string;
  name: string;
  stages: string[];
}): Promise<UserJourney> {
  const response = await fetch(`${API_BASE_URL}/discovery/journeys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao criar jornada");
  }
  return response.json();
}

export async function updateUserJourney(
  journeyId: string,
  data: {
    persona_id?: string;
    name?: string;
    stages?: string[];
  }
): Promise<UserJourney> {
  const response = await fetch(`${API_BASE_URL}/discovery/journeys/${journeyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao atualizar jornada");
  }
  return response.json();
}

export async function deleteUserJourney(journeyId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/discovery/journeys/${journeyId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erro ao excluir jornada");
  }
}

export async function getProductOkrs(productId: number): Promise<ProductOkr[]> {
  const response = await fetch(`${API_BASE_URL}/discovery/okrs?product_id=${productId}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar OKRs");
  }
  return response.json();
}

export async function createProductOkr(data: {
  product_id: number;
  objective: string;
  key_results: string[];
}): Promise<ProductOkr> {
  const response = await fetch(`${API_BASE_URL}/discovery/okrs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao criar OKR");
  }
  return response.json();
}

export async function updateProductOkr(
  okrId: string,
  data: {
    product_id?: number;
    objective?: string;
    key_results?: string[];
  }
): Promise<ProductOkr> {
  const response = await fetch(`${API_BASE_URL}/discovery/okrs/${okrId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao atualizar OKR");
  }
  return response.json();
}

export async function deleteProductOkr(okrId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/discovery/okrs/${okrId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erro ao excluir OKR");
  }
}
