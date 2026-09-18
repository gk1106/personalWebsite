import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";

export function AboutHeader() {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" } },
  };

  return (
    <section className="pb-4 pt-20 lg:pt-28">
      <Container>
        <motion.div
          className="flex flex-col gap-6"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.12 }}
        >
          <motion.p
            variants={item}
            className="font-mono text-xs uppercase tracking-[0.25em] text-primary"
          >
            About GK
          </motion.p>

          <motion.h1
            variants={item}
            className="text-4xl font-bold uppercase leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Java Engineer.
            <br />
            AI Builder.
            <br />
            Systems Thinker.
          </motion.h1>

          <motion.p variants={item} className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            I enjoy understanding what happens behind the API — from backend services and
            distributed systems to modern interfaces and AI-powered applications.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
