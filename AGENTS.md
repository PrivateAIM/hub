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
- **`npm run lint` enforces it** through the `agentDocs` checks of `@tada5hi/eslint-config` (default limits: 40000 bytes per agent doc, 60000 bytes for everything `CLAUDE.md` loads, no history phrases outside code). Raising a limit is a policy change, not a fix.

## Plans

Open work is tracked in GitHub issues and in the local roadmap `.agents/plans/000-roadmap.md` (gitignored, so it exists only on the maintainer's machine). In progress:

- **Analysis check hardening**: race-safe verdicts shipped (#1954); narrow ports, precise registry classification and check observability remain.
- **Per-analysis Authup client**: `analysis.clientId` provisioning (#1693), capability management and credential rotation exist; typed HTTP-client methods, capability UI and verified node consumption remain.
- **Analysis capability tokens**: storage tokens shipped (mint route, storage verification, client-vue use). Storage reads and uploads are enforced (`bucket_read`, owner reach); telemetry and messenger remain.
- **Message broker rewrite**: durable mailbox and REST API (#1711, #1715) and the payload-free `messagePending` wakeup (#1717) shipped. The legacy relay/presence stays until decommission; the external TS node broker and the rollout remain.
- **Open findings**: run ids for process status, trusted-proxy hop counting for audit IPs.

Delivered work is recorded as invariants in the [topic files](.agents/architecture.md#topic-files), not here.

## Operational Invariants

- Production starts use `startApplication` from server-kit: one-shot SIGINT/SIGTERM teardown bounded to 30 s. server-core closes its Socket.IO server before HTTP.
- The analysis reconciler is registered only with `RemoteMessageBusInjectionKey` (AMQP).
- An analysis update with an unchanged non-null client binding skips the Authup lookup; remote client deletion is not repaired on incidental saves.
- Node-log creation requires an existing analysis-node pair (approval not required). Execution progress and status require node authority on the analysis-node update route; assignment creation ignores execution, approval and comment fields.
- Master-image events apply only to an active STARTING/STARTED build; a fresh STARTED blocks a duplicate BUILD. A failed dispatch keeps its STARTING claim (a broker confirmation failure does not prove non-delivery), so a retry waits for the 15-minute stale takeover, which renews `updatedAt` explicitly.
- Harbor project renames copy, verify, provision, then cut over; the source binding, project and robot stay until success. Migration robots record source/target Harbor ids in their descriptions, and cleanup shares the registry migration lock. Quiesce writers and drain old registry consumers before rollout ([registry project renames](docs/src/guide/deployment/configuration.md#registry-project-renames)).

## Commits, Issues & Pull Requests

- Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)** (`@tada5hi/commitlint-config`); the type/scope drive release-please version bumps. See [conventions.md](.agents/conventions.md#commit-messages).
- Versioning, `CHANGELOG.md`, `package.json` version, and `.release-please-manifest.json` are owned by **release-please** — do not hand-edit them.
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.
