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

## Test Application Pattern (server-core)

Test infrastructure lives in `test/app/`, matching authup's pattern:

- `test/app/module.ts` — `TestApplication extends Application` with `get dataSource()` accessor
- `test/app/http.ts` — `TestHTTPApplication extends TestApplication` with `get client` (resolves server from container)
- `test/app/database.ts` — `createTestDatabaseModule()` for per-test DB, `createTestDatabaseModuleForSetup()` for global setup
- `test/app/factory.ts` — `createTestApplication()` returns `TestHTTPApplication`, `createTestDatabaseApplication()` returns `TestApplication`

```typescript
// test/app/factory.ts
export function createTestApplication(): TestHTTPApplication {
    process.env.PORT = '0';
    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        createTestDatabaseModule(),
        createTestComponentsModule(),
        new AnalysisModule(),
        new HTTPModule(),
    ];
    return new TestHTTPApplication({ modules });
}
```

HTTP tests use the full DI-wired application — the same modules as production:

```typescript
const suite = createTestApplication();
beforeAll(async () => { await suite.setup(); });
afterAll(async () => { await suite.teardown(); });

it('should create', async () => {
    const { client } = suite;
    const result = await client.node.create(createTestNode());
    expect(result.id).toBeDefined();
});
```

## Test Infrastructure (all services with database)

Services with databases (server-core, server-telemetry, server-storage) share the same test infrastructure pattern in `test/app/`:

| File | Purpose |
|------|---------|
| `test/app/module.ts` | `TestApplication extends Application` with `get dataSource()` accessor |
| `test/app/http.ts` | `TestHTTPApplication extends TestApplication` with `get client` (API client) |
| `test/app/database.ts` | `createTestDatabaseModule()` for per-test DB, using the configured database or a PostgreSQL testcontainer by default |
| `test/app/factory.ts` | `createTestApplication()` returns `TestHTTPApplication` with `PORT=0` |

Each test application wires the same DI modules as production but uses `createTestDatabaseModule()` instead of the real `DatabaseModule`.

## Testcontainers & Always-On Authup

The HTTP-facing services (`server-core`, `server-storage`, `server-telemetry`) run
their suites against a **real Authup instance** and a **real database**, and the
authorization middleware **actually enforces** permissions (no `dryRun`). Each
dependency is provided one of two ways, decided by env:

| Dependency | External (used as-is)             | Otherwise (testcontainer)          |
|------------|-----------------------------------|------------------------------------|
| Database   | `DB_TYPE` set (CI services, `test:mysql`, `test:psql`) | PostgreSQL container |
| Authup     | `AUTHUP_URL` set                  | `authup/authup` container          |

The shared helpers live in `@privateaim/server-test-kit`
(`src/testcontainers/`, `src/authup-token.ts`, `src/setup.ts`):

- `provideDatabase(project)` — start a PostgreSQL container when no `DB_TYPE` is set,
  else use the configured database. Publishes the connection to the workers via
  vitest `provide`.
- `provideAuthup(project, permissionNames)` — start an Authup container (unless
  `AUTHUP_URL` is set), provisioned with exactly the permission names the calling
  service checks. Each service passes its own set (`server-storage` 3, `server-telemetry`
  6, `server-core` 19), listed in its `test/setup.ts`. The built-in `admin` role's
  `globalPermissions: ['*']` picks those up at provisioning time, so the `admin`/`master`
  token resolves them via introspection. The generated `.mjs` is mounted at
  `/usr/src/app/writable/provisioning/hub.mjs`.
- Authup runs on the **same database engine as hub** in each environment
  (`resolveAuthupDatabaseEnv`): a dedicated `authup` database on the same
  MySQL/PostgreSQL server (reached via `host.docker.internal`), or its own in-memory
  SQLite on the sqlite leg. This keeps the whole stack on one engine per run.
- `hydrateTestEnv()` — worker-side; the side-effecting `@privateaim/server-test-kit/setup`
  module (wired into each `vitest.config` `setupFiles` alongside `reflect-metadata`)
  copies the provided values into `process.env` before the test app is built.
- `stopTestContainers()` — teardown.
- `createAdminAccessToken()` / `createAdminAuthorizationHeader()` — mint a real
  `admin`/`master` token for tests that issue raw `fetch` requests (uploads,
  streaming) instead of the authenticated API client.

The Authup image is `authup/authup` (currently beta.54, matching `@authup/*`). Each
test app registers `AuthupHookModule` + `AuthupClientModule` so the middleware takes
the real introspection path rather than the fake-identity fallback.

