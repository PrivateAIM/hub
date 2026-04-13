# Authup Architecture Reference

Reference: [authup/authup/.agents/architecture.md](https://github.com/authup/authup/blob/master/.agents/architecture.md)

This documents the hexagonal architecture patterns Hub should adopt (see Plans 003-005).

## DI and Module Libraries

Authup uses two libraries (both by tada5hi) for dependency injection and module orchestration:

| Library | Version | Purpose |
|---------|---------|---------|
| `eldin` | 1.1.0 | Type-safe DI container — `TypedToken<T>`, `IContainer`, `Provider` types |
| `orkos` | 1.1.1 | Module orchestrator — `IModule`, `Application`, topological dependency resolution |

**eldin API**: `TypedToken<T>` (typed injection keys), `IContainer.register(key, provider)`, `IContainer.resolve(key)`, `IContainer.tryResolve(key)`, provider types: `{ useValue }`, `{ useFactory }`, `{ useAsyncFactory }`. Supports singleton/transient/scoped lifetimes and parent-child containers.

**orkos API**: `IModule` (name, dependencies, setup/teardown/onReady/onError), `Application` (accepts modules, topologically sorts by dependencies, calls setup in order and teardown in reverse).

## Hexagonal Architecture Layers

Authup's `apps/server-core/src/` has three layers:

```
core/       → Business logic, port interfaces (no framework deps)
adapters/   → External system implementations (TypeORM, HTTP controllers)
app/        → Module composition, DI wiring, bootstrap
```

### core/ — Ports & Business Logic

| Folder | Hub Equivalent |
|--------|---------------|
| `core/entities/` | Currently in `http/controllers/entities/` handlers — needs extraction |
| `core/entities/{entity}/types.ts` | New: port interfaces (`IAnalysisRepository`, `IAnalysisService`) |
| `core/entities/{entity}/service.ts` | New: business logic (currently inline in handlers) |
| `core/entities/service.ts` | New: `AbstractEntityService` base class |
| `core/entities/actor/types.ts` | New: `ActorContext` type (decouples from HTTP) |
| `core/identity/` | Workflows like analysis-builder, analysis-distributor |
| `core/provisioning/` | No equivalent yet in Hub |

### adapters/ — External Systems

| Folder | Hub Equivalent |
|--------|---------------|
| `adapters/database/entities/` | Currently `database/entities/` in each service |
| `adapters/database/migrations/` | Currently `database/migrations/` |
| `adapters/http/controllers/` | Currently `http/controllers/` — must become thin |
| `adapters/http/request/helpers/actor.ts` | New: `buildActorContext(req)` bridge |

### app/modules/ — DI Wiring

| Folder | Hub Equivalent |
|--------|---------------|
| `app/modules/config/` | Currently `config/` setup functions |
| `app/modules/database/` | Currently `database/data-source/singleton.ts` |
| `app/modules/database/repositories/` | New: repository adapter implementations |
| `app/modules/http/modules/controller.ts` | New: factory functions wiring repo→service→controller |
| `app/factory.ts` | New: `createApplication()` |
| `app/builder.ts` | New: `ApplicationBuilder` fluent API |

## Repository Port Interface

The base contract all entity repositories must implement:

```typescript
export interface IEntityRepository<T> {
    findMany(query: Record<string, any>): Promise<{ data: T[], meta: { total: number } }>;
    findOneById(id: string): Promise<T | null>;
    findOneByName?(name: string, realm?: string): Promise<T | null>;
    findOneByIdOrName(idOrName: string, realm?: string): Promise<T | null>;
    findOneBy(where: Record<string, any>): Promise<T | null>;
    create(data: Partial<T>): T;
    merge(entity: T, data: Partial<T>): T;
    save(entity: T): Promise<T>;
    remove(entity: T): Promise<void>;
    validateJoinColumns(data: Partial<T>): Promise<void>;
}
```

Per-entity interfaces extend the base:
```typescript
export interface IAnalysisRepository extends IEntityRepository<Analysis> {
    checkUniqueness(data: Partial<Analysis>, existing?: Analysis): Promise<void>;
}
```

## Entity Categories (Hub mapping)

| Category | Authup Examples | Hub Entities |
|----------|----------------|--------------|
| Simple CRUD | realm, scope | node, registry, master-image |
| CRUD + uniqueness | role, permission | project, analysis |
| Junction | user-role, client-permission | project-node, analysis-node |
| Complex + secrets | client, robot | (none currently) |

## Service Pattern

Services implement business logic, receive `ActorContext` (not HTTP request):

```typescript
export class AnalysisService extends AbstractEntityService implements IAnalysisService {
    constructor(ctx: { repository: IAnalysisRepository; projectRepository: IProjectRepository }) { ... }

    async create(data: Record<string, any>, actor: ActorContext): Promise<Analysis> {
        // 1. Permission pre-check
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_CREATE });
        // 2. Validate input (Zod via validup)
        const validated = await this.validator.run(data, { group: 'create' });
        // 3. Realm defaulting
        validated.realm_id = validated.realm_id ?? this.getActorRealmId(actor);
        // 4. Validate join columns
        await this.repository.validateJoinColumns(validated);
        // 5. Full permission evaluation
        await actor.permissionEvaluator.evaluate({ name: ..., input: new PolicyData({ ... }) });
        // 6. Uniqueness check
        await this.repository.checkUniqueness(validated);
        // 7. Create & save
        return this.repository.save(this.repository.create(validated));
    }
}
```

## Thin Controller Pattern

Controllers only: extract input, build ActorContext, delegate, format response.

```typescript
@DController('/analyses')
export class AnalysisController {
    constructor(ctx: { service: IAnalysisService }) { this.service = ctx.service; }

    @DPost('')
    async add(@DRequest() req, @DResponse() res) {
        const actor = buildActorContext(req);
        const entity = await this.service.create(useRequestBody(req), actor);
        return sendCreated(res, entity);
    }
}
```

**No business logic in controllers** — no permission checks, no validation, no entity manipulation.

## Wiring Pattern

Factory functions in `app/modules/http/modules/controller.ts`:

```typescript
createAnalysisController(container: IContainer) {
    const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
    const repository = new AnalysisRepositoryAdapter(dataSource);
    const service = new AnalysisService({ repository });
    return new AnalysisController({ service });
}
```

## ActorContext Bridge

Decouples business logic from HTTP:

```typescript
// core/entities/actor/types.ts
export type ActorContext = {
    permissionEvaluator: IPermissionEvaluator;
    identity?: Identity;
};

// adapters/http/request/helpers/actor.ts
export function buildActorContext(req: Request): ActorContext {
    return {
        permissionEvaluator: useRequestPermissionEvaluator(req),
        identity: useRequestIdentity(req)?.raw,
    };
}
```

## Realm Scoping

| Category | `realm_id: null` allowed | Hub Entities |
|----------|--------------------------|--------------|
| Global | Yes | (TBD per entity) |
| Realm-bound | No | Most Hub entities |
| Junction | Inherited | project-node, analysis-node |

Services default `realm_id` to actor's realm. Explicit `null` required for global entities. Access control is policy-driven, no master realm bypass.
