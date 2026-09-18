import { Link } from "react-router-dom";
import { GlassPanel } from "../ui/GlassPanel";
import { DraftBadge } from "./DraftBadge";
import { formatPostDate } from "../../lib/formatDate";
import type { BlogPost } from "../../types/blogPost";

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
  featured?: boolean;
}

export function BlogPostCard({ post, index, featured = false }: BlogPostCardProps) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full rounded-panel">
      <GlassPanel
        className={`flex h-full flex-col justify-between gap-6 transition-colors duration-300 group-hover:border-secondary/40 group-focus-visible:border-secondary/40 ${
          featured ? "gap-10 p-8 sm:p-10" : "p-6"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-sm text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            {post.status === "draft" && <DraftBadge />}
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
              {post.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3
            className={
              featured
                ? "text-2xl font-semibold text-foreground sm:text-3xl"
                : "text-xl font-semibold text-foreground"
            }
          >
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground sm:text-base">{post.excerpt}</p>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {formatPostDate(post.date)} · {post.readingTime} min read
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-transform duration-300 group-hover:translate-x-1">
            Read note <span aria-hidden="true">→</span>
          </span>
        </div>
      </GlassPanel>
    </Link>
  );
}
