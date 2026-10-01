import type { ChatApiRequest, ChatApiResponse } from "../types/chatApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// AI responses (including tool-calling round trips) are slower than a plain
// DB read, so this is more generous than blogService's 8s — but still bounded,
// so a hung request fails into a retryable error instead of waiting forever.
const REQUEST_TIMEOUT_MS = 30000;
// Mirrors the backend's ChatRequest validation (@Size(max = 2000)).
export const CHAT_MESSAGE_MAX_LENGTH = 2000;

const UNAVAILABLE_MESSAGE =
  "Sorry, the portfolio assistant is temporarily unavailable. Please try again later.";

export type ChatFetchErrorKind = "network" | "client" | "server" | "unexpected";

/** Safe, user-facing chat failure. Never wraps or exposes a raw backend/OpenAI message. */
export class ChatFetchError extends Error {
  readonly kind: ChatFetchErrorKind;

  constructor(kind: ChatFetchErrorKind, message: string) {
    super(message);
    this.name = "ChatFetchError";
    this.kind = kind;
  }
}

/**
 * Calls the public portfolio chat endpoint. No admin JWT is ever attached —
 * this mirrors blogService's public GET pattern, just for a POST. The
 * backend is the only thing that ever talks to OpenAI; nothing here does.
 */
export async function sendChatMessage(message: string): Promise<string> {
  if (!API_BASE_URL) {
    throw new ChatFetchError(
      "unexpected",
      "The application is not configured correctly. Please try again later.",
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    const body: ChatApiRequest = { message };
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ChatFetchError(
        "network",
        "The portfolio assistant is taking longer than expected. Please try again.",
      );
    }
    throw new ChatFetchError("network", "Could not reach the portfolio assistant. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 400) {
    throw new ChatFetchError("client", "That message couldn't be sent — please rephrase and try again.");
  }

  if (!response.ok) {
    // Covers 503 (AI layer down) and any other non-2xx — same safe message
    // either way, never the backend's own error body.
    throw new ChatFetchError("server", UNAVAILABLE_MESSAGE);
  }

  let data: ChatApiResponse;
  try {
    data = (await response.json()) as ChatApiResponse;
  } catch {
    throw new ChatFetchError("unexpected", "Received an unexpected response from the portfolio assistant.");
  }

  if (typeof data.answer !== "string" || data.answer.trim() === "") {
    throw new ChatFetchError("unexpected", "Received an unexpected response from the portfolio assistant.");
  }

  return data.answer;
}
