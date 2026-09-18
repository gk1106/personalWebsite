import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets document title and description/OG meta tags for the current page. No canonical/social URLs are set. */
export function useDocumentMeta({ title, description }: DocumentMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:title", title);
      upsertMeta("property", "og:description", description);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
