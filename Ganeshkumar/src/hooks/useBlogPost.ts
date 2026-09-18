import { useEffect, useState } from "react";
import { getBlogPost, BlogFetchError } from "../services/blogService";
import type { BlogPost } from "../types/blogPost";

export type BlogPostState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; error: BlogFetchError }
  | { status: "ready"; post: BlogPost };

/**
 * Fetches a single published post by slug. Distinguishes "doesn't exist"
 * (404, or a draft — the API can't tell those apart either) from a real
 * fetch failure, so callers never present a backend outage as "not found."
 */
export function useBlogPost(slug: string | undefined): BlogPostState {
  const [state, setState] = useState<BlogPostState>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "not-found" });
      return;
    }

    let active = true;
    setState({ status: "loading" });

    getBlogPost(slug)
      .then((post) => {
        if (!active) return;
        setState(post ? { status: "ready", post } : { status: "not-found" });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const error = err instanceof BlogFetchError ? err : new BlogFetchError("unexpected", "Something went wrong.");
        setState({ status: "error", error });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}
