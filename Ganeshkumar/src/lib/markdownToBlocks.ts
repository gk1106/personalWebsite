import type { ArticleBlock } from "../types/blogPost";

/**
 * Minimal markdown → ArticleBlock[] converter. The backend stores post
 * bodies as a single markdown string (`contentMarkdown`), but ArticleContent
 * renders structured blocks — this bridges the two without pulling in a
 * markdown library, covering just the subset ArticleBlock supports:
 * headings, paragraphs, ordered/unordered lists, fenced code, blockquotes.
 * Inline formatting (`code`, [links](url)) is handled separately by
 * parseInlineText at render time.
 */
export function markdownToBlocks(markdown: string): ArticleBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: { items: string[]; ordered: boolean } | null = null;

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer) {
      blocks.push({ type: "list", items: listBuffer.items, ordered: listBuffer.ordered });
      listBuffer = null;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      i++;
      continue;
    }

    const fenceMatch = /^```(\w+)?$/.exec(trimmed);
    if (fenceMatch) {
      flushParagraph();
      flushList();
      const language = fenceMatch[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "```") {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", code: codeLines.join("\n"), language });
      i++; // skip closing fence
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length <= 2 ? 2 : 3,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(trimmed);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: quoteMatch[1].trim() });
      i++;
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.*)$/.exec(trimmed);
    const orderedMatch = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      const ordered = orderedMatch !== null;
      const text = (unorderedMatch ?? orderedMatch)![1].trim();
      if (!listBuffer || listBuffer.ordered !== ordered) {
        flushList();
        listBuffer = { items: [], ordered };
      }
      listBuffer.items.push(text);
      i++;
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
    i++;
  }

  flushParagraph();
  flushList();

  return blocks;
}
