/**
 * Shapes for the authenticated /api/admin/blog/** API. Kept separate from
 * the public blogApi.ts types — the admin DTO includes `status`, which the
 * public one deliberately omits. PageResponse<T> is shared as-is from
 * blogApi.ts since the pagination envelope is identical either way.
 */
export type AdminPostStatus = "DRAFT" | "PUBLISHED";

export interface AdminBlogPostApiResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  contentMarkdown: string;
  status: AdminPostStatus;
  featured: boolean;
  readingTime: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Body for POST /api/admin/blog and PUT /api/admin/blog/{id} — identical
 * shape on the backend. `status` is included because the backend requires
 * it, but the editor UI only ever sets it to the post's own current status
 * (for updates) or to a value the user explicitly chose via "Save as draft"
 * / "Publish" (for new posts) — never an arbitrary status picker.
 */
export interface BlogPostCreateRequest {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  contentMarkdown: string;
  featured: boolean;
  readingTime: number | null;
  status: AdminPostStatus;
}

export type BlogPostUpdateRequest = BlogPostCreateRequest;
