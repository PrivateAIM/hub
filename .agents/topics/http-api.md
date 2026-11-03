# HTTP API and Clients

Read before changing a controller, the response envelope, meta.schema, a secret field, or one of the four HTTP client kits.

## Thin Controller Pattern

Controllers only: extract request → build actor → delegate → shape the response. No validation, no business logic.

**The controller owns the wire shape; services keep returning bare domain entities.** Every entity **record** response is the `{ data, meta }` envelope (`EntityRecordResponse<T>` from the matching HTTP kit) and every collection response is `EntityCollectionResponse<T>`. Hub uses no `send()`/`sendCreated()` helpers — the decorated method returns a value that routup serializes, and the status is set imperatively via `event.response.status`.

```typescript
// adapters/http/controllers/entities/node/module.ts
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import { nodeSchema } from '../../../../../core/index.ts';

@DController('/nodes')
export class NodeController {
    constructor(ctx: { service: INodeService }) { ... }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(@DContext() event: IAppEvent): Promise<EntityCollectionResponse<Node>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, buildActorContext(event));
        return { data, meta: { ...meta, schema: describeQuerySchema(nodeSchema) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(@DBody() data: NodeCreatePayload, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }
}
```

GET endpoints also pass `ActorContext` when the entity has permission-gated fields (e.g. `accountSecret`), and a record read advertises only the `fields` + `relations` subset:

```typescript
@DGet('/:id', [ForceLoggedInMiddleware])
async getOne(@DPath('id') id: string, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Registry>> {
    const actor = buildActorContext(event);
    const query = useRequestQuery(event);
    const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

    return { data: entity, meta: { schema: describeQuerySchema(registrySchema, RECORD_QUERY_PARAMETERS) } };
}
```

## Response Envelope & Query Capability Discovery

Contract, uniform across server-core, server-storage and server-telemetry:

