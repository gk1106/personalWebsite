import type { ReactNode } from "react";

const INLINE_PATTERN = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Minimal inline formatting for article text: `code` and [label](url) links.
 * Intentionally not a markdown parser — just enough for this content model.
 */
export function parseInlineText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const href = match[3];
      const isExternal = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={key++}
          href={href}
          className="text-primary underline underline-offset-2 hover:text-secondary"
          {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {match[2]}
        </a>,
      );
    }

    lastIndex = INLINE_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
