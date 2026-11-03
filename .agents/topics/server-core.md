# server-core

Read before changing apps/server-core's layout, DI modules or test application.

## Directory layout

```
apps/server-core/src/
├── core/                          # Domain logic (pure business rules)
│   ├── entities/                  # Entity ports, services, validators
│   │   └── <entity>/
│   │       ├── types.ts           # IXRepository, IXService port interfaces
│   │       ├── service.ts         # XService (business logic + validation)
│   │       └── validator.ts       # Input validator (ValidatorGroup groups)
│   ├── services/                  # Business logic services
│   │   ├── analysis-builder/      # Analysis build lifecycle
│   │   ├── analysis-configurator/ # Configuration lock/unlock
│   │   ├── analysis-distributor/  # Distribution orchestration
│   │   ├── analysis-storage-manager/ # Storage provisioning
│   │   ├── master-image/          # Image catalog sync + build status rules (builder/)
│   │   └── helpers.ts             # isProcessStatusTerminal / isCheckVerdictStale
│   └── domains/                   # Domain type definitions (task types)
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # TypeORM entity definitions
│   │   ├── subscribers/           # TypeORM event subscribers (domain-grouped)
│   │   ├── analysis/          # Analysis, bucket, bucket-file, node
│   │   ├── master-image/      # MasterImage, MasterImageGroup
│   │   ├── node/              # Node
│   │   ├── project/           # Project, ProjectNode
│   │   └── registry/          # Registry, RegistryProject
│   │   ├── migrations/            # postgres/ and mysql/
│   │   └── error/                 # Database error types
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── entities/<entity>/module.ts  # Thin controllers
│   │   │   └── workflows/         # Non-CRUD workflow controllers
│   │   (buildActorContext comes from @privateaim/server-http-kit)
│   └── socket/                    # WebSocket handlers
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerCoreApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── analysis/              # AnalysisModule (builder, configurator, distributor, storage)
│   │   ├── aggregators/            # AggregatorsModule (starts AMQP event consumers)
│   │   ├── components/            # ComponentsModule (dispatchers, task consumers, scheduled components)
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, repos, subscribers, node-client)
│   │   │   ├── repositories/<entity>/  # Repository adapters
│   │   │   ├── node-client.ts     # NodeClientService (authup integration)
│   │   │   ├── options.ts         # DataSourceOptionsBuilder
│   │   │   └── register.ts        # registerRepositories() helper
│   │   ├── harbor/                # HarborModule (registry setup)
│   │   ├── http/                  # HTTPModule (router, controllers, server, socket)
│   │   ├── registry/              # RegistryManagerAdapter
│   │   └── telemetry-client/      # TelemetryClientModule
│   ├── aggregators/               # AMQP event consumers
│   └── components/                # hubwire components: registry consumer, node-client + analysis-reconciler (scheduled)
├── cli/                           # CLI entry point (citty)
└── commands/                      # start, migration commands
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`?, `authupClient`? | `DataSource`, 13 repo adapters, `RegistryManager` |
| ComponentsModule | `components` | `database`, `analysis`, `messageBus` | `RegistryComponentDispatcher` (bus dispatch, in-process only without a bus); starts the registry consumer and the node-client and analysis-reconciler scheduled components, stops them on teardown |
| AnalysisModule | `analysis` | `database` | `Builder`, `Configurator`, `Distributor`, `StorageManager`, 3 metadata recalculators |
| HarborModule | `harbor` | `config`, `database` | nothing (sets up registry) |
| AggregatorsModule | `aggregators` | `database`, `components`, `analysis` | nothing (starts AMQP event consumers, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `analysis`, `telemetryClient`? | `App`, `Server`, `Router` |
| TelemetryClientModule | `telemetryClient` | `config`, `authupHook`? | `TelemetryClient` |

`?` marks an **optional** dependency (`{ name, optional: true }`) — the module still
sets up when that one is absent.

## Test application pattern

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
