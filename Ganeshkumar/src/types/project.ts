export type ProjectStatus = "in-progress" | "completed" | "planned";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  techStack: string[];
  status: ProjectStatus;
  featured: boolean;
  links?: {
    github?: string;
    live?: string;
  };
}
