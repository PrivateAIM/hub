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

- **Node.js**: ≥26.0.0 (declared in root and workspace `engines`)
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
- **[Topic files](.agents/topics/)** — per-subsystem detail, indexed at the end of [architecture.md](.agents/architecture.md#topic-files). NOT loaded into every session: read the topic file before changing that area.

### Writing agent docs

The guides above are loaded into every session, so their whole size is paid on every task. They say what a future task must know to avoid a silent breakage. **They are not a changelog, a design record or a test index.**

| Content | Where it goes |
|---|---|
| A cross-cutting rule or an easy-to-break invariant, its reason, and the rejected alternative | One line in a guide, with the issue number |
| A subsystem's invariants and rejected alternatives | Its topic file (`.agents/topics/<name>.md`) |
| Mechanism the code already shows | Nowhere, or a code comment |
| How a defect happened, before/after, "spec X covers it" | The PR description or commit message |
| What changed for users or operators | CHANGELOG or the docs site |

The test for a paragraph: would removing it let a reasonable change break something silently? If not, leave it out.

- **Update docs only when an invariant or a cross-cutting rule changes.** A bug fix or a feature that follows the existing rules needs no doc change. Edit the existing line; never add a section for a single fix. A routine dependency bump goes in the PR body, not here.
- **Describe what the code does now.** No `used to`, `no longer`, `before #N`. The one exception is a rejected alternative: keep the verdict and its one-line reason.
- **Cite issues or PRs, never local plan files**: `.agents/plans/` is gitignored and resolves for one person on one machine.
- **`npm run lint` enforces it** through the `agentDocs` checks of `@tada5hi/eslint-config`: a size limit per agent doc, a limit on everything `CLAUDE.md` loads through its imports, and no history phrases outside code. Lower the limits in `eslint.config.js` as the docs shrink; raising one is a policy change, not a fix.

## Plans

**Start with the [overarching roadmap](.agents/plans/000-roadmap.md)** for the verified plan inventory, remaining work, dependency order and issue triage (reviewed 2026-10-30). [Focused bug/audit revalidation](.agents/plans/025-bug-audit-revalidation.md) records current evidence and the remediation queue; completed plans 016/023 and superseded pointer 020 were removed. The numbered history below records delivered work, not the execution order. `.agents/plans/` is currently gitignored; new roadmap/plan changes remain local unless explicitly included.

Modernization and refactoring plans:

1. ~~Tooling Modernization~~ — Complete (#1511)
2. ~~Monorepo Restructuring~~ — Complete (#1512)
3. ~~Dependency Injection~~ — Complete (singa fully removed, all services use eldin/orkos DI)
4. ~~Hexagonal: server-core~~ — Complete (#1514)
5. ~~Hexagonal: remaining services~~ — Complete (#1528)
6. ~~Service-Level Tests~~ — Complete (all 13 entity services, command checkers, core services tested)
7. ~~Message Bus~~ — Complete (QueueRouter → MessageBus, AMQP/Memory driver abstraction)
8. ~~Shared Test Infrastructure~~ — Complete (server-test-kit package, shared core types in server-kit, domain-grouped test layout)
9. [Analysis Check Hardening](.agents/plans/009-analysis-check-hardening.md) — Partial (race-safe verdicts shipped in #1954; worker verdict tests exist; proposed narrow ports, precise registry classification and check observability remain to revalidate/complete)
10. [Per-Analysis Authup Client](.agents/plans/010-analysis-dedicated-client.md) — Partial (phase 4 removed AnalysisPermission (#1692), phase 1 added `analysis.clientId` + provisioning (#1693); capability-management backend and credential pull/rotation service also exist. Remaining: typed HTTP-client methods, capability UI and verified external node consumption)
11. [Analysis Capability Tokens](.agents/plans/012-analysis-capability-tokens.md) — Proposed (resource-scoped, Google-Docs-style capability tokens issued by server-core so analyses can use storage/telemetry/messenger only for owned-or-shared resources)
12. [Message Broker Rewrite](.agents/plans/013-message-broker-rewrite.md) — In progress (turn the stateless Hub messenger into a durable, analysis-agnostic store-and-forward broker; replace the unmaintainable Java node-message-broker with a thin TS service in a dedicated repo that keeps only E2E crypto + local container delivery). Phase 0 contracts/crypto (#1711) and Phase 1 durable mailbox + REST API (#1715) merged; phase 2 (Hub participant projection) dropped by the general-messenger pivot. Phase 3's payload-free `messagePending` wakeup and long-poll/SSE also merged (#1717) — the legacy relay/presence is kept for coexistence and deleted at decommission (Phase 5). Remaining: phase 4 (verify/complete the external TS node broker; repository existence is not completion), phase 5 (rollout + legacy removal).
Items 13 to 35 (delivered work since #1794) are recorded in the topic file of the area they changed, under their own heading:

| Topic | Items |
|---|---|
| [query-surface](.agents/topics/query-surface.md) | 13 rapiq v2 + authup beta.54 follow-ups, 24 indexed query surface + schema drift gate (#1842, #1823) |
| [testcontainers](.agents/topics/testcontainers.md) | 14 Testcontainers + always-on Authup |
| [http-api](.agents/topics/http-api.md) | 15 record envelope + `meta.schema` (#1794), 16 contract-first HTTP clients (#1800) |
| [authorization](.agents/topics/authorization.md) | 17 `IPermissionEvaluator` alignment, 27 read authorization on catalogs, 28 permission cleanup, 29 to 33 analysis reach and `realm_scope` writes/realtime, Authup beta.68 to beta.70 upgrades |
| [database](.agents/topics/database.md) | 18 camelCase properties (#1501), 25 typeorm-extension 4.2 (#1900) |
| [dependencies](.agents/topics/dependencies.md) | 19 authup beta.62 / rapiq 2.2 / validup 2, 20 authup beta.63, 23 authup beta.65 |
| [server-telemetry](.agents/topics/server-telemetry.md) | 21 telemetry event hardening (#1745) |
| [frontend](.agents/topics/frontend.md) | 22 SSR hydration handoff (#1805) |
| [messaging-delivery](.agents/topics/messaging-delivery.md) | 26 messaging delivery semantics |
| [messaging](.agents/topics/messaging.md) | 34 shared components (hubwire), 35 hubwire 0.2 |

## Current hardening follow-up (2026-10-30)

Step-2 fixes from [bug/audit revalidation](.agents/plans/025-bug-audit-revalidation.md):
- Node-log creation requires an existing analysis-node pair, without requiring approval. Execution progress and status both require node authority on the existing analysis-node update route. Assignment creation ignores execution/approval/comment fields; those use the authorized update path.
- Node rename relink preserves the previous Harbor project name. Master-image events require an active STARTING/STARTED build; fresh STARTED blocks duplicate BUILD just like STARTING. A stale takeover explicitly renews `updatedAt` to prevent a no-op save from leaving the claim stale.
- Production starts use `startApplication` from server-kit for one-shot SIGINT/SIGTERM teardown, bounded to 30 seconds including leaked handles. Failed setup triggers cleanup; successful shutdown drains buffered output naturally. Core retains/closes its Socket.IO server before HTTP. Scheduled `settled()` handling still lives in the modules. Orkos suppresses individual teardown errors; detecting them still needs upstream support.
- The analysis reconciler is registered only with `RemoteMessageBusInjectionKey`. Ordinary analysis updates with an unchanged non-null client binding skip Authup lookup; explicit missing/changed bindings still provision/check, but remote client deletion is not repaired on incidental status saves.
- Harbor project renames use copy/verify/provision/cutover, not unlink/link. The active registry-project binding and credentials remain at the source until success; source project/robot stay retained. Migration robots carry durable source/target Harbor ID records in their descriptions (arbitrary project metadata is unsupported). Cleanup shares the registry migration lock and honours those records. Writers must be quiesced operationally; inventory stability is not a write fence. Drain old registry consumers before rollout. See [registry project renames](docs/src/guide/deployment/configuration.md#registry-project-renames).
- Failed master-image dispatch keeps its fresh STARTING claim: a broker confirmation failure does not prove non-delivery. Worker outcomes remain accepted after the request fails; immediate retries are blocked until the existing 15-minute stale takeover threshold. No delivery certainty or run IDs are added.
- Trusted-proxy/audit-IP changes were explicitly skipped. Run IDs, direct storage authorization and other residual findings remain open.

## Commits, Issues & Pull Requests

- Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)** (`@tada5hi/commitlint-config`); the type/scope drive release-please version bumps. See [conventions.md](.agents/conventions.md#commit-messages).
- Versioning, `CHANGELOG.md`, `package.json` version, and `.release-please-manifest.json` are owned by **release-please** — do not hand-edit them.
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.
