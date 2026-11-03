# server-core-worker

Read before changing apps/server-core-worker.

## Architecture

Background worker executing Docker containers. No database entities — purely queue-driven.

**Core layer:** Docker utilities, crypto helpers, GitHub/Harbor integrations. Uses module-level variables (`setCoreClient`/`useCoreClient`) for API client access.

**Adapters:**
- `adapters/http/server.ts` — minimal health-check HTTP server

**Service-specific modules:**
- `CoreClientModule` — sets up core API client via `setCoreClient()`
- `StorageClientModule` — sets up storage API client via `setStorageClient()`
- `ComponentsModule` — starts all 4 worker components (analysis-builder, analysis-distributor, master-image-builder, master-image-synchronizer)

**Failure classification:** every check/execute handler rethrows a failure for which
`isRetryableFailure(e, context.metadata)` (`app/components/helpers.ts`) holds — a transient
error (`isTransientError`: hapic network error or 5xx/429, dockerode `statusCode` ≥ 500, node
socket codes, `ENOENT` only on `connect`) before the last attempt (`metadata.delivery.attempt` <
`metadata.delivery.maxAttempts`, which the driver sets on consume: `@hubwire/amqp` from the
`x-attempt` header and `MESSAGE_BUS_MAX_ATTEMPTS`, the memory driver `1/1`; without a delivery
every attempt is the last) — so the AMQP driver retries it; everything else
emits `*_FAILED`. A permanent error misread as transient costs only the backoff. The
distributor keeps the local analysis image while a retry is pending (it re-tags from it) and
removes it otherwise. Errors inside a docker build/push stream are permanent.

**Entry point:** Uses `src/index.ts` with `dotenv/config` directly (no citty CLI).

## Directory layout

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

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| CoreClientModule | `coreClient` | `config`, `authupHook`? | nothing (calls `setCoreClient()`) |
| StorageClientModule | `storageClient` | `config`, `authupHook`? | nothing (calls `setStorageClient()`) |
| DockerModule | `docker` | none | `DockerInjectionKey` (dockerode client) |
| ComponentsModule | `components` | `coreClient`, `storageClient`, `docker` | nothing (starts 4 worker components, stops them on teardown) |
| HTTPModule | `http` | `config` | `Server` (health-check only) |
