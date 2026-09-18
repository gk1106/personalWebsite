import { Link } from "react-router-dom";

export function BackToBlog() {
  return (
    <Link
      to="/blog"
      className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <span aria-hidden="true">←</span> Back to notes
    </Link>
  );
}
