import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlassPanel } from "../components/ui/GlassPanel";
import { blogPosts } from "../data/blogPosts";

export function BlogPage() {
  return (
    <Container className="flex flex-col gap-10 py-24">
      <SectionHeading
        eyebrow="Writing"
        title="Blog"
        description="Posts will be served from a Spring Boot backend in a later phase."
      />
      {blogPosts.length === 0 ? (
        <GlassPanel className="p-6 text-sm text-muted-foreground">
          No posts published yet.
        </GlassPanel>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <GlassPanel key={post.id} className="flex flex-col gap-2 p-6">
              <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </GlassPanel>
          ))}
        </div>
      )}
    </Container>
  );
}
