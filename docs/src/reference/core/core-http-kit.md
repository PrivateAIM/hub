# @privateaim/core-http-kit

Typed HTTP client for the PrivateAIM core API, built on [Hapic](https://github.com/tada5hi/hapic). Provides domain-specific API methods for all core entities.

## Installation

```bash
npm install @privateaim/core-http-kit
```

## Usage

### Creating a Client

```typescript
import { Client } from '@privateaim/core-http-kit';

const client = new Client({
    baseURL: 'http://localhost:4000',
});
```

### CRUD Operations

Every method resolves to an envelope: the payload under `data`, response-scoped extras under
`meta`. Destructure `data` at the call site.

```typescript
// List analyses — { data: Analysis[], meta: { total, limit?, offset?, schema? } }
const { data: analyses, meta } = await client.analysis.getMany();

// Create a project — { data: Project, meta: {} }
const { data: project } = await client.project.create({
    name: 'My Project',
});

// Get a node by ID — { data: Node, meta: { schema } }
const { data: node } = await client.node.getOne(nodeId);

// Update an entity
const { data: analysis } = await client.analysis.update(analysisId, { name: 'Updated' });

// Delete an entity — the deleted record comes back under `data`
const { data: removed } = await client.analysis.delete(analysisId);
```

### Response Types

| Type | Shape | Used by |
|------|-------|---------|
| `EntityRecordResponse<R, M>` | `{ data: R, meta: M }` | `getOne`, `create`, `update`, `delete`, entity commands |
| `EntityCollectionResponse<R>` | `{ data: R[], meta: { total, limit?, offset?, schema? } }` | `getMany` |
| `EntityRecordMeta` | `Record<string, any> & { schema?: SchemaDescription }` | default `M` of `EntityRecordResponse` |
| `IEntityAPISlim<T>` | `getMany` / `getOne` / `create` / `delete` | read(+create/delete)-only sub-APIs |
| `IEntityAPI<T>` | `IEntityAPISlim<T>` + `update` | full CRUD sub-APIs |

Mutations answer with an **empty** `meta` (`{}`) — never omitted, never `null`. Query-capable `GET`s
fill `meta.schema`, see below.

Some endpoints deliberately stay flat and are typed accordingly — credential payloads
(`node.getClientCredentials`, `node.setClientCredentials`, `node.getRegistryCredentials`,
`analysis.createStorageToken`), all stream methods, the path builders, the bulk log deletes
and `service.runCommand` / `service.runRegistryCommand` (both `Promise<void>`). See [Response Shapes](/guide/development/api#response-shapes) for the full list.

### Query Capability Discovery

Every query-capable `GET` describes its own queryable vocabulary under `meta.schema` — which
`filter`, `fields`, `sort` and `include` **URL parameters** the endpoint accepts, plus the pagination
cap — so a consumer never has to inspect server source to build a query. The description keys them by
their **canonical** names, so `filter` is described under `filters`, `include` under `relations` and
`sort` under `sorts`:

```typescript
const { meta } = await client.node.getMany();

console.log(meta.schema);
// {
//     name: 'node',
//     strict: true,
//     indexes:    [['id'], ['name', 'realmId'], ['online'], /* ... */],
//     fields:     { default: ['id', 'name', /* ... */], allowed: ['id', 'name', /* ... */] },
//     filters:    { allowed: ['id', 'name', 'online', 'hidden', 'clientId', 'realmId', 'robotId'],
//                   caseSensitive: null, indexed: 'anchor' },
//     pagination: { maxLimit: 50 },
//     relations:  { allowed: ['registryProject', 'registry'],
//                   schemas: { registryProject: 'registryProject', registry: 'registry' } },
//     sorts:      { allowed: ['name', 'updatedAt', 'createdAt'], default: null, indexed: true },
// }
```

Reading rules:

- the description is the **static upper bound** — the allow-list the schema declares, not an
  actor-aware view. Actor-dependent authorization gates (e.g. the `accountSecret` field gate on
  registries) and realm scoping are deliberately **not** reflected and may still strip individual
  keys per request.
- the shape is **normalized** — every described parameter carries every constraint key: a **`null`**
  constraint was never declared (the server-side fallback applies); an **empty array** is an
  explicit "nothing allowed". The two mean opposite things.
- relation vocabulary is **referenced, not expanded**: `relations.schemas` names the schema
  governing each relation — dotted keys like `filter[registry.name]` follow the `registry` entity's
  own description, found on its own endpoints.
- the sort vocabulary is described under **`sorts`**; the URL parameter carrying it is still
  `sort` (`?sort=-updatedAt`). `describe()` emits `sorts` only — rapiq 2.1 dropped the `sort`
  alias from the description.
- `indexes` lists the schema's declared index sequences (property-name-spelled, each backed by a
  real database index), and `filters.indexed: 'anchor'` / `sorts.indexed: true` announce the
  indexed policies: every and-group of a `filter` expression must contain at least one filter on
  a key that **leads** one of the sequences, or the query answers 400. Every `filters.allowed`
  key is index-leading, so a filter built from the allow-list is always anchored.
- single-record `GET`s carry only the subset a record read processes (`fields` + `relations`); the
  `filters`, `sorts` and `pagination` keys are **absent**, not `null`.
- mutations describe nothing — their `meta` is exactly `{}`.

`GET /logs` on the [telemetry service](/reference/telemetry/) is the one query endpoint without
`meta.schema`: its filters are dynamic VictoriaLogs labels rather than a declared vocabulary.

### Exhaustive Collections

`getMany` returns a single page; the server caps the page size (default `maxLimit: 50`).
Use `getManyAll` to follow the pagination until every record is retrieved:

```typescript
import { getManyAll } from '@privateaim/core-http-kit';

const analysisNodes = await getManyAll((pagination) => client.analysisNode.getMany({
    filters: { analysisId },
    pagination,
}));
```

### Timeouts

`timeout` (milliseconds) bounds each request, including reading its response body. The client
sets none by default; Hub's services set one per kind of peer (`HTTPClientTimeout` in
[`@privateaim/server-kit`](/reference/shared/server-kit#outbound-http-timeouts)). A timed-out
request rejects with a hapic client error whose `code` is `ETIMEDOUT`
(`isClientErrorDueTimeout()`).

```typescript
const client = new Client({ baseURL: 'http://localhost:4000', timeout: 30_000 });
```

The stream methods (`analysis.streamFiles`, `analysis.downloadResult`) pass `timeout: 0`: the
deadline would keep running while the caller reads the stream.

### Cancellation & Per-Call Timeouts

Every method of every sub-API takes one optional `APIRequestOptions` object as its **last**
parameter: `signal` aborts the call, `timeout` (milliseconds) bounds it and overrides the
client's own `timeout` for this call. Absent, the client defaults apply. On the stream methods a
per-call `timeout` replaces their `timeout: 0`.

```typescript
import { isClientErrorDueTimeout } from 'hapic';

const controller = new AbortController();

try {
    const { data } = await client.project.getMany(
        { pagination: { limit: 10 } },
        { signal: controller.signal, timeout: 2_000 },
    );
} catch (e) {
    if (isClientErrorDueTimeout(e)) {
        // the call ran past 2 seconds
    }
}
```

An aborted call rejects with a hapic client error whose `code` is `ECONNABORTED`, a timed-out
one with `ETIMEDOUT`. Methods with an optional argument before the options take `undefined` in
its place (`getOne(id, undefined, { signal })`).

### With Authentication

The client is a hapic client, so the token is set as an authorization header after construction:

```typescript
const client = new Client({ baseURL: 'http://localhost:4000' });

client.setAuthorizationHeader({ type: 'Bearer', token: accessToken });
```

`client.unsetAuthorizationHeader()` removes it again.

## API

### Exports

| Module | Description |
|--------|-------------|
| `client` | `Client` class with typed domain API methods |
| `domains` | Domain-specific request/response types |
| `EntityRecordResponse` / `EntityRecordMeta` | The `{ data, meta }` record envelope and its meta type |
| `EntityCollectionResponse` | The `{ data, meta }` collection envelope |
| `IEntityAPI` / `IEntityAPISlim` | Generic port interfaces the entity sub-APIs build on |
| `APIRequestOptions` | The per-call `{ signal?, timeout? }` every API method takes last |
| `ICoreClient` / `ClientOptions` | The client contract and its construction options |
| `I<X>API` | One contract per sub-API (`IAnalysisAPI`, `INodeAPI`, …) |
| `pickEntityAPI` | Runtime lookup of a sub-API by `DomainType` string; returns `undefined` for a type without an entity API. The record type parameter is asserted by the caller, not checked, and every returned verb is optional |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute` |
| `getManyAll` | Helper that fetches a resource collection exhaustively across all pages |

### Client Methods

`client.analysis.createStorageToken(id, { cap, lifetime? })` mints a [storage capability token](/reference/core/#storage-capability-tokens) and returns the flat `{ token, expiresAt }`.

The client exposes a property per domain entity. These carry `getMany`, `getOne`, `create`, `update` and `delete`:

- `client.analysis`
- `client.analysisBucketFile`
- `client.analysisNode`
- `client.project`
- `client.projectNode`
- `client.node`
- `client.registry`
- `client.registryProject`

`client.analysisBucket` has no `update`. `client.masterImage` and `client.masterImageGroup` have neither `create` nor `update` (master images arrive through `masterImage.runCommand('sync' | 'build')`), and `client.analysisNodeEvent` is read-only.

`client.service.runCommand(id, command, data?)` and `client.service.runRegistryCommand(command, data)` resolve to `void`.

## Migration

The record envelope shipped together with a rename of the response/port types. **No deprecated
aliases are exported** — the old names are gone, so an upgrade fails to compile rather than
failing at runtime.

| Removed | Replacement |
|---------|-------------|
| `SingleResourceResponse<R>` | `EntityRecordResponse<R, M>` — and it is now the `{ data, meta }` envelope, not `R` |
| `CollectionResourceResponse<R>` | `EntityCollectionResponse<R>` |
| `DomainAPI<T>` | `IEntityAPI<T>` |
| `DomainAPISlim<T>` | `IEntityAPISlim<T>` |

The same rename applies to [`@privateaim/storage-kit`](/reference/storage/storage-kit) and
[`@privateaim/telemetry-kit`](/reference/telemetry/telemetry-kit).

Two changes are needed per upgrade:

```typescript
// 1. Rename the types.
- import type { SingleResourceResponse, DomainAPI } from '@privateaim/core-http-kit';
+ import type { EntityRecordResponse, IEntityAPI } from '@privateaim/core-http-kit';

// 2. Unwrap `data` at every single-record call site. Collections are unchanged.
- const node = await client.node.getOne(nodeId);
+ const { data: node } = await client.node.getOne(nodeId);
```

`getMany` call sites need **no** change — collections were already enveloped.

### hapic error guards

The kit no longer re-exports hapic's `isClientError` / `isClientErrorWithStatusCode` (nor does
[`@privateaim/messenger-http-kit`](/reference/messenger/messenger-http-kit)). Import them from
`hapic`, which every consumer of the client already depends on:

```typescript
- import { isClientErrorWithStatusCode } from '@privateaim/core-http-kit';
+ import { isClientErrorWithStatusCode } from 'hapic';
```

### Analysis download URLs

`analysis.getResultDownloadURL` and `analysis.getFileDownloadURL` are removed: they dropped the
last base-URL path segment when the base URL had no trailing slash, and a bare URL carries no
credentials. Read the archive through `analysis.downloadResult` / `analysis.streamFiles`, or join
`getResultDownloadPath` / `getFilesDownloadPath` onto the base URL yourself.

## Contract

`Client` implements `ICoreClient`, and each sub-API implements its own
`I<X>API` interface:

```typescript
import type { ICoreClient } from '@privateaim/core-http-kit';

// Depend on the CONTRACT, not the class — that is what lets a test hand you a
// fake, and what keeps the type structural.
function doWork(client: ICoreClient) { /* … */ }
```

| Sub-API | Contract |
|---|---|
| `analysis` | `IAnalysisAPI` |
| `analysisBucket` | `IAnalysisBucketAPI` (no `update`) |
| `analysisBucketFile` | `IAnalysisBucketFileAPI` |
| `analysisLog` | `IAnalysisLogAPI` (standalone — query-keyed `delete`, returns telemetry `Log`) |
| `analysisNode` | `IAnalysisNodeAPI` |
| `analysisNodeEvent` | `IAnalysisNodeEventAPI` (read-only) |
| `analysisNodeLog` | `IAnalysisNodeLogAPI` (standalone) |
| `masterImage` | `IMasterImageAPI` (no `create`, no `update`) |
| `masterImageGroup` | `IMasterImageGroupAPI` (no `create`, no `update`) |
| `node` | `INodeAPI` |
| `project` | `IProjectAPI` |
| `projectNode` | `IProjectNodeAPI` |
| `registry` | `IRegistryAPI` |
| `registryProject` | `IRegistryProjectAPI` |
| `service` | `IServiceAPI` (protocol surface, no entity shape) |

## Testing

`@privateaim/core-http-kit/testing` ships a `FakeClient`: a real `Client` wired to hapic's
`MemoryTransport`. Only the transport is replaced, so header merging, body
transformation, decoding, retries and the client's own `RESPONSE_ERROR` hook all
still run.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/core-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /projects/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
        'DELETE /projects/:id': () => fakeResponse(403, { message: 'forbidden' }),
    },
});

const { data: project } = await client.project.getOne('abc');

// Every dispatched request is recorded, normalized.
expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
```

A recorded request's `options` holds the `signal` and `timeout` it was sent with (client
defaults included, so a stream method shows `timeout: 0`), each key only when set.

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response **body**; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests fall back to `{ data: [], meta: { total: 0 } }`.
- Keep the default path-free `baseURL` — a `baseURL` carrying a path shifts every
  pathname, and patterns silently stop matching.

## Dependencies

All dependencies are peer dependencies:

- `@privateaim/core-kit`, `@privateaim/kit`, `@privateaim/telemetry-kit` — Domain types
- `@authup/core-kit`, `@authup/kit` — Authup types
- `hapic` — HTTP client base; every sub-API extends hapic's `BaseAPI`
- `@rapiq/core`, `@rapiq/codec-url` — Query parameter building
