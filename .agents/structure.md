# Project Structure

## Monorepo Overview

npm workspaces monorepo with two workspace roots: `apps/*` and `packages/*`. Nx orchestrates build/test/lint with dependency-aware caching.

## Applications (6)

Runnable services and the frontend, located in `apps/`.

### Services

| Application            | Purpose                                      | Key Dependencies                      |
|------------------------|----------------------------------------------|---------------------------------------|
| `server-core`          | Main REST API — analyses, projects, nodes, registries | server-kit, server-db-kit, server-http-kit, core-kit |
| `server-core-worker`   | Background worker — Docker container execution | server-kit, server-core-worker-kit, dockerode |
| `server-storage`       | File/object storage service (MinIO/S3)       | server-kit, server-storage-kit, storage-kit |
| `server-telemetry`     | Log aggregation via VictoriaLogs             | server-kit, server-telemetry-kit, telemetry-kit |
| `server-messenger`     | Real-time messaging (Socket.io)              | server-kit, messenger-kit             |

### Frontend

| Application  | Purpose                              | Key Dependencies                    |
|--------------|--------------------------------------|-------------------------------------|
| `client-ui`  | Nuxt 4 SSR web application           | client-vue, core-http-kit, authup   |

## Packages & Libraries (15)

Shared libraries, located in `packages/`.

### Client Libraries

| Package      | Purpose                              | Key Dependencies                    |
|--------------|--------------------------------------|-------------------------------------|
| `client-vue` | Reusable Vue 3 component library     | core-kit, storage-kit, bootstrap-vue-next |

### Server Kits (shared server libraries)

| Package                  | Purpose                                    |
|--------------------------|--------------------------------------------|
| `server-kit`             | Logging (Winston), auth helpers, AMQP messaging, Redis |
| `server-db-kit`          | TypeORM utilities, database setup, migrations |
| `server-http-kit`        | HTTP route/controller decorators for Routup |
| `server-realtime-kit`    | Socket.io server helpers                   |
| `server-telemetry-kit`   | Telemetry/logging utilities                |
| `server-core-worker-kit` | Worker task type definitions               |
| `server-storage-kit`     | Storage service contracts                  |

### Domain Kits (shared types and HTTP clients)

| Package             | Purpose                                |
|---------------------|----------------------------------------|
| `kit`               | Core utilities: crypto, domain events, permissions, realms |
| `core-kit`          | Domain models & types for the core service |
| `core-http-kit`     | HTTP client (Hapic) for the core API   |
| `core-realtime-kit` | WebSocket event types                  |
| `storage-kit`       | Storage domain types                   |
| `telemetry-kit`     | Telemetry/logging types                |
| `messenger-kit`     | Messenger domain types                 |

## Dependency Layers

```
Layer 0 (leaf):   kit, core-kit, storage-kit, telemetry-kit, messenger-kit
                     |
Layer 1:          core-http-kit, core-realtime-kit, server-kit
                     |
Layer 2:          server-db-kit, server-http-kit, server-realtime-kit
                  server-storage-kit, server-telemetry-kit, server-core-worker-kit
                  client-vue
                     |
Layer 3 (apps):   server-core, server-core-worker, server-storage,
                  server-telemetry, server-messenger, client-ui
```

Build order follows this DAG. Changes to a leaf kit (e.g., `core-kit`) require rebuilding all packages that depend on it.

## Per-Application Directory Layout (typical service)

```
apps/server-core/
├── src/
│   ├── commands/          # CLI commands (start, migration, seed)
│   ├── components/        # Domain modules (analysis, project, node, registry, ...)
│   │   └── <entity>/
│   │       ├── entity.ts          # TypeORM entity definition
│   │       ├── handlers/          # HTTP route handlers (CRUD)
│   │       └── subscribers/       # TypeORM event subscribers
│   ├── core/              # Application bootstrap (HTTP server, database, messaging)
│   └── index.ts           # Entry point
├── test/
│   ├── unit/              # Vitest specs
│   └── vitest.config.ts   # Test config
└── package.json
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
