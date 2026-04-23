# Conventions

## Commit Messages

**Conventional Commits** enforced by commitlint (`@tada5hi/commitlint-config`) + Husky:

```
type(scope): description

# Examples:
feat(server-core): add analysis bucket file upload
fix(deps): bump the minorandpatch group with 10 updates
chore: release master
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

## Linting

ESLint 10 with `@tada5hi/eslint-config` (flat config):

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

Config: `eslint.config.js` — extends `@tada5hi/eslint-config` with Vue-specific overrides (`no-explicit-any` off for `.vue` files). Ignores: `dist`, `*.d.ts`, `node_modules`, `.nuxt`, `.nx`, `writable`, `.output`.

## Pre-commit Hooks

Husky runs on every commit:
1. **lint-staged** — ESLint with fix on `*.{vue,js,ts}`
2. **commitlint** — Validates commit message format (`commitlint.config.mjs`)

## Build System

### Libraries (kits)

Built with **tsdown** (powered by rolldown/oxc):

```bash
npm run build         # rimraf dist/ && tsdown
```

Config: `tsdown.config.ts` per package — `entry: 'src/index.ts'`, `format: 'esm'`, `dts: true`, `sourcemap: true`.

Output: ESM only (`dist/index.mjs`) with TypeScript declarations (`dist/index.d.mts`).

**Special case:** `client-vue` uses `@vitejs/plugin-vue` + `@tsdown/css` for Vue SFC compilation, with `vue-tsc` for type declarations (`dts: false` in tsdown, separate `build:types` script).

### Services

Built with **tsdown** (JS) + **tsc** (type declarations):

```bash
npm run build:js      # tsdown (bundle: false, preserves directory structure)
npm run build:types   # tsc --emitDeclarationOnly -p tsconfig.build.json
npm run build         # rimraf dist/ + both above
```

Config: `tsdown.config.ts` per service — `entry: ['src/**/*.ts']`, `format: 'esm'`, `bundle: false`, `dts: false`, `sourcemap: true`.

Output: ESM files (`dist/**/*.mjs`) preserving source directory structure, plus TypeScript declarations (`dist/**/*.d.ts`). CLI entry points at `dist/cli/index.mjs`.

### Nx Orchestration

Nx handles cross-package build ordering via `dependsOn: ["^build"]` in `nx.json`. Build results are cached.

```bash
npm run build         # npx nx run-many -t build
npm run test          # npx nx run-many -t test
```

## TypeScript

- Extends `@tada5hi/tsconfig` with project-specific overrides
- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- `strict: false` (migration to `strict: true` is a future effort)
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`) — required for TypeORM entities
- All packages use `"type": "module"` (ESM-only, no CJS exports)
- **Naming**: Interfaces always have an `I` prefix (e.g. `IEntityRepository`, `IAnalysisStorageManager`). Types do not (e.g. `ActorContext`, `EntityPersistContext`).
- **Types/interfaces** always live in `types.ts` in the same directory, never inline in module files

## Validation

**Zod 4** schemas via `validup` adapters. Domain types in kit packages have corresponding validators:

```typescript
// packages/core-kit/src/domains/<entity>/validator.ts
import { z } from 'zod';
export const analysisSchema = z.object({
    name: z.string().max(128).optional(),
    // ...
});
```

## Release Process

Automated via **release-please** (Google) for versioning + **monoship** (`tada5hi/monoship@v2`) for npm publishing. Creates release PRs that bump versions across all packages in lockstep (current: 0.8.31).

## Hexagonal Architecture (all services)

All services follow a hexagonal (ports & adapters) architecture matching authup's `apps/server-core/src/` layout:

```
src/
├── core/          # Domain logic — zero imports from adapters/, app/, typeorm, routup
├── adapters/      # External system implementations (database, HTTP, socket)
└── app/           # Orchestration — DI modules, wiring, factory, infrastructure
```

### Dependency Rule

