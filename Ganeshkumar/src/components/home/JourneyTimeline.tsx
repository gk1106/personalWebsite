import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { timelineEntries } from "../../data/timeline";

export function JourneyTimeline() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="The journey"
          title="How I got from writing APIs to building AI systems."
          className="max-w-2xl"
        />

        <ol className="mt-16 flex flex-col gap-10">
          {timelineEntries.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={item}
              transition={{ delay: index * 0.06 }}
              className="relative border-l-2 border-border pl-6 sm:pl-8"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {entry.period}
              </p>
              <h3 className="mt-1.5 text-xl font-semibold text-foreground sm:text-2xl">
                {entry.title}
              </h3>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
