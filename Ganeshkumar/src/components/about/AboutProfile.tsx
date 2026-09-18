import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../ui/Container";
import { GlassPanel } from "../ui/GlassPanel";
import { ProfileImage } from "../ui/ProfileImage";
import { siteConfig } from "../../config/site";

export function AboutProfile() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: "easeOut" }}
        >
          <GlassPanel className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex flex-col items-center gap-4 lg:shrink-0 lg:items-start">
              <ProfileImage
                size={120}
                src={siteConfig.profileImageSrc}
                initials={siteConfig.initials}
                alt={siteConfig.profileImageSrc ? `Photo of ${siteConfig.name}` : `${siteConfig.name} profile placeholder`}
              />
              <div className="text-center lg:text-left">
                <p className="text-xl font-semibold text-foreground">{siteConfig.name} (GK)</p>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {siteConfig.roles.map((role) => (
                    <li
                      key={role}
                      className="font-mono text-xs uppercase tracking-[0.15em] text-secondary"
                    >
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              With a background in Computer Science and an MCA, I work across the stack —
              building backend services in Java and Spring Boot, interfaces in React, and
              exploring how AI agents, retrieval and tool calling can make applications
              genuinely useful. I like understanding systems end to end: REST APIs and
              microservices on one side, and the infrastructure — AWS, Docker, CI/CD — that
              keeps them running on the other.
            </p>
          </GlassPanel>
        </motion.div>
      </Container>
    </section>
  );
}
