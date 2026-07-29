# @privateaim/core-http-kit

Typed HTTP client for the PrivateAIM core API, built on [Hapic](https://github.com/tada5hi/hapic). Provides domain-specific API methods for all core entities.

## Installation

```bash
npm install @privateaim/core-http-kit
```

## Usage

### Creating a Client

```typescript
import { HTTPClient } from '@privateaim/core-http-kit';

const client = new HTTPClient({
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
//     fields:     { default: ['id', 'name', /* ... */], allowed: ['id', 'name', /* ... */] },
//     filters:    { allowed: ['id', 'name', 'online', 'hidden', 'client_id', 'realm_id', 'robot_id'] },
//     pagination: { maxLimit: 50 },
//     relations:  { allowed: ['registry_project', 'registry'],
//                   schemas: { registry_project: 'registryProject', registry: 'registry' } },
//     sort:       { allowed: ['name', 'updated_at', 'created_at'], default: null },
// }
```

Reading rules:

- the description is the **static upper bound** — the allow-list the schema declares, not an
  actor-aware view. Actor-dependent authorization gates (e.g. the `account_secret` field gate on
  registries) and realm scoping are deliberately **not** reflected and may still strip individual
  keys per request.
- the shape is **normalized** — every described parameter carries every constraint key: a **`null`**
  constraint was never declared (the server-side fallback applies); an **empty array** is an
  explicit "nothing allowed". The two mean opposite things.
- relation vocabulary is **referenced, not expanded**: `relations.schemas` names the schema
  governing each relation — dotted keys like `filter[registry.name]` follow the `registry` entity's
  own description, found on its own endpoints.
- single-record `GET`s carry only the subset a record read processes (`fields` + `relations`); the
  `filters`, `sort` and `pagination` keys are **absent**, not `null`.
- mutations describe nothing — their `meta` is exactly `{}`.

`GET /logs` on the [telemetry service](/reference/telemetry/) is the one query endpoint without
`meta.schema`: its filters are dynamic VictoriaLogs labels rather than a declared vocabulary.

### Exhaustive Collections

`getMany` returns a single page; the server caps the page size (default `maxLimit: 50`).
Use `getManyAll` to follow the pagination until every record is retrieved:

```typescript
import { getManyAll } from '@privateaim/core-http-kit';

const analysisNodes = await getManyAll((page) => client.analysisNode.getMany({
    filter: { analysis_id: analysisId },
    page,
}));
```

### With Authentication

```typescript
const client = new HTTPClient({
    baseURL: 'http://localhost:4000',
    token: 'Bearer <your-token>',
});
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `client` | `HTTPClient` class with typed domain API methods |
| `domains` | Domain-specific request/response types |
| `EntityRecordResponse` / `EntityRecordMeta` | The `{ data, meta }` record envelope and its meta type |
| `EntityCollectionResponse` | The `{ data, meta }` collection envelope |
| `IEntityAPI` / `IEntityAPISlim` | Port interfaces every entity sub-API implements |
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

## Dependencies

- `@privateaim/core-kit` — Domain types
- `hapic` — HTTP client base
- `rapiq` — Query parameter building
