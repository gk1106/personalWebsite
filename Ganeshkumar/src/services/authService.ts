import type { LoginRequest, LoginResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 8000;

/** Tab-scoped on purpose — sessionStorage, never localStorage (see task security requirements). */
const TOKEN_KEY = "gk_admin_token";

/** Safe, user-facing auth failure. Never wraps or exposes a raw backend message beyond a fixed set of known cases. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Logs in against the real backend and stores the JWT in sessionStorage.
 * Never logs the username, password, or resulting token.
 */
export async function login(username: string, password: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new AuthError("The application is not configured correctly. Please try again later.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    const body: LoginRequest = { username, password };
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new AuthError("Could not reach the backend. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    throw new AuthError("Incorrect username or password.");
  }

  if (!response.ok) {
    throw new AuthError("Something went wrong while signing in. Please try again.");
  }

  let data: LoginResponse;
  try {
    data = (await response.json()) as LoginResponse;
  } catch {
    throw new AuthError("Received an unexpected response from the backend.");
  }

  sessionStorage.setItem(TOKEN_KEY, data.accessToken);
}

export function logout(): void {
  clearToken();
}
