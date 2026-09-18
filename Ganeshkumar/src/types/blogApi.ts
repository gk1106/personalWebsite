/**
 * Shapes returned by the Spring Boot public blog API (GET /api/blog,
 * GET /api/blog/{slug}). Kept separate from the frontend's own `BlogPost`
 * model so backend response shape changes don't leak into UI components —
 * blogService.ts is the only place that maps one to the other.
 */
export interface BlogPostApiResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  contentMarkdown: string;
  featured: boolean;
  readingTime: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
