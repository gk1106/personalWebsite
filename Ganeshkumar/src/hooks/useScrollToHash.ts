import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the element matching the current URL hash whenever it changes.
 * behavior: "auto" (scrollIntoView's default) defers to the CSS
 * scroll-behavior property, which is smooth by default and neutralized
 * under prefers-reduced-motion.
 */
export function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView({ block: "start" });
  }, [hash]);
}
