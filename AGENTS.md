<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# PrivateAIM Hub — Agent Guide

PrivateAIM Hub is a monorepo for the central services of the PrivateAIM platform — a privacy-preserving analytics infrastructure. It contains backend services (core API, storage, telemetry, messenger, worker), a Nuxt frontend, shared libraries, and a VitePress documentation site. All packages are TypeScript, built with tsdown (libraries) or tsdown + tsc (services), orchestrated by Nx.

## Quick Reference

```bash
# Setup
npm ci

# Development
npm run build                   # Build all packages (Nx)
npm run test                    # Test all packages (Nx + Vitest)
npm run lint                    # ESLint across all packages
npm run lint:fix                # ESLint with auto-fix

# Dev servers
npm run dev --workspace=apps/client-ui          # Nuxt frontend
npm run dev --workspace=apps/server-core        # Core API server
npm run dev --workspace=apps/server-messenger   # Realtime/WebSocket server
npm run dev --workspace=apps/server-core-worker # Worker service
npm run dev --workspace=docs                    # Documentation site
```

- **Node.js**: 22
- **Package manager**: npm (workspaces)
- **Build orchestration**: Nx 22

### Workspace Layout

Applications (services + frontend) are in `apps/`, shared libraries are in `packages/`, and documentation is in `docs/`. Libraries export ESM (`dist/index.mjs` + types), services compile with tsdown + tsc.

### CLI Entry Points

| Binary               | Source                        |
|----------------------|-------------------------------|
| `server-core` CLI    | `apps/server-core/`           |
| `server-storage` CLI | `apps/server-storage/`        |
| `server-telemetry`   | `apps/server-telemetry/`      |

## Documentation

The `docs/` directory contains a VitePress documentation site. When making changes that affect user-facing behavior, configuration, APIs, or service architecture, **update the corresponding docs pages**. The docs site is the authoritative reference for Hub — docs.privateaim.net should link here, not the other way around.

Key docs areas to keep in sync:
- `docs/src/reference/<service>/` — per-service pages (env vars, endpoints, usage)
- `docs/src/reference/<service>/<kit>.md` — per-package pages (install, API, usage)
- `docs/src/guide/user/` — user-facing workflows (projects, analyses, approval)
- `docs/src/guide/deployment/` — deployment configuration and guides

When you need additional context beyond what's in the code (e.g., deployment patterns, admin workflows, env var semantics), check the docs first: `docs/src/`.

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Monorepo layout, 6 apps + 15 libraries, dependency layers
- **[Architecture](.agents/architecture.md)** — Hexagonal architecture (all services), Routup HTTP, TypeORM, AMQP messaging, Authup auth
- **[Testing](.agents/testing.md)** — Vitest with SWC, multi-database CI matrix (MySQL/Postgres/SQLite)
- **[Conventions](.agents/conventions.md)** — Conventional Commits, Husky hooks, ESLint, tsdown bundling, Nx caching

## Completed Plans

All modernization and refactoring plans are complete:

1. ~~Tooling Modernization~~ — #1511
2. ~~Monorepo Restructuring~~ — #1512
3. ~~Dependency Injection~~ — singa fully removed, all services use eldin/orkos DI
4. ~~Hexagonal: server-core~~ — #1514
5. ~~Hexagonal: remaining services~~ — #1528
6. ~~Service-Level Tests~~ — all 13 entity services, command checkers, core services tested
7. ~~Message Bus~~ — QueueRouter → MessageBus, AMQP/Memory driver abstraction