Enabling the Authup client does **not** activate `NodeClientService` /
`AnalysisClientService`: the test database module builds serviceless subscribers
that short-circuit, keeping enforcement and client-provisioning decoupled.

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
- `FakePermissionChecker` — `IPermissionChecker` with call recording (`getCalls()`, `wasMethodCalled()`)
- `createAllowAllActor()` — `ActorContext` with master realm that permits all operations
- `createDenyAllActor()` — `ActorContext` with non-master realm that throws `ForbiddenError`
- `createMasterRealmActor()` / `createNonMasterRealmActor()` — Realm-specific actor factories

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
    ).rejects.toThrow(ForbiddenError);
});
```

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs:

1. **Install** — `npm ci` with Node 22
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
- Service-level tests: use `FakeEntityRepository` and fake callers
- Service-level (core/entity) tests use fakes and need no database or Authup
- HTTP-facing suites (core/storage/telemetry) need Docker: they start Authup (always)
  and, unless `DB_TYPE` is set, a PostgreSQL container. Set `DB_TYPE`/`DB_HOST`
  (or use `test:mysql`/`test:psql`) to target an already-running database instead.

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
- `FakePermissionChecker` — `IPermissionChecker` with `getCalls()`, `wasMethodCalled()`
- `createAllowAllActor()` / `createDenyAllActor()` — `ActorContext` fakes for permission testing
- `createMasterRealmActor()` / `createNonMasterRealmActor()` — realm-scoped actor fakes

**Domain-specific (colocated in `test/unit/core/entities/<entity>/`):**
- `FakeAnalysisRepository` — `IAnalysisRepository` with `findOneWithProject()`
- `FakeAnalysisNodeRepository` — `IAnalysisNodeRepository` with `findManyWithNodeByAnalysis()`
- `FakeAnalysisBucketFileRepository` — `IAnalysisBucketFileRepository` with `findRootCodeFile()`
- `FakeNodeRepository` — `INodeRepository` with `findOneWithExternalName()`
- `FakeProjectRepository` — `IProjectRepository` with `checkUniqueness()`
- `FakeRegistryRepository` — `IRegistryRepository` with `findOneWithSecret()`
- `FakeRegistryManager` — `IRegistryManager` with call recording
- `FakeRegistryCaller` — `IRegistryCaller` with call recording
- `FakeMasterImageBuilderCaller` / `FakeMasterImageSynchronizerCaller` — caller fakes with call recording
- `FakeAnalysisMetadataRecalculator` / `FakeAnalysisNodeMetadataRecalculator` / `FakeAnalysisFileMetadataRecalculator` — record `recalc()` and `recalcDebounced()` calls

When a dependency has no fake yet, create one in the entity's test directory (`test/unit/core/entities/<entity>/`) implementing the port interface.

## Migration Tests

The `test` CI job runs the integration suite against MySQL, Postgres, and SQLite, but the schema is built via `dataSource.synchronize()` (see `apps/<service>/test/app/database.ts`) — migration files in `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/` are **not** exercised by that suite.

A separate `tests-migrations` CI job runs the migration CLI end-to-end for `server-core`, `server-storage`, `server-telemetry`, and `server-messenger` against a fresh MySQL and Postgres container:

1. `migration run` — applies all migrations forward
2. `migration revert` × N — undoes every migration in reverse order (verifies every `down()` works)
3. `migration run` — re-applies the full chain (verifies idempotency)

This catches SQL syntax errors, cross-DB type mismatches, and `down()` regressions across every migration. It does **not** catch data-correctness bugs in `UPDATE`/`INSERT` migrations against pre-existing rows — those still require manual smoke-testing against a populated database.

The job pre-flights with a sanity check that the compiled migrations exist under `apps/<service>/dist/adapters/database/migrations/{mysql,postgres}/` — without this guard, running the CLI from the wrong working directory results in typeorm silently reporting "No migrations are pending" with exit code 0, masking the failure.

Locally, run the same `run → revert × N → run` flow against a running compose stack:

```bash
# MySQL
docker compose up -d mysql
cd apps/server-core               # or: server-storage / server-telemetry / server-messenger

export DB_TYPE=mysql DB_HOST=127.0.0.1 DB_PORT=3306 \
       DB_USERNAME=root DB_PASSWORD=start123 DB_DATABASE=app

node dist/cli/index.mjs migration run
node dist/cli/index.mjs migration revert    # repeat once per migration
node dist/cli/index.mjs migration run       # idempotency replay
```

```bash
# Postgres
docker compose up -d postgres
cd apps/server-core

export DB_TYPE=postgres DB_HOST=127.0.0.1 DB_PORT=5432 \
       DB_USERNAME=postgres DB_PASSWORD=start123 DB_DATABASE=app

node dist/cli/index.mjs migration run
node dist/cli/index.mjs migration revert
node dist/cli/index.mjs migration run
```

The CLI auto-creates the target database if it does not exist.
