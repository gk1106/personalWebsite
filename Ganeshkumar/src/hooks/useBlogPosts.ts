import { useEffect, useState } from "react";
import { getBlogPosts, BlogFetchError } from "../services/blogService";
import type { BlogPost } from "../types/blogPost";

export type BlogPostsState =
  | { status: "loading" }
  | { status: "error"; error: BlogFetchError }
  | { status: "ready"; posts: BlogPost[] };

/** Fetches the published post list once on mount. Empty `posts` is a valid, non-error state. */
export function useBlogPosts(): BlogPostsState {
  const [state, setState] = useState<BlogPostsState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    getBlogPosts()
      .then((posts) => {
        if (active) setState({ status: "ready", posts });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const error = err instanceof BlogFetchError ? err : new BlogFetchError("unexpected", "Something went wrong.");
        setState({ status: "error", error });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
