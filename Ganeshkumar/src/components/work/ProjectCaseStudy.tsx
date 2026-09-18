import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { GlassPanel } from "../ui/GlassPanel";
import { ProjectArchitecture } from "./ProjectArchitecture";
import type { Project } from "../../types/project";

interface ProjectCaseStudyProps {
  project: Project;
  index: number;
}

export function ProjectCaseStudy({ project, index }: ProjectCaseStudyProps) {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  return (
    <section id={project.slug} className="scroll-mt-24 py-20 lg:py-28">
      <Container>
        <motion.div
          className="flex flex-col gap-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.1 }}
        >
          <motion.div variants={item} className="flex flex-col gap-4">
            <span className="font-mono text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
                {project.title}
              </h2>
              {project.subtitle && (
                <span className="text-base text-muted-foreground sm:text-lg">{project.subtitle}</span>
              )}
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
              {project.category}
            </span>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{project.description}</p>
          </motion.div>

          {project.architecture && (
            <motion.div variants={item}>
              <GlassPanel className="overflow-x-auto p-6 sm:p-10">
                <h3 className="mb-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Architecture
                </h3>
                <ProjectArchitecture architecture={project.architecture} />
              </GlassPanel>
            </motion.div>
          )}

          <motion.div variants={item} className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Problem</h3>
              <p className="mt-3 text-foreground">
                {project.problem ?? "Full problem statement coming soon."}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Solution</h3>
              <p className="mt-3 text-foreground">
                {project.solution ?? "Full solution write-up coming soon."}
              </p>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Engineering</h3>
            {project.techStack.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted-foreground">Technology breakdown coming soon.</p>
            )}
          </motion.div>

          <motion.div variants={item}>
            {/* Detail routes (/work/:slug) aren't built yet — jump within this same section for now */}
            <a
              href={`#${project.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full font-mono text-xs uppercase tracking-[0.2em] text-primary transition-[gap] duration-200 hover:gap-3"
            >
              Case study <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
