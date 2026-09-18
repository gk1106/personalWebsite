import type { Project } from "../types/project";

// Only verified information is included. Fields left undefined (problem,
// solution, techStack items) are genuinely not yet provided — the Work page
// renders a restrained placeholder for those rather than inventing content.
export const projects: Project[] = [
  {
    id: "insurance-ai-agent",
    slug: "insurance-ai-agent",
    title: "InsuranceAI Agent",
    summary:
      "An AI-powered insurance application that connects natural-language questions with structured policy data.",
    description:
      "An AI-powered insurance application that connects natural-language questions with structured policy data.",
    category: "AI / RAG / Agents",
    techStack: [
      "Java / Spring Boot",
      "React",
      "RAG",
      "Agent / Tool Calling",
      "Database",
      "Docker",
      "CI/CD",
    ],
    status: "in-progress",
    featured: true,
    problem:
      "How can users ask natural-language questions about insurance data without manually searching through records?",
    solution:
      "An application combining a React frontend, Spring Boot backend and AI capabilities to retrieve relevant insurance information and invoke application tools.",
    architecture: {
      layers: [
        { id: "client", nodes: ["React"] },
        { id: "api", nodes: ["Spring Boot API"] },
        { id: "agent", nodes: ["AI Agent"] },
        { id: "capabilities", nodes: ["RAG / Retrieval", "Tools", "Policy Search"] },
        { id: "data", nodes: ["Insurance Data"] },
      ],
      summary:
        "Requests flow from the React frontend to a Spring Boot API, which invokes an AI agent. The agent coordinates retrieval-augmented generation, tool calling, and policy search before reading from the insurance data store.",
    },
  },
  {
    id: "jansamarth",
    slug: "jansamarth",
    title: "Jansamarth",
    subtitle: "Loan Management Application",
    summary: "A loan management application built around enterprise workflow and service integration.",
    description: "A loan management application built around enterprise workflow and service integration.",
    category: "Loan Management",
    techStack: [],
    status: "in-progress",
    featured: true,
    architecture: {
      layers: [
        { id: "user", nodes: ["User"] },
        { id: "ui", nodes: ["React / UI"] },
        { id: "backend", nodes: ["Backend APIs"] },
        { id: "processing", nodes: ["Loan Processing"] },
        { id: "external", nodes: ["External Services"] },
      ],
      summary:
        "A user interacts with a React interface, which calls backend APIs handling loan processing before reaching external services.",
    },
  },
  {
    id: "insurancehub",
    slug: "insurancehub",
    title: "InsuranceHub",
    subtitle: "Insurance Platform / Microservices",
    summary: "An insurance application built with Spring Boot and a microservices-oriented architecture.",
    description: "An insurance application built with Spring Boot and a microservices-oriented architecture.",
    category: "Insurance Platform",
    techStack: ["Java", "Spring Boot", "REST APIs", "Microservices", "Database", "Docker", "CI/CD"],
    status: "in-progress",
    featured: true,
    architecture: {
      layers: [
        { id: "client", nodes: ["Client"] },
        { id: "gateway", nodes: ["API / Gateway"] },
        { id: "services", nodes: ["Policy Service", "Renewal Service", "Claims Service"] },
        { id: "data", nodes: ["Data Layer"] },
      ],
      summary:
        "Client requests pass through an API gateway to independent policy, renewal, and claims services, which share a common data layer.",
    },
  },
];
