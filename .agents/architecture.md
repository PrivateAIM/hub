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

Every service follows authup's ports-and-adapters layout:

```
src/
├── core/          # Domain logic: ports, services, validators (no typeorm/routup imports)
├── adapters/      # database (entities, subscribers, migrations), http (thin controllers), socket
└── app/           # DI modules (orkos IModule), builder, factory, aggregators, components
```

Each service has `app/builder.ts` (`…ApplicationBuilder extends BaseApplicationBuilder`), `app/factory.ts` (`createApplication()`), a `ConfigModule`, an `HTTPModule`, and a minimal start command (`createApplication()` + `app.setup()`). There is no `SwaggerModule`: OpenAPI is generated at build time by `build:swagger` (`trapi generate`) in server-core and server-storage.

### Core Layer (`core/`)

- `core/entities/<name>/`: `types.ts` (`IXRepository`, `IXService`), `service.ts`, `schema.ts` (rapiq), re-exported by the barrel. Input validators live in the domain kits (e.g. `@privateaim/core-kit`) and run with `ValidatorGroup.CREATE`/`UPDATE` inside the service.
- `core/services/`: workflows spanning entities (analysis builder, configurator, distributor, storage manager, reach, reconciler, master-image).
- Shared base types come from `@privateaim/server-kit`: `IEntityRepository<T>`, `AbstractEntityService`, `ActorContext`, `ValidatorGroup`.

### Adapter Layer (`adapters/`)

TypeORM entities, subscribers (domain-event publishing only) and `migrations/{mysql,postgres}`; thin HTTP controllers under `controllers/entities/<name>/`; socket handlers.

### App Layer (`app/`)

DI modules under `app/modules/<name>/` resolve repositories, build services and controllers. `app/aggregators/` and `app/components/` hold hubwire components: task consumers behind a `RemoteWorker`, and scheduled jobs built with `defineScheduledComponent` (see [messaging](topics/messaging.md)).

## Service Pattern

Services take their dependencies through the constructor, validate input themselves, check permissions through the actor, and pass `actor.metadata` to `save()` for the audit trail:

```typescript
async create(data: Partial<Node>, actor: ActorContext): Promise<Node> {
    const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });
    await actor.permissionEvaluator.preEvaluate({ name: PermissionName.NODE_CREATE });
    // ... business logic ...
    return this.repository.save(entity, { data: actor.metadata });
}
```

## Wiring Pattern

DI modules resolve repositories from the container, create services, then controllers (`new NodeController({ service: new NodeService({ repository }) })`). Tests construct services the same way with fakes.

## ActorContext Bridge

Controllers build the actor with the one shared `buildActorContext(event)` from `@privateaim/server-http-kit` (permission evaluator, realm, `identity` of type `user` | `client`, audit `metadata`); there are no per-service copies. Authorization decisions live in `core/` services, never in controllers or app modules. Socket subscribe handlers answer a denial with `PermissionDeniedError` (403) and any other failure with `InternalError`.

## Authentication — Authup

Every service authenticates through Authup: `@authup/server-adapter` middleware verifies tokens, and `ActorContext.permissionEvaluator` is authup's `IPermissionEvaluator` (hub has no port of its own). `preEvaluate` is the fast capability gate; `evaluate` and the record helpers apply policies and realm reach. Details: [authorization](topics/authorization.md).

## Realm Scoping

Entities carry `realmId`. There is no master-realm bypass: reach comes from each grant's `realm_scope` (`any` / `ownOrNull` / `own` / `none`).

- **Writes on one record** use `@authup/access`'s `evaluateRecord` / `evaluateRecordOneOf` (throw), `reachesRecord` / `reachesRecordOneOf` (predicates) and `evaluateRecordUpdate`, with `actor.permissionEvaluator`.
  - `realm` is required (`undefined` throws). Pass a stored row's realm raw (`entity.realmId`); `null` only where a global row or create target is meant.
  - The row goes in as `data: { attributes: row }`; nothing is synthesized, so an attribute policy without a row denies.
  - An array of names is ALL-of in the plain variants; use `*OneOf` for any-of.
  - `evaluateRecordUpdate({ current, next })`: snapshot `{ ...entity }` before `repository.merge()`, which mutates the entity.
  - The predicates read only authup's `PermissionError` as `false`; anything else propagates. Test fakes throw `PermissionError` too; hub's `PermissionDeniedError` is what hub throws after a predicate said no. Both are 403.
