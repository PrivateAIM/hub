# @privateaim/telemetry-kit

Telemetry and observability domain types with Zod validation schemas for logging and event tracking.

## Installation

```bash
npm install @privateaim/telemetry-kit
```

## Usage

### HTTP Client

```typescript
import { HTTPClient } from '@privateaim/telemetry-kit';

const client = new HTTPClient({
    baseURL: 'http://localhost:4002',
});

// Query logs — filters map onto VictoriaLogs labels
const { data: logs, meta } = await client.log.getMany({
    filter: { ref_type: 'analysis', ref_id: analysisId },
});

// Create an event — { data: Event, meta: {} }
const { data: event } = await client.event.create({ name: 'analysis.started', /* ... */ });

// Get an event — { data: Event, meta: { schema } }
const { data: entity } = await client.event.getOne(eventId);
```

### Response Shapes

Every single-record method (`getOne`, `create`, `update`, `delete`) resolves to the
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

```typescript
import { Event, Log } from '@privateaim/telemetry-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `http` | `HTTPClient` with event and log API methods |
| `domains` | `Event`, `Log` types and Zod validators |

## Dependencies

- `@validup/adapter-zod` — Zod validation adapter
- `validup` — Validation utilities
- `zod` — Schema validation
