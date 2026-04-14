# Architecture

## System Overview

```
                    ┌─────────────┐
                    │  client-ui  │  Nuxt 4 SSR
                    │  (browser)  │
                    └──────┬──────┘
                           │ HTTP / WebSocket
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ server-core │ │server-storage│ │server-telemetry│
    │  (REST API) │ │ (S3/MinIO)  │ │(VictoriaLogs)│
    └──────┬──────┘ └─────────────┘ └──────────────┘
           │
    ┌──────┴──────┐
    │    AMQP     │  RabbitMQ message bus
    └──────┬──────┘
           ▼
    ┌─────────────┐
    │server-worker│  Docker container execution
    └─────────────┘

External services: Authup (OAuth2), Redis (pub/sub + caching), MySQL/Postgres
```

## Hexagonal Architecture (server-core)

server-core follows a hexagonal (ports & adapters) architecture matching authup's pattern. Code is organized into three layers:

```
src/
├── core/          # Domain logic — ports, services, validators
├── adapters/      # External system implementations — database, HTTP, socket
└── app/           # Orchestration — DI modules, wiring, factory
```

### Core Layer (`core/`)

Pure business logic. No imports from `typeorm`, `routup`, or other infrastructure packages.

**Entities** (`core/entities/<name>/`):
- `types.ts` — Port interfaces: `IXRepository`, `IXService`
- `service.ts` — Domain service implementing `IXService`
- `validator.ts` — Input validation with `ValidatorGroup.CREATE`/`UPDATE`

**Base types** (`core/entities/`):
- `IEntityRepository<T>` — Generic repository port (findMany, findOneById, save, remove, etc.)
- `AbstractEntityService` — Realm helpers (`isActorMasterRealmMember`, `getActorRealmId`)
- `ActorContext` — Permission checker + realm + identity, decoupled from HTTP
- `ValidatorGroup` — Domain-level validation groups (not HTTP-specific)

**Services** (`core/services/`):
- Business logic that spans multiple entities or orchestrates workflows
- `analysis-builder/` — Build lifecycle orchestration
- `analysis-configurator/` — Configuration lock/unlock
- `analysis-distributor/` — Distribution orchestration
- `analysis-storage-manager/` — Storage bucket provisioning
- `master-image/synchronizer/` — Image catalog sync

### Adapter Layer (`adapters/`)

Implementations that connect domain logic to external systems.

**Database** (`adapters/database/`):
- `entities/<name>.ts` — TypeORM entity definitions (`@Entity`, `@Column`)
- `subscribers/<name>.ts` — TypeORM event subscribers (domain event publishing)
- `migrations/` — PostgreSQL and MySQL migration files
- `error/` — Database error types (`DatabaseConflictError`)
- `query/` — Realm-scoped query helpers

**HTTP** (`adapters/http/`):
- `controllers/entities/<name>/module.ts` — Thin controllers (extract request → delegate to service → send response)
- `controllers/workflows/` — Non-CRUD workflow controllers (root, service)
- `request/helpers/actor.ts` — `buildActorContext(req)` bridge from HTTP to domain
- `request/repository.ts` — `RequestRepositoryAdapter` (audit metadata injection)

**Socket** (`adapters/socket/`):
- WebSocket controllers and server setup

### App Layer (`app/`)

DI modules, wiring, and infrastructure services.

**Modules** (`app/modules/`) — Each implements `IModule` from orkos:
- `config/` — `ConfigModule`: reads env, registers typed config in container
- `database/` — `DatabaseModule`: creates DataSource, registers all repository adapters
- `http/` — `HTTPModule`: resolves repos from container, creates services + controllers, mounts router
- `registry/` — `RegistryManagerAdapter` for cross-entity registry operations
- `telemetry-client/` — `TelemetryClientModule`: creates API client

**Builder** (`app/builder.ts`):
- `ServerCoreApplicationBuilder extends BaseApplicationBuilder`
- Fluent API: `.withConfig().withDatabase().withHTTP()`

**Services** (`app/services/`):
- Infrastructure services, singletons, and wiring
- `database-integrity/` — Data consistency housekeeping
- `node-client/` — Authup client provisioning for nodes
- `telemetry/` — Telemetry client singleton bridge