- **Reads** lower `compile()` into the query (`scopeReadQuery`, `AnalysisReachService`) and run through `findManyScoped` / `AnalysisReachService.findMany`, which decide a `post` verdict per row by evaluation, never by the actor's realm (#2021).
- **"Reaches every realm"** is `hasUnboundedReach(evaluator, name)` (compiled verdict `allow`).
- Node and analysis clients reach by **binding** (`node.clientId` / `analysis.clientId`, in the client's own realm); their grants are scoped `none`.

## Key Domain Entities

`Analysis` (a distributed computation), `AnalysisBucket` (its file storage), `Project` (groups nodes and analyses), `ProjectNode`, `Node` (global compute node registry), `MasterImage` (base images), `Registry` / `RegistryProject` (Harbor).

## Cross-cutting Rules

Invariants a change outside the owning area breaks silently. Details and reasons are in the topic file named on each line.

- **Authorization** ([authorization](topics/authorization.md)): use the `@authup/access` record helpers with `actor.permissionEvaluator`; their plain variants take an array of names as ALL-of, so "any of" needs the `*OneOf` variant. Pass a stored row's realm raw (`entity.realmId`). Only authup's `PermissionError` counts as a denial. Reads are scoped through `scopeReadQuery` / `AnalysisReachService`, so list and record cannot disagree; a family table's own `realmId` is the uploader's, never the owner's. Keep `IntrospectableTokenVerifier` in front of vouchly, and an introspection outage answers 502, not 401.
- **Messaging** ([messaging](topics/messaging.md), [messaging-delivery](topics/messaging-delivery.md)): a publisher whose only consumer is another service resolves `RemoteMessageBusInjectionKey`, never the always-registered bus. Every module that starts components stops them, then awaits `settled?.()`. A `buildStatus`/`distributionStatus` change goes through `updateLocked`, never a `save()` of an earlier read and never `repository.update()` (it skips the subscribers). An `ordered` routing declares `x-single-active-consumer` on publish and consume alike (the broker answers 406 otherwise). Roll out workers and storage before server-core.
- **HTTP API** ([http-api](topics/http-api.md)): controllers stay thin and own the `{ data, meta }` envelope of entity endpoints (protocol, credential, stream and messenger endpoints stay flat); entity mutations carry `meta: {}`; `meta.schema` is deep-frozen, so spread it; annotate every return type (trapi reads it). A secret column needs all of `select: false`, absence from `fields.default`, and `createRootOnlyFieldsGate`.
- **Query surface** ([query-surface](topics/query-surface.md)): the `QueryBuildInput<T, 3>` depth bound is permanent (authup's components declare the same bound). Every allow-listed filter/sort key leads a declared `indexes` sequence, so a new key needs a backing entity index in the same change, plus a migration when that index is new. Never allow-list a filter on a column behind `dateToISOStringTransformer`.
- **Database** ([database](topics/database.md)): snake_case exists only in column names and migrations, apart from the naming exceptions (`PermissionName` values, OAuth2/OIDC parameters, introspection and third-party payloads, env vars); every camelCase property carries `@Column({ name })` and there is no naming strategy. Migrations ship in both dialects, named for everything they do; released migrations are immutable. Build a `DataSource` only through `DataSourceOptionsBuilder` (UTC pin), and run boot passes under `withDataSourceLock` (lock names are a deployment contract). Write nodes and analyses only through entity `save` / `remove` / `updateLocked`: the read cache's tags miss a criteria `update` and raw SQL.
- **Dependencies** ([dependencies](topics/dependencies.md)): no `--force`, `--legacy-peer-deps`, root `overrides` or `npm install --package-lock-only`; check for a split tree after every bump. TypeScript stays on 6.0.3 until vue-tsc, typescript-eslint and @trapi support 7.
- **Telemetry** ([server-telemetry](topics/server-telemetry.md)): an audit event validator degrades a client-controlled field, never the whole record; retention is stamped once, at ingest.
- **Frontend** ([frontend](topics/frontend.md)): an id-driven `createEntityManager` resolve never falls back to the collection; icon names are literals; authenticated routes get no `swr`/`isr` route rule; a collection query never requests a permission-gated column (the rows land in the SSR payload).
- **Tests against Authup** ([testcontainers](topics/testcontainers.md)): each service provisions exactly the permission names it checks in `test/setup.ts`; the Authup image is tagged with the installed `@authup/core-kit` version.
- **Per-service layout and DI modules**: [server-core](topics/server-core.md), [server-telemetry](topics/server-telemetry.md), [server-storage](topics/server-storage.md), [server-core-worker](topics/server-core-worker.md), [server-messenger](topics/server-messenger.md).

## Configuration

Environment-based via `envix`, managed by `ConfigModule` in `app/modules/config/`.

Common variables: `DB_TYPE` (`mysql`, `postgres`, `better-sqlite3`), `DB_HOST`/`DB_PORT`, `AUTHUP_URL`, `REDIS_CONNECTION_STRING`, `RABBITMQ_CONNECTION_STRING`, `MINIO_CONNECTION_STRING` (storage). Per-service variables are documented in `docs/src/reference/<service>/`.

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
