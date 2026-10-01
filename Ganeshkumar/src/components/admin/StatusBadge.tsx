import type { AdminPostStatus } from "../../types/adminBlogApi";

interface StatusBadgeProps {
  status: AdminPostStatus;
}

/** Distinguishes DRAFT/PUBLISHED by label + dot, never by color alone. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${
        isPublished ? "border-primary/40 bg-primary/10 text-primary" : "border-border-strong bg-surface text-muted-foreground"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-primary" : "bg-muted-foreground"}`}
      />
      {status}
    </span>
  );
}
