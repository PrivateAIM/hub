# Architecture

## System Overview

```
                    ┌─────────────┐
                    │  client-ui  │  Nuxt 4 SSR
                    │  (browser)  │
                    └──────┬──────┘
                           │ HTTP / WebSocket
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ server-core │ │server-storage│ │server-telemetry│
    │  (REST API) │ │ (S3/MinIO)  │ │(VictoriaLogs)│
    └──────┬──────┘ └─────────────┘ └──────────────┘
           │
    ┌──────┴──────┐
    │    AMQP     │  RabbitMQ message bus
    └──────┬──────┘
           ▼
    ┌─────────────┐
    │server-worker│  Docker container execution
    └─────────────┘

External services: Authup (OAuth2), Redis (pub/sub + caching), MySQL/Postgres
```

## Hexagonal Architecture (all services)

All services follow a hexagonal (ports & adapters) architecture matching authup's pattern. Code is organized into three layers:

```
src/
├── core/          # Domain logic — ports, services, validators
├── adapters/      # External system implementations — database, HTTP, socket
└── app/           # Orchestration — DI modules, wiring, factory
```

Each service has the same structural elements:
- `app/builder.ts` — `ServiceXApplicationBuilder extends BaseApplicationBuilder`
- `app/factory.ts` — `createApplication()` using the builder
- `app/modules/config/` — `ConfigModule` (env reading)
- `app/modules/http/` — `HTTPModule` (server + controllers or socket)
- `app/modules/components/` — `ComponentsModule` (AMQP consumers, if applicable)
- Minimal `start.ts` / `cli/commands/start.ts` — just `createApplication()` + `app.setup()`

There is **no** `SwaggerModule`. OpenAPI docs are generated at **build time** by
`build:swagger` (`trapi generate`, part of `npm run build` in server-core and
server-storage), not by a DI module at boot.

### Core Layer (`core/`)

Pure business logic. No imports from `typeorm`, `routup`, or other infrastructure packages.

**Entities** (`core/entities/<name>/`):
- `types.ts` — Port interfaces: `IXRepository`, `IXService`
- `service.ts` — Domain service implementing `IXService`
- `validator.ts` — Input validation with `ValidatorGroup.CREATE`/`UPDATE`

**Shared base types** (from `@privateaim/server-kit`):
- `IEntityRepository<T>` — Generic repository port (findMany, findOneById, save, remove, etc.)
- `AbstractEntityService` — Realm helper (`getActorRealmId`)
- `ActorContext` — Permission evaluator + realm + identity, decoupled from HTTP
- `ValidatorGroup` — Domain-level validation groups (not HTTP-specific)

### Test Architecture

- Unit tests are grouped by domain under `test/unit/core/entities/<domain>/` and `test/unit/core/services/`.
- Shared test fakes and helpers are imported from `@privateaim/server-test-kit` (`FakeEntityRepository`, `FakePermissionEvaluator` re-exported from `@authup/server-test-kit`, actor factories returning `FakeActorContext`).
- Domain-specific fakes (e.g. `FakeNodeRepository`, `FakeRegistryManager`) are colocated beside the tests that use them.

**Services** (`core/services/`):
- Business logic that spans multiple entities or orchestrates workflows
- `analysis-builder/` — Build lifecycle orchestration
- `analysis-configurator/` — Configuration lock/unlock
- `analysis-distributor/` — Distribution orchestration
- `analysis-storage-manager/` — Storage bucket provisioning
- `master-image/synchronizer/` — Image catalog sync

### Adapter Layer (`adapters/`)

Implementations that connect domain logic to external systems.

**Database** (`adapters/database/`):
- `entities/<name>.ts` — TypeORM entity definitions (`@Entity`, `@Column`)
- `subscribers/<name>.ts` — TypeORM event subscribers (domain event publishing)
- `migrations/` — PostgreSQL and MySQL migration files
- `error/` — Database error types (`DatabaseConflictError`)

**HTTP** (`adapters/http/`):
- `controllers/entities/<name>/module.ts` — Thin controllers (extract request → delegate to service → send response)
- `controllers/workflows/` — Non-CRUD workflow controllers (root, service)

**Socket** (`adapters/socket/`):
- WebSocket controllers and server setup

### App Layer (`app/`)