- **Record responses** — `{ data: <entity>, meta: {…} }`. Mutations (`POST`, `DELETE`, command routes) carry `meta: {}` — never omitted, never `undefined`.
- **Collection responses** — `{ data: <entity>[], meta: { total, limit?, offset?, schema? } }`. Unchanged by the envelope work apart from `schema`.
- **`meta.schema`** — every query-capable `GET` publishes its rapiq vocabulary via `describeQuerySchema()` (`@privateaim/server-kit`, `src/core/query/describe.ts`). Collections get the full description; record reads get `describeQuerySchema(x, RECORD_QUERY_PARAMETERS)` (fields + relations). It is the **static** allow-list upper bound — actor-dependent gates (the `accountSecret` field gate, realm scoping) are deliberately not reflected. Relation vocabulary is **referenced, not expanded**: `relations.schemas` names each relation's target schema.
- Every entity schema declares `indexes` — **query-surface-only** property-name sequences, each a leftmost prefix of a real PK/unique/`@Index` — and opts into rapiq's indexed policies, so the description carries the real sequences plus `filters.indexed: 'anchor'` and `sorts.indexed: true` (#1842). Anchor mode rejects an expression-dialect filter whose and-group contains no key leading a declared sequence; the invariant that every `filters.allowed`/`sorts.allowed` key leads one is enforced by each service's `schema-entity-parity.spec.ts` — see [conventions.md](database.md#column-naming).
- Descriptions are memoized **and deep-frozen**. Always spread — `meta: { ...meta, schema: … }`; `meta.schema = …` throws.
- Controllers import the schema **object** from the `core` barrel — every entity barrel re-exports its `schema.ts` (server-core: `core/entities/<x>/index.ts` ×14; server-storage and server-telemetry: the single `core/entities/index.ts`). Never deep-import a `schema.ts` from a controller.
- Return-type annotations are load-bearing: trapi derives the OpenAPI response schema from the method signature, so every method — including `getMany` — must be annotated.

**Endpoints that deliberately stay flat** (protocol, credential, stream and bespoke shapes): `GET /` on all three services; `POST /services/:id/hook` and `POST /services/:id/command`; the node/analysis client-credential and node registry-credential routes; `DELETE /analysis-logs`, `DELETE /analysis-node-logs`, `DELETE /logs`; `GET /buckets/:id/stream` and `GET /bucket-files/:id/stream`; the entire `server-messenger` message surface. `POST /buckets/:id/upload` stays a **collection** (it uploads many files), not a record envelope.

**Collections without `schema`:** `GET /logs` (telemetry) — decoded with `decodeQueryOpen()`, its filters are dynamic VictoriaLogs labels, so there is nothing to describe; `GET /analyses/:id/client/permissions` — proxies Authup records with no Hub-side schema; `POST /buckets/:id/upload`.

## Controller Conventions

Controllers are truly thin — only: extract request → build `ActorContext` → delegate to service → shape the response. **Zero validation, zero business logic.**

The controller owns the **wire shape**; services keep returning bare domain entities. Every entity record response is the `{ data, meta }` envelope, every collection response is `{ data, meta: { total, limit?, offset?, schema? } }`.

```typescript
@DGet('', [ForceLoggedInMiddleware])
async getMany(@DContext() event: IAppEvent): Promise<EntityCollectionResponse<Node>> {
    const query = useRequestQuery(event);
    const { data, meta } = await this.service.getMany(query, buildActorContext(event));
    return { data, meta: { ...meta, schema: describeQuerySchema(nodeSchema) } };
}

@DGet('/:id', [ForceLoggedInMiddleware])
async getOne(@DPath('id') id: string, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
    const query = useRequestQuery(event);
    const entity = await this.service.getOne(id, buildActorContext(event), Object.keys(query).length > 0 ? query : undefined);

    return { data: entity, meta: { schema: describeQuerySchema(nodeSchema, RECORD_QUERY_PARAMETERS) } };
}

@DPost('', [ForceLoggedInMiddleware])
async add(@DBody() data: NodeCreatePayload, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
    const actor = buildActorContext(event);
    const entity = await this.service.create(data, actor);
    event.response.status = 201;
    return { data: entity, meta: {} };
}
```

Rules:

- **Annotate every return type**, including `getMany` — `@trapi/swagger` derives the OpenAPI response schema from the method signature; an unannotated method emits an anonymous inline schema. Types come from `@privateaim/core-http-kit` / `storage-kit` / `telemetry-kit` (`EntityRecordResponse`, `EntityCollectionResponse`).
- **Mutations carry `meta: {}`** — never omitted, never `undefined`. When a command can legitimately produce no entity, coalesce explicitly (`{ data: entity ?? null, meta: {} }`, annotated `EntityRecordResponse<X | null>`); `data: undefined` serializes to a malformed envelope with the key dropped.
- **Query-capable `GET`s attach `meta.schema`** via `describeQuerySchema()` from `@privateaim/server-kit`: the full description on collections, `describeQuerySchema(x, RECORD_QUERY_PARAMETERS)` (fields + relations) on record reads. The schema object comes from the entity barrel, which re-exports `schema.ts`.
- **Never mutate the description** — it is memoized and deep-frozen, shared by reference. Always spread: `meta: { ...meta, schema: … }`. `meta.schema = …` throws a `TypeError`.
- `meta.schema` is the **static** allow-list upper bound. Actor-dependent gates (the `accountSecret` field gate, realm scoping) are deliberately not reflected there — the runtime gate in the service is what enforces access.
- **Protocol, credential, stream and bespoke shapes stay flat** — no envelope. See [architecture.md](#response-envelope--query-capability-discovery) for the explicit endpoint list.
- Hub uses **no** `send()`/`sendCreated()` helpers (only `sendStream` in storage): return the value and set the status via `event.response.status`.

## Field Selection Conventions

Field projection is declared on the entity's **rapiq schema**
(`core/entities/<x>/schema.ts`), not in the repository. `fields.default` is
what a read returns when the request names no fields; `fields.allowed` is the
upper bound a client may request with `?fields=…`. The repository only applies
the decoded query (`decodeQuery(query, { schema })`).

A sensitive column is hidden in three places, and all are required:

- the TypeORM column carries `select: false`, so no read that bypasses the
  schema (`findOneById`, `findOneBy`) ever loads it, and `BaseSubscriber`
  strips it from published domain events;
- the schema lists it in `fields.allowed` but **not** in `fields.default`, so
  it is returned only when explicitly requested;
- the schema keeps it **root-only** with `createRootOnlyFieldsGate`
  (`core/query/fields.ts`, rapiq's `fields.validate` hook). A relation fieldset
  (`include=registry&fields[registry]=+accountSecret`) is selected explicitly by
  the typeorm adapter, bypassing `select: false`, and never reaches the owning
  service's gate — so the field is dropped there. `secret-field-gate.spec.ts`
  derives every `select: false` column from the entity metadata and fails until
  its schema gates it.

```typescript
// core/entities/registry/schema.ts
export const registrySchema = defineSchema<Registry>({
    name: DomainType.REGISTRY,
    fields: {
        default: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt'],
        allowed: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt', 'accountSecret'],
        validate: createRootOnlyFieldsGate(['accountSecret' satisfies keyof Registry]),
    },
    // filters / sorts / indexes / pagination …
});
```

Requestable is not the same as permitted. The permission gate lives in the
**entity service**, which therefore takes an `ActorContext` on its read
methods, and the controller passes `buildActorContext(event)` for those GETs.
Two shapes exist today:

- **request-side** (`RegistryService.checkSecretFieldAccess`): before the
  read, collect every `fields` token — strings, arrays and per-relation
  objects alike — and require `REGISTRY_MANAGE` if any names the secret. The
  field name is a `satisfies keyof T` constant, so a rename cannot leave a
  stale string that silently skips the gate.
- **result-side** (`RegistryProjectService.checkSecretFieldAccess`): after
  the read, if any returned entity carries the secret, require
  `REGISTRY_MANAGE` — or let the node's own client through for its own
  project.

`meta.schema` advertises the static `fields.allowed` list; the actor-dependent
gate is deliberately not reflected there.

## Transport-level FakeClient

`@privateaim/<kit>/testing` ships a `FakeClient` that subclasses the kit's real
client and only replaces the transport. Everything above the transport still
runs — header merge, body transform, decode, retry, the constructor's
`RESPONSE_ERROR` hook and any attached `ClientAuthenticationHook` — so a test
exercises the client rather than bypassing it.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/core-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /projects/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
        'DELETE /projects/:id': () => fakeResponse(403, { message: 'forbidden' }),
    },
});

