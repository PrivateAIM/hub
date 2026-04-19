<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# PrivateAIM Hub — Agent Guide

PrivateAIM Hub is a monorepo for the central services of the PrivateAIM platform — a privacy-preserving analytics infrastructure. It contains backend services (core API, storage, telemetry, messenger, worker), a Nuxt frontend, and shared libraries. All packages are TypeScript, built with Rollup (libraries) or tsc (services), orchestrated by Nx.

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
npm run client-ui               # Nuxt frontend
npm run server-api              # Core API server
npm run server-realtime         # Realtime/WebSocket server
npm run server-train-manager    # Worker service
```

- **Node.js**: 22
- **Package manager**: npm (workspaces)
- **Build orchestration**: Nx 22

### Workspace Layout

Applications (services + frontend) are in `apps/`, shared libraries are in `packages/`. Libraries export ESM (`dist/index.mjs` + types), services compile with tsdown + tsc.

### CLI Entry Points

| Binary               | Source                        |
|----------------------|-------------------------------|
| `server-core` CLI    | `apps/server-core/`           |
| `server-storage` CLI | `apps/server-storage/`        |
| `server-telemetry`   | `apps/server-telemetry/`      |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Monorepo layout, 6 apps + 15 libraries, dependency layers
- **[Architecture](.agents/architecture.md)** — Hexagonal architecture (all services), Routup HTTP, TypeORM, AMQP messaging, Authup auth
- **[Testing](.agents/testing.md)** — Vitest with SWC, multi-database CI matrix (MySQL/Postgres/SQLite)
- **[Conventions](.agents/conventions.md)** — Conventional Commits, Husky hooks, ESLint, Rollup bundling, Nx caching

## Active Plans

Modernization and refactoring plans (execute in order):

1. ~~Tooling Modernization~~ — Complete (#1511)
2. ~~Monorepo Restructuring~~ — Complete (#1512)
3. **[Dependency Injection](.agents/plans/003-dependency-injection.md)** — Replace `singa` singletons with DI container + module system
4. **[Hexagonal: server-core](.agents/plans/004-hexagonal-server-core.md)** — Core/adapters/app separation for the main service
5. ~~[Hexagonal: remaining services](.agents/plans/005-hexagonal-remaining-services.md)~~ — Complete (#1528)
6. **[Service-Level Tests](.agents/plans/006-service-level-tests.md)** — Shared test package + core business logic unit tests
7. **[Message Bus](.agents/plans/007-message-bus.md)** — Rename QueueRouter → MessageBus, driver abstraction (AMQP/Memory)
