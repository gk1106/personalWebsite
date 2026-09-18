import { motion, useReducedMotion, type Variants } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { BlogPostCard } from "./BlogPostCard";
import type { BlogPost } from "../../types/blogPost";

interface BlogPostListProps {
  posts: BlogPost[];
}

export function BlogPostList({ posts }: BlogPostListProps) {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  if (posts.length === 0) {
    return (
      <GlassPanel className="flex flex-col gap-2 p-6 text-sm">
        <p className="font-semibold text-foreground">Notes are being prepared.</p>
        <p className="text-muted-foreground">Technical articles will appear here as they are published.</p>
      </GlassPanel>
    );
  }

  const indexed = posts.map((post, index) => ({ post, index }));
  const featuredEntry = indexed.find((entry) => entry.post.featured);
  const restEntries = featuredEntry ? indexed.filter((entry) => entry !== featuredEntry) : indexed;

  return (
    <div className="flex flex-col gap-14">
      {featuredEntry && (
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={item}>
          <BlogPostCard post={featuredEntry.post} index={featuredEntry.index} featured />
        </motion.div>
      )}

      {restEntries.length > 0 && (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.1 }}
        >
          {restEntries.map(({ post, index }) => (
            <motion.div key={post.id} variants={item}>
              <BlogPostCard post={post} index={index} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
