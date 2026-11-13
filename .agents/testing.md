# Testing

## Framework

**Vitest 4.x** with SWC (`unplugin-swc`). Each package has `test/vitest.config.ts`; specs live in `test/unit/**/*.spec.ts`. Use `@faker-js/faker` for test data.

## Running Tests

```bash
npm run test                                      # all packages (Nx)
npx nx test server-core                           # one package
npm run test:mysql --workspace=apps/server-core   # against a running MySQL (also test:psql, test:coverage)
```

## Test Infrastructure (all services with database)

server-core, server-storage and server-telemetry share a `test/app/` pattern: `TestApplication` (with `get dataSource()`), `TestHTTPApplication` (with `get client`), `createTestDatabaseModule()` and `createTestApplication()` (sets `PORT=0`). The test app wires the production DI modules, replacing only the database module. Details per service: [server-core](topics/server-core.md), [testcontainers](topics/testcontainers.md).

## The Three Testing Layers

Pick the layer by what the code under test talks to; do not migrate one layer into another. Prefer real modules and components with fake implementations of their ports or transport. Do not intercept constructors or `vi.mock` modules to test wiring, and do not add production injection options only for a test.

| Layer | Seam | Used for | Needs Docker |
|---|---|---|---|
| **Port fakes** | The domain port interface (`IEntityRepository`, `IPermissionEvaluator`, …) | Entity/business services in `core/` | no |
| **Transport-level FakeClient** | hapic's `MemoryTransport`, under a real client | Anything that CONSUMES an HTTP client: client-vue components, worker components | no |
| **A real docker daemon** | dockerode against the local socket | The two worker specs that pack or build an image | **yes** |
| **Testcontainers** | The real process | HTTP integration suites for server-core / storage / telemetry, with real Authup enforcement | **yes** |

## Database Testing

CI runs the suites against MySQL 9, PostgreSQL 18 (workflow services) and in-memory SQLite. Locally, without `DB_TYPE`, the DB-backed suites start a PostgreSQL testcontainer; set `DB_TYPE`/`DB_HOST`/`DB_USERNAME`/`DB_PASSWORD`/`DB_DATABASE` (or use `test:mysql`/`test:psql` after `docker-compose up -d`) to use a running server. Without `AUTHUP_URL` an Authup testcontainer starts. The suites build their schema with `synchronize()`, so migrations are covered separately ([database](topics/database.md#migration-tests)).

## Service-Level Tests

Core services are tested with fakes and need no database or Authup. Tests are grouped by domain (`test/unit/core/entities/<entity>/`, `test/unit/core/services/`), with domain-specific fakes colocated next to the specs that use them.

### Shared test package (`@privateaim/server-test-kit`)

- `FakeEntityRepository<T>`: in-memory `IEntityRepository<T>` with `seed()`, `getAll()`, `clear()`.
- `FakePermissionEvaluator` (re-exported from `@authup/server-test-kit`): call arrays, `setBehavior` / `deny` / `denyAll`, `compile()` defaulting to `post`. A denial throws authup's `PermissionError`, as production does; a hand-written behavior must throw it too, never `PermissionDeniedError` (`reachesRecord` & co. read only `PermissionError` as "not reached").
- `createAllowAllActor()` / `createDenyAllActor()` / `createScopedActor({ realmScope })`: `FakeActorContext` factories; only the scoped one enforces realm reach, and its `policy` option models a grant that does not lower (`compile()` → `post`, rows decided by the policy). The allow-all actor also compiles to `post` and then reaches every row of every realm, so a read spec about realm reach needs the scoped one. Assert `toThrow(PermissionError)` for an evaluator denial, `toThrow(PermissionDeniedError)` only for a denial hub code throws.
- `createFakeAuthupClient({ handlers, fallback })`: a real `AuthupClient` on a `MemoryTransport`. Not `@authup/core-http-kit/testing`'s fake, which hard-codes a 200 and cannot reach the 404 branches of `AnalysisClientService` / `NodeClientService`.

## CI Pipeline

`.github/workflows/main.yml`: install (`npm ci`, Node 26), build (Nx, cached), test matrix (MySQL, Postgres, SQLite; database as a workflow service), lint. Authup is not a workflow service: a service container cannot mount the provisioning file, which is only checked out after services start, so each suite starts it via testcontainers.

## Writing Tests

- HTTP-client consumers (client-vue components, worker components) use the kit's `FakeClient` ([http-api](topics/http-api.md#transport-level-fakeclient)) and need no Docker.
- server-core-worker components are constructor-injected: specs construct them directly, no container or bus; shared doubles live in `test/unit/components/fakes/`. Two worker specs need a real docker daemon (`test/unit/docker/pack.spec.ts`, `test/unit/components/master-image-builder/execute.spec.ts`). The second writes a fixture under `writable/master-images/` that `master-images.spec.ts` deletes, hence `fileParallelism: false` in that package; do not re-enable it without decoupling the fixture.
- hubwire's own suite covers bus semantics; hub specs cover only hub wiring. `publish()` / `dispatch()` resolve before any handler ran: wait with `drain()` from `@hubwire/test`, never on the publish. A bus that must only record is `@hubwire/test`'s `FakeMessageBus`. A worker handler spec sets `metadata.delivery = { attempt, maxAttempts }` on the fake context.
- The server-core and server-storage test apps register a memory-driver `MessageBusModule`; `RemoteMessageBusInjectionKey` stays unbound there, so storage publishes no bucket or file events.
- A scheduled-component spec must `stop()` the component in `afterEach`: a cron task left running keeps the vitest worker alive and the suite hangs instead of failing.
- `createTestApplication({ telemetryHandlers })` (server-core) fakes the telemetry client; it is the only way to exercise the analysis log controllers.

## Fakes Over Mocks

**Use fake implementations, never `vi.fn()` / `vi.mock()`.** Every dependency is injectable through a port interface; if one is not, the architecture is not hexagonal enough yet and that is what to fix. A fake implements the port with in-memory behavior and call-recording helpers:

```typescript
// Good: fake implements the port interface
const recalculator = new FakeAnalysisNodeMetadataRecalculator(analysisRepository);

// Bad: vi.fn() stubs bypass the interface contract
const recalculator = { recalc: vi.fn(), recalcDebounced: vi.fn() };
```

Reuse the existing fakes (`server-test-kit`, the kits' `./testing` exports, and the `Fake*` files next to the specs). When a dependency has none, add one in the entity's test directory implementing the port.
