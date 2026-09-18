export type ProjectStatus = "in-progress" | "completed" | "planned";

/** One horizontal stage of an architecture flow. Multiple nodes render as parallel/sibling steps. */
export interface ArchitectureLayer {
  id: string;
  nodes: string[];
}

export interface ProjectArchitecture {
  layers: ArchitectureLayer[];
  /** Plain-language description of the flow, used as the diagram's accessible text alternative. */
  summary: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Short subtitle shown next to the title, e.g. "Loan Management Application". */
  subtitle?: string;
  summary: string;
  description: string;
  category: string;
  techStack: string[];
  status: ProjectStatus;
  featured: boolean;
  problem?: string;
  solution?: string;
  architecture?: ProjectArchitecture;
  responsibilities?: string[];
  /** Longer write-up for a future dedicated case-study page. */
  caseStudyContent?: string;
  links?: {
    github?: string;
    live?: string;
  };
}
