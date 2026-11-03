# Project Structure

## Monorepo Overview

npm workspaces monorepo with three workspace roots: `apps/*`, `packages/*`, and `docs`. Nx orchestrates build/test/lint with dependency-aware caching.

## Applications (6)

Runnable services and the frontend, located in `apps/`.

### Services

| Application            | Purpose                                      | Key Dependencies                      |
|------------------------|----------------------------------------------|---------------------------------------|
| `server-core`          | Main REST API — analyses, projects, nodes, registries | server-kit, server-db-kit, server-http-kit, core-kit |
| `server-core-worker`   | Background worker — Docker container execution | server-kit, server-core-worker-kit, dockerode |
| `server-storage`       | File/object storage service (MinIO/S3 or filesystem) | server-kit, server-storage-kit, storage-kit |
| `server-telemetry`     | Log aggregation via VictoriaLogs             | server-kit, server-telemetry-kit, telemetry-kit |
| `server-messenger`     | Durable store-and-forward message broker (REST + Socket.io wakeup) | server-kit, messenger-kit |

### Frontend

| Application  | Purpose                              | Key Dependencies                    |
|--------------|--------------------------------------|-------------------------------------|
| `client-ui`  | Nuxt 4 SSR web application           | client-vue, core-http-kit, authup   |

### Documentation

| Directory | Purpose                              | Key Dependencies                    |
|-----------|--------------------------------------|-------------------------------------|
| `docs`    | VitePress documentation site         | vitepress, vue                      |

See [Conventions — Documentation Site](conventions.md#documentation-site) for update guidelines and [topics/docs-site.md](topics/docs-site.md) for the docs structure.

## Packages & Libraries (19)

Shared libraries, located in `packages/`.

### Client Libraries

| Package            | Purpose                              | Key Dependencies                    |
|--------------------|--------------------------------------|-------------------------------------|
| `client-vue`       | Reusable Vue 3 component library     | core-kit, storage-kit, @vuecs/*, validup, ilingo |
| `client-vue-theme` | Tailwind v4 theme — design tokens, light/dark chrome, card system | tailwindcss, @vuecs/design, @authup/client-web-kit-theme |

### Server Kits (shared server libraries)

| Package                  | Purpose                                    |
|--------------------------|--------------------------------------------|
| `server-kit`             | Logging (Winston), auth helpers, `MessageBusModule` (DI wiring for [`hubwire`](https://github.com/tada5hi/hubwire)'s message bus — AMQP driver from `@hubwire/amqp` or memory driver; components, dispatchers, workers and the bus itself come from hubwire) + the bus/worker/scheduled-component log-hook factories (`message-bus/hooks.ts`), Redis, shared core types (IEntityRepository, ActorContext, AbstractEntityService, ValidatorGroup), `describeQuerySchema()` + `RECORD_QUERY_PARAMETERS` for the response `meta.schema`, `collectRootFilterValues()` for the log endpoints, `scopeReadQuery()` + `appendQueryConditions()` for authorized reads |
| `server-test-kit`        | Shared test fakes (FakeEntityRepository, FakePermissionEvaluator via `@authup/server-test-kit`, actor factories) |
| `server-db-kit`          | TypeORM utilities, database setup, migrations; options builder pinned to UTC (`pinTimezone`), `withDataSourceLock` for boot passes |
| `server-http-kit`        | HTTP route/controller decorators for Routup, request helpers incl. the shared `buildActorContext`, rate limiter, `sanitizeError` |
| `server-realtime-kit`    | Socket.io server helpers                   |
| `server-telemetry-kit`   | Telemetry/logging utilities                |
| `server-core-worker-kit` | Worker task type definitions               |
| `server-storage-kit`     | Storage service contracts                  |
| `errors`                 | Shared error types                         |

### Domain Kits (shared types and HTTP clients)

| Package             | Purpose                                |
|---------------------|----------------------------------------|
| `kit`               | Core utilities: crypto, domain events, permissions, realms |
| `core-kit`          | Domain models & types for the core service |
| `core-http-kit`     | HTTP client (Hapic) for the core API. Entity **record** responses are the `{ data, meta }` envelope (`EntityRecordResponse`), collections are `EntityCollectionResponse`, and query-capable GETs carry the endpoint's queryable vocabulary under `meta.schema` (rapiq `SchemaDescription`). The client implements `ICoreClient` and each sub-API its own `I<X>API`; `./testing` ships a `MemoryTransport`-backed `FakeClient`. Generic sub-API port interfaces are `IEntityAPI` / `IEntityAPISlim` — the pre-envelope names `SingleResourceResponse` / `CollectionResourceResponse` / `DomainAPI` / `DomainAPISlim` were removed with **no** deprecated aliases. |
| `core-realtime-kit` | WebSocket event types                  |
| `storage-kit`       | Storage domain types + HTTP client (same `EntityRecordResponse` / `EntityCollectionResponse` envelope types as core-http-kit). Implements `IStorageClient`; ships `./testing`. |
| `telemetry-kit`     | Telemetry/logging types + HTTP client (same envelope types; `GET /logs` is the one schemaless collection). Implements `ITelemetryClient`; ships `./testing`. |
| `messenger-kit`     | Messenger domain types                 |
| `messenger-http-kit` | HTTP client for the messenger broker surface (send/pull/ack). NOT an entity API — no `{ data, meta }` envelope. |

## Dependency Layers

```
Layer 0 (leaf):   kit, core-kit, storage-kit, telemetry-kit, messenger-kit,
                  client-vue-theme, errors
                     |
Layer 1:          core-http-kit, core-realtime-kit, messenger-http-kit, server-kit
                     |
Layer 2:          server-db-kit, server-http-kit, server-realtime-kit
                  server-storage-kit, server-telemetry-kit, server-core-worker-kit
                  server-test-kit, client-vue
                     |
Layer 3 (apps):   server-core, server-core-worker, server-storage,
                  server-telemetry, server-messenger, client-ui
```

Build order follows this DAG. Changes to a leaf kit (e.g., `core-kit`) require rebuilding all packages that depend on it.

## Per-Package Directory Layout (typical kit)

```
packages/core-kit/
├── src/
│   ├── domains/           # Domain type definitions per entity
│   │   └── <entity>/
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── validator.ts    # Zod schemas
│   └── index.ts           # Re-exports
├── rollup.config.mjs      # Builds to dist/index.mjs
└── package.json
```
