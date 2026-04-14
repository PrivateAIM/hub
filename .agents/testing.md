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

## Test Suite Pattern (server-core)

The test suite uses the DI module system. The `TestSuite` class:

1. Sets up shared modules (logger) via `BaseApplicationBuilder`
2. Creates its own `TestDatabase` (manages DataSource lifecycle)
3. Registers `ConfigInjectionKey`, `DataSource`, and all repositories in a `Container`
4. Uses `HTTPModule({ skipServer: true })` to wire controllers via DI
5. Creates a test HTTP server from the router

```typescript
// test/utils/suite.ts
const container = new Container();
container.register(ConfigInjectionKey, { useValue: config });
container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });
registerRepositories(container, dataSource);

const httpModule = new HTTPModule({ skipServer: true });
await httpModule.setup(container);

const router = container.resolve(HTTPInjectionKey.Router);
const server = createServer(createNodeDispatcher(router));
```

This ensures tests exercise the same DI wiring as production.

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

## Service-Level Tests (TODO)

Following authup's pattern, service-level tests should use fake repositories:

```typescript
// test/unit/core/helpers/fake-repository.ts
export class FakeEntityRepository<T> implements IEntityRepository<T> {
    private store: T[] = [];
    // In-memory implementation of all IEntityRepository methods
}

// test/unit/core/helpers/mock-actor.ts
export function createAllowAllActor(): ActorContext { ... }
export function createDenyAllActor(): ActorContext { ... }

// test/unit/core/entities/node/service.spec.ts
const repository = new FakeEntityRepository<Node>();
const service = new NodeService({ repository });
const actor = createAllowAllActor();
const node = await service.create({ name: 'test' }, actor);
```

This allows testing business logic without a database.

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
- Service-level tests (TODO): use `FakeEntityRepository` and mock actors
- SQLite tests use in-memory databases and need no external services
- MySQL/Postgres tests need docker-compose services running
