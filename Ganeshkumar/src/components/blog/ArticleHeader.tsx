import type { BlogPost } from "../../types/blogPost";
import { ArticleMeta } from "./ArticleMeta";
import { DraftBadge } from "./DraftBadge";

interface ArticleHeaderProps {
  post: BlogPost;
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
          {post.category}
        </span>
        {post.status === "draft" && <DraftBadge />}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{post.title}</h1>

      <ArticleMeta date={post.date} readingTime={post.readingTime} />

      {post.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
