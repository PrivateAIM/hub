# Authup Structure Reference

Reference: [authup/authup/.agents/structure.md](https://github.com/authup/authup/blob/master/.agents/structure.md)

This documents the target monorepo structure that Hub should converge toward (see Plan 002).

## Monorepo Layout

Authup separates **apps** (runnable applications) from **packages** (shared libraries):

```
apps/
├── authup/              # CLI tool
├── client-web/          # Nuxt web UI
├── client-web-slim/     # Lightweight Vue 3 + Vite UI
└── server-core/         # Main backend service

packages/
├── kit/                 # General utilities (no internal deps)
├── errors/              # HTTP error classes (@ebec/http)
├── specs/               # Constants, interfaces for specifications
├── access/              # Permission & policy evaluation
├── core-kit/            # Domain models & types
├── core-http-kit/       # HTTP client for core API
├── core-realtime-kit/   # WebSocket types
├── server-kit/          # Server utilities (crypto, abstractions)
├── server-adapter-kit/  # Token verification core logic
├── server-adapter-http/ # HTTP middleware adapter
├── server-adapter-socket-io/ # Socket.io middleware adapter
├── client-web-kit/      # Reusable Vue 3 components
└── client-web-nuxt/     # Nuxt integration module
```

## Hub → Authup Mapping

| Authup | Hub Equivalent | Notes |
|--------|---------------|-------|
| `apps/server-core` | `packages/server-core` → `apps/server-core` | Move in Plan 002 |
| `apps/client-web` | `packages/client-ui` → `apps/client-ui` | Move in Plan 002 |
| `apps/authup` (CLI) | No equivalent | Hub services have embedded CLIs |
| `packages/kit` | `packages/kit` | Same role |
| `packages/errors` | No equivalent | Hub uses inline error handling |
| `packages/specs` | No equivalent | Hub uses core-kit for specs |
| `packages/access` | Uses `@authup/access` directly | Not a Hub package |
| `packages/core-kit` | `packages/core-kit` | Same role |
| `packages/core-http-kit` | `packages/core-http-kit` | Same role |
| `packages/core-realtime-kit` | `packages/core-realtime-kit` | Same role |
| `packages/server-kit` | `packages/server-kit` | Same role, needs DI refactor |
| `packages/server-adapter-kit` | `packages/server-http-kit` | Similar but different scope |
| `packages/server-adapter-http` | Part of `server-http-kit` | Hub bundles HTTP + adapter |
| `packages/server-adapter-socket-io` | `packages/server-realtime-kit` | Similar role |
| `packages/client-web-kit` | `packages/client-vue` | Same role |
| `packages/client-web-nuxt` | Uses `@authup/client-web-nuxt` | Not a Hub package |

## Dependency Layer Pattern

Authup enforces explicit dependency layers (Foundation → Layer 1 → ... → Apps). Hub should adopt the same discipline:

```
Foundation (no internal deps):
  kit

Layer 1:
  core-kit          → kit
  core-realtime-kit → kit

Layer 2:
  core-http-kit     → kit, core-kit
  server-kit        → kit, core-kit

Layer 3:
  server-db-kit     → kit, server-kit
  server-http-kit   → kit, core-kit, server-kit

Layer 4 (service kits):
  server-storage-kit, server-telemetry-kit, server-core-worker-kit → server-kit

Apps:
  server-core       → all relevant kits
  server-storage    → server-kit, server-db-kit, storage-kit
  client-ui         → client-vue, core-http-kit
```

## Separation of Concerns

| Concern | Authup | Hub Target |
|---------|--------|------------|
| Domain logic | `core-kit` | `core-kit` |
| API clients | `core-http-kit` | `core-http-kit` |
| UI components | `client-web-kit` | `client-vue` |
| Server infra | `server-kit` | `server-kit` (after DI refactor) |
| Auth middleware | `server-adapter-*` | `server-http-kit` |
