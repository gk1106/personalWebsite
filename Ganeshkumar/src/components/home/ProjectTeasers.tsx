import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassPanel } from "../ui/GlassPanel";
import { projects } from "../../data/projects";

export function ProjectTeasers() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  return (
    <section className="pb-24 lg:pb-32">
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Things I've built."
          description="From enterprise applications to AI-powered insurance workflows."
        />

        <motion.div
          className="mt-14 grid gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            >
              {/* Detail routes (/work/:slug) aren't built yet — deep-link to the project's section on /work */}
              <Link to={`/work#${project.slug}`} className="group block h-full rounded-panel">
                <GlassPanel className="flex h-full flex-col justify-between gap-10 p-8 transition-colors duration-300 group-hover:border-secondary/40 group-focus-visible:border-secondary/40">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-sm text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
                      {project.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">{project.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
                  </div>

                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-transform duration-300 group-hover:translate-x-1">
                    Case study <span aria-hidden="true">→</span>
                  </span>
                </GlassPanel>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