**core/ → nothing** (only external domain packages like `@privateaim/core-kit`, `@privateaim/kit`, `@privateaim/server-kit`, `@ebec/http`, `@authup/access`)
**adapters/ → core/ and app/** (implements core ports, may use app DI modules)
**app/ → core/ and adapters/** (wires everything together)

### Core Layer Conventions

- **Entity services** (`core/entities/<name>/service.ts`): Own validation (`this.validator.run(data, { group: ValidatorGroup.CREATE })`), receive repos via constructor injection
- **Port interfaces** (`core/entities/<name>/types.ts`): `IXRepository extends IEntityRepository<T>`, `IXService`
- **Business services** (`core/services/`): Accept all dependencies via constructor (repositories, callers, task managers)
- **Service port interfaces** (`core/services/types.ts`): `IAnalysisBuilderCaller`, `IBucketCaller`, `ITaskManager`, etc.
- **No TypeORM, no routup** imports anywhere in `core/`. Use container DI via injection keys.

### Controller Conventions

Controllers are truly thin — only: extract request → build `ActorContext` → delegate to service → send response. **Zero validation, zero business logic.**

```typescript
@DPost('', [ForceLoggedInMiddleware])
async add(@DBody() data: any, @DRequest() req: any, @DResponse() res: any) {
    const actor = buildActorContext(req);
    const entity = await this.service.create(data, actor);
    return sendCreated(res, entity);
}
```

### Repository Field Selection Conventions

Repository adapters define `DEFAULT_FIELDS` (returned by default) and optionally `ALLOWED_FIELDS` (requestable via `?fields=+field_name`). Sensitive columns with `select: false` on the TypeORM entity must be in `ALLOWED_FIELDS` but NOT in `DEFAULT_FIELDS`.

```typescript
// app/modules/database/repositories/registry/repository.ts
const DEFAULT_FIELDS: ParseAllowedOption<RegistryEntity> = [
    'id', 'name', 'host', 'account_name', 'created_at', 'updated_at',
];

const ALLOWED_FIELDS: ParseAllowedOption<RegistryEntity> = [
    ...DEFAULT_FIELDS,
    'account_secret',  // select: false on entity — only returned when explicitly requested
];

// In findMany():
const fieldsParsed = parseQueryFields<RegistryEntity>(fields, {
    default: DEFAULT_FIELDS,
    allowed: ALLOWED_FIELDS,  // NOT DEFAULT_FIELDS — allows opt-in field selection
    defaultPath: 'registry',
});
```

When an entity has permission-gated fields, the service's `getMany`/`getOne` methods accept `ActorContext` and check permissions before allowing access:

```typescript
// core/entities/registry/service.ts
async getMany(query: Record<string, any>, actor: ActorContext) {
    await this.checkSecretFieldAccess(query, actor);
    return this.repository.findMany(query);
}
```

The controller passes `buildActorContext(req)` for GET endpoints on these entities.

### Subscriber Conventions

Subscribers are **pre-instantiated** with dependencies in `DatabaseModule.setup()` and pushed onto `dataSource.subscribers`. No `@EventSubscriber()` decorators — no auto-discovery.

```typescript
// In DatabaseModule.setup():
dataSource.subscribers.push(
    new NodeSubscriber({ nodeClientService }),
    new AnalysisSubscriber(),
    new RegistrySubscriber(),
);
```

Subscribers are purely for domain event publishing (via `BaseSubscriber`). Business logic (metadata recalculation, storage management) lives in entity services, not subscribers.

## DI Modules

Each DI module (orkos `IModule` implementation) lives in its own directory under `app/modules/<name>/`:

```
app/modules/<name>/
├── constants.ts     # TypedToken injection keys
├── types.ts         # Option types/interfaces
├── module.ts        # IModule class implementation
└── index.ts         # Barrel re-exports
```

- **Injection keys** use `TypedToken<T>` from `eldin` — one constant per token, co-located with the module that registers it
- **Types/interfaces** always live in `types.ts`, never inline in `module.ts`
- **Module names** are string constants in `ModuleName` enum (`packages/server-kit/src/services/module-names.ts`)
- **Shared modules** (logger, redis, amqp, authup, cache, entity-event, queue-router) live in `packages/server-kit/src/services/<name>/`
- **Per-service modules** (database, minio, victoria-logs, etc.) live in `apps/<service>/src/app/modules/<name>/`
- Each service has `app/builder.ts` (`ServiceXApplicationBuilder extends BaseApplicationBuilder`) with `withConfig()`, `withDatabase()`, `withHTTP()`
- Each service has `app/factory.ts` with `createApplication()` using the builder
- **`start.ts` should be minimal** — just `createApplication()` + `app.setup()`. All orchestration (DB, HTTP, swagger, harbor, components) happens in modules.
- **HTTPModule starts the server** — `server.listen()` is inside the module with a Promise, not in `start.ts`. Socket server is toggleable via `options.socket`.

### server-core Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource`, 13 repo adapters, `RegistryManager` |
| ComponentsModule | `components` | `database` | `TaskManager`, `RegistryComponentCaller` |
| AnalysisModule | `analysis` | `database`, `components` | `Builder`, `Configurator`, `Distributor`, `StorageManager`, 3 metadata recalculators |
| SwaggerModule | `swagger` | `config` | nothing (generates docs) |
| HarborModule | `harbor` | `config`, `database` | nothing (sets up registry) |
| AggregatorsModule | `aggregators` | `database`, `components` | nothing (starts AMQP event consumers) |
| HTTPModule | `http` | `config`, `database`, `analysis` | `Server`, `Router` |
| AuthupSetupModule | `authupSetup` | none | nothing (provisions realm, clients, permissions) |
| TelemetryClientModule | `telemetryClient` | (optional) | `TelemetryClient` |

### server-telemetry Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource` |
| VictoriaLogsModule | `victoriaLogs` | `config` | `VictoriaLogsClient`, `LogStore` |
| SwaggerModule | `swagger` | `config` | nothing (generates docs) |
| ComponentsModule | `components` | none | nothing (starts event + log consumers) |
| HTTPModule | `http` | `config`, `database`, `victoriaLogs` | `Server`, `Router` |

### server-storage Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource` |
| MinioModule | `minio` | `config` | `MinioClient` |
| SwaggerModule | `swagger` | `config` | nothing (generates docs) |
| ComponentsModule | `components` | `minio` | nothing (starts bucket consumers) |
| HTTPModule | `http` | `config`, `database`, `minio`, `components` | `Server`, `Router` |

### server-core-worker Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| CoreClientModule | `coreClient` | `config` | nothing (calls `setCoreClient()`) |
| StorageClientModule | `storageClient` | `config` | nothing (calls `setStorageClient()`) |
| ComponentsModule | `components` | none | nothing (starts 4 worker components) |
| HTTPModule | `http` | `config` | `Server` (health-check only) |

### server-messenger Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| HTTPModule | `http` | `config` | `Server`, `SocketServer` |

## Docker

Multi-service `Dockerfile` builds the entire monorepo. The `entrypoint.sh` script selects which service to start based on env vars.

```bash
docker build -t privateaim/hub .
docker-compose up       # Local dev: MySQL + Postgres
```

## Documentation Site

The `docs/` directory contains a VitePress site — the authoritative reference for Hub. It is a workspace member (`@privateaim/docs`).

```bash
npm run dev --workspace=docs     # Dev server
npm run build --workspace=docs   # Build static site
```

### Keeping Docs in Sync

When making changes that affect any of the following, **update the corresponding docs page(s)**:

| Change | Docs to update |
|--------|---------------|
| Service env vars (ConfigModule) | `docs/src/reference/<service>/index.md` |
| New/changed API endpoints | `docs/src/reference/<service>/index.md` and `docs/src/guide/development/api.md` |
| New/changed package exports | `docs/src/reference/<service>/<kit>.md` |
| Entity changes (new fields, new entities) | `docs/src/guide/user/` pages and `docs/src/getting-started/architecture.md` |
| Deployment config changes | `docs/src/guide/deployment/configuration.md` |
| New DI modules | `docs/src/reference/<service>/index.md` and `.agents/conventions.md` module inventory |
| README changes | Keep `README.md` in the affected app/package in sync |

### Using Docs as Context

When you need context beyond the code (deployment patterns, admin workflows, env var semantics, platform concepts), check docs first:

- `docs/src/reference/` — per-service configuration, env vars, endpoints, related packages
- `docs/src/guide/user/` — user-facing workflows (projects, analyses, approval, realms)
- `docs/src/guide/deployment/` — Docker Compose, Kubernetes, reverse proxy configuration
- `docs/src/guide/development/` — local setup, repo structure, contributing

### Docs Structure

```
docs/src/
├── .vitepress/config.mjs   # Nav, sidebar, theme config
├── index.md                 # Landing page
├── getting-started/         # Overview, architecture
├── guide/
│   ├── user/                # Projects, analyses, realms, nodes, approval
│   ├── deployment/          # Config, Docker, K8s, reverse proxy
│   └── development/         # Setup, repo structure, API, contributing
├── reference/               # Services + packages (grouped by service area)
│   ├── shared/              # kit, server-kit, server-db-kit, server-http-kit
│   ├── core/                # server-core service + core-kit, core-http-kit, core-realtime-kit
│   ├── worker/              # server-core-worker + server-core-worker-kit
│   ├── storage/             # server-storage + storage-kit, server-storage-kit
│   ├── telemetry/           # server-telemetry + telemetry-kit, server-telemetry-kit
│   ├── messenger/           # server-messenger + messenger-kit, server-realtime-kit
│   └── frontend/            # client-ui + client-vue
├── about/team.{md,vue}      # Team page
└── public/images/           # UI screenshots and architecture diagram
```

## References

External project references live in `.agents/references/`. When looking up source code in a referenced project (e.g., authup, routup, hapic), always update the corresponding reference file with:

- The source file path / function name in the external project
- The corresponding Hub file path / function name
- Any behavioral differences between the implementations

This builds a cumulative mapping over time so future work can quickly find corresponding code without re-searching.
