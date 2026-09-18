import type { BlogPost, BlogPostStatus } from "../types/blogPost";
import type { BlogPostApiResponse, PageResponse } from "../types/blogApi";
import { markdownToBlocks } from "../lib/markdownToBlocks";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 8000;
const PUBLIC_PAGE_SIZE = 10;

export type BlogFetchErrorKind = "network" | "server" | "unexpected";

/**
 * Thrown for anything other than "the resource legitimately doesn't exist" —
 * backend unreachable, a 5xx, a malformed response, or missing config.
 * Callers must not present this as "not found."
 */
export class BlogFetchError extends Error {
  readonly kind: BlogFetchErrorKind;

  constructor(kind: BlogFetchErrorKind, message: string) {
    super(message);
    this.name = "BlogFetchError";
    this.kind = kind;
  }
}

interface FetchResult<T> {
  status: number;
  data: T | null;
}

/** GET-only fetch wrapper: no admin JWT is ever attached — these are public endpoints. */
async function fetchJson<T>(path: string): Promise<FetchResult<T>> {
  if (!API_BASE_URL) {
    throw new BlogFetchError("unexpected", "VITE_API_BASE_URL is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new BlogFetchError("network", "The request to the backend timed out.");
    }
    throw new BlogFetchError("network", "Could not reach the backend.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 404) {
    return { status: 404, data: null };
  }

  if (response.status >= 500) {
    throw new BlogFetchError("server", `Backend returned ${response.status}.`);
  }

  if (!response.ok) {
    throw new BlogFetchError("unexpected", `Unexpected response: ${response.status}.`);
  }

  try {
    const data = (await response.json()) as T;
    return { status: response.status, data };
  } catch {
    throw new BlogFetchError("unexpected", "Received a malformed response from the backend.");
  }
}

function toBlogPost(api: BlogPostApiResponse): BlogPost {
  // The public API only ever returns published posts, so this is always true
  // for anything this mapping sees.
  const status: BlogPostStatus = "published";

  return {
    id: String(api.id),
    slug: api.slug,
    title: api.title,
    excerpt: api.excerpt ?? "",
    category: api.category,
    date: api.publishedAt ?? api.createdAt,
    readingTime: api.readingTime ?? 1,
    tags: [], // not modeled by the backend yet
    content: markdownToBlocks(api.contentMarkdown ?? ""),
    featured: api.featured,
    status,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data } = await fetchJson<PageResponse<BlogPostApiResponse>>(
    `/api/blog?page=0&size=${PUBLIC_PAGE_SIZE}`,
  );
  return (data?.content ?? []).map(toBlogPost);
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const { status, data } = await fetchJson<BlogPostApiResponse>(`/api/blog/${encodeURIComponent(slug)}`);
  if (status === 404 || !data) return undefined;
  return toBlogPost(data);
}
