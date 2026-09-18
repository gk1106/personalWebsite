import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { EngineeringPanel } from "./EngineeringPanel";
import { CursorGlow } from "./CursorGlow";
import { siteConfig } from "../../config/site";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const hasResume = Boolean(siteConfig.resumeUrl) && siteConfig.resumeUrl !== "#";

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.14, delayChildren: 0.05 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.55, ease: "easeOut" } },
  };

  const panelVariant: Variants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 28 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: prefersReducedMotion ? 0.01 : 0.65, ease: "easeOut", delay: prefersReducedMotion ? 0 : 0.2 },
    },
  };

  return (
    <section className="relative overflow-hidden">
      <CursorGlow />
      <Container className="grid items-center gap-16 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <motion.div initial="hidden" animate="show" variants={container}>
          <motion.p
            variants={item}
            className="font-mono text-xs uppercase tracking-[0.25em] text-primary"
          >
            Java Engineer / AI Builder
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            <span className="block">
              From <span className="text-primary">APIs</span>
            </span>
            <span className="block">
              to AI <span className="text-primary">Agents.</span>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            I build backend systems, modern web applications, and AI-powered software
            that connects real engineering problems with practical solutions.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button to="/work">
              Explore my work <span aria-hidden="true">→</span>
            </Button>
            {hasResume ? (
              <Button
                variant="secondary"
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled
                aria-label="Resume coming soon"
                title="Resume coming soon"
              >
                Resume coming soon
              </Button>
            )}
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={panelVariant}>
          <EngineeringPanel />
        </motion.div>
      </Container>
    </section>
  );
}
