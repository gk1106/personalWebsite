import type { SkillGroup } from "../types/skill";

// A technology map, not a skill rating — deliberately no levels/percentages.
export const skillGroups: SkillGroup[] = [
  {
    id: "backend",
    label: "Backend",
    items: [
      { name: "Java" },
      { name: "Spring Boot" },
      { name: "Spring MVC" },
      { name: "Spring Security" },
      { name: "Hibernate / JPA" },
      { name: "REST APIs" },
      { name: "Microservices" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: [
      { name: "React" },
      { name: "JavaScript" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    id: "data",
    label: "Data",
    items: [
      { name: "MySQL" },
      { name: "PostgreSQL", note: "planned" },
      { name: "MongoDB" },
      { name: "Redis" },
    ],
  },
  {
    id: "cloud-devops",
    label: "Cloud / DevOps",
    items: [{ name: "AWS" }, { name: "Docker" }, { name: "Git" }, { name: "CI/CD" }],
  },
  {
    id: "ai",
    label: "AI",
    items: [{ name: "RAG" }, { name: "Agents" }, { name: "Tool Calling" }, { name: "MCP" }],
  },
  {
    id: "security",
    label: "Security",
    items: [{ name: "JWT" }, { name: "AES-256" }, { name: "HMAC" }],
  },
];
