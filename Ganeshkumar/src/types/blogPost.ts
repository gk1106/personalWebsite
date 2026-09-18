export type BlogPostStatus = "draft" | "published";

/**
 * Structured content blocks for an article body. Deliberately not markdown —
 * plain data avoids pulling in a parser dependency for this first version.
 */
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; language?: string }
  | { type: "quote"; text: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date string, e.g. "2026-09-01". */
  date: string;
  /** Minutes. */
  readingTime: number;
  tags: string[];
  content: ArticleBlock[];
  featured: boolean;
  status: BlogPostStatus;
}
