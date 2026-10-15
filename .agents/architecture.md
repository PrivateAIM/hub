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
**Components** (`app/components/`): AMQP task consumers (`BaseComponent` + a message-bus caller), and background components without a queue that follow authup's `{ start, stop, status }` shape — a pass at start, then a cron (`node-client/`: node-client permission sync)

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

## Thin Controller Pattern

Controllers only: extract request → build actor → delegate → shape the response. No validation, no business logic.

**The controller owns the wire shape; services keep returning bare domain entities.** Every entity **record** response is the `{ data, meta }` envelope (`EntityRecordResponse<T>` from the matching HTTP kit) and every collection response is `EntityCollectionResponse<T>`. Hub uses no `send()`/`sendCreated()` helpers — the decorated method returns a value that routup serializes, and the status is set imperatively via `event.response.status`.

```typescript
// adapters/http/controllers/entities/node/module.ts
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import { nodeSchema } from '../../../../../core/index.ts';

@DController('/nodes')
export class NodeController {
    constructor(ctx: { service: INodeService }) { ... }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(@DContext() event: IAppEvent): Promise<EntityCollectionResponse<Node>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(nodeSchema) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(@DBody() data: NodeCreatePayload, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }
}
```

GET endpoints also pass `ActorContext` when the entity has permission-gated fields (e.g. `accountSecret`), and a record read advertises only the `fields` + `relations` subset:

```typescript
@DGet('/:id', [ForceLoggedInMiddleware])
async getOne(@DPath('id') id: string, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Registry>> {
    const actor = buildActorContext(event);
    const query = useRequestQuery(event);
    const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

    return { data: entity, meta: { schema: describeQuerySchema(registrySchema, RECORD_QUERY_PARAMETERS) } };
}
```

## Response Envelope & Query Capability Discovery

Contract, uniform across server-core, server-storage and server-telemetry:

