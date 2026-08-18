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
the analysis client credentials), all stream methods, the URL builders, and the bulk log deletes
(`Promise<void>`). See [Response Shapes](/guide/development/api#response-shapes) for the full list.

### Query Capability Discovery

Every query-capable `GET` describes its own queryable vocabulary under `meta.schema` — which
`filter`, `fields`, `sort` and `include` keys the endpoint accepts, plus the pagination cap — so a
consumer never has to inspect server source to build a query:

```typescript
const { meta } = await client.node.getMany();

console.log(meta.schema);
// {
//     name: 'node',
//     strict: true,
//     indexes:    null,
//     fields:     { default: ['id', 'name', /* ... */], allowed: ['id', 'name', /* ... */] },
//     filters:    { allowed: ['id', 'name', 'online', 'hidden', 'clientId', 'realmId', 'robotId'],
//                   caseSensitive: null, indexed: false },
//     pagination: { maxLimit: 50 },
//     relations:  { allowed: ['registryProject', 'registry'],
//                   schemas: { registryProject: 'registryProject', registry: 'registry' } },
//     sorts:      { allowed: ['name', 'updatedAt', 'createdAt'], default: null, indexed: false },
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

const analysisNodes = await getManyAll((page) => client.analysisNode.getMany({
    filter: { analysisId: analysisId },
    page,
}));
```

### With Authentication

```typescript
const client = new Client({
    baseURL: 'http://localhost:4000',
    token: 'Bearer <your-token>',
});
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `client` | `Client` class with typed domain API methods |
| `domains` | Domain-specific request/response types |
| `EntityRecordResponse` / `EntityRecordMeta` | The `{ data, meta }` record envelope and its meta type |
| `EntityCollectionResponse` | The `{ data, meta }` collection envelope |
| `IEntityAPI` / `IEntityAPISlim` | Generic port interfaces the entity sub-APIs build on |
| `ICoreClient` / `ClientOptions` | The client contract and its construction options |
| `I<X>API` | One contract per sub-API (`IAnalysisAPI`, `INodeAPI`, …) |
| `pickEntityAPI` | Resolve a sub-API by `DomainType` string, with a compile-time record-type check |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute` |
| `getManyAll` | Helper that fetches a resource collection exhaustively across all pages |

### Client Methods

The client exposes a property per domain entity, each with `getMany`, `getOne`, `create`, `update`, `delete` methods:

- `client.analysis`
- `client.analysisBucket`
- `client.analysisBucketFile`
- `client.project`
- `client.projectNode`
- `client.node`
- `client.registry`
- `client.registryProject`
- `client.masterImage`
- `client.masterImageGroup`

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
| `analysisBucket` | `IAnalysisBucketAPI` |
| `analysisBucketFile` | `IAnalysisBucketFileAPI` |
| `analysisLog` | `IAnalysisLogAPI` (standalone — query-keyed `delete`, returns telemetry `Log`) |
| `analysisNode` | `IAnalysisNodeAPI` |
| `analysisNodeEvent` | `IAnalysisNodeEventAPI` (read-only) |
| `analysisNodeLog` | `IAnalysisNodeLogAPI` (standalone) |
| `masterImage` | `IMasterImageAPI` (no `create`) |
| `masterImageGroup` | `IMasterImageGroupAPI` (no `create`) |
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

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response **body**; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests fall back to `{ data: [], meta: { total: 0 } }`.
- Keep the default path-free `baseURL` — a `baseURL` carrying a path shifts every
  pathname, and patterns silently stop matching.

## Dependencies

- `@privateaim/core-kit` — Domain types
- `hapic` — HTTP client base
- `rapiq` — Query parameter building
