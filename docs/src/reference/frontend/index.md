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
| `NUXT_PUBLIC_STORAGE_URL` | — | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | — | Telemetry service URL |
| `NUXT_PUBLIC_MESSENGER_URL` | — | Messenger service URL |

## Key Features

- **Project management** — create and manage collaborative research projects
- **Analysis workflows** — define, configure, and monitor distributed analyses
- **Node management** — register and manage compute nodes
- **Administration** — realm management, user roles, approval workflows
- **Real-time updates** — live status via WebSocket (Messenger service)

## Technology

- **Nuxt 4** with SSR
- **Vue 3** composition API
- **@privateaim/client-vue** — shared component library
- **@privateaim/core-http-kit** — typed HTTP client for Core API
- **Authup client libraries** — authentication and authorization UI
