import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { currentlyExploring } from "../../data/exploring";

export function AboutExploring() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.35, ease: "easeOut" } },
  };

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow="Currently Exploring"
          title="What I'm reading and experimenting with."
          description="Areas of active exploration, not claims of expertise."
        />

        <motion.ul
          className="mt-10 flex flex-wrap gap-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.06 }}
        >
          {currentlyExploring.map((topic) => (
            <motion.li
              key={topic}
              variants={item}
              className="rounded-full border border-border px-4 py-2 font-mono text-xs uppercase tracking-wide text-foreground"
            >
              {topic}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
