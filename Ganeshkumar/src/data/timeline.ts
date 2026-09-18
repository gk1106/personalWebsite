import type { TimelineEntry } from "../types/timeline";

// Dated entries reflect confirmed education history. Undated milestones use
// descriptive labels rather than invented years.
export const timelineEntries: TimelineEntry[] = [
  { id: "bsc", period: "2021", title: "B.Sc Computer Science" },
  { id: "mca", period: "2022 — 2024", title: "MCA" },
  { id: "backend", period: "Software Engineering", title: "Java / Spring Boot" },
  { id: "frontend", period: "Modern Web", title: "React" },
  { id: "cloud", period: "Cloud & Engineering", title: "AWS / Docker / CI/CD" },
  { id: "ai", period: "AI Systems", title: "RAG / Agents / Tool Calling" },
];
