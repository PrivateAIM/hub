# server-core

Read before changing apps/server-core's layout, DI modules or test application.

## Directory layout

```
apps/server-core/src/
├── core/                          # Domain logic, no typeorm/routup imports
│   ├── entities/<entity>/         # types.ts (ports), service.ts, schema.ts (rapiq)
│   ├── services/                  # Cross-entity services: analysis-{builder,configurator,
│   │                              #   distributor,storage-manager,reach,reconciler,
│   │                              #   log-access,client-permission}, master-image/{builder,
│   │                              #   synchronizer}, client-credential, registry-credential;
│   │                              #   helpers.ts (process status/staleness rules)
│   ├── query/                     # Field gates, relation gates, condition prefixing
│   ├── domains/                   # Domain type definitions (registry task types)
│   └── harbor/
├── adapters/
│   ├── database/
│   │   ├── entities/              # TypeORM entities
│   │   ├── subscribers/           # Domain-grouped: analysis, master-image, node, project, registry
│   │   ├── migrations/            # mysql/ and postgres/
│   │   └── error/
│   ├── http/controllers/
│   │   ├── entities/<entity>/     # Thin controllers
│   │   └── workflows/             # root, service (non-CRUD)
│   └── socket/                    # Socket server, namespace/room reach, per-entity controllers
├── app/
│   ├── modules/                   # DI modules (see inventory); database/ also holds the
│   │                              #   repository adapters and the node/analysis client services
│   ├── aggregators/               # Bus event consumers: authup, storage, worker
│   └── components/                # registry consumer; node-client + analysis-reconciler
│                                  #   (scheduled); start/ (background start helper)
├── cli/                           # citty CLI (start, migration)
└── commands/                      # start
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`?, `authupClient`?, `taggedCache`?, `logger`? | `DataSource`, `QueryCache`, 12 repository adapters, `RegistryManager` |
| ComponentsModule | `components` | `database`, `analysis`, `messageBus` | `RegistryComponentDispatcher` (bus dispatch, in-process only without a bus); starts the registry consumer and the node-client and analysis-reconciler scheduled components, stops them on teardown |
| AnalysisModule | `analysis` | `database`, `messageBus` | `Builder`, `Configurator`, `Distributor`, `StorageManager`, 3 metadata recalculators |
| HarborModule | `harbor` | `config`, `database` | nothing (sets up registry) |
| AggregatorsModule | `aggregators` | `database`, `components`, `analysis`, `messageBus` | nothing (starts bus event consumers, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `analysis`, `messageBus`, `telemetryClient`?, `authupClient`?, `components`? | `App`, `Server` (plus the socket server when `options.socket`) |
| TelemetryClientModule | `telemetryClient` | `config`, `authupHook`? | `TelemetryClientInjectionKey` |

`?` marks an **optional** dependency (`{ name, optional: true }`) — the module still
sets up when that one is absent.

## Test application pattern

Test infrastructure lives in `test/app/`, matching authup's pattern:

- `module.ts` — `TestApplication extends Application` with a `dataSource` getter
- `http.ts` — `TestHTTPApplication extends TestApplication` with a `client` getter (`ICoreClient`)
- `database.ts` — `createTestDatabaseModule()` per test app, `createTestDatabaseModuleForSetup()` for global setup
- `factory.ts` — `createTestApplication({ telemetryHandlers? })` returns `TestHTTPApplication`; `createTestDatabaseApplication()` returns `TestApplication`

`createTestApplication()` wires config, logger, a `MessageBusModule` on the memory
driver, `AuthupHookModule`, `AuthupClientModule`, `TaggedCacheModule` (memory driver),
the test database module,
`AnalysisModule` and `HTTPModule` (no `ComponentsModule`; a faked telemetry client
only with `telemetryHandlers`):

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