DI modules, wiring, and infrastructure services.

**Modules** (`app/modules/`) — Each implements `IModule` from orkos:
- `config/` — `ConfigModule`: reads env, registers typed config in container
- `database/` — `DatabaseModule`: creates DataSource, registers all repository adapters
- `http/` — `HTTPModule`: resolves repos from container, creates services + controllers, mounts router
- `registry/` — `RegistryManagerAdapter` for cross-entity registry operations
- `telemetry-client/` — `TelemetryClientModule`: creates API client

**Builder** (`app/builder.ts`):
- `ServerCoreApplicationBuilder extends BaseApplicationBuilder`
- Fluent API: `.withConfig().withDatabase().withHTTP()`

**Aggregators** (`app/aggregators/`): AMQP event consumers
**Components** (`app/components/`): everything here implements `IComponent { start, stop, status }` from [`hubwire`](https://github.com/tada5hi/hubwire) (shared with authup). Two shapes: AMQP task consumers — a hubwire `Component` (key → handler map) behind a `RemoteWorker` — and scheduled background jobs built with `defineScheduledComponent({ schedule, run, hooks })`: a pass at start, then a cron (`node-client/`: node-client permission sync, `analysis-reconciler/`). A `run` that throws is reported to `hooks.onError` (hub passes `createScheduledComponentLogHooks` from server-kit, or logs inside `run` itself) and does not count as a success; `start()` never rejects. Every `ComponentsModule` keeps all its components in one `IComponent[]`; `teardown()` `stop()`s each, then awaits `settled?.()` on each (only a scheduled component has it; its `stop()` never waits for a pass in flight)

## Service Pattern

Services receive dependencies via constructor injection and own validation:

```typescript
// core/entities/node/service.ts
export class NodeService extends AbstractEntityService implements INodeService {
    protected repository: INodeRepository;
    protected validator: NodeValidator;

    constructor(ctx: { repository: INodeRepository }) {
        super();
        this.repository = ctx.repository;
        this.validator = new NodeValidator();
    }

    async create(data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.NODE_CREATE });
        await this.repository.validateJoinColumns(validated);
        // ... business logic ...
        return this.repository.save(entity, { data: actor.metadata });
    }
}
```

## Wiring Pattern

DI modules resolve repositories from the container, create services, then controllers:

```typescript
// app/modules/http/controller.ts
export function createControllers(container: IContainer) {
    const nodeRepository = container.resolve(DatabaseInjectionKey.NodeRepository);
    const nodeService = new NodeService({ repository: nodeRepository });
    return [new NodeController({ service: nodeService }), ...];
}
```

## ActorContext Bridge

`ActorContext` decouples services from HTTP. Every service's controllers build it
with the one shared bridge, `buildActorContext(event)` from `@privateaim/server-http-kit`
(`src/request/actor.ts`) — there are no per-service copies:

```typescript
// packages/server-http-kit/src/request/actor.ts
export function buildActorContext(event: IAppEvent): ActorContext {
    return {
        permissionEvaluator: useRequestPermissionEvaluator(event),
        realm: useRequestIdentityRealm(event),
        identity: { id, type, realmId },     // type is 'user' | 'client'
        metadata: { requestPath, requestMethod, actorId, ... }, // the audit fields
    };
}
```

Authorization decisions live in `core/` services, never in controllers or app
modules: telemetry's log endpoints go through `LogService`, server-core's analysis
client permissions through `AnalysisClientPermissionService` behind an
`IClientPermissionStore` port. Socket subscribe handlers answer a permission denial
with `PermissionDeniedError` (403) and any other failure with `InternalError`.

## Authentication — Authup

All services integrate with **Authup** (OAuth2 identity provider):
- `@authup/server-adapter` middleware validates tokens on incoming requests
- `@authup/access` handles per-realm permission checks via `IPermissionEvaluator`
- `ActorContext.permissionEvaluator` IS authup's `IPermissionEvaluator` — hub has no port of its own
- Two-phase permission: `preEvaluate` (fast fail) then `evaluate` (with PolicyData attributes)

## Realm Scoping

Entities are scoped to realms via `realmId`. There is no master-realm bypass:
reach comes from each grant's `realm_scope` (`any` / `ownOrNull` / `own` / `none`).

- **Writes on one record** (create with its target realm, update, delete, commands) go
  through `@authup/access`'s record helpers, called with `actor.permissionEvaluator`:
  `evaluateRecord` / `evaluateRecordOneOf` (throw), `reachesRecord` / `reachesRecordOneOf`
  (predicates), `evaluateRecordUpdate`. Hub has no copies of its own (the former
  `server-kit/src/core/authorization/` is gone since beta.70). Rules:
  - `realm` is the record's realm, and it is required: `undefined` throws. Pass a stored row's
    realm **raw** (`entity.realmId`), so a projection that dropped the column fails instead of
    reading as global. `null` only where a global row or create target is meant (a realm-less
    registry project or event, a bucket created by an actor without a realm).
  - The row goes in as `data: { attributes: row }`; nothing is synthesized, so a grant's
    attribute policy without a row stays pending and denies (the socket room gate passes none).
  - An array of names is **all of** with `evaluateRecord` / `reachesRecord`. Use the `*OneOf`
    variant for "any of these names".
  - Updates use `evaluateRecordUpdate({ current, next })`. Snapshot `current`'s attributes
    (`{ ...entity }`) before `repository.merge()`: typeorm's merge writes into the entity.
  - The predicates read only authup's `PermissionError` as `false`; any other error
    propagates. The production evaluator throws only `PermissionError`, and so do the test
    fakes (`createDenyAllActor`, `createScopedActor`). Hub's own `PermissionDeniedError`
    is what hub code throws after a predicate said no. Both map to 403.
  - Out of reach → 403.
- **Reads** lower `compile()` into the query (`scopeReadQuery`, `AnalysisReachService`).
- **"Reaches every realm"** (the old "master"/"system" checks) is `hasUnboundedReach(evaluator,
  name)` from `@authup/access`: the compiled verdict is `allow`. `compile()` never throws for a
  name the actor does not hold (it drops out → `deny`).
- Node and analysis clients reach by **binding** (`node.clientId` / `analysis.clientId`, in the
  client's own realm); their grants are scoped `none`.

## Key Domain Entities

| Entity              | Purpose                                          |
|---------------------|--------------------------------------------------|
| `Analysis`          | A distributed computation task                   |
| `AnalysisBucket`    | File storage container for an analysis           |
| `Project`           | User project grouping nodes and analyses         |
| `ProjectNode`       | A compute node assigned to a project             |
| `Node`              | Global registry of available compute nodes       |
| `MasterImage`       | Base Docker images available for worker tasks    |
| `Registry`          | Docker registry configuration                   |
| `RegistryProject`   | Project within a Docker registry                 |

## Cross-cutting Rules

Invariants a change outside the owning area breaks silently. Details and reasons are in the topic file named on each line.

- **Authorization** ([authorization](topics/authorization.md)): use the `@authup/access` record helpers with `actor.permissionEvaluator`; their plain variants take an array of names as ALL-of, so "any of" needs the `*OneOf` variant. Pass a stored row's realm raw (`entity.realmId`). Only authup's `PermissionError` counts as a denial. Reads are scoped through `scopeReadQuery` / `AnalysisReachService`, so list and record cannot disagree; a family table's own `realmId` is the uploader's, never the owner's. Keep `IntrospectableTokenVerifier` in front of vouchly, and an introspection outage answers 502, not 401.
- **Messaging** ([messaging](topics/messaging.md), [messaging-delivery](topics/messaging-delivery.md)): a publisher whose only consumer is another service resolves `RemoteMessageBusInjectionKey`, never the always-registered bus. Every module that starts components stops them, then awaits `settled?.()`. A `buildStatus`/`distributionStatus` change goes through `updateLocked`, never a `save()` of an earlier read and never `repository.update()` (it skips the subscribers). An `ordered` routing declares `x-single-active-consumer` on publish and consume alike (the broker answers 406 otherwise). Roll out workers and storage before server-core.
- **HTTP API** ([http-api](topics/http-api.md)): controllers stay thin and own the `{ data, meta }` envelope; mutations carry `meta: {}`; `meta.schema` is deep-frozen, so spread it; annotate every return type (trapi reads it). A secret column needs all of `select: false`, absence from `fields.default`, and `createRootOnlyFieldsGate`.
- **Query surface** ([query-surface](topics/query-surface.md)): the `QueryBuildInput<T, 3>` depth bound is permanent (authup's components declare the same bound). Every allow-listed filter/sort key leads a declared `indexes` sequence, so a new key needs its entity index and migration in the same change. Never allow-list a filter on a column behind `dateToISOStringTransformer`.
- **Database** ([database](topics/database.md)): snake_case exists only in column names and migrations; every camelCase property carries `@Column({ name })` and there is no naming strategy. Migrations ship in both dialects, named for everything they do; released migrations are immutable. Build a `DataSource` only through `DataSourceOptionsBuilder` (UTC pin), and run boot passes under `withDataSourceLock` (lock names are a deployment contract).
- **Dependencies** ([dependencies](topics/dependencies.md)): no `--force`, `--legacy-peer-deps`, root `overrides` or `npm install --package-lock-only`; check for a split tree after every bump. TypeScript stays on 6.0.3 until vue-tsc, typescript-eslint and @trapi support 7.
- **Telemetry** ([server-telemetry](topics/server-telemetry.md)): an audit event validator degrades a client-controlled field, never the whole record; retention is stamped once, at ingest.
- **Frontend** ([frontend](topics/frontend.md)): an id-driven `createEntityManager` resolve never falls back to the collection; icon names are literals; authenticated routes get no `swr`/`isr` route rule; a collection query never requests a permission-gated column (the rows land in the SSR payload).
- **Tests against Authup** ([testcontainers](topics/testcontainers.md)): each service provisions exactly the permission names it checks in `test/setup.ts`; the Authup image is tagged with the installed `@authup/core-kit` version.
- **Per-service layout and DI modules**: [server-core](topics/server-core.md), [server-telemetry](topics/server-telemetry.md), [server-storage](topics/server-storage.md), [server-core-worker](topics/server-core-worker.md), [server-messenger](topics/server-messenger.md).

## Configuration

Environment-based via `envix`, managed by `ConfigModule` in `app/modules/config/`.

| Variable        | Purpose                           |
|-----------------|-----------------------------------|
| `DB_TYPE`       | `mysql`, `postgres`, `better-sqlite3` |
| `DB_HOST/PORT`  | Database connection               |
| `AUTHUP_URL`    | Authup identity provider URL      |
| `REDIS_URL`     | Redis for pub/sub and caching     |
| `AMQP_URL`      | RabbitMQ connection               |
| `MINIO_*`       | MinIO/S3 storage credentials      |

## Topic Files

Read on demand; never imported by `CLAUDE.md`.

| File | Covers |
|---|---|
| [authorization](topics/authorization.md) | Authorization catalog, token verification, read scoping, record reach, analysis reach, Authup beta.68 to beta.70 |
| [messaging](topics/messaging.md) | Domain events, hubwire bus, dispatchers, workers, aggregators, scheduled components, process-status locking |
| [messaging-delivery](topics/messaging-delivery.md) | Retry, ordering, redelivery, race-safe status transitions, reconciler, bucket reply correlation |
| [http-api](topics/http-api.md) | Thin controllers, response envelope, `meta.schema`, field selection and secret gates, HTTP client kits and `FakeClient` |
| [query-surface](topics/query-surface.md) | rapiq depth bound, schema `indexes`, leading-key invariant, schema drift gate |
| [database](topics/database.md) | Migrations, UTC timestamps and boot locks, table and column naming, migration and UTC specs |
| [dependencies](topics/dependencies.md) | Dependency classification, root `overrides`, Authup/rapiq/validup upgrade notes, TypeScript 7 verdict |
| [server-telemetry](topics/server-telemetry.md) | server-telemetry layout and modules, audit event hardening, retention |
| [frontend](topics/frontend.md) | client-vue entity resolution, icons, component and build-config tests, SSR hydration |
| [testcontainers](topics/testcontainers.md) | Testcontainers, Authup provisioning for tests |
| [server-core](topics/server-core.md) | Directory layout, module inventory, test application |
| [server-storage](topics/server-storage.md) | Architecture, directory layout, module inventory |
| [server-core-worker](topics/server-core-worker.md) | Architecture, directory layout, module inventory |
| [server-messenger](topics/server-messenger.md) | Architecture, directory layout, module inventory |
| [docs-site](topics/docs-site.md) | Using the docs as context, docs structure |
