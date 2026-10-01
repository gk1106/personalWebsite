package com.gk.portfolio.ai;

import com.gk.portfolio.dto.BlogPostResponse;
import com.gk.portfolio.service.BlogService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controlled, read-only tools the portfolio chat model may call. Every tool
 * here returns curated, hardcoded facts about Ganesh Kumar — mirroring the
 * frontend's own authoritative content in Ganeshkumar/src/data/*.ts and
 * Ganeshkumar/src/config/site.ts — or delegates to the existing BlogService
 * for published posts. There is deliberately no tool here that can run
 * arbitrary SQL, call out to the internet, execute code, or touch the
 * filesystem: the model can only ever read this fixed, curated data.
 *
 * If the frontend's portfolio content changes, update the data below to
 * match — the two are not wired together, since the frontend (Vite/React)
 * and backend (Spring Boot) are separate builds with no shared data source.
 */
@Component
public class PortfolioTools {

    private record PortfolioProject(
            String slug,
            String title,
            String subtitle,
            String summary,
            String category,
            List<String> techStack,
            String status,
            String problem,
            String solution,
            String architectureSummary
    ) {
    }

    private static final List<PortfolioProject> PROJECTS = List.of(
            new PortfolioProject(
                    "insurance-ai-agent",
                    "InsuranceAI Agent",
                    null,
                    "An AI-powered insurance application that connects natural-language questions with structured policy data.",
                    "AI / RAG / Agents",
                    List.of("Java / Spring Boot", "React", "RAG", "Agent / Tool Calling", "Database", "Docker", "CI/CD"),
                    "in-progress",
                    "How can users ask natural-language questions about insurance data without manually searching through records?",
                    "An application combining a React frontend, Spring Boot backend and AI capabilities to retrieve relevant insurance information and invoke application tools.",
                    "Requests flow from the React frontend to a Spring Boot API, which invokes an AI agent. The agent coordinates retrieval-augmented generation, tool calling, and policy search before reading from the insurance data store."
            ),
            new PortfolioProject(
                    "jansamarth",
                    "Jansamarth",
                    "Loan Management Application",
                    "A loan management application built around enterprise workflow and service integration.",
                    "Loan Management",
                    List.of(),
                    "in-progress",
                    null,
                    null,
                    "A user interacts with a React interface, which calls backend APIs handling loan processing before reaching external services."
            ),
            new PortfolioProject(
                    "insurancehub",
                    "InsuranceHub",
                    "Insurance Platform / Microservices",
                    "An insurance application built with Spring Boot and a microservices-oriented architecture.",
                    "Insurance Platform",
                    List.of("Java", "Spring Boot", "REST APIs", "Microservices", "Database", "Docker", "CI/CD"),
                    "in-progress",
                    null,
                    null,
                    "Client requests pass through an API gateway to independent policy, renewal, and claims services, which share a common data layer."
            )
    );

    private final BlogService blogService;

    public PortfolioTools(BlogService blogService) {
        this.blogService = blogService;
    }

    @Tool(description = "Get Ganesh Kumar's profile: his name, roles, a short bio, and his contact email, GitHub, and LinkedIn links.")
    public String getProfile() {
        return """
                Name: GaneshKumar (GK)
                Roles: Java Engineer, AI Builder, Systems Thinker

                Bio: With a background in Computer Science and an MCA, Ganesh works across \
                the stack — building backend services in Java and Spring Boot, interfaces in \
                React, and exploring how AI agents, retrieval and tool calling can make \
                applications genuinely useful. He likes understanding systems end to end: \
                REST APIs and microservices on one side, and the infrastructure — AWS, \
                Docker, CI/CD — that keeps them running on the other.

                Contact email: ganeshkumar.v.dev@gmail.com
                GitHub: https://github.com/gk1106
                LinkedIn: https://www.linkedin.com/in/gk1106/
                """;
    }

    @Tool(description = "Get Ganesh Kumar's technical skills, grouped by category (backend, frontend, data, cloud/devops, AI, security).")
    public String getSkills() {
        return """
                Backend: Java, Spring Boot, Spring MVC, Spring Security, Hibernate / JPA, REST APIs, Microservices
                Frontend: React, JavaScript, HTML, CSS, Tailwind CSS
                Data: MySQL, PostgreSQL (planned), MongoDB, Redis
                Cloud / DevOps: AWS, Docker, Git, CI/CD
                AI: RAG, Agents, Tool Calling, MCP
                Security: JWT, AES-256, HMAC
                """;
    }

