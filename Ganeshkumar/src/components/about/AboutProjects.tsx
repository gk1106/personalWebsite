import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { projects } from "../../data/projects";

export function AboutProjects() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.4, ease: "easeOut" } },
  };

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow="What I Build"
          title="Selected engineering work."
          description="A closer look at each lives on the Work page."
        />

        <motion.div
          className="mt-10 flex flex-col divide-y divide-border"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.08 }}
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={item}>
              <Link
                to={`/work#${project.slug}`}
                className="group flex items-center justify-between gap-6 py-6"
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
                    {project.category}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground transition-colors duration-150 group-hover:text-primary group-focus-visible:text-primary sm:text-xl">
                    {project.title}
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                    {project.summary}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-lg text-primary transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
