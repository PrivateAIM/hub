# @privateaim/telemetry-kit

Telemetry and observability domain types with Zod validation schemas for logging and event tracking.

## Installation

```bash
npm install @privateaim/telemetry-kit
```

## Usage

### HTTP Client

```typescript
import { APIClient, EventScope } from '@privateaim/telemetry-kit';

const client = new APIClient({
    baseURL: 'http://localhost:4002',
});

// Query logs — filters map onto VictoriaLogs labels
const { data: logs, meta } = await client.log.getMany({
    filter: { refType: 'analysis', refId: analysisId },
});

// Create an event — { data: Event, meta: {} }
const { data: event } = await client.event.create({
    scope: EventScope.ENTITY, name: 'updated', refType: 'analysis', refId: analysisId,
});

// Get an event — { data: Event, meta: { schema } }
const { data: entity } = await client.event.getOne(eventId);
```

### Response Shapes

Every single-record method (`getOne`, `create`, `delete`) resolves to the
`{ data, meta }` record envelope — destructure `data` at the call site. `getMany` is unchanged:
collections were already enveloped.

Query-capable `GET`s advertise the endpoint's queryable vocabulary under `meta.schema`; the reading
rules are documented once, in
[`@privateaim/core-http-kit`](/reference/core/core-http-kit#query-capability-discovery).

::: warning `log.getMany` carries no `meta.schema`
`GET /logs` is decoded as an **open** query — its filters are dynamic VictoriaLogs labels rather
than a declared rapiq vocabulary, so there is nothing to describe. It is the one query endpoint in
Hub without capability discovery; `meta` carries only `total`, `limit` and `offset`.
`log.deleteMany` resolves to `void` (the endpoint answers `null` with 202).
:::

### Type Renames

The envelope shipped with a rename and **no deprecated aliases**:
`SingleResourceResponse` → `EntityRecordResponse` (now the envelope, not the bare record) and
`CollectionResourceResponse` → `EntityCollectionResponse`. Both are re-exported from the package
barrel. See the [core-http-kit migration note](/reference/core/core-http-kit#migration).

### Domain Types

`Event.scope` is a **closed** vocabulary — `EventScope.ENTITY` | `BUILDER` | `SYNCHRONIZER` — enforced
by the validator on both the `POST /events` and AMQP ingest paths. `name` and `refType` stay
free-form: `name`'s vocabulary is scope-relative and `refType`'s is owned by the producing service's
own `DomainType`, neither of which a Layer-0 kit can import.


```typescript
import { Event, EventScope, Log } from '@privateaim/telemetry-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `http` | `APIClient` with event and log API methods |
| `ITelemetryClient` / `ClientOptions` | The client contract and its construction options |
| `pickEntityAPI` | Resolve a sub-API by `DomainType` string, with a compile-time record-type check |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute` |
| `domains` | `Event`, `Log` types and Zod validators |

## Contract

`APIClient` implements `ITelemetryClient`, and each sub-API implements its own
`I<X>API` interface:

```typescript
import type { ITelemetryClient } from '@privateaim/telemetry-kit';

// Depend on the CONTRACT, not the class — that is what lets a test hand you a
// fake, and what keeps the type structural.
function doWork(client: ITelemetryClient) { /* … */ }
```

| Sub-API | Contract |
|---|---|
| `event` | `IEventAPI` (append-only audit records: no `update`) |
| `log` | `ILogAPI` (append-and-query only: no `getOne`/`update`, and a query-keyed `deleteMany`) |

## Testing

`@privateaim/telemetry-kit/testing` ships a `FakeClient`: a real `APIClient` wired to hapic's
`MemoryTransport`. Only the transport is replaced, so header merging, body
transformation, decoding, retries and the client's own `RESPONSE_ERROR` hook all
still run.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/telemetry-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /logs': () => ({ data: [{ message: 'hello' }], meta: { total: 1 } }),
    },
});

const { data: logs } = await client.log.getMany();
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response **body**; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests fall back to `{ data: [], meta: { total: 0 } }`.
- Keep the default path-free `baseURL` — a `baseURL` carrying a path shifts every
  pathname, and patterns silently stop matching.

## Dependencies

- `@validup/adapter-zod` — Zod validation adapter
- `validup` — Validation utilities
- `zod` — Schema validation
