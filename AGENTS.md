<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# FLAME Hub — Agent Guide

FLAME Hub is a monorepo for the central services of the FLAME platform — a privacy-preserving analytics infrastructure. It contains backend services (core API, storage, telemetry, messenger, worker), a Nuxt frontend, shared libraries, and a VitePress documentation site. All packages are TypeScript, built with tsdown (libraries) or tsdown + tsc (services), orchestrated by Nx.

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

## Plans

Modernization and refactoring plans:

1. ~~Tooling Modernization~~ — Complete (#1511)
2. ~~Monorepo Restructuring~~ — Complete (#1512)
3. ~~Dependency Injection~~ — Complete (singa fully removed, all services use eldin/orkos DI)
4. ~~Hexagonal: server-core~~ — Complete (#1514)
5. ~~Hexagonal: remaining services~~ — Complete (#1528)
6. ~~Service-Level Tests~~ — Complete (all 13 entity services, command checkers, core services tested)
7. ~~Message Bus~~ — Complete (QueueRouter → MessageBus, AMQP/Memory driver abstraction)
8. ~~[Shared Test Infrastructure](.agents/plans/008-shared-test-infrastructure.md)~~ — Complete (server-test-kit package, shared core types in server-kit, domain-grouped test layout)
9. [Analysis Check Hardening](.agents/plans/009-analysis-check-hardening.md) — Proposed (race-safe check verdicts, worker ports + verdict unit tests, registry error classification, check observability)
10. [Per-Analysis Authup Client](.agents/plans/010-analysis-dedicated-client.md) — In progress (dedicated OAuth2 client per analysis mirroring the Node pattern; phase 4 removed the AnalysisPermission entity (#1692, merged), phase 1 added `analysis.client_id` + `AnalysisClientService` (#1693); remaining: phase 2 admin-configurable capabilities, phase 3 node-side credential delivery)
11. [Analysis Capability Tokens](.agents/plans/012-analysis-capability-tokens.md) — Proposed (resource-scoped, Google-Docs-style capability tokens issued by server-core so analyses can use storage/telemetry/messenger only for owned-or-shared resources; split out of plan 010's phase 5)
12. [Message Broker Rewrite](.agents/plans/013-message-broker-rewrite.md) — In progress (turn the stateless Hub messenger into a durable, analysis-agnostic store-and-forward broker; replace the unmaintainable Java node-message-broker with a thin TS service in a dedicated repo that keeps only E2E crypto + local container delivery). Phase 0 contracts/crypto (#1711) and Phase 1 durable mailbox + REST API (#1715) merged; phase 2 (Hub participant projection) dropped by the general-messenger pivot. Phase 3 adds the payload-free `messagePending` wakeup (redis pub/sub + socket emit) and long-poll `wait`, additively — the legacy relay/presence is kept for coexistence and deleted at decommission (Phase 5). Remaining: phase 4 (new node-broker repo), phase 5 (rollout + legacy removal).

## Commits, Issues & Pull Requests

- Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)** (`@tada5hi/commitlint-config`); the type/scope drive release-please version bumps. See [conventions.md](.agents/conventions.md#commit-convention).
- Versioning, `CHANGELOG.md`, `package.json` version, and `.release-please-manifest.json` are owned by **release-please** — do not hand-edit them.
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.
