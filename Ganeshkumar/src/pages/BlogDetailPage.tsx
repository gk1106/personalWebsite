import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useBlogPost } from "../hooks/useBlogPost";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { Container } from "../components/ui/Container";
import { GlassPanel } from "../components/ui/GlassPanel";
import { ArticleLayout } from "../components/blog/ArticleLayout";
import { ArticleHeader } from "../components/blog/ArticleHeader";
import { ArticleContent } from "../components/blog/ArticleContent";
import { BlogErrorState } from "../components/blog/BlogErrorState";
import { NotFoundPage } from "./NotFoundPage";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const state = useBlogPost(slug);
  const prefersReducedMotion = useReducedMotion();

  useDocumentMeta({
    title: state.status === "ready" ? `${state.post.title} — GaneshKumar (GK)` : "GaneshKumar (GK)",
    description: state.status === "ready" ? state.post.excerpt : undefined,
  });

  if (state.status === "loading") {
    return (
      <Container narrow className="py-20 lg:py-28">
        <GlassPanel className="p-6 text-sm text-muted-foreground">Loading note…</GlassPanel>
      </Container>
    );
  }

  // A backend outage is a distinct state from "this note doesn't exist" —
  // never route a network/server failure through NotFoundPage.
  if (state.status === "error") {
    return (
      <Container narrow className="py-20 lg:py-28">
        <BlogErrorState error={state.error} />
      </Container>
    );
  }

  if (state.status === "not-found") return <NotFoundPage />;

  const { post } = state;

  return (
    <ArticleLayout>
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" }}
      >
        <ArticleHeader post={post} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : 0.5,
          ease: "easeOut",
          delay: prefersReducedMotion ? 0 : 0.1,
        }}
      >
        <ArticleContent blocks={post.content} />
      </motion.div>
    </ArticleLayout>
  );
}
