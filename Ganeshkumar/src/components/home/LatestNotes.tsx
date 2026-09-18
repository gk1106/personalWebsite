import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { BlogPostCard } from "../blog/BlogPostCard";
import { useBlogPosts } from "../../hooks/useBlogPosts";

export function LatestNotes() {
  const state = useBlogPosts();
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  // Loading, a fetch error, and "no published posts yet" are all reasons to
  // simply omit this section from the homepage rather than show a partial
  // or broken widget — the full Blog page is where those states get a
  // proper UI.
  if (state.status !== "ready" || state.posts.length === 0) return null;

  const latest = state.posts.slice(0, 3);

  return (
    <section className="pb-24 lg:pb-32">
      <Container>
        <SectionHeading
          eyebrow="The Lab"
          title="Latest notes"
          description="Engineering notes on what I'm building and learning."
        />

        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.12 }}
        >
          {latest.map((post, index) => (
            <motion.div key={post.id} variants={item} whileHover={prefersReducedMotion ? undefined : { y: -4 }}>
              <BlogPostCard post={post} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
