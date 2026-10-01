# GaneshKumar — Developer Portfolio

> Full-stack developer portfolio built with React, TypeScript, Spring Boot, PostgreSQL, JWT authentication, Docker, and a database-backed blog CMS.

[![Live Portfolio](https://img.shields.io/badge/Portfolio-Live-000000?style=for-the-badge)](https://ganeshkumarv.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)

## Live

🌐 **Portfolio:**  
https://ganeshkumarv.vercel.app

🔐 **Admin CMS:**  
https://ganeshkumarv.vercel.app/admin/login

⚙️ **Backend API:**  
https://gk-portfolio-api-dlxp.onrender.com

---

## Overview

This is my personal developer portfolio, built as a **full-stack application rather than a static website**.

The project combines a modern React frontend with a Spring Boot backend, PostgreSQL persistence, JWT-based admin authentication, and a database-backed blog CMS.

The goal is to use the portfolio itself as an engineering project — demonstrating frontend architecture, backend API design, authentication, database management, Docker, deployment, and production-oriented development practices.

### The portfolio includes

- Engineering journey
- Project case studies
- Architecture-focused project explanations
- Technical stack
- Technical blog
- About section
- Contact information
- Private admin CMS for blog management
- Dark / Light theme
- Responsive design
- Production deployment

---

# Architecture

```text
                         ┌─────────────────────────┐
                         │         Vercel          │
                         │                         │
                         │ React + TypeScript      │
                         │ Vite                    │
                         │ Tailwind CSS             │
                         │ Framer Motion            │
                         └────────────┬────────────┘
                                      │
                                      │ HTTPS / REST
                                      ▼
                         ┌─────────────────────────┐
                         │         Render          │
                         │                         │
                         │ Spring Boot             │
                         │ Spring Security         │
                         │ JWT Authentication      │
                         │ Spring Data JPA         │
                         │ Flyway                  │
                         │ Docker                  │
                         └────────────┬────────────┘
                                      │
                                      │ PostgreSQL
                                      ▼
                         ┌─────────────────────────┐
                         │        Supabase         │
                         │                         │
                         │ PostgreSQL Database     │
                         │ Blog persistence        │
                         └─────────────────────────┘

                         External Scheduler
                                │
                                │ every ~14 min
                                ▼
                         GET /api/health
                                │
                                ▼
                           Render Backend

                           Tech Stack
Frontend
- React
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router
- Lucide React
Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- BCrypt
- Bean Validation
- Flyway
- Maven
Database
- PostgreSQL
- Supabase
DevOps / Deployment
- Docker
- Docker Compose
- GitHub
- Vercel
- Render
- Supabase
Project Structure
personalWebsite/
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── blog/
│   │   ├── layout/
│   │   ├── projects/
│   │   └── ui/
│   │
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── data/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── README.md
│
├── public/
├── vercel.json
├── package.json
├── vite.config.ts
└── README.md

Key Features
1. Engineering-focused Portfolio
The portfolio is structured around engineering work rather than a traditional resume layout.
It presents:
Engineering Journey
        ↓
Selected Projects
        ↓
Architecture
        ↓
Technology Stack
        ↓
Technical Notes
        ↓
About / Contact

Projects are presented as case studies with their technical architecture and engineering context.
2. Project Case Studies
InsuranceAI Agent
AI-powered insurance application demonstrating:
- Spring Boot
- React
- RAG
- AI Agents
- Tool Calling
- MCP
- Insurance domain workflows
Jansamarth
Housing loan integration/application platform demonstrating enterprise backend development and API-driven workflows.
InsuranceHub
Insurance application demonstrating:
- Spring Boot
- REST APIs
- Microservices
- Database-driven workflows
- Enterprise application architecture
3. Database-backed Blog
The blog is not hardcoded into React.
Instead:
React
  │
  ▼
Spring Boot REST API
  │
  ▼
PostgreSQL

Public endpoints:
GET /api/blog
GET /api/blog/{slug}

Only published articles are exposed through the public API.
Draft content remains accessible only through the authenticated admin API.
4. Admin CMS
The project includes a private admin dashboard for managing blog content.
Admin capabilities
- Login
- JWT authentication
- Create posts
- Edit posts
- Delete posts
- Save drafts
- Publish posts
- Move published posts back to draft
- Markdown editing
- Live Markdown preview
- Automatic slug generation
- Duplicate slug validation
- Publication status management
Admin routes:
/admin/login
/admin
/admin/blog
/admin/blog/new
/admin/blog/:id

5. Authentication
Admin authentication uses:
Username + Password
        │
        ▼
Spring Security
        │
        ▼
BCrypt
        │
        ▼
JWT
        │
        ▼
Bearer Authentication

The backend uses stateless authentication.
Protected endpoints require:
Authorization: Bearer <JWT>

The initial admin account is bootstrapped through environment variables during application startup.
No public admin-registration endpoint exists.
6. Database Migrations
Flyway manages the database schema.
Flyway
   │
   ├── V1 → Blog schema
   ├── V2 → Admin users
   └── V3 → Seed data

Hibernate is configured for schema validation rather than automatic schema modification.
spring:
  jpa:
    hibernate:
      ddl-auto: validate

This keeps schema changes explicit and version-controlled.
7. Dockerized Backend
The backend uses a multi-stage Docker build:
Maven Build
     │
     ▼
Compile + Test
     │
     ▼
Spring Boot JAR
     │
     ▼
Slim Java Runtime Image
     │
     ▼
Container

The production container runs as a non-root user and exposes a health endpoint:
GET /api/health

8. Deployment
Frontend
Deployed on Vercel.
https://ganeshkumarv.vercel.app

Backend
Dockerized Spring Boot application deployed on Render.
https://gk-portfolio-api-dlxp.onrender.com

Database
PostgreSQL hosted on Supabase.
SPA Routing
The frontend uses React Router.
Vercel is configured with a root-level vercel.json so direct navigation and browser refresh work correctly for client-side routes.
For example:
/admin/login
/admin
/admin/blog
/blog
/work
/about

All are handled by React Router after Vercel serves the application entry point.
Render Free Tier
The backend is currently deployed on the Render Free tier.
Free instances can spin down after inactivity, which can result in a cold start.
To reduce unnecessary cold starts, an external scheduler can periodically call:
GET /api/health

Example:
https://gk-portfolio-api-dlxp.onrender.com/api/health

The application itself does not implement a background scheduler or self-ping mechanism.
The health endpoint intentionally remains lightweight and does not perform unnecessary database polling.
An external scheduler such as cron-job.org can be configured for approximately 14-minute intervals.
This is a cold-start mitigation, not a guarantee. External scheduling can fail or be delayed.

API Overview
Public
GET /api/health

GET /api/blog?page=0&size=10

GET /api/blog/{slug}

Authentication
POST /api/auth/login

Admin
GET    /api/admin/blog
GET    /api/admin/blog/{id}

POST   /api/admin/blog

PUT    /api/admin/blog/{id}

DELETE /api/admin/blog/{id}

PATCH  /api/admin/blog/{id}/publish

PATCH  /api/admin/blog/{id}/draft

Admin endpoints require JWT authentication.
Local Development
Prerequisites
- Node.js
- Java 17
- PostgreSQL
- Docker
- Git
Frontend
npm install
npm run dev

The frontend runs using Vite.
Backend
cd backend
./mvnw spring-boot:run

Windows:
cd backend
.\mvnw.cmd spring-boot:run

Health endpoint:
http://localhost:8080/api/health

Docker
cd backend
docker compose up --build

This starts the backend and PostgreSQL locally.
For backend-specific configuration and deployment details, see:
[`backend/README.md`](./backend/README.md)
Environment Variables
Secrets are never committed to the repository.
Frontend:
VITE_API_BASE_URL=http://localhost:8080

Production:
VITE_API_BASE_URL=https://gk-portfolio-api-dlxp.onrender.com

Backend environment variables include:
SPRING_PROFILES_ACTIVE
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MINUTES
ADMIN_USERNAME
ADMIN_PASSWORD
CORS_ALLOWED_ORIGINS


About Me
Ganesh Kumar
Java Full Stack Developer | Backend & AI Engineer
I build backend systems, modern web applications, and AI-powered software that connects real engineering problems with practical solutions.
Links
- 🌐 Portfolio — https://ganeshkumarv.vercel.app
- 💼 LinkedIn — https://www.linkedin.com/in/gk1106/
- 💻 GitHub — https://github.com/gk1106
- 📄 Resume — https://drive.google.com/file/d/1XWlwfI7H7YVOdI25t8ImaG0mD2mDCrwq/view
- ✉️ Email — ganeshkumar.v.dev@gmail.com
License
This repository represents my personal developer portfolio and engineering work.
The code is primarily provided as a demonstration of architecture, development practices, and implementation decisions.

This version is the **root README**, so it intentionally avoids duplicating all the detailed Spring Boot setup tha
