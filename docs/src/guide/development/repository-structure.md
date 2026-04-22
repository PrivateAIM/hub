# Repository Structure

PrivateAIM Hub is an npm workspaces monorepo with two workspace roots: `apps/*` and `packages/*`. Nx orchestrates build, test, and lint with dependency-aware caching.

## Layout

```
hub/
├── apps/                  # Runnable services and frontend
│   ├── client-ui/         # Nuxt 4 SSR web application
│   ├── server-core/       # Main REST API
│   ├── server-core-worker/# Background worker (Docker execution)
│   ├── server-messenger/  # Real-time messaging (Socket.io)
│   ├── server-storage/    # File/object storage (MinIO/S3)
│   └── server-telemetry/  # Log aggregation (VictoriaLogs)
├── packages/              # Shared libraries
│   ├── kit/               # Core utilities: crypto, events, permissions
│   ├── core-kit/          # Domain models & types for core service
│   ├── core-http-kit/     # HTTP client for the core API
│   ├── core-realtime-kit/ # WebSocket event types
│   ├── storage-kit/       # Storage domain types
│   ├── telemetry-kit/     # Telemetry/logging types
│   ├── messenger-kit/     # Messenger domain types
│   ├── client-vue/        # Reusable Vue 3 component library
│   ├── server-kit/        # Logging, auth, AMQP, Redis helpers
│   ├── server-db-kit/     # TypeORM utilities and setup
│   ├── server-http-kit/   # HTTP route/controller decorators
│   ├── server-realtime-kit/   # Socket.io server helpers
│   ├── server-telemetry-kit/  # Telemetry utilities
│   ├── server-core-worker-kit/# Worker task definitions
│   └── server-storage-kit/    # Storage service contracts
└── docs/                  # Documentation (VitePress)
```

## Dependency Layers

```
Layer 0 (leaf):   kit, core-kit, storage-kit, telemetry-kit, messenger-kit
                     │
Layer 1:          core-http-kit, core-realtime-kit, server-kit
                     │
Layer 2:          server-db-kit, server-http-kit, server-realtime-kit
                  server-storage-kit, server-telemetry-kit, server-core-worker-kit
                  client-vue
                     │
Layer 3 (apps):   server-core, server-core-worker, server-storage,
                  server-telemetry, server-messenger, client-ui
```

Build order follows this DAG. Changes to a leaf kit (e.g., `core-kit`) require rebuilding all packages that depend on it.

## Service Directory Layout

Each service follows a hexagonal architecture:

```
apps/<service>/src/
├── core/          # Domain logic (pure business rules)
├── adapters/      # External system implementations (database, HTTP, socket)
└── app/           # Orchestration (DI modules, wiring, factory)
```

See [Architecture](/getting-started/architecture) for details on each layer.

## Library Directory Layout

```
packages/<kit>/
├── src/
│   ├── domains/       # Domain type definitions per entity
│   │   └── <entity>/
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── validator.ts
│   └── index.ts       # Re-exports
├── tsdown.config.ts   # Builds to dist/index.mjs
└── package.json
```

## Build System

- **Libraries**: built with tsdown — ESM only (`dist/index.mjs`) with TypeScript declarations
- **Services**: built with tsdown (JS) + tsc (declarations), preserving directory structure
- **Nx**: orchestrates cross-package build ordering via `dependsOn: ["^build"]`

```bash
npm run build         # Build everything (npx nx run-many -t build)
npm run test          # Test everything (npx nx run-many -t test)
```
