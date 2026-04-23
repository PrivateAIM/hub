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
| `test/app/database.ts` | `createTestDatabaseModule()` for per-test DB with SQLite fallback |
| `test/app/factory.ts` | `createTestApplication()` returns `TestHTTPApplication` with `PORT=0` |

Each test application wires the same DI modules as production but uses `createTestDatabaseModule()` instead of the real `DatabaseModule`.

## Database Testing

Tests run against real databases (not mocks). The CI matrix tests three backends:

| Backend          | Driver           | CI Service         |
|------------------|------------------|--------------------|
| MySQL 9          | `mysql2`         | Docker container   |
| PostgreSQL 18    | `pg`             | Docker container   |
| SQLite           | `better-sqlite3` | In-memory          |

Local database testing uses `docker-compose.yml`:

```bash
docker-compose up -d    # Start MySQL (3306) + Postgres (5432)
npm run test:mysql
npm run test:psql
```

## Service-Level Tests

Test helpers for service-level (core) unit tests are in `test/unit/core/helpers/`:

- `FakeEntityRepository<T>` — In-memory `IEntityRepository<T>` implementation with `seed()`, `getAll()`, `clear()` helpers
- `createAllowAllActor()` — Mock `ActorContext` that permits all operations
- `createDenyAllActor()` — Mock `ActorContext` that throws `ForbiddenError`
- `createMasterRealmActor()` / `createNonMasterRealmActor()` — Realm-specific mock actors

```typescript
// test/unit/core/entities/node/service.spec.ts
const repository = new FakeEntityRepository<Node>();
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

Service test files go in `test/unit/core/entities/<entity>/service.spec.ts`. See [Plan 006](.agents/plans/006-service-level-tests.md) for implementation roadmap.

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs:

1. **Install** — `npm ci` with Node 22
2. **Build** — `npm run build` (Nx with caching)
3. **Test** — Parallel matrix: MySQL, Postgres, SQLite
   - Spins up Authup service on port 3000
   - Database-specific env vars set per matrix entry
4. **Lint** — `npm run lint`

## Test Environment Variables

| Variable                  | Purpose                        |
|---------------------------|--------------------------------|
| `DB_TYPE`                 | Selects database driver        |
| `DB_HOST`, `DB_PORT`      | Database connection            |
| `DB_USERNAME`, `DB_PASSWORD` | Database credentials        |
| `DB_DATABASE`             | Database name                  |
| `SKIP_PROJECT_APPROVAL`   | Skip approval flow in tests    |
| `SKIP_ANALYSIS_APPROVAL`  | Skip approval flow in tests    |

## Writing Tests

- Place test files in `test/unit/**/*.spec.ts`
- Use `@faker-js/faker` for test data generation
- HTTP integration tests: use `TestSuite` which wires controllers via DI modules
- Service-level tests: use `FakeEntityRepository` and fake callers
- SQLite tests use in-memory databases and need no external services
- MySQL/Postgres tests need docker-compose services running

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
- `FakeEntityRepository<T>` — `IEntityRepository<T>` with `seed()`, `getAll()`, `clear()`
- `FakeAnalysisRepository` — `IAnalysisRepository` with `findOneWithProject()`
- `FakeAnalysisNodeRepository` — `IAnalysisNodeRepository` with `findManyWithNodeByAnalysis()`
- `FakeAnalysisBucketFileRepository` — `IAnalysisBucketFileRepository` with `findRootCodeFile()`
- `FakeAnalysisMetadataRecalculator` / `FakeAnalysisNodeMetadataRecalculator` / `FakeAnalysisFileMetadataRecalculator` — record `recalc()` and `recalcDebounced()` calls
- `createAllowAllActor()` / `createDenyAllActor()` — `ActorContext` fakes for permission testing
- `createMasterRealmActor()` / `createNonMasterRealmActor()` — realm-scoped actor fakes

When a dependency has no fake yet, create one in the appropriate `test/**/helpers/` directory implementing the port interface.
