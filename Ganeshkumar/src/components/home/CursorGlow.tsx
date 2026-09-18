import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Barely-visible glow that tracks the pointer over its parent. Skipped for
 * reduced-motion users and on coarse (touch) pointers where it has no meaning.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = parent.getBoundingClientRect();
        el.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
        el.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
        el.style.opacity = "1";
      });
    };
    const handleLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", handleMove);
    parent.addEventListener("pointerleave", handleLeave);
    return () => {
      parent.removeEventListener("pointermove", handleMove);
      parent.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(227, 178, 60, 0.06), transparent 70%)",
      }}
    />
  );
}
