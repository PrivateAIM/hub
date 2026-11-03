# Testing

## Framework

**Vitest 4.x** with SWC transpilation (`unplugin-swc`) for fast TypeScript compilation.

## Running Tests

```bash
# All packages
npm run test

# Specific database backend (server-core)
npm run test:mysql
npm run test:psql

# With coverage
npm run test:coverage

# Single package
npx nx test server-core
```

## Test Configuration

Each package with tests has `test/vitest.config.ts`:

```typescript
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/unit/**/*.spec.ts'],
        globals: true,
    },
    plugins: [swc.vite()],
});
```

Test files live in `test/unit/` and use the `.spec.ts` extension.

## Test Infrastructure (all services with database)

Services with databases (server-core, server-telemetry, server-storage) share the same test infrastructure pattern in `test/app/`:

| File | Purpose |
|------|---------|
| `test/app/module.ts` | `TestApplication extends Application` with `get dataSource()` accessor |
| `test/app/http.ts` | `TestHTTPApplication extends TestApplication` with `get client` (API client) |
| `test/app/database.ts` | `createTestDatabaseModule()` for per-test DB, using the configured database or a PostgreSQL testcontainer by default |
| `test/app/factory.ts` | `createTestApplication()` returns `TestHTTPApplication` with `PORT=0` |

Each test application wires the same DI modules as production but uses `createTestDatabaseModule()` instead of the real `DatabaseModule`.

## The Three Testing Layers

Hub fakes at three different depths. They are complementary — pick by what the
code under test actually talks to, and do not migrate one layer into another.

Prefer real modules/components with fake implementations of their dependency ports
or transport clients. Do not intercept constructors or replace imported modules with
`vi.mock` to test wiring: exercise observable behavior through the real container and
lifecycle instead. For adapter behavior that depends on the transport (e.g. closing
live WebSockets), use the real adapter in an integration test rather than mocking it.
Do not add production injection options solely to support a test.

| Layer | Seam | Used for | Needs Docker |
|---|---|---|---|
| **Port fakes** | The domain port interface (`IEntityRepository`, `IPermissionEvaluator`, …) | Entity/business services in `core/` | no |
| **Transport-level FakeClient** | hapic's `MemoryTransport`, under a real client | Anything that CONSUMES an HTTP client: client-vue components, worker components | no |
| **A real docker daemon** | dockerode against the local socket | The two worker specs that pack or build an image | **yes** |
| **Testcontainers** | The real process | HTTP integration suites for server-core / storage / telemetry, with real Authup enforcement | **yes** |

## Database Testing

Tests run against real databases (not mocks). The CI matrix tests three backends:

| Backend          | Driver           | CI Service / Source |
|------------------|------------------|---------------------|
| MySQL 9          | `mysql2`         | Docker service      |
| PostgreSQL 18    | `pg`             | Docker service      |
| SQLite           | `better-sqlite3` | In-memory           |

Locally, with no `DB_TYPE` configured, the DB-backed suites start a PostgreSQL
testcontainer (the SQLite in-memory fallback was removed for these services).
To target an already-running database instead:

```bash
docker-compose up -d    # Start MySQL (3306) + Postgres (5432)
npm run test:mysql
npm run test:psql
```

## Service-Level Tests

### Shared test package (`@privateaim/server-test-kit`)

Generic test fakes shared across all services live in `packages/server-test-kit/`:

- `FakeEntityRepository<T>` — In-memory `IEntityRepository<T>` with `seed()`, `getAll()`, `clear()`
- `FakePermissionEvaluator` — authup's `IPermissionEvaluator` fake, re-exported from `@authup/server-test-kit`: public call arrays (`preEvaluateCalls`, `preEvaluateOneOfCalls`, `evaluateCalls`, `evaluateOneOfCalls`, `compileCalls`), `setBehavior` / `deny` / `denyAll`, `compile()` defaulting to `post`
- `FakeActorContext` — `ActorContext` whose `permissionEvaluator` is the fake, so specs read the call arrays without a cast
- `createAllowAllActor()` — `FakeActorContext` that permits all operations
- `createDenyAllActor()` — `FakeActorContext` whose evaluator throws authup's `PermissionError`, as the production evaluator does (assert `toThrow(PermissionError)` from `@authup/access` for an evaluator denial, `toThrow(PermissionDeniedError)` only for a denial hub code throws itself)
- `createScopedActor({ realmScope })` — `FakeActorContext` whose grants carry a `realm_scope`, enforced via authup's `realmScopeMatches` (use it for realm denials; the other factories allow everything)

### Test directory layout (domain-grouped)

Service-level tests are organized by domain, with fakes colocated next to the tests that use them:

```text
test/unit/core/
├── helpers/
│   └── index.ts                      # Re-exports from @privateaim/server-test-kit
├── entities/
│   └── <entity>/
│       ├── service.spec.ts           # Entity service tests
│       ├── fake-repository.ts        # Domain-specific fake repository (if needed)
│       └── fake-*.ts                 # Other domain-specific fakes
└── services/
    ├── helpers/                      # Fakes for core service tests
    │   └── index.ts
    └── <service>.spec.ts             # Core service tests (builder, configurator, etc.)
```

