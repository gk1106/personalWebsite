import { formatPostDate } from "../../lib/formatDate";

interface ArticleMetaProps {
  date: string;
  readingTime: number;
  className?: string;
}

export function ArticleMeta({ date, readingTime, className = "" }: ArticleMetaProps) {
  return (
    <p className={`font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
      {formatPostDate(date)} · {readingTime} min read
    </p>
  );
}
