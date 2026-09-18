import type { JourneyGroup } from "../types/journeyGroup";

export const journeyGroups: JourneyGroup[] = [
  { id: "foundations", label: "Foundations", steps: ["Computer Science", "Software Engineering"] },
  { id: "backend", label: "Backend", steps: ["Java", "Spring Boot", "REST APIs", "Microservices"] },
  { id: "applications", label: "Applications", steps: ["React", "Modern web interfaces"] },
  { id: "cloud", label: "Cloud", steps: ["AWS", "Docker", "CI/CD"] },
  { id: "ai-systems", label: "AI Systems", steps: ["RAG", "Agents", "Tool Calling", "MCP"] },
];