### Example

```typescript
// test/unit/core/entities/node/service.spec.ts
import { FakeEntityRepository, createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { FakeNodeRepository } from './fake-repository.ts';
import { FakeRegistryManager } from './fake-registry-manager.ts';

const repository = new FakeNodeRepository();
const service = new NodeService({ repository, registryManager });

it('should create with valid data', async () => {
    const result = await service.create({ name: 'test' }, createAllowAllActor());
    expect(result.id).toBeDefined();
});

it('should deny without permission', async () => {
    await expect(
        service.create({ name: 'test' }, createDenyAllActor()),
    ).rejects.toThrow(PermissionError); // from @authup/access
});
```

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs:

1. **Install** — `npm ci` with Node 26
2. **Build** — `npm run build` (Nx with caching)
3. **Test** — Parallel matrix: MySQL, Postgres, SQLite
   - Database provided as a workflow service (external), selected per matrix entry
   - Authup is **not** a workflow service — each suite starts it via testcontainers
     (a service container cannot mount the workspace provisioning file, which is only
     checked out after services start)
4. **Lint** — `npm run lint`

## Test Environment Variables

| Variable                  | Purpose                        |
|---------------------------|--------------------------------|
| `DB_TYPE`                 | Selects database driver; unset ⇒ Postgres testcontainer |
| `DB_HOST`, `DB_PORT`      | Database connection            |
| `DB_USERNAME`, `DB_PASSWORD` | Database credentials        |
| `DB_DATABASE`             | Database name                  |
| `AUTHUP_URL`              | External Authup URL; unset ⇒ Authup testcontainer |
| `SKIP_PROJECT_APPROVAL`   | Skip approval flow in tests    |
| `SKIP_ANALYSIS_APPROVAL`  | Skip approval flow in tests    |

## Writing Tests

- Place test files in `test/unit/**/*.spec.ts`
- Use `@faker-js/faker` for test data generation
- HTTP integration tests: use `TestSuite` which wires controllers via DI modules
- Service-level tests: use `FakeEntityRepository` and fake dispatchers
- Service-level (core/entity) tests use fakes and need no database or Authup
- HTTP-facing suites (core/storage/telemetry) need Docker: they start Authup (always)
  and, unless `DB_TYPE` is set, a PostgreSQL container. Set `DB_TYPE`/`DB_HOST`
  (or use `test:mysql`/`test:psql`) to target an already-running database instead.
- HTTP-client consumers (client-vue components, worker components) use the
  transport-level `FakeClient` and need **no** Docker.
- `apps/server-core-worker` components are constructor-injected, so specs
  construct them DIRECTLY (`new AnalysisBuilderCheckHandler({ coreClient, docker })`)
  — no container, no message bus. Shared doubles live in
  `test/unit/components/fakes/`.