- **Record responses** — `{ data: <entity>, meta: {…} }`. Mutations (`POST`, `DELETE`, command routes) carry `meta: {}` — never omitted, never `undefined`.
- **Collection responses** — `{ data: <entity>[], meta: { total, limit?, offset?, schema? } }`. Unchanged by the envelope work apart from `schema`.
- **`meta.schema`** — every query-capable `GET` publishes its rapiq vocabulary via `describeQuerySchema()` (`@privateaim/server-kit`, `src/core/query/describe.ts`). Collections get the full description; record reads get `describeQuerySchema(x, RECORD_QUERY_PARAMETERS)` (fields + relations). It is the **static** allow-list upper bound — actor-dependent gates (the `accountSecret` field gate, realm scoping) are deliberately not reflected. Relation vocabulary is **referenced, not expanded**: `relations.schemas` names each relation's target schema.
- Every entity schema declares `indexes` — **query-surface-only** property-name sequences, each a leftmost prefix of a real PK/unique/`@Index` — and opts into rapiq's indexed policies, so the description carries the real sequences plus `filters.indexed: 'anchor'` and `sorts.indexed: true` (#1842). Anchor mode rejects an expression-dialect filter whose and-group contains no key leading a declared sequence; the invariant that every `filters.allowed`/`sorts.allowed` key leads one is enforced by each service's `schema-entity-parity.spec.ts` — see [conventions.md](conventions.md#column-naming).
- Descriptions are memoized **and deep-frozen**. Always spread — `meta: { ...meta, schema: … }`; `meta.schema = …` throws.
- Controllers import the schema **object** from the `core` barrel — every entity barrel re-exports its `schema.ts` (server-core: `core/entities/<x>/index.ts` ×14; server-storage and server-telemetry: the single `core/entities/index.ts`). Never deep-import a `schema.ts` from a controller.
- Return-type annotations are load-bearing: trapi derives the OpenAPI response schema from the method signature, so every method — including `getMany` — must be annotated.

**Endpoints that deliberately stay flat** (protocol, credential, stream and bespoke shapes): `GET /` on all three services; `POST /services/:id/hook` and `POST /services/:id/command`; the node/analysis client-credential and node registry-credential routes; `DELETE /analysis-logs`, `DELETE /analysis-node-logs`, `DELETE /logs`; `GET /buckets/:id/stream` and `GET /bucket-files/:id/stream`; the entire `server-messenger` message surface. `POST /buckets/:id/upload` stays a **collection** (it uploads many files), not a record envelope.

**Collections without `schema`:** `GET /logs` (telemetry) — decoded with `decodeQueryOpen()`, its filters are dynamic VictoriaLogs labels, so there is nothing to describe; `GET /analyses/:id/client/permissions` — proxies Authup records with no Hub-side schema; `POST /buckets/:id/upload`.

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

## Domain Events & Messaging

TypeORM subscribers in `adapters/database/subscribers/` (grouped by domain: `analysis/`, `node/`, `project/`, `registry/`, `master-image/`) publish domain events via the entity event system. Events flow through Redis pub/sub and AMQP (RabbitMQ).

AMQP consumers are wired via two DI modules:
- **AggregatorsModule** (`app/modules/aggregators/`) — Starts AMQP event consumers that react to events from other services (builder, distributor, storage, master-image, authup). Aggregators depend only on core services and repository ports (resolved from `AnalysisInjectionKey` / `DatabaseInjectionKey`), never on a `DataSource`: the worker status rules (event → status transition, `isProcessStatusTerminal`, `isCheckVerdictStale`) live in core as `AnalysisBuilder.applyEvent` / `AnalysisDistributor.applyEvent` / `MasterImageBuilderService.applyEvent`, while the storage-bucket and authup handlers keep their orchestration in app over the ports. Storage-bucket replies are correlated by the bucket itself (`refType`/`refId` + `parseAnalysisBucketName(name)`), not by a task store.
- **ComponentsModule** (`app/modules/components/`) — Registers `RegistryComponentCaller` in the container. Starts task consumer workers (registry) and the background components: node-client permission sync and the analysis reconciler (depends on `analysis` for the builder/distributor).

**Process-status transitions are row-locked.** Any read-check-mutate-save of a
`buildStatus`/`distributionStatus` (command starts, configuration lock/unlock, the master-image rollback,
the worker aggregators) goes through `updateLockedEntity` (`adapters/database/locked-update.ts`)
— `core/` reaches it as `IAnalysisRepository` / `IMasterImageRepository` `.updateLocked(id, fn)`.
It holds the row with `SELECT … FOR UPDATE` and saves through the transaction manager, so
subscribers still publish; never replace it with `repository.update()`. `fn` is synchronous
and returns `true` to save; dispatch to the worker only after it resolves. A CHECK_FINISHED
verdict whose `checkedAt` predates the locked row's `updatedAt` is dropped — any write
counts. Every other writer of these rows must not `save()` a copy read earlier either: the
recalculators apply their derived fields via `saveAnalysisPatch`; `AnalysisService.update` and
the master-image synchronizer `Object.assign` into the locked row.

**Stuck processes are judged and recovered by server-core** (plan 018 F13/F14). The worker's
check reports an in-progress (STARTING/STARTED) build/distribution whose image is not there as
it is; `applyEvent` turns that verdict into FAILED when the locked row is older than
`ANALYSIS_PROCESS_STALE_THRESHOLD_MS` (15 min, `core/services/helpers.ts`). Running workers keep
the row fresh: an EXECUTION_PROGRESS that leaves the percent unchanged stamps `updatedAt`
explicitly once the row is older than `ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS` (1 min) and is
otherwise a no-op (typeorm skips a no-op save, and a heartbeat repeats the last percent), and
the analysis builder/distributor execute handlers re-emit their last progress every 5 min —
until no real progress arrived for 2 h, so a hung docker stream goes stale. Stale is not
recovered: with one worker the CHECK waits behind the hung EXECUTE on the same prefetch-1 queue,
so recovery needs a worker restart, a second worker replica, or RabbitMQ's `consumer_timeout`.
EXECUTION_FINISHED applies only while the locked row is STARTING/STARTED, so a late finish cannot
resurrect a run already FAILED or reset to null (full fix: run ids). The distributor check reports
an in-progress status for permanently missing preconditions (no nodes, no registry, no registry
project), so the stale rule fails such a run. `AnalysisReconciler.reconcile()`
(`core/services/analysis-reconciler/`) selects in-progress rows older than the threshold
(`IAnalysisRepository.findManyInProgressUpdatedBefore`, a `Raw` bound `Date` — the
timestamp-filter trap) and dispatches the existing check commands; the app component
(`app/components/analysis-reconciler/`) runs it at start and every 5 min on every replica,
without a lock — a duplicate verdict is dropped by `isCheckVerdictStale` (CHECKs carry no TTL, so
they queue up while no worker consumes). Rollout: workers before server-core — an old worker has no
heartbeat and judges staleness itself, so the reconciler's checks would fail its long builds. Master images are
out of scope: they have no check command, and BUILD takes over a 15-min-stale build itself.

Implementation classes live in `app/aggregators/` and `app/components/`.

## Authentication — Authup

All services integrate with **Authup** (OAuth2 identity provider):
- `@authup/server-adapter` middleware validates tokens on incoming requests
- `@authup/access` handles per-realm permission checks via `IPermissionEvaluator`
- `ActorContext.permissionEvaluator` IS authup's `IPermissionEvaluator` — hub has no port of its own (plan 016)
- Two-phase permission: `preEvaluate` (fast fail) then `evaluate` (with PolicyData attributes)

### Authorization catalog (Authup beta.68)

HTTP and socket middleware use the service Authup client to fetch `GET /authorization`
once per authenticated request/connection, then `createAuthupPermissionEvaluator`
(`server-kit/src/authup/authorization.ts`) combines it with the caller's complete
introspection grants and identity. Do not flatten grants to permission names: that
loses definition policies, junction policies and realm reach. Scope restricts what a
caller can do, not who it is: `resolveAuthupPolicySubject` always places the identity and
places its grants only for a token scoped `global` (`[]` otherwise), so the binding policy
denies every permission (403) while identity-reading policies — and hub's identity-based
checks (credential ownership, the messenger mailbox, bucket ownership, socket rooms) — still
see the real caller. Authup applies the same rule since authup#3723 (`useRequestPolicyGrants`).
The credential needs
`permission_read` at `ownOrNull` or wider. Fetch failures propagate; no cross-request
catalog cache or name-only fallback is installed. Token-verifier caching and socket
connection lifetimes remain unchanged.

The evaluator enforces the data a call supplies. A service using only `preEvaluate`
still has only a pre-gate.

Reads that need scoping go through `scopeReadQuery` (`server-kit/src/core/query/scope.ts`):

- It pre-evaluates a one-of of the entity's read and write names; holding none is a 403.
- It then lowers `compile()` into the query. A `post` verdict narrows to the actor's own
  realm; `compile: false` skips this step, leaving a capability gate only (the global
  catalogs).
- Record reads reuse the scoped query with `eq('id', id)`, so a row out of reach is a 404,
  the same as a missing one.

The Vue store handles batch verdict fetching and expiry; `store.permissionRevision` must
be watched by custom async navigation resolvers.

## Realm Scoping

Entities are scoped to realms via `realmId`. There is no master-realm bypass (plan 021, D5):
reach comes from each grant's `realm_scope` (`any` / `ownOrNull` / `own` / `none`).

- **Writes on one record** (create with its target realm, update, delete, commands):
  `assertRecordReach` / `reachesRecord` (`server-kit/src/core/authorization/`) evaluate with
  `PolicyData({ realmMatch: record.realmId ?? null, attributes })`. The `realmMatch` key is what
  applies the scope; `attributes` alone apply none. Out of reach → 403. Updates check the stored
  and the merged row.
- **Reads** lower `compile()` into the query (`scopeReadQuery`, `AnalysisReachService`).
- **"Reaches every realm"** (the old "master"/"system" checks) is `hasUnboundedReach`: the
  compiled verdict is `allow`.
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

## Per-Service Architecture

### server-telemetry

Manages log aggregation via VictoriaLogs and event tracking via TypeORM.

**Core port:** `LogStore` interface (`core/services/log-store/types.ts`) — defines `query`, `write`, `delete` operations for log storage. No TypeORM or VictoriaLogs imports.

**Adapters:**
- `VictoriaLogsLogStore` (`adapters/telemetry/victoria-logs.ts`) — implements `LogStore` via VictoriaLogs HTTP API. Includes query injection protection (`isValidLabelKey`, `escapeQueryValue`).
- `MemoryLogStore` (`adapters/telemetry/memory.ts`) — in-memory fallback for components that run before VictoriaLogs is available.
- `EventController` / `LogController` — thin HTTP controllers receiving dependencies via constructor.

**Service-specific modules:**
- `VictoriaLogsModule` — registers VictoriaLogs client + `LogStore` in container
- `ComponentsModule` — resolves `EventRepository` from the container and starts
  EventComponent + LogComponent via `QueueWorkerComponentCaller`

**Event retention sweep:** `EventComponentCleanerHandler` (once at start, then daily
at 01:00) drops every `expiring` row whose `expiresAt` has passed. The window is
stamped at **ingest** by `EventComponentCreateHandler` from `EVENT_RETENTION_DAYS`
(default 7 days; `0` keeps rows forever) — publishers no longer stamp, and an
explicit `expiresAt`, or `expiring: false`, from the publisher wins. The handler owns only the
schedule: the sweep itself is `IEventRepository.deleteExpired(now, { batchSize })`,
so nothing in `app/components/` reaches for a `DataSource`.

The delete is **batched** (`EVENT_RETENTION_SWEEP_BATCH_SIZE`, 1000). Steady state
removes a trickle, but the first sweep after a retention change — or the day a full
window first matures — can match millions of rows, and the cleaner runs on every
replica. Batching selects ids then deletes by id, because `DELETE ... LIMIT` is
MySQL-only; the loop drains, and a batch that removes nothing means another
replica's sweep owns those rows, so it stops and the next tick takes the remainder.
A `batchSize` that is not a positive safe integer falls back to the default —
typeorm ignores a falsy `take`, which would silently restore the unbounded select.

Selecting **ids only** matters twice over: the row carries a `text` `data` blob
behind a deserialize transformer, and a delete-by-id does not fire
`BaseSubscriber.beforeRemove`, so the sweep no longer publishes one `DELETED`
domain event per expired row. Nothing in hub subscribes to the telemetry `EVENT`
channel, so that traffic was pure Redis noise.

**Special concern:** The telemetry service IS the log writer, so its own logger cannot use `useLogComponentCaller()` (circular). The `LogComponentWriteHandler` accepts an optional `LogStore` param with `MemoryLogStore` fallback.

### server-storage

File/object storage service, backed by MinIO/S3 or the local filesystem behind a
common `IStorageAdapter` port.

**Adapters:**
- `BucketEntity` / `BucketFileEntity` — TypeORM entities in `adapters/database/entities/`
- `BucketSubscriber` / `BucketFileSubscriber` — pre-instantiated in `DatabaseModule` (no `@EventSubscriber()`)
- `BucketController` / `BucketFileController` — thin HTTP controllers with upload/stream endpoints

**Service-specific modules:**
- `StorageModule` — selects the storage backend from config and registers it under
  `StorageInjectionKey` as an `IStorageAdapter` port: `MinioStorageAdapter` (MinIO/S3)
  or `FsStorageAdapter` (local filesystem). Controllers and components depend on the
  port, not on a MinIO client.
- `ComponentsModule` — resolves the storage adapter from the container, starts the
  bucket + bucket-file consumers via `QueueWorkerComponentCaller`

### server-core-worker

Background worker executing Docker containers. No database entities — purely queue-driven.

**Core layer:** Docker utilities, crypto helpers, GitHub/Harbor integrations. Uses module-level variables (`setCoreClient`/`useCoreClient`) for API client access.

**Adapters:**
- `adapters/http/server.ts` — minimal health-check HTTP server

**Service-specific modules:**
- `CoreClientModule` — sets up core API client via `setCoreClient()`
- `StorageClientModule` — sets up storage API client via `setStorageClient()`
- `ComponentsModule` — starts all 4 worker components (analysis-builder, analysis-distributor, master-image-builder, master-image-synchronizer)

**Entry point:** Uses `src/index.ts` with `dotenv/config` directly (no citty CLI).

### server-messenger

Durable store-and-forward message broker (plan 013). It is **no longer** the
database-less Socket.io relay: messages are persisted to a mailbox and delivered by
`send` / `pull` / `ack` over REST, with the socket reduced to a payload-free wakeup
signal. The legacy relay/presence surface is kept alongside it for coexistence until
decommission (plan 013 phase 5).

**Adapters:**
- `adapters/database/entities/` — the message mailbox entity (+ `migrations/{mysql,postgres}/`)
- `adapters/http/controllers/message/` — REST message surface (send/pull/ack). **Not**
  an entity API: no `{ data, meta }` envelope.
- `adapters/socket/controllers/connection/` — Socket.io connection lifecycle handlers
- `adapters/socket/controllers/messaging/` — legacy relay handlers
- `adapters/socket/register.ts` — controller registration helper

**Service-specific modules:**
- `DatabaseModule` — `DataSource` + `MessageRepository`
- `WakeupModule` — redis pub/sub when redis is present (cross-instance), else an
  in-process fallback; emits the payload-free `messagePending` into the recipient's
  local socket room
- `SweeperModule` — 60s timer deleting messages past their absolute `expiresAt`,
  via the same batched `deleteExpired(now, { batchSize })` shape as the telemetry
  event sweep (`MESSAGE_SWEEP_BATCH_SIZE`, 1000). The id select uses `Raw`, not
  `LessThan`: `expires_at` is a datetime column behind a `string`-typed property,
  and `now` must stay a bound `Date` — an ISO string satisfies the property type
  but MySQL truncates the trailing `Z` when casting it
- `HTTPModule` — HTTP server + Socket.io server with Authup auth middleware

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
