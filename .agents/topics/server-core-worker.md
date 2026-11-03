# server-core-worker

Read before changing apps/server-core-worker.

## Architecture

Background worker executing Docker builds and pushes. No database — purely queue-driven.

**Core layer:** crypto helpers only (asymmetric, symmetric, hash).

**Adapters:** `docker/` (container pack, image push/cleanup, registry auth), `github/`,
`harbor/`, and `http/server.ts` (health-check server).

**Service-specific modules:**
- `CoreClientModule` / `StorageClientModule` — register the core and storage API clients
  under `CoreClientInjectionKey` / `StorageClientInjectionKey`
- `ComponentsModule` — resolves the clients and docker, and starts the 4 worker components
  (analysis-builder, analysis-distributor, master-image-builder, master-image-synchronizer),
  each behind a `RemoteWorker`; components take their clients by constructor

**Failure classification:** every check/execute handler rethrows a failure for which
`isRetryableFailure(e, context.metadata)` (`app/components/helpers.ts`) holds — a transient
error (`isTransientError`: hapic network error or 5xx/429, dockerode `statusCode` ≥ 500, node
socket codes, `ENOENT` only on `connect`) before the last attempt (`metadata.delivery.attempt` <
`metadata.delivery.maxAttempts`, set by the driver on consume: `@hubwire/amqp` from the
`x-attempt` header and `MESSAGE_BUS_MAX_ATTEMPTS`, the memory driver `1/1`; without a delivery
every attempt is the last) — so the AMQP driver retries it; everything else
emits `*_FAILED`. A permanent error misread as transient costs only the backoff. The
distributor keeps the local analysis image while a retry is pending (it re-tags from it) and
removes it otherwise. Errors inside a docker build/push stream are permanent.

**Entry point:** `src/index.ts` with `dotenv/config` and server-kit's `startApplication` (no citty CLI).

## Directory layout

```
apps/server-core-worker/src/
├── core/crypto/                   # Cryptographic utilities
├── adapters/
│   ├── docker/                    # Pack, push, cleanup, registry auth
│   ├── github/
│   ├── harbor/
│   └── http/                      # Health-check server
├── app/
│   ├── modules/                   # config, core-client, storage-client, docker, components, http
│   └── components/                # analysis-builder, analysis-distributor,
│                                  #   master-image-builder, master-image-synchronizer; helpers.ts
└── index.ts                       # Entry point
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| CoreClientModule | `coreClient` | `config`, `authupHook`? | `CoreClientInjectionKey` |
| StorageClientModule | `storageClient` | `config`, `authupHook`? | `StorageClientInjectionKey` |
| DockerModule | `docker` | none | `DockerInjectionKey` (dockerode client) |
| ComponentsModule | `components` | `coreClient`, `storageClient`, `docker`, `messageBus` | nothing (starts 4 worker components, stops them on teardown) |
| HTTPModule | `http` | `config` | `Server` (health-check only) |
