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

See [Conventions — Documentation Site](.agents/conventions.md#documentation-site) for docs structure and update guidelines.

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
| `server-kit`             | Logging (Winston), auth helpers, AMQP messaging, Redis, shared core types (IEntityRepository, ActorContext, AbstractEntityService, ValidatorGroup), `describeQuerySchema()` + `RECORD_QUERY_PARAMETERS` for the response `meta.schema` |
| `server-test-kit`        | Shared test fakes (FakeEntityRepository, FakePermissionChecker, actor factories) |
| `server-db-kit`          | TypeORM utilities, database setup, migrations |
| `server-http-kit`        | HTTP route/controller decorators for Routup |
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

## Per-Application Directory Layout (server-core, hexagonal)

```
apps/server-core/src/
├── core/                          # Domain logic (pure business rules)
│   ├── entities/                  # Entity ports, services, validators
│   │   └── <entity>/
│   │       ├── types.ts           # IXRepository, IXService port interfaces
│   │       ├── service.ts         # XService (business logic + validation)
│   │       └── validator.ts       # Input validator (ValidatorGroup groups)
│   ├── services/                  # Business logic services
│   │   ├── analysis-builder/      # Analysis build lifecycle
│   │   ├── analysis-configurator/ # Configuration lock/unlock
│   │   ├── analysis-distributor/  # Distribution orchestration
│   │   ├── analysis-storage-manager/ # Storage provisioning
│   │   └── master-image/          # Image catalog sync
│   └── domains/                   # Domain type definitions (task types)
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # TypeORM entity definitions
│   │   ├── subscribers/           # TypeORM event subscribers (domain-grouped)
│   │   ├── analysis/          # Analysis, bucket, bucket-file, node
│   │   ├── master-image/      # MasterImage, MasterImageGroup
│   │   ├── node/              # Node
│   │   ├── project/           # Project, ProjectNode
│   │   └── registry/          # Registry, RegistryProject
│   │   ├── migrations/            # postgres/ and mysql/
│   │   ├── error/                 # Database error types
│   │   └── query/                 # Realm query helpers
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── entities/<entity>/module.ts  # Thin controllers
│   │   │   └── workflows/         # Non-CRUD workflow controllers
│   │   └── request/
│   │       ├── helpers/actor.ts   # buildActorContext bridge
│   │       └── repository.ts      # RequestRepositoryAdapter (audit)
│   └── socket/                    # WebSocket handlers
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerCoreApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── analysis/              # AnalysisModule (builder, configurator, distributor, storage)
│   │   ├── aggregators/            # AggregatorsModule (starts AMQP event consumers)
│   │   ├── components/            # ComponentsModule (TaskManager, callers, task consumers)
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, repos, subscribers, node-client)
│   │   │   ├── repositories/<entity>/  # Repository adapters
│   │   │   ├── node-client.ts     # NodeClientService (authup integration)
│   │   │   ├── options.ts         # DataSourceOptionsBuilder
│   │   │   └── register.ts        # registerRepositories() helper
│   │   ├── harbor/                # HarborModule (registry setup)
│   │   ├── http/                  # HTTPModule (router, controllers, server, socket)
│   │   ├── registry/              # RegistryManagerAdapter
│   │   └── telemetry-client/      # TelemetryClientModule
│   ├── aggregators/               # AMQP event consumers
│   └── components/                # AMQP task consumers (registry)
├── cli/                           # CLI entry point (citty)
└── commands/                      # start, migration commands
```

## Per-Application Directory Layout (server-telemetry, hexagonal)

```
apps/server-telemetry/src/
├── core/                          # Domain logic
│   └── services/
│       └── log-store/
│           └── types.ts           # LogStore port interface (query, write, delete)
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/event.ts      # EventEntity TypeORM definition
│   │   ├── subscribers/event.ts   # EventSubscriber (no @EventSubscriber decorator)
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   └── controllers/
│   │       ├── event/             # EventController (DataSource-based CRUD)
│   │       └── log/               # LogController (LogStore-based operations)
│   └── telemetry/
│       ├── victoria-logs.ts       # VictoriaLogsLogStore (with query injection protection)
│       └── memory.ts              # MemoryLogStore (fallback for components)
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerTelemetryApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, subscribers)
│   │   ├── http/                  # HTTPModule (router, controllers, server)
│   │   ├── victoria-logs/         # VictoriaLogsModule (client + LogStore)
│   │   └── components/            # ComponentsModule (starts event + log consumers)
│   └── components/                # AMQP task consumers (event, log)
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

## Per-Application Directory Layout (server-storage, hexagonal)

```
apps/server-storage/src/
├── core/                          # Domain logic
│   └── utils/
│       └── stream-to-buffer.ts    # Stream utility
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # BucketEntity, BucketFileEntity
│   │   ├── subscribers/           # BucketSubscriber, BucketFileSubscriber
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   └── controllers/
│   │       ├── bucket/            # BucketController (CRUD + upload + stream)
│   │       └── bucket-file/       # BucketFileController (CRUD + stream)
│   └── storage/                   # IStorageAdapter impls: minio.ts, fs.ts
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerStorageApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, subscribers)
│   │   ├── http/                  # HTTPModule (router, controllers, server)
│   │   ├── storage/               # StorageModule (IStorageAdapter: minio | fs)
│   │   └── components/            # ComponentsModule (starts bucket consumers)
│   ├── components/                # AMQP task consumers (bucket, bucket-file)
│   └── domains/                   # Domain utility helpers
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

## Per-Application Directory Layout (server-core-worker, hexagonal)

```
apps/server-core-worker/src/
├── core/                          # Domain logic (no infra imports)
│   ├── core/module.ts             # Core API client (module-level variable)
│   ├── storage/module.ts          # Storage API client (module-level variable)
│   ├── crypto/                    # Cryptographic utilities (asymmetric, symmetric, hash)
│   ├── docker/                    # Docker utilities (container-pack, image-push, etc.)
│   ├── github/                    # GitHub API integration
│   └── harbor/                    # Harbor registry utilities
├── adapters/                      # External system implementations
│   └── http/
│       └── server.ts              # Health-check HTTP server
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerCoreWorkerApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── http/                  # HTTPModule (health-check server)
│   │   ├── core-client/           # CoreClientModule (API client setup)
│   │   ├── storage-client/        # StorageClientModule (API client setup)
│   │   ├── docker/                # DockerModule (dockerode client)
│   │   └── components/            # ComponentsModule (starts 4 worker components)
│   └── components/                # AMQP task consumers (builder, distributor, master-image-*)
├── index.ts                       # Entry point (no citty CLI — uses dotenv/config)
└── constants.ts
```

## Per-Application Directory Layout (server-messenger, hexagonal)

```
apps/server-messenger/src/
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # Message mailbox entity
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   ├── controllers/message/   # REST message surface (send/pull/ack, no envelope)
│   │   └── request/helpers/       # Request helpers
│   └── socket/
│       ├── controllers/
│       │   ├── connection/        # Socket.io connection handlers
│       │   └── messaging/         # Legacy relay handlers (kept until plan 013 phase 5)
│       ├── register.ts            # Socket controller registration
│       └── types.ts               # Socket adapter types
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerMessengerApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   └── modules/
│       ├── config/                # ConfigModule (env, paths)
│       ├── database/              # DatabaseModule (DataSource, MessageRepository)
│       │   └── repositories/message/
│       ├── wakeup/                # WakeupModule (redis pub/sub -> `messagePending`)
│       ├── sweeper/               # SweeperModule (expires stored messages)
│       └── http/                  # HTTPModule (HTTP server + Socket.io server)
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

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
