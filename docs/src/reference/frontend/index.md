# Frontend (client-ui)

The frontend is a Nuxt 4 SSR web application that provides the user interface for managing projects, analyses, nodes, and platform administration.

## Running

```bash
# Development (from repo root)
npm run client-ui

# Docker
docker run -e ... privateaim/hub ui
```

## Dependencies

- **Core API** — REST API for all domain operations
- **Authup** — OAuth2 identity provider (login, registration, permissions)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CORE_URL` | — | Core API base URL |
| `NUXT_PUBLIC_AUTHUP_URL` | — | Authup URL |
| `NUXT_PUBLIC_AUTHUP_CLIENT_ID` | `web` | OAuth2 client used for the login (authorization-code) flow |
| `NUXT_PUBLIC_STORAGE_URL` | — | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | — | Telemetry service URL |
| `NUXT_PUBLIC_MESSENGER_URL` | — | Messenger service URL |

## Authentication

The UI signs in with the **OAuth2 Authorization Code flow (PKCE)** — credentials are
never entered in the Hub UI itself. On the login page the user picks a **realm**
(`ARealmGrid`, which reveals a search field once more than 8 realms exist); the app
then builds an authorize URL and redirects to Authup's `/authorize` endpoint, where the
login form and configured identity providers live. Authup redirects back to
`<ui-origin>/login/callback`, and the `@authup/client-web-nuxt` routing interceptor
exchanges the authorization code for a session.

The OAuth client is configurable via `NUXT_PUBLIC_AUTHUP_CLIENT_ID` (default: `web`, the
Authup built-in web client). The configured client **must** register
`<ui-origin>/login/callback` as an allowed redirect URI.

## Key Features

- **Project management** — create and manage collaborative research projects
- **Analysis workflows** — define, configure, and monitor distributed analyses
- **Node management** — register and manage compute nodes
- **Administration** — realm management, user roles, approval workflows
- **Real-time updates** — live status via WebSocket (Messenger service)
- **Light / dark mode** — class-based color mode with a header toggle

## Technology

- **Nuxt 4** with SSR
- **Vue 3** composition API
- **Tailwind CSS v4** via **@privateaim/client-vue-theme** — design tokens, light/dark chrome, card system
- **@vuecs/\*** component framework + **Iconify** SVG icons
- **@privateaim/client-vue** — shared component library
- **@privateaim/core-http-kit** — typed HTTP client for Core API
- **Authup client libraries** — authentication and authorization UI

## Icons

The client ships only the icons it actually renders. `@nuxt/icon`'s standalone vite plugin scans
source for `<collection>:<name>` literals at build time and emits just that subset into
`virtual:nuxt-icon-bundle/register`, which `plugins/vuecs.ts` imports. Registration goes through
`addIcon` from `@iconify/vue` — the same global store `<VCIcon>` reads — so components are
unaffected. This replaced registering the full Font Awesome 6 solid + brands collections (1,902
icons, ~429 KB gzip) and cut the client JS payload from ~1,031 KB to ~623 KB gzip.

The scanned paths are configured in `apps/client-ui/icon-bundle.config.ts`. They cover this app,
`@privateaim/client-vue`, `@privateaim/client-vue-theme`, `@authup/client-web-kit` and
`@vuecs/icons-font-awesome` (whose preset holds the vuecs behavioral defaults — pagination arrows,
submit-button, alert and collapse icons — that appear in no hub source file).

Two consequences for anyone adding an icon:

- **Write the icon name as a literal.** A composed name (`` `fa6-brands:${os}` ``) is invisible to
  the scan, so it is never bundled; `@iconify/vue` then falls back to fetching it from the public
  Iconify API at runtime. Resolve to literals instead — see `FAnalysisBuildStep.vue`.
- **A path that stops matching fails silently** — an empty icon slot, not a build error.
  `apps/client-ui/test/unit/icon-bundle.spec.ts` pins one uniquely-attributable icon per scanned
  source to catch that.
