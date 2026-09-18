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

Only `GET /api/blog` and `GET /api/blog/{slug}` are used (public, no
authentication) — the admin API and its JWT are not touched by this
frontend yet.

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
