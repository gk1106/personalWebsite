import { motion, useReducedMotion, type Variants } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { ProfileImage } from "../ui/ProfileImage";
import { siteConfig } from "../../config/site";
import { engineeringStack } from "../../data/stack";

export function EngineeringPanel() {
  const prefersReducedMotion = useReducedMotion();

  const row: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.4, ease: "easeOut" } },
  };

  return (
    <GlassPanel className="mx-auto w-full max-w-sm p-8">
      <div className="flex items-center gap-4">
        <ProfileImage
          size={64}
          src={siteConfig.profileImageSrc}
          initials={siteConfig.initials}
          alt={siteConfig.profileImageSrc ? `Photo of ${siteConfig.name}` : `${siteConfig.name} profile placeholder`}
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {siteConfig.initials}
          </p>
          <p className="text-lg font-semibold text-foreground">{siteConfig.name}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-1.5 border-t border-border pt-6">
        {siteConfig.roles.map((role) => (
          <li key={role} className="text-sm font-medium text-foreground">
            {role}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-border pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
          Engineering Stack
        </p>
        <motion.ul
          className="mt-4 flex flex-col"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ staggerChildren: 0.08 }}
        >
          {engineeringStack.map((item, index) => (
            <motion.li
              key={item}
              variants={row}
              className={`flex items-center justify-between py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground ${
                index !== engineeringStack.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <span>{item}</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_color-mix(in_srgb,var(--color-secondary)_60%,transparent)]"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </GlassPanel>
  );
}