- **Two worker specs are the exception and need a real docker daemon**:
  `test/unit/docker/pack.spec.ts` (pulls alpine, `putArchive`) and
  `test/unit/components/master-image-builder/execute.spec.ts` (builds a `FROM
  scratch` fixture, the only coverage of the streamx `Pack` → `buildImage`
  hand-off from #1863). The second writes a fixture under
  `writable/master-images/`, which `master-images.spec.ts` deletes wholesale
  before cloning the catalogue — hence `fileParallelism: false` in that package's
  `test/vitest.config.ts`. Do not re-enable it without decoupling the fixture.
- Components, dispatchers, workers and the bus come from `hubwire`, whose own suite covers their
  semantics (retry, ordering, unknown commands, `stop()` during a pass). Hub specs
  pin only hub wiring. A dispatcher spec builds a real `MessageBus` on hubwire's
  `MemoryMessageBusDriver` and puts a fake `ICallable` behind a
  `RemoteWorker` (`apps/server-core/test/unit/app/components/registry/dispatcher.spec.ts`).
  **`publish()` / `dispatch()` resolve before any handler ran** (the memory driver delivers on
  a later microtask): wait with `drain()` from `@hubwire/test` (a dev dependency of server-kit
  and server-core) or a deferred, never on the publish. A dispatcher whose bus must only
  record takes `@hubwire/test`'s `FakeMessageBus` instead of a hand-written fake. A worker
  handler spec sets the delivery it needs on the fake context
  (`metadata.delivery = { attempt, maxAttempts }`; server-core-worker's
  `FakeComponentHandlerContext` defaults to the first of `MESSAGE_BUS_MAX_ATTEMPTS`).
  The server-core and server-storage test apps register a `MessageBusModule` on a
  memory driver, since dispatchers require a bus; nothing in those suites consumes
  the commands, and `RemoteMessageBusInjectionKey` stays unbound, so server-storage
  publishes no bucket or file events (server-kit's `message-bus-module.spec.ts` pins
  when that token is registered). The log-hook factories are covered by server-kit's
  `message-bus-hooks.spec.ts` (including that a silent routing's publish is not logged).
  A scheduled-component spec (`test/unit/app/components/{node-client,analysis-reconciler}/`,
  server-telemetry's `event-cleaner.spec.ts`) asserts through `status()` and **must
  `stop()` the component in `afterEach`**: a cron task left running keeps the vitest
  worker alive, so the suite hangs instead of failing.
- `createTestApplication({ telemetryHandlers })` (server-core) opts in to a faked
  telemetry client, which is the only way to exercise `AnalysisLogController` /
  `AnalysisNodeLogController` without a live telemetry service.

## Fakes Over Mocks

**Always prefer fake implementations over `vi.fn()` / `vi.mock()`.** The hexagonal architecture with dependency inversion makes every dependency injectable via a port interface — if it doesn't, that's a signal the architecture isn't fully hexagonal yet and should be fixed.

Write a class that implements the port interface with in-memory behavior and call-recording helpers. Never use `vi.fn()` to stub methods or `vi.mock()` to replace modules.

```typescript
// Good — fake implements the port interface
const recalculator = new FakeAnalysisNodeMetadataRecalculator(analysisRepository);
const service = new AnalysisNodeService({ repository, recalculator });

// Bad — vi.fn() stubs bypass the interface contract
const recalculator = { recalc: vi.fn(), recalcDebounced: vi.fn() };
```

Existing fakes to reuse:

**Shared (`@privateaim/server-test-kit`):**
- `FakeEntityRepository<T>` — `IEntityRepository<T>` with `seed()`, `getAll()`, `clear()`
- `FakePermissionEvaluator` (from `@authup/server-test-kit`) — call arrays + `setBehavior`/`deny`/`denyAll`; a denial throws authup's `PermissionError` (the `deny`/`denyAll` default). A hand-written behavior must throw it too, never `PermissionDeniedError`: `reachesRecord` & co. read only `PermissionError` as "not reached", so a fake throwing hub's error would propagate where production returns `false`
- `createAllowAllActor()` / `createDenyAllActor()` — `FakeActorContext` fakes for permission testing
- `createScopedActor({ realmScope })` — realm-scoped actor fake (`realmMatch` enforced, `compile()` lowered per scope)
- `createFakeAuthupClient({ handlers, fallback, baseURL })` / `FakeAuthupClient` — a REAL `AuthupClient` on a `MemoryTransport`, with `requests` and `fakeAuthupResponse(status, body)`. Use this for anything talking to authup. Deliberately **not** `@authup/core-http-kit/testing`'s `createFakeClient`: that one overrides `request()` and hard-codes a 200, so it can never drive the `isClientErrorWithStatusCode(e, 404)` branches that `AnalysisClientService` and `NodeClientService` depend on.

**HTTP clients (`@privateaim/<kit>/testing`)** — see [Transport-level FakeClient](topics/http-api.md#transport-level-fakeclient):
- `createFakeClient({ handlers, fallback, ...clientOptions })` / `FakeClient` — a REAL client on a `MemoryTransport`, exposing `requests`: the normalized record of everything dispatched
- `fakeResponse(status, body)` — return it from a handler to drive a non-2xx through the real error pipeline
- `matchRoute(method, url, handlers)` — the route matcher, exported for direct testing

Available from all four HTTP kits: `@privateaim/core-http-kit/testing`,
`@privateaim/storage-kit/testing`, `@privateaim/telemetry-kit/testing` and
`@privateaim/messenger-http-kit/testing`. Authup's equivalent
(`@authup/core-http-kit/testing`) is installed too, so alias on import when a
file needs more than one: `import { createFakeClient as createFakeCoreClient } from …`.

**Domain-specific (colocated in `test/unit/core/entities/<entity>/`):**
- `FakeAnalysisRepository` — `IAnalysisRepository` with `findOneWithProject()`
- `FakeAnalysisNodeRepository` — `IAnalysisNodeRepository` with `findManyWithNodeByAnalysis()`
- `FakeAnalysisBucketFileRepository` — `IAnalysisBucketFileRepository` with `findRootCodeFile()`
- `FakeNodeRepository` — `INodeRepository` with `findOneWithExternalName()`
- `FakeProjectRepository` — `IProjectRepository` with `checkUniqueness()`
- `FakeRegistryRepository` — `IRegistryRepository` with `findOneWithSecret()`
- `FakeRegistryManager` — `IRegistryManager` with call recording
- `FakeRegistryDispatcher` — `IRegistryDispatcher` with dispatch recording
- `FakeMasterImageBuilderDispatcher` / `FakeMasterImageSynchronizerDispatcher` — dispatcher fakes with dispatch recording
- `FakeAnalysisMetadataRecalculator` / `FakeAnalysisNodeMetadataRecalculator` / `FakeAnalysisFileMetadataRecalculator` — record `recalc()` and `recalcDebounced()` calls

When a dependency has no fake yet, create one in the entity's test directory (`test/unit/core/entities/<entity>/`) implementing the port interface.
