import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";
import { SocialLinks } from "../ui/SocialLinks";
import { siteConfig } from "../../config/site";

export function AboutContactCta() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="contact" className="scroll-mt-24 py-20 lg:py-28">
      <Container>
        <motion.div
          className="flex flex-col items-center gap-8 text-center"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" }}
        >
          <SectionHeading
            align="center"
            eyebrow="Let's Connect"
            title="Have a problem worth building?"
            description="Interested in software engineering, backend systems, AI applications, or collaborating on a technical problem?"
          />

          <div className="flex flex-col items-center gap-3">
            <Button href={`mailto:${siteConfig.email}`}>
              Get in touch <span aria-hidden="true">→</span>
            </Button>
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-mono text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {siteConfig.email}
            </a>
          </div>

          <SocialLinks />
        </motion.div>
      </Container>
    </section>
  );
}
