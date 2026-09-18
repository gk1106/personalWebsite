import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlassPanel } from "../components/ui/GlassPanel";
import { BlogPostList } from "../components/blog/BlogPostList";
import { BlogErrorState } from "../components/blog/BlogErrorState";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function BlogPage() {
  const state = useBlogPosts();

  useDocumentMeta({
    title: "The Lab — GaneshKumar (GK)",
    description: "Engineering notes on Java, Spring Boot, React, distributed systems and AI engineering.",
  });

  return (
    <Container className="flex flex-col gap-16 py-20 lg:py-28">
      <SectionHeading
        level="h1"
        eyebrow="The Lab"
        title="Things I'm learning, building and exploring."
        description="Notes on Java, Spring Boot, React, distributed systems and AI engineering."
      />
      {state.status === "loading" && (
        <GlassPanel className="p-6 text-sm text-muted-foreground">Loading notes…</GlassPanel>
      )}
      {state.status === "error" && <BlogErrorState error={state.error} />}
      {state.status === "ready" && <BlogPostList posts={state.posts} />}
    </Container>
  );
}
