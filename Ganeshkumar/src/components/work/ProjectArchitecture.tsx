import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ProjectArchitecture as ProjectArchitectureData } from "../../types/project";
import { ArchitectureNode } from "./ArchitectureNode";
import { ArchitectureConnection } from "./ArchitectureConnection";

interface ProjectArchitectureProps {
  architecture: ProjectArchitectureData;
}

export function ProjectArchitecture({ architecture }: ProjectArchitectureProps) {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      role="img"
      aria-label={architecture.summary}
      className="flex flex-col items-center gap-0"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.08 }}
    >
      {architecture.layers.map((layer, index) => (
        <Fragment key={layer.id}>
          {index > 0 && <ArchitectureConnection variants={item} />}
          {layer.nodes.length === 1 ? (
            <ArchitectureNode label={layer.nodes[0]} variants={item} />
          ) : (
            <motion.div
              variants={item}
              className="mx-auto flex w-fit max-w-full flex-wrap items-stretch justify-center gap-3 border-t border-border/70 pt-4"
            >
              {layer.nodes.map((node) => (
                <ArchitectureNode key={node} label={node} />
              ))}
            </motion.div>
          )}
        </Fragment>
      ))}
    </motion.div>
  );
}
