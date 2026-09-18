import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Plain BrowserRouter doesn't reset scroll position on navigation. Without
 * this, navigating from a deeply-scrolled page (e.g. Work) to another route
 * renders it already scrolled down. Skips when a hash is present so the
 * page's own `useScrollToHash` effect can handle it instead.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
