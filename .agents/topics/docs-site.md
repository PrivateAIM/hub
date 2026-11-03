# Documentation Site

Read before adding or restructuring pages of the VitePress site in docs/.

## Using Docs as Context

When you need context beyond the code (deployment patterns, admin workflows, env var semantics, platform concepts), check docs first:

- `docs/src/reference/` — per-service configuration, env vars, endpoints, related packages
- `docs/src/guide/user/` — user-facing workflows (projects, analyses, approval, realms)
- `docs/src/guide/deployment/` — Docker Compose, Kubernetes, reverse proxy configuration
- `docs/src/guide/development/` — local setup, repo structure, contributing

## Docs Structure

```
docs/src/
├── .vitepress/config.mjs   # Nav, sidebar, theme config
├── index.md                 # Landing page
├── getting-started/         # Overview, architecture
├── guide/
│   ├── user/                # Projects, analyses, approval, nodes, realms
│   ├── deployment/          # Configuration, Docker, Docker Compose, Kubernetes, reverse proxy
│   └── development/         # Contributing, setup, repository structure, API, camelCase migration
├── reference/               # index.md + per service area (service index.md + its packages)
│   ├── shared/              # kit, server-kit, server-db-kit, server-http-kit
│   ├── core/                # server-core + core-kit, core-http-kit, core-realtime-kit
│   ├── worker/              # server-core-worker + server-core-worker-kit
│   ├── storage/             # server-storage + storage-kit, server-storage-kit
│   ├── telemetry/           # server-telemetry + telemetry-kit, server-telemetry-kit
│   ├── messenger/           # server-messenger + messenger-kit, messenger-http-kit, server-realtime-kit
│   └── frontend/            # client-ui + client-vue, client-vue-theme
├── about/team.{md,vue}      # Team page
└── public/images/           # UI screenshots and architecture diagram
```