**Aggregators** (`app/aggregators/`): AMQP event consumers
**Components** (`app/components/`): AMQP task consumers

## Service Pattern

Services receive dependencies via constructor injection and own validation:

```typescript
// core/entities/node/service.ts
export class NodeService extends AbstractEntityService implements INodeService {
    protected repository: INodeRepository;
    protected validator: NodeValidator;

    constructor(ctx: { repository: INodeRepository }) {
        super();
        this.repository = ctx.repository;
        this.validator = new NodeValidator();
    }

    async create(data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });
        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_CREATE });
        await this.repository.validateJoinColumns(validated);
        // ... business logic ...
        return this.repository.save(entity, { data: actor.metadata });
    }
}
```

## Thin Controller Pattern

Controllers only: extract request → build actor → delegate → send response. No validation, no business logic.

```typescript
// adapters/http/controllers/entities/node/module.ts
@DController('/nodes')
export class NodeController {
    constructor(ctx: { service: INodeService }) { ... }

    @DPost('', [ForceLoggedInMiddleware])
    async add(@DBody() data: any, @DRequest() req: any, @DResponse() res: any) {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity);
    }
}
```

## Wiring Pattern

DI modules resolve repositories from the container, create services, then controllers:

```typescript
// app/modules/http/controller.ts
export function createControllers(container: IContainer) {
    const nodeRepository = container.resolve(DatabaseInjectionKey.NodeRepository);
    const nodeService = new NodeService({ repository: nodeRepository });
    return [new NodeController({ service: nodeService }), ...];
}
```

## ActorContext Bridge

`ActorContext` decouples services from HTTP. The adapter layer bridges:

```typescript
// adapters/http/request/helpers/actor.ts
export function buildActorContext(req: Request): ActorContext {
    return {
        permissionChecker: useRequestPermissionChecker(req),
        realm: useRequestIdentityRealm(req),
        identity: ...,
        metadata: { request_path, request_method, actor_id, ... },
    };
}
```

## Domain Events & Messaging

TypeORM subscribers in `adapters/database/subscribers/` publish domain events via the entity event system. Events flow through Redis pub/sub and AMQP (RabbitMQ).

AMQP consumers:
- **Aggregators** (`app/aggregators/`) — React to events from other services
- **Components** (`app/components/`) — Process task queues (registry, analysis metadata)

## Authentication — Authup

All services integrate with **Authup** (OAuth2 identity provider):
- `@authup/server-adapter` middleware validates tokens on incoming requests
- `@authup/access` handles per-realm permission checks via `IPermissionEvaluator`
- Two-phase permission: `preCheck` (fast fail) then `check` (with PolicyData attributes)

## Realm Scoping

Entities are scoped to realms via `realm_id`. The `isRealmResourceWritable()` helper enforces:
- Master realm members can access all resources
- Other users can only access resources in their own realm

## Key Domain Entities

| Entity              | Purpose                                          |
|---------------------|--------------------------------------------------|
| `Analysis`          | A distributed computation task                   |
| `AnalysisBucket`    | File storage container for an analysis           |
| `Project`           | User project grouping nodes and analyses         |
| `ProjectNode`       | A compute node assigned to a project             |
| `Node`              | Global registry of available compute nodes       |
| `MasterImage`       | Base Docker images available for worker tasks    |
| `Registry`          | Docker registry configuration                   |
| `RegistryProject`   | Project within a Docker registry                 |

## Configuration

Environment-based via `envix`, managed by `ConfigModule` in `app/modules/config/`.

| Variable        | Purpose                           |
|-----------------|-----------------------------------|
| `DB_TYPE`       | `mysql`, `postgres`, `better-sqlite3` |
| `DB_HOST/PORT`  | Database connection               |
| `AUTHUP_URL`    | Authup identity provider URL      |
| `REDIS_URL`     | Redis for pub/sub and caching     |
| `AMQP_URL`      | RabbitMQ connection               |
| `MINIO_*`       | MinIO/S3 storage credentials      |
