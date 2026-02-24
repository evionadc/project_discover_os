const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Email ou senha invalidos");
  }
  return response.json();
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (response.status === 409) {
    throw new Error("Este email ja esta cadastrado");
  }
  if (!response.ok) {
    throw new Error("Nao foi possivel criar a conta");
  }
  return response.json();
}
