# HTTP API and Clients

Read before changing a controller, the response envelope, meta.schema, a secret field, or one of the four HTTP client kits.

## Thin Controller Pattern

Controllers only: extract request → build `ActorContext` → delegate → shape the response.
No validation, no business logic. **The controller owns the wire shape; services return
bare domain entities.**

```typescript
// apps/server-core/src/adapters/http/controllers/entities/node/module.ts
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
    const entity = await this.service.create(data, buildActorContext(event));
    event.response.status = 201;
    return { data: entity, meta: {} };
}
```

## Response Envelope & Query Capability Discovery

Uniform across server-core, server-storage and server-telemetry (#1794):

- **Record responses**: `{ data: <entity>, meta: {…} }` (`EntityRecordResponse<T>`).
- **Collection responses**: `{ data: <entity>[], meta: { total, limit?, offset?, schema? } }`
  (`EntityCollectionResponse<T>`).
- **`meta.schema`**: every query-capable `GET` publishes its rapiq vocabulary via
  `describeQuerySchema()` (`@privateaim/server-kit`, `src/core/query/describe.ts`): the
  full description on collections, `describeQuerySchema(x, RECORD_QUERY_PARAMETERS)`
  (fields + relations) on record reads. Relation vocabulary is referenced, not expanded:
  `relations.schemas` names each target schema.
- It is the **static** allow-list upper bound. Actor-dependent gates (the `accountSecret`
  field gate, realm scoping) are not reflected; the service enforces them.
- It carries each schema's declared `indexes` plus `filters.indexed: 'anchor'` and
  `sorts.indexed: true` (#1842). Anchor mode rejects an expression-dialect filter whose
  and-group contains no key leading a declared sequence; the leading-key rule is in
  [database.md](database.md#column-naming).
- Controllers import the schema **object** from the `core` barrel (every entity barrel
  re-exports its `schema.ts`); never deep-import a `schema.ts`.

**Endpoints that stay flat** (protocol, credential, stream and bespoke shapes): `GET /` on
all three services; `POST /services/:id/hook` and `POST /services/:id/command`; the
node/analysis client-credential and node registry-credential routes;
`DELETE /analysis-logs`, `DELETE /analysis-node-logs`, `DELETE /logs`;
`GET /buckets/:id/stream` and `GET /bucket-files/:id/stream`; the entire
`server-messenger` message surface. `POST /buckets/:id/upload` stays a **collection**.

**Collections without `schema`:** `GET /logs` (telemetry; `decodeQueryOpen()`, filters
are dynamic VictoriaLogs labels); `GET /analyses/:id/client/permissions` (proxied Authup
records); `POST /buckets/:id/upload`.

## Controller Conventions

- **Annotate every return type**, including `getMany`: `@trapi/swagger` derives the
  OpenAPI response schema from the signature; an unannotated method emits an anonymous
  inline schema. Types come from `@privateaim/core-http-kit` / `storage-kit` /
  `telemetry-kit`.
- **Mutations carry `meta: {}`**, never omitted or `undefined`. A command that may yield
  no entity coalesces: `{ data: entity ?? null, meta: {} }`, typed
  `EntityRecordResponse<X | null>`; `data: undefined` drops the key from the JSON.
- **Never mutate a description**: it is memoized, deep-frozen and shared. Spread
  (`meta: { ...meta, schema: … }`); `meta.schema = …` throws a `TypeError`.
- No `send()`/`sendCreated()` helpers (only `sendStream` in storage): return the value
  and set `event.response.status`.

## Field Selection Conventions

Projection is declared on the entity's rapiq schema (`core/entities/<x>/schema.ts`):
`fields.default` is returned when no fields are named, `fields.allowed` is the upper bound
for `?fields=…`. The repository only applies the decoded query.

A sensitive column is hidden in three places, all required:

- the TypeORM column has `select: false`, so reads that bypass the schema (`findOneById`,
  `findOneBy`) never load it and `BaseSubscriber` strips it from domain events;
- it is in `fields.allowed` but **not** `fields.default`;
- it is **root-only** via `createRootOnlyFieldsGate` (server-core `core/query/fields.ts`,
  rapiq's `fields.validate` hook). A relation fieldset
  (`include=registry&fields[registry]=+accountSecret`) is selected explicitly by the
  typeorm adapter, bypassing `select: false` and the owning service's gate.
  `secret-field-gate.spec.ts` derives every `select: false` column from the metadata and
  fails until its schema gates it.

```typescript
export const registrySchema = defineSchema<Registry>({
    name: DomainType.REGISTRY,
    fields: {
        default: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt'],
        allowed: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt', 'accountSecret'],
        validate: createRootOnlyFieldsGate(['accountSecret' satisfies keyof Registry]),
    },
});
```

Requestable is not permitted. The permission gate lives in the **entity service**, whose
read methods take an `ActorContext`:

- **request-side** (`RegistryService.checkSecretFieldAccess`): before the read, require
  `REGISTRY_MANAGE` if any `fields` token (strings, arrays, per-relation objects) names
  the secret;
- **result-side** (`RegistryProjectService.checkSecretFieldAccess`): after the read, if
  any returned row carries the secret, require `REGISTRY_MANAGE`, or let a node's own
  client through for its own project.

Field names are `satisfies keyof T` constants, so a rename cannot leave a stale string
that silently skips the gate.

## Transport-level FakeClient

`@privateaim/<kit>/testing` (all four HTTP kits) ships a `FakeClient` that subclasses the
real client and replaces only the transport (`MemoryTransport`). Header merge, body
transform, decode, retry, the `RESPONSE_ERROR` hook and any `ClientAuthenticationHook`
still run.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/core-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /projects/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
        'DELETE /projects/:id': () => fakeResponse(403, { message: 'forbidden' }),
    },
});
```

Handler-map semantics (`test/unit/fake-client.spec.ts` in each kit):

- Keys are `'<METHOD> /<path>'`; `:name` captures into `req.params`. Method compare is
  case-insensitive; segment count must match; the query string is ignored.
- `'*'` always loses to a specific pattern. Among specific patterns the first inserted
  wins: declare `'GET /users/@me'` before `'GET /users/:id'`.
- No match and no `'*'` falls back to `{ data: [], meta: { total: 0 } }`.
- Return the body, or `fakeResponse(status, body)` for a non-2xx. Do not throw: a throw on
  a fire-and-forget path is an unhandled rejection that fails the run.

Traps:

- **A path-bearing `baseURL` shifts every pathname**: with `http://fake.test/api`, a
  `'GET /projects'` pattern silently hits the fallback. Keep the default
  `http://fake.test`.
- **`getManyAll` pages until `offset >= total`**: an inflated or recomputed `total` never
  terminates.
- **`responseType: 'stream'` dispatches with `method === undefined`**, normalized to `GET`
  (so `AnalysisAPI.streamFiles`, `BucketAPI.stream`, `BucketFileAPI.stream` match `GET`).
- The raw record is on `MemoryTransport.requests` (with `reset()`).

## Record Envelope + `meta.schema` (#1794, port of authup #3332)

See [Response Envelope & Query Capability Discovery](#response-envelope--query-capability-discovery).
The generic port names are `EntityRecordResponse`, `EntityCollectionResponse`,
`IEntityAPI` and `IEntityAPISlim`; there are no aliases for the older names.

## Contract-First HTTP Clients + `./testing` FakeClient (#1800)

- Each HTTP client `implements` an explicit contract (`ICoreClient`, `IStorageClient`,
  `ITelemetryClient`, `IMessengerClient`) plus one `I<X>API` per sub-API
  ([conventions.md](../conventions.md#subpath-exports) for the `./testing` export).
- client-vue resolves an entity's API through `pickEntityAPI` (core-http-kit, storage-kit,
  telemetry-kit), whose verbs are guarded one by one: an unsupported verb (`create` on
  `masterImage`, `delete` on `log`) is a no-op, not a throw. Do not reintroduce
  `hasOwnProperty` + `as any` lookups.
- For Authup, use `createFakeAuthupClient` (`@privateaim/server-test-kit`), not
  `@authup/core-http-kit/testing`: the latter hard-codes a 200 and cannot reach
  `isClientErrorWithStatusCode(e, 404)` branches.
- server-core's `createTestApplication({ telemetryHandlers })` fakes the telemetry client
  for the log controllers.
- Worker components are constructor-injected; specs build them directly with doubles from
  `test/unit/components/fakes/`. Rejected: a DI `test/app/` harness for the worker (it
  would be unused scaffolding). See [testing.md](../testing.md#the-three-testing-layers).
