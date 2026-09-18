/** Visible marker for demo/draft notes so they never read as published writing. */
export function DraftBadge() {
  return (
    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
      Draft
    </span>
  );
}
