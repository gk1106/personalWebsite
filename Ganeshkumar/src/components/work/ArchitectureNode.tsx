import { motion, type Variants } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

interface ArchitectureNodeProps {
  label: string;
  variants?: Variants;
}

export function ArchitectureNode({ label, variants }: ArchitectureNodeProps) {
  return (
    <motion.div variants={variants}>
      <GlassPanel className="px-4 py-2.5 text-center">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground sm:text-xs">
          {label}
        </span>
      </GlassPanel>
    </motion.div>
  );
}
