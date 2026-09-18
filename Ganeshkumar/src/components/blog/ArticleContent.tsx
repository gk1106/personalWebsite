import type { ArticleBlock } from "../../types/blogPost";
import { parseInlineText } from "../../lib/parseInlineText";
import { CodeBlock } from "./CodeBlock";

interface ArticleContentProps {
  blocks: ArticleBlock[];
}

export function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className="flex flex-col gap-6 text-base leading-relaxed text-foreground sm:text-lg sm:leading-loose">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2
                key={index}
                className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                {block.text}
              </h2>
            ) : (
              <h3
                key={index}
                className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {block.text}
              </h3>
            );

          case "paragraph":
            return <p key={index}>{parseInlineText(block.text)}</p>;

          case "list":
            return block.ordered ? (
              <ol key={index} className="flex list-decimal flex-col gap-2 pl-6">
                {block.items.map((item, i) => (
                  <li key={i}>{parseInlineText(item)}</li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="flex list-disc flex-col gap-2 pl-6">
                {block.items.map((item, i) => (
                  <li key={i}>{parseInlineText(item)}</li>
                ))}
              </ul>
            );

          case "code":
            return <CodeBlock key={index} code={block.code} language={block.language} />;

          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-primary/50 pl-5 text-muted-foreground italic"
              >
                {parseInlineText(block.text)}
              </blockquote>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
