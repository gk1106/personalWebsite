import type { PageResponse } from "../types/blogApi";
import type {
  AdminBlogPostApiResponse,
  BlogPostCreateRequest,
  BlogPostUpdateRequest,
} from "../types/adminBlogApi";
import { getToken, clearToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 8000;

export type AdminApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "validation"
  | "network"
  | "server"
  | "unexpected";

/**
 * Every kind maps to a message that is always safe to show directly to the
 * admin — for "validation"/"conflict" that message comes from the backend's
 * own ApiError.message (bean-validation text or the fixed slug-conflict
 * copy), never a stack trace or SQL detail.
 */
export class AdminApiError extends Error {
  readonly kind: AdminApiErrorKind;

  constructor(kind: AdminApiErrorKind, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.kind = kind;
  }
}

interface BackendApiErrorBody {
  message?: string;
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * The single authenticated fetch path for every /api/admin/** call.
 * Always attaches `Authorization: Bearer <token>` — never used for public
 * blog requests (those go through blogService.ts, which never imports this
 * file). On 401 the stored token is cleared immediately so a stale/expired
 * session can't linger.
 */
async function adminRequest(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE_URL) {
    throw new AdminApiError("unexpected", "VITE_API_BASE_URL is not configured.");
  }

  const token = getToken();
  if (!token) {
    throw new AdminApiError("unauthorized", "You are not signed in.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AdminApiError("network", "The request to the backend timed out.");
    }
    throw new AdminApiError("network", "Could not reach the backend.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    clearToken();
    throw new AdminApiError("unauthorized", "Your session has expired. Please sign in again.");
  }

  if (response.status === 403) {
    throw new AdminApiError("forbidden", "You do not have permission to perform this action.");
  }

  if (response.status === 404) {
    throw new AdminApiError("not-found", "This post could not be found.");
  }

  if (response.status === 409) {
    // The only 409 source in this API is a duplicate slug on create/update.
    throw new AdminApiError("conflict", "This slug is already in use. Please choose another.");
  }

  if (response.status === 400) {
    const body = await safeJson<BackendApiErrorBody>(response);
    throw new AdminApiError("validation", body?.message || "Please check the form and try again.");
  }

  if (response.status >= 500) {
    throw new AdminApiError("server", "The backend hit an unexpected error. Please try again shortly.");
  }

  if (!response.ok) {
    throw new AdminApiError("unexpected", `Unexpected response: ${response.status}.`);
  }

  return response;
}

async function adminRequestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await adminRequest(path, init);
  const data = await safeJson<T>(response);
  if (data === null) {
    throw new AdminApiError("unexpected", "Received a malformed response from the backend.");
  }
  return data;
}

export async function getAdminPosts(page: number, size: number): Promise<PageResponse<AdminBlogPostApiResponse>> {
  return adminRequestJson(`/api/admin/blog?page=${page}&size=${size}`);
}

export async function getAdminPost(id: number): Promise<AdminBlogPostApiResponse> {
  return adminRequestJson(`/api/admin/blog/${id}`);
}

export async function createPost(payload: BlogPostCreateRequest): Promise<AdminBlogPostApiResponse> {
  return adminRequestJson(`/api/admin/blog`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePost(id: number, payload: BlogPostUpdateRequest): Promise<AdminBlogPostApiResponse> {
  return adminRequestJson(`/api/admin/blog/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePost(id: number): Promise<void> {
  await adminRequest(`/api/admin/blog/${id}`, { method: "DELETE" });
}

export async function publishPost(id: number): Promise<AdminBlogPostApiResponse> {
  return adminRequestJson(`/api/admin/blog/${id}/publish`, { method: "PATCH" });
}

export async function draftPost(id: number): Promise<AdminBlogPostApiResponse> {
  return adminRequestJson(`/api/admin/blog/${id}/draft`, { method: "PATCH" });
}
