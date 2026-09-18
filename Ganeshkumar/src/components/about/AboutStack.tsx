import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassPanel } from "../ui/GlassPanel";
import { skillGroups } from "../../data/skills";

export function AboutStack() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.45, ease: "easeOut" } },
  };

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow="Engineering Stack"
          title="A map of what I use."
          description="Grouped by area, not ranked by depth."
        />

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.08 }}
        >
          {skillGroups.map((group) => (
            <motion.div key={group.id} variants={item}>
              <GlassPanel className="flex h-full flex-col gap-4 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
                  {group.label}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li
                      key={skill.name}
                      className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      {skill.name}
                      {skill.note && <span className="text-primary"> · {skill.note}</span>}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