await client.project.getOne('abc');
expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
```

Handler-map semantics (covered by each kit's `test/unit/fake-client.spec.ts`):

- Keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- Method compare is case-insensitive; the segment count must match exactly.
- The query string is ignored — the url is reduced to its **pathname**.
- `'*'` is a catch-all that always loses to a specific pattern, whatever the key
  order. Among specific patterns, first insertion order wins, so declare
  `'GET /users/@me'` before `'GET /users/:id'`.
- No match and no `'*'` falls back to `{ data: [], meta: { total: 0 } }`.
- A handler returns the response **body**; return `fakeResponse(status, body)`
  for a non-2xx. Prefer that over throwing — a throw on a fire-and-forget path
  becomes an unhandled rejection and fails the run.

Gotchas worth knowing before you debug one:

- **A path-bearing `baseURL` shifts every pathname.** `createFakeClient({ baseURL: 'http://fake.test/api' })`
  makes a `'GET /projects'` pattern silently fall through to the fallback. Keep
  the default (`http://fake.test`, path-free).
- **`getManyAll` needs consistent `meta.total`.** It pages until `offset >= total`,
  so a handler returning a full page with an inflated or recomputed `total`
  never terminates.
- **`responseType: 'stream'` dispatches with `method === undefined`** and is
  normalized to `GET` — that is what makes `AnalysisAPI.streamFiles`,
  `BucketAPI.stream` and `BucketFileAPI.stream` match a `GET` pattern.
- The raw, un-normalized record is still on the transport itself
  (`MemoryTransport.requests`, plus `reset()`) if you need it.

## Record Envelope + `meta.schema` (#1794, port of authup #3332)

Record Envelope + `meta.schema` (#1794, port of authup #3332) — Implemented (every entity **record** endpoint returns `{ data, meta }`; every query-capable `GET` publishes its rapiq vocabulary at `meta.schema` via `describeQuerySchema()` in `@privateaim/server-kit`). Breaking for npm consumers: `SingleResourceResponse` → `EntityRecordResponse`, `CollectionResourceResponse` → `EntityCollectionResponse`, `DomainAPI` → `IEntityAPI`, `DomainAPISlim` → `IEntityAPISlim`, with **no** deprecated aliases. Protocol/credential/stream/bespoke endpoints stay flat — see [architecture.md](#response-envelope--query-capability-discovery).

## Contract-First HTTP Clients + `./testing` FakeClient (#1800)

Contract-First HTTP Clients + `./testing` FakeClient (#1800) — Implemented (all four HTTP clients declare an explicit contract they `implements` — `ICoreClient` / `IStorageClient` / `ITelemetryClient` / `IMessengerClient`, plus one `I<X>API` per sub-API — and each kit ships a `./testing` subpath exporting a `MemoryTransport`-backed `FakeClient`. `pickEntityAPI` (core-http-kit, mirrored in storage-kit/telemetry-kit) now backs all three client-vue dispatch sites — `createEntityManager`, `createList`, `FEntityDelete` — replacing their `hasOwnProperty` + `as any` lookups with a typed one whose verbs are individually guarded, so a `create` on `masterImage` or a `delete` on `log` no-ops instead of throwing. client-vue installers accept a pre-built `client`, the provide/inject singletons are contract-typed, and `installSocketManager` is now gated behind `realtime`. Unlocked hub's first Vue component test environment (`packages/client-vue/test/`, happy-dom) and the first `apps/server-core-worker` component specs. Breaking for npm consumers: `AuthupClientInjectionKey` retyped; `Options.isServer` removed from client-vue. See [testing.md](../testing.md#the-three-testing-layers) and [conventions.md](../conventions.md#subpath-exports). The issue's optional follow-ups are done too: all 21 `as unknown as AuthupClient` casts and both hand-written `FakeAuthupClient` classes are replaced by `createFakeAuthupClient` in `@privateaim/server-test-kit` (which uses a `MemoryTransport` rather than `@authup/core-http-kit/testing`, whose fake hard-codes a 200 and so cannot reach the `isClientErrorWithStatusCode(e, 404)` branches), and `createTestApplication({ telemetryHandlers })` opts in to a faked telemetry client for the log controllers. A container-based worker `test/app/` harness was deliberately NOT added: worker components are constructor-injected, so specs build them directly and share doubles via `test/unit/components/fakes/` — a DI harness would be unused scaffolding.
