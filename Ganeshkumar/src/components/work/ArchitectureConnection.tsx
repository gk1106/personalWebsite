import { ChevronDown } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface ArchitectureConnectionProps {
  variants?: Variants;
}

/** Purely decorative connector between architecture layers. */
export function ArchitectureConnection({ variants }: ArchitectureConnectionProps) {
  return (
    <motion.div
      variants={variants}
      aria-hidden="true"
      className="flex flex-col items-center text-muted-foreground/60"
    >
      <span className="h-4 w-px bg-border" />
      <ChevronDown size={14} />
    </motion.div>
  );
}
