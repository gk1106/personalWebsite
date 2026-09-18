import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { journeyGroups } from "../../data/journeyGroups";

export function AboutJourney() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.45, ease: "easeOut" } },
  };

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow="The Engineering Journey"
          title="How the pieces fit together."
          description="Areas I've worked across — not a ranking of expertise."
        />

        <motion.div
          className="mt-12 flex flex-col gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.1 }}
        >
          {journeyGroups.map((group) => (
            <motion.div key={group.id} variants={item} className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                {group.label}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg text-foreground sm:text-xl">
                {group.steps.map((step, index) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    {index > 0 && (
                      <span aria-hidden="true" className="text-muted-foreground">
                        →
                      </span>
                    )}
                    {step}
                  </span>
                ))}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