    @Tool(description = "Get Ganesh Kumar's engineering experience and learning journey across domains. No specific employer/job history is published in the portfolio — this describes the domains and skills he has built up, not a list of past jobs.")
    public String getExperience() {
        return """
                Ganesh Kumar's engineering journey (the portfolio does not publish a \
                separate employer-by-employer job history, so this reflects the domains he \
                has built experience in):

                1. Foundations: Computer Science, Software Engineering
                2. Backend: Java, Spring Boot, REST APIs, Microservices
                3. Applications: React, modern web interfaces
                4. Cloud: AWS, Docker, CI/CD
                5. AI Systems: RAG, Agents, Tool Calling, MCP

                Currently exploring: AI Agents, RAG architectures, MCP, Kubernetes, AWS, Distributed Systems
                """;
    }

    @Tool(description = "Get Ganesh Kumar's educational background.")
    public String getEducation() {
        return """
                B.Sc Computer Science — 2021
                MCA (Master of Computer Applications) — 2022 to 2024
                """;
    }

    @Tool(description = "Get the list of all portfolio projects Ganesh Kumar has built, with a short summary, category, and tech stack for each.")
    public String getProjects() {
        return PROJECTS.stream()
                .map(PortfolioTools::formatProjectSummary)
                .collect(Collectors.joining("\n"));
    }

    @Tool(description = "Get full details about one specific portfolio project by name (e.g. 'InsuranceAI Agent', 'Jansamarth', 'InsuranceHub'), including its problem, solution, tech stack, and architecture.")
    public String getProject(
            @ToolParam(description = "The project's title or slug, e.g. 'InsuranceAI Agent' or 'insurance-ai-agent'") String projectName) {
        Optional<PortfolioProject> match = findProject(projectName);
        if (match.isEmpty()) {
            String knownTitles = PROJECTS.stream().map(PortfolioProject::title).collect(Collectors.joining(", "));
            return "No project named '" + projectName + "' was found in the portfolio. Known projects are: " + knownTitles + ".";
        }
        return formatProjectDetail(match.get());
    }

    @Tool(description = "Get Ganesh Kumar's published blog articles (title and short excerpt for each).")
    public String getBlogPosts() {
        List<BlogPostResponse> posts = blogService.getPublishedPosts(0, 20).content();
        if (posts.isEmpty()) {
            return "No blog posts are currently published.";
        }
        return posts.stream()
                .map(post -> "- " + post.getTitle() + ": " + post.getExcerpt())
                .collect(Collectors.joining("\n"));
    }

    private Optional<PortfolioProject> findProject(String projectName) {
        if (projectName == null || projectName.isBlank()) {
            return Optional.empty();
        }
        String normalized = normalize(projectName);
        return PROJECTS.stream()
                .filter(project -> normalize(project.title()).equals(normalized)
                        || normalize(project.slug()).equals(normalized)
                        || normalize(project.title()).contains(normalized)
                        || normalized.contains(normalize(project.slug())))
                .findFirst();
    }

    private String normalize(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private static String formatProjectSummary(PortfolioProject project) {
        String subtitle = project.subtitle() != null ? " (" + project.subtitle() + ")" : "";
        String techStack = project.techStack().isEmpty() ? "not yet documented" : String.join(", ", project.techStack());
        return "- " + project.title() + subtitle + ": " + project.summary()
                + " | Category: " + project.category()
                + " | Tech stack: " + techStack
                + " | Status: " + project.status();
    }

    private static String formatProjectDetail(PortfolioProject project) {
        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(project.title());
        if (project.subtitle() != null) {
            sb.append(" (").append(project.subtitle()).append(")");
        }
        sb.append("\nSummary: ").append(project.summary());
        sb.append("\nCategory: ").append(project.category());
        sb.append("\nStatus: ").append(project.status());
        sb.append("\nTech stack: ")
                .append(project.techStack().isEmpty() ? "not yet documented" : String.join(", ", project.techStack()));
        if (project.problem() != null) {
            sb.append("\nProblem: ").append(project.problem());
        }
        if (project.solution() != null) {
            sb.append("\nSolution: ").append(project.solution());
        }
        if (project.architectureSummary() != null) {
            sb.append("\nArchitecture: ").append(project.architectureSummary());
        }
        return sb.toString();
    }
}
