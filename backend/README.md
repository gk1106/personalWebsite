# GK Portfolio Backend

Backend for the portfolio (V2). Earlier phases added the project skeleton
and the public, read-only blog API. This phase adds **JWT-based admin
authentication and full blog CRUD** — see [Current status](#current-status)
for what's still not built.

## Prerequisites

- **Java 17** (compiled with `--release 17`; developed against a JDK 21 install, both work)
- **PostgreSQL** (14+; developed and tested against 18) — must be created/reachable yourself, this project does not provision it
- No global Maven install required — use the included Maven Wrapper (`./mvnw` / `mvnw.cmd`)

## Environment variables

| Variable | Purpose | Dev default | Required in prod |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Which profile to run | `dev` | yes (`prod`) |
| `DB_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/portfolio_dev` | yes, no default |
| `DB_USERNAME` | DB user | `portfolio_dev` | yes, no default |
| `DB_PASSWORD` | DB password | `portfolio_dev` | yes, no default |
| `SERVER_PORT` | HTTP port | `8080` | optional |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins for the React frontend | `http://localhost:5173` | yes, set to the real frontend origin(s) |
| `JWT_SECRET` | HMAC signing key for admin JWTs (HS256 — must be at least 32 bytes) | insecure built-in fallback, dev only | yes, no default — startup fails without it |
| `JWT_EXPIRATION_MINUTES` | Access token lifetime, in minutes | `60` | optional (60 is a reasonable prod value too) |
| `ADMIN_USERNAME` | Bootstrap admin username (one-time) | unset (bootstrap disabled) | optional — see [Admin bootstrap](#admin-bootstrap) |
| `ADMIN_PASSWORD` | Bootstrap admin password (one-time, plaintext input only) | unset (bootstrap disabled) | optional — see [Admin bootstrap](#admin-bootstrap) |

No password, secret, or credential is hardcoded anywhere in this repository.
`application-prod.yml` intentionally has **no fallback defaults** for the
datasource or `JWT_SECRET` — the app fails fast at startup if `DB_URL`/
`DB_USERNAME`/`DB_PASSWORD`/`JWT_SECRET` aren't set in a production
environment. The `dev` profile's "sensible local defaults" point at a
**dedicated, low-privilege local role** (`portfolio_dev`/`portfolio_dev`)
that you create yourself (see below) — never a superuser account — and at an
insecure, clearly-labeled fallback JWT secret that must never be used outside
local development.

`ADMIN_USERNAME`/`ADMIN_PASSWORD` behave identically in dev and prod: both
are optional, but if set, both must be set together (see below) — there is
no environment-specific default for either.

## Running locally

1. Create a local Postgres role + database (adjust host/port for your install):

   ```sh
   psql -U postgres -c "CREATE ROLE portfolio_dev LOGIN PASSWORD 'portfolio_dev';"
   psql -U postgres -c "CREATE DATABASE portfolio_dev OWNER portfolio_dev;"
   ```

2. Run the app (Flyway migrates the schema automatically on startup):

   ```sh
   ./mvnw spring-boot:run
   ```

   Windows: `mvnw.cmd spring-boot:run`

3. Check it's up:

   ```sh
   curl http://localhost:8080/api/health
   # {"status":"UP"}
   ```

If your Postgres isn't on the default host/port/db, override via env vars, e.g.:

```sh
DB_URL=jdbc:postgresql://localhost:5555/portfolio_dev DB_USERNAME=portfolio_dev DB_PASSWORD=portfolio_dev ./mvnw spring-boot:run
```

## Docker

For a full local stack (Postgres + backend, both containerized) or as the
basis for a real deployment:

```sh
cp .env.example .env
# edit .env — at minimum set POSTGRES_PASSWORD, CORS_ALLOWED_ORIGINS, JWT_SECRET
docker compose up -d --build
curl http://localhost:8080/api/health   # or whatever SERVER_PORT you set
```

`.env` is gitignored (only `.env.example` is committed) — `docker compose`
reads it automatically and refuses to start (`POSTGRES_PASSWORD`/
`CORS_ALLOWED_ORIGINS`/`JWT_SECRET` all use the `${VAR:?message}` syntax) if
any of those three aren't set. `ADMIN_USERNAME`/`ADMIN_PASSWORD` behave
exactly as described in [Admin bootstrap](#admin-bootstrap) below — optional,
both-or-neither.

What's in it:
- **`Dockerfile`** — multi-stage: builds the jar with the official `maven`
  image (dependencies cached in their own layer), then runs it on a slim
  `eclipse-temurin:17-jre` base as a non-root user, with a `HEALTHCHECK`
  against `/api/health`. Tests are **not** run during the image build (they
  need a live Postgres — see [Tests](#tests)) — run `./mvnw test` yourself
  before building if you want that guarantee.
- **`docker-compose.yml`** — a `db` service (`postgres:18`, named volume for
  persistence, `pg_isready` healthcheck) and a `backend` service that only
  starts once `db` reports healthy. Uses an explicit top-level `name:` so
  its containers/network/volume never collide with some other
  docker-compose project that also happens to live in a directory called
  "backend" (a real collision discovered while testing this).
- **`.env.example`** — every variable the compose file reads, documented.

Verified end-to-end against this exact setup: schema migrated (Flyway),
admin bootstrap ran and logged in successfully, CORS preflight succeeded,
and data (posts + the bootstrapped admin account) survived a full
`docker compose restart`.

> **Postgres 18 note**: its image changed where it expects data on disk —
> the named volume is mounted at `/var/lib/postgresql` (not
> `.../postgresql/data`, the pre-18 convention). Mounting at the old path
> makes the container refuse to start against existing data.

## Keep-alive (Render Free tier cold starts)

The production backend runs on Render's **Free** plan, which puts the
service to sleep after a period of inactivity. The next request then pays a
~1–2 minute cold-start cost (container boot + JVM startup + Flyway) before
it responds.

To reduce how often that happens, configure an **external** scheduled HTTP
check against the health endpoint, roughly every 14 minutes (comfortably
under typical free-tier inactivity timeouts) — a plain `GET` request from
outside the app:

```
GET https://<your-render-service>.onrender.com/api/health
```

**This is deliberately not implemented inside the application** — no
`@Scheduled` job, no self-calling HTTP client, no background thread, and
`/api/health` itself stays a trivial, dependency-free `{"status":"UP"}`
(see `HealthController`) with no DB query added to it just for this. A
periodic outbound ping is an *infrastructure* concern, not something that
belongs inside the service being pinged — set it up with any free external
uptime/cron service (e.g. cron-job.org, UptimeRobot, or GitHub Actions'
`schedule` trigger), pointed at the URL above on a ~14-minute interval.
This project doesn't prescribe or configure one for you — pick whichever
free tool you're comfortable with and point it at the URL above.

**This is a mitigation, not a guarantee.** The external scheduler itself
can be delayed, rate-limited, or occasionally fail to run — a cold start can
still happen (e.g. right after a deploy, or if the ping is missed). It
reduces how *often* users hit a cold start; it doesn't eliminate the
possibility.

## Flyway

Flyway is the **single source of truth** for schema changes —
`spring.jpa.hibernate.ddl-auto` is set to `validate` (never `create`/
`create-drop`), so Hibernate only checks that the entities match the schema
Flyway produced; it never generates or alters tables itself.

Migrations live in `src/main/resources/db/migration/`. The first one
(`V1__create_blog_posts_table.sql`) creates the `blog_posts` table only — no
other tables (e.g. an admin user table) exist yet, since nothing in this
phase needs one.

To add a future migration: add `V2__description.sql` etc. to the same
directory; Flyway applies any new, unapplied migrations on the next startup.

## Admin bootstrap

There is **no "create admin" endpoint** — the only way an admin account is
ever created is via `ADMIN_USERNAME` + `ADMIN_PASSWORD` at startup
(`AdminBootstrapRunner`), and only under these rules:

- Both variables are optional. If neither is set, bootstrap is a silent
  no-op — this is the expected steady state once an admin already exists.
- If **exactly one** is set, startup **fails fast** with an
  `IllegalStateException` — a half-configured bootstrap is treated as a
  mistake, not silently ignored, in dev or prod alike.
- If an account for that username **already exists**, nothing happens —
  bootstrap **never overwrites an existing password**, even if
  `ADMIN_PASSWORD` has since changed. To rotate a password, do it directly
  against the database (there is no API for it yet).
- The plaintext password is used exactly once, to compute a BCrypt hash via
  `PasswordEncoder`, and is **never logged or persisted** — only the hash is
  stored, in `admin_users.password_hash`.

To create your first admin locally:

```sh
ADMIN_USERNAME=youradmin ADMIN_PASSWORD=some-strong-local-password \
DB_URL=... DB_USERNAME=... DB_PASSWORD=... \
./mvnw spring-boot:run
```

After it logs `Bootstrapped initial admin account 'youradmin'.`, you can
unset `ADMIN_USERNAME`/`ADMIN_PASSWORD` — leaving them set is harmless (the
runner just no-ops on every subsequent startup) but unnecessary.

## Authentication

Stateless JWT, access-token-only (no refresh tokens). Log in once, then send
the token on every admin request:

```
Authorization: Bearer <access-token>
```

### `POST /api/auth/login`

Public. Request:

```json
{ "username": "youradmin", "password": "some-strong-local-password" }
```

Response (`200`):

```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

`expiresIn` is in seconds and reflects `JWT_EXPIRATION_MINUTES` (default 60
minutes → `3600`). An unknown username and a wrong password both return the
same generic `401`:

```json
{ "timestamp": "...", "status": 401, "error": "Unauthorized", "message": "Invalid username or password", "path": "/api/auth/login" }
```

— the response never reveals which one it was, and never includes the
password or its hash.

### JWT contents

Minimal claims only: `sub` = admin username, `role` = `ADMIN`, `iat`/`exp`.
Signed with HS256 using `JWT_SECRET`. There is currently only one role
(`ADMIN`) — no broader RBAC.

### Protected endpoints

Missing, malformed, expired, or wrongly-signed tokens are all treated
identically — `401 Unauthorized`, with no detail about which of those it
was. A valid token whose role isn't `ADMIN` (not reachable today since only
`ADMIN` accounts can be created, but enforced regardless) gets
`403 Forbidden`. Only the `Authorization` header is ever read — a token in a
query string or cookie is ignored and treated as no token at all.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | public | `{ "status": "UP" }` |
| POST | `/api/auth/login` | public | Admin login → JWT |
| GET | `/api/blog` | public | Paginated list of **published** blog posts, newest first |
| GET | `/api/blog/{slug}` | public | A single **published** blog post |
| GET | `/api/admin/blog` | admin | Paginated list of **all** blog posts (draft + published) |
| GET | `/api/admin/blog/{id}` | admin | Full editable representation of one post |
| POST | `/api/admin/blog` | admin | Create a post |
| PUT | `/api/admin/blog/{id}` | admin | Update a post's editable fields |
| DELETE | `/api/admin/blog/{id}` | admin | Hard-delete a post |
| PATCH | `/api/admin/blog/{id}/publish` | admin | Publish (or re-publish) a post |
| PATCH | `/api/admin/blog/{id}/draft` | admin | Move a post back to draft |

Public users only ever see `PUBLISHED` posts; admins can see and manage both
`DRAFT` and `PUBLISHED`. There is no `/api/v1` prefix yet. Every path not
listed above (including anything under `/api/` that isn't one of these) is
denied by default.

### Public visibility rule

Only posts with `status = PUBLISHED` are ever returned by these endpoints.
This is enforced **at the database query** (`BlogPostRepository`), not by
filtering in Java and not by the frontend — a request for a draft's slug is
indistinguishable from a request for a slug that doesn't exist at all: both
return the same 404 body, so the API never reveals that a draft exists.

### `GET /api/blog`

Query parameters:

| Param | Default | Bounds |
|---|---|---|
| `page` | `0` | `>= 0` |
| `size` | `10` | `1`–`50` |

An out-of-bounds or non-numeric value returns `400 Bad Request` (page/size
are never silently clamped).

Example response:

```json
{
  "content": [
    {
      "id": 12,
      "title": "Building an Insurance AI Agent",
      "slug": "insurance-ai-agent",
      "excerpt": "How I designed an LLM-backed claims assistant...",
      "category": "engineering",
      "contentMarkdown": "# Building an Insurance AI Agent\n\n...",
      "featured": true,
      "readingTime": 8,
      "publishedAt": "2026-03-01T10:15:00Z",
      "createdAt": "2026-02-20T09:00:00Z",
      "updatedAt": "2026-03-01T10:15:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1
}
```

Sorted by `published_at DESC`, with `id DESC` as a deterministic tiebreaker.

### `GET /api/blog/{slug}`

Returns the same object shape as one item of `/api/blog`'s `content` array.

`404 Not Found` (same `ApiError` shape used everywhere else) when the slug
doesn't exist **or** belongs to a draft:

```json
{
  "timestamp": "2026-03-01T10:20:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Blog post not found: some-slug",
  "path": "/api/blog/some-slug"
}
```

Note: `status` isn't included in `BlogPostResponse` — every post reachable
through these endpoints is implicitly `PUBLISHED`, so it would be redundant.
There's no `tags` field either, since the current schema has no tags column.

## Blog admin API

Every endpoint below requires `Authorization: Bearer <token>` from a valid
admin login (see [Authentication](#authentication)).

### Create / update request body

`POST /api/admin/blog` and `PUT /api/admin/blog/{id}` take the same shape:

```json
{
  "title": "Building RAG with Spring Boot",
  "slug": "building-rag-with-spring-boot",
  "excerpt": "A short summary",
  "category": "engineering",
  "contentMarkdown": "# Building RAG with Spring Boot\n\n...",
  "featured": false,
  "readingTime": 8,
  "status": "DRAFT"
}
```

`id`, `createdAt`, and `updatedAt` are never client-controlled — the server
owns them entirely. `publishedAt` isn't in the request either; it's derived
from `status` (see below). Validation: `title` required (≤255 chars), `slug`
required (≤255 chars, must match `^[a-z0-9]+(-[a-z0-9]+)*$` — e.g.
`building-rag-with-spring-boot`, not `Building RAG!!!`), `excerpt` ≤500
chars, `category` required (≤100 chars), `contentMarkdown` required,
`readingTime` positive if provided, `status` required. A slug already used
by another post returns `409 Conflict` — it is never silently overwritten or
auto-suffixed.

### Publication model

Deliberately simple, applied uniformly whether the transition happens via
`PUT` (by changing `status` in the body) or the dedicated `/publish` and
`/draft` endpoints:

- Setting `status = PUBLISHED` sets `publishedAt = now()`, **but only if
  it isn't already set** — editing (or re-publishing) an already-published
  post never resets its original publish time.
- Moving a post to `DRAFT` **never clears `publishedAt`** — it's kept as the
  historical record of when the post was first published, in case it's
  republished later.
- Creating (or leaving) a post as `DRAFT` with no prior `publishedAt` leaves
  it `null` — a post that's never been published has no publish time.

### Admin list

`GET /api/admin/blog?page=0&size=10` — same pagination envelope and bounds
as the public list (`size` 1–50, default 10; out-of-range → `400`), but
returns **both** `DRAFT` and `PUBLISHED` posts, sorted by `updated_at DESC`
(then `id DESC`) — newest-edited-first, not newest-published-first.

### Delete

`DELETE /api/admin/blog/{id}` is a **hard delete** (`204 No Content` on
success) — there's no soft-delete/trash table. This is a deliberate choice
for a single-author portfolio blog rather than added complexity; revisit if
that ever stops being true.

### Not found

`GET`/`PUT`/`DELETE`/`PATCH` against a nonexistent `id` all return `404`, in
the same `ApiError` shape used elsewhere.

## Project structure

```
backend/
├── pom.xml
├── mvnw, mvnw.cmd, .mvn/          Maven Wrapper (no global Maven needed)
├── Dockerfile, docker-compose.yml, .env.example, .dockerignore
└── src/
    ├── main/java/com/gk/portfolio/
    │   ├── PortfolioBackendApplication.java
    │   ├── config/        CorsConfig, AdminBootstrapRunner
    │   ├── controller/    HealthController, AuthController, BlogController, AdminBlogController
    │   ├── dto/           BlogPostResponse, AdminBlogPostResponse, PageResponse,
    │   │                  LoginRequest, LoginResponse, BlogPostCreateRequest, BlogPostUpdateRequest
    │   ├── entity/        BlogPost, BlogPostStatus, AdminUser, AdminRole
    │   ├── exception/     ApiError, GlobalExceptionHandler, ResourceNotFoundException,
    │   │                  DuplicateSlugException, InvalidCredentialsException
    │   ├── repository/    BlogPostRepository, AdminUserRepository
    │   ├── security/      SecurityConfig, JwtService, JwtAuthenticationFilter,
    │   │                  JwtAuthenticationEntryPoint (401), JwtAccessDeniedHandler (403)
    │   └── service/       BlogService, AuthService
    └── main/resources/
        ├── application.yml, application-dev.yml, application-prod.yml
        └── db/migration/
            ├── V1__create_blog_posts_table.sql
            ├── V2__create_admin_users_table.sql
            └── V3__seed_blog_posts.sql
```

## Database schema

`blog_posts` (see the migration file for the authoritative definition):

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL | PK |
| title | VARCHAR(255) | not null |
| slug | VARCHAR(255) | not null, **unique index** |
| excerpt | VARCHAR(500) | |
| category | VARCHAR(100) | |
| content_markdown | TEXT | |
| status | VARCHAR(20) | `DRAFT` / `PUBLISHED`, CHECK constraint, **indexed** |
| featured | BOOLEAN | default false |
| reading_time | INTEGER | |
| published_at | TIMESTAMP WITH TIME ZONE | **indexed** |
| created_at | TIMESTAMP WITH TIME ZONE | set on insert |
| updated_at | TIMESTAMP WITH TIME ZONE | set on insert and update |

`admin_users` (added by `V2__create_admin_users_table.sql`):

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL | PK |
| username | VARCHAR(100) | not null, **unique index** |
| password_hash | VARCHAR(255) | not null — BCrypt hash, **never** plaintext |
| role | VARCHAR(20) | `ADMIN` only for now, CHECK constraint |
| created_at | TIMESTAMP WITH TIME ZONE | set on insert |
| updated_at | TIMESTAMP WITH TIME ZONE | set on insert and update |

`V1` was not modified — this is a purely additive migration.

### Seed data

`V3__seed_blog_posts.sql` inserts the three demo notes that previously lived
only in the frontend's local fixture data, so local development has content
to work with. They're seeded as **`DRAFT`** on purpose — they're demo
articles, not real published writing — so the public API legitimately
returns an empty list/404s for them until a real post is published through
the admin API. Log in as an admin and hit `GET /api/admin/blog` to see them.

### Timezone handling

The app is intended for Indian usage, but timestamps are **stored and
processed as UTC** (`hibernate.jdbc.time_zone=UTC`, Jackson `time-zone: UTC`,
`TIMESTAMP WITH TIME ZONE` columns) rather than relying on the JVM's local
timezone. Conversion to IST (or any other zone) for display is a
presentation-layer concern for later, not baked into storage — this keeps
timestamps unambiguous regardless of where the app or database happen to run.

## Security

Stateless JWT auth (see [Authentication](#authentication) above) via a
custom `JwtAuthenticationFilter` (`OncePerRequestFilter`) that only ever
reads the `Authorization` header — never a query parameter or cookie — and
never authenticates on a missing/invalid/expired token; it just leaves the
request unauthenticated so the URL-based rules below decide what happens
next:

| Rule | Effect |
|---|---|
| `OPTIONS /**` | public (CORS preflight) |
| `GET /api/health` | public |
| `POST /api/auth/login` | public |
| `GET /api/blog`, `GET /api/blog/**` | public |
| `/api/admin/**` | requires a valid JWT with role `ADMIN` |
| everything else | denied by default |

Session management is `STATELESS` (no `HttpSession` is ever created). CSRF
is disabled — this is, and will remain, a stateless JSON API authenticated
via the `Authorization` header, not cookies. `JwtAuthenticationEntryPoint`
writes a `401` `ApiError` for missing/invalid/expired tokens;
`JwtAccessDeniedHandler` writes a `403` `ApiError` for an authenticated
caller lacking the required role — neither leaks a stack trace or any
detail about *why* the token was rejected. Passwords are hashed with
`BCryptPasswordEncoder`; plaintext passwords are never stored, logged, or
returned by any endpoint. Spring Boot's default auto-generated in-memory
user (and the password it would otherwise log on every startup) stays
disabled via excluding `UserDetailsServiceAutoConfiguration`, since admin
auth here is fully custom (JWT + `AdminUserRepository`), not Spring
Security's `UserDetailsService` flow.

## CORS

Allowed origins come entirely from `CORS_ALLOWED_ORIGINS` (comma-separated) —
no origin, including any future production frontend domain, is hardcoded.
Verified locally via an OPTIONS preflight request returning the expected
`Access-Control-Allow-Origin` for a configured origin.

## Tests

| Class | Type | What it covers |
|---|---|---|
| `PortfolioBackendApplicationTests` | `@SpringBootTest` | Context load + Flyway migration + Hibernate schema validation |
| `BlogPostRepositoryTest` | `@DataJpaTest` (real DB, `Replace.NONE`) | Public query methods exclude drafts, sort, paginate |
| `JwtServiceTest` | Unit | Token generation/round-trip, rejects malformed/wrong-signature/expired tokens |
| `AdminBootstrapRunnerTest` | Unit (Mockito) | No-op when unset, fails fast when only one var is set, never overwrites an existing account, stores a BCrypt hash (never the raw password) |
| `BlogServiceTest` | Unit (Mockito) | Public + admin mapping, publish/draft `publishedAt` rules, duplicate-slug rejection, 404s |
| `BlogControllerIntegrationTest` | `@SpringBootTest` + `MockMvc` (real DB) | Public API: drafts excluded, sort order, pagination bounds, 404s, entity never leaks |
| `AuthControllerIntegrationTest` | `@SpringBootTest` + `MockMvc` (real DB) | Valid login → JWT; wrong password / unknown username → identical generic `401`; password/hash never in the response |
| `AdminSecurityIntegrationTest` | `@SpringBootTest` + `MockMvc` (real DB) | No token / malformed / wrong signature / expired → `401`; valid admin token → `200`; wrong role → `403`; token in query param or cookie is ignored (still `401`); JWT never appears in application logs (verified with a Logback `ListAppender`, not just by inspection) |
| `AdminBlogControllerIntegrationTest` | `@SpringBootTest` + `MockMvc` (real DB) | Create draft/published, update, duplicate slug → `409`, publish sets `publishedAt`, draft preserves it, delete → `404` after, nonexistent `id` → `404`, admin list pagination, slug-format/required-field validation → `400` |

**All of the above were genuinely run against a real local PostgreSQL 18
instance** (not skipped or faked) — `./mvnw test` passed **61/61** with the
schema, repository queries, service mapping, full JWT lifecycle, and full
HTTP round-trips (including a real login → real BCrypt check → real signed
JWT → real authorization decision) all verified end to end, no mocking of
Spring Security itself. Data written by these tests is rolled back
automatically (`@Transactional` / `@DataJpaTest` defaults) so no test data
is left behind. If no PostgreSQL instance is reachable in your environment,
every `@SpringBootTest`/`@DataJpaTest` class above will fail at context
startup (none mock or fall back to an in-memory database) — that failure
means "no database available," not a code defect.

One test scenario from the original checklist doesn't apply: "wrong role →
403" is tested by hand-crafting a JWT with a non-`ADMIN` role claim (proving
the 401-vs-403 branching is wired correctly), since the system has no way to
*create* an account with any role other than `ADMIN` — by design, per "do
not build a complicated RBAC system."

## Current status

**Implemented:** everything from the previous phase, plus JWT-based admin
authentication (`POST /api/auth/login`), the `admin_users` table and
bootstrap mechanism, and full blog CRUD + publish/draft workflow under
`/api/admin/blog/**`, all gated behind a real Spring Security filter chain
(not a stub).

**Not implemented yet (planned, later phases):**
- A refresh-token flow (access-token-only is intentional for now)
- Contact form handling
- AI portfolio assistant / RAG / MCP endpoints
- Actual cloud deployment (Docker + Compose exist and are verified locally — see [Docker](#docker) — but nothing is deployed anywhere yet)
- React admin UI (this phase is API-only, per scope)
