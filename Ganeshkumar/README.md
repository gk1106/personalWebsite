# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Connecting to the backend (Blog API)

The public Blog pages fetch live data from the Spring Boot backend — there
is no local/demo blog data bundled anymore.

1. **Environment**: copy `.env.example` to `.env` and adjust if needed:

   ```sh
   cp .env.example .env
   ```

   ```
   VITE_API_BASE_URL=http://localhost:8099
   ```

   Never commit `.env` or `.env.local` (both are gitignored) — only
   `.env.example` is checked in, and it holds no secrets, just a local
   default URL. Production must configure its own `VITE_API_BASE_URL`
   independently; this repo doesn't invent or hardcode a production backend
   URL anywhere.

2. **Start PostgreSQL**, then **the Spring Boot backend** (see
   `backend/README.md` for full setup, including the admin bootstrap):

   ```sh
   cd ../backend
   DB_URL=... DB_USERNAME=... DB_PASSWORD=... ./mvnw spring-boot:run
   ```

3. **Start this frontend**:

   ```sh
   npm run dev
   ```

The backend's `CORS_ALLOWED_ORIGINS` env var must include this app's dev
origin (`http://localhost:5173` by default) — see `backend/README.md`.

The public Blog pages use `GET /api/blog` and `GET /api/blog/{slug}` only —
public, no authentication, no JWT ever attached.

## Admin CMS

A small admin area lives at `/admin` for managing blog posts — separate
layout, separate auth, no shared chrome with the public site.

| Route | Purpose |
|---|---|
| `/admin/login` | Sign in with an admin account (created via the backend's bootstrap — see `backend/README.md`) |
| `/admin` | Dashboard: post counts, create/edit/publish/draft/delete |
| `/admin/blog/new` | Create a post (Markdown editor + live preview) |
| `/admin/blog/:id/edit` | Edit a post |

**Auth model**: `POST /api/auth/login` returns a JWT, stored in
`sessionStorage` (never `localStorage`, never in a URL) under
`gk_admin_token` — tab-scoped, so it survives a refresh but not a new tab.
Every `/api/admin/**` request attaches `Authorization: Bearer <token>`
(`src/services/adminBlogService.ts`); public blog requests never do
(`src/services/blogService.ts` has no knowledge of the token at all — the
two service files are fully decoupled). A `401` from any admin request
clears the token and redirects to `/admin/login`; a `403` shows an
access-denied state instead of logging you out. No new environment
variables are needed beyond `VITE_API_BASE_URL` above — the admin API lives
on the same backend origin.

**Editor**: posts are authored as Markdown (`contentMarkdown`, matching
what the backend stores) — not the `ArticleBlock[]` structured format the
public renderer uses internally. The preview pane reuses the same
`markdownToBlocks` conversion and `ArticleContent` component the public
blog detail page renders with, so what you see in the editor is what
publishing will actually look like. Publish/draft state is changed only
through the dedicated publish/draft actions (dashboard row buttons, or the
status toggle on the edit page) — the create/update form itself never sends
an arbitrary status.

The backend remains the sole authority on what's allowed — this frontend
gate is a UX convenience, not a security boundary.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
