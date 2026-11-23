<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/telemetry-kit 📊</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/telemetry-kit)](https://www.npmjs.com/package/@privateaim/telemetry-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Log and audit event types, validators and a typed HTTP client for the FLAME Hub telemetry service.**

You query logs and audit events with typed calls and validate log and event records with the same rules the telemetry service
applies. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Logs](#logs) · [Events](#events) · [Responses](#responses) · [Contract](#contract) · [Testing](#testing) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/telemetry/telemetry-kit.html)

---

## Installation

```bash
npm install @privateaim/telemetry-kit @privateaim/kit hapic @rapiq/core @rapiq/codec-url @authup/core-kit @authup/kit
```

The package is ESM only and needs Node.js `>=26.0.0`. `@privateaim/kit`, `hapic`, `@rapiq/core`, `@rapiq/codec-url`,
`@authup/core-kit` and `@authup/kit` are peer dependencies; `validup`, `@validup/zod` and `zod` come along as dependencies.

## Usage

```typescript
import { APIClient, EventScope } from '@privateaim/telemetry-kit';

const client = new APIClient({ baseURL: 'http://localhost:4002' });

client.setAuthorizationHeader({ type: 'Bearer', token: accessToken });

// Logs of one analysis: each filter is an exact match on a VictoriaLogs label.
const { data: logs, meta } = await client.log.getMany({
    filters: { labels: { refType: 'analysis', refId: analysisId } },
});

const { data: event } = await client.event.create({
    scope: EventScope.ENTITY,
    name: 'updated',
    refType: 'analysis',
    refId: analysisId,
});
```

`APIClient` takes hapic's client options (`baseURL`, `headers`, `timeout`, `transport`, …) and exposes two sub-APIs: `log`
and `event`.

## Logs

A `Log` is one line in VictoriaLogs: `time`, `message`, `level`, `service`, `channel` and free-form string `labels`.

| Method | Does |
|---|---|
| `log.getMany(query)` | Queries log lines; each root filter is an exact match on a label |
| `log.create(input)` | Writes one line (`LogInput`: `message`, `level`, `service` and `channel` required) |
| `log.deleteMany(query)` | Deletes the matching lines; resolves to `void` |

| Export | Purpose |
|---|---|
| `LogLevel` | Syslog levels: `emerg`, `alert`, `crit`, `error`, `warn`, `notice`, `info`, `debug` (`LogLevelColor` maps each to a colour) |
| `LogChannel` | `http`, `websocket`, `background`, `system` |
| `LogFlag` | The queryable label keys: `channel`, `component`, `service`, `level`, `refType`, `refId` |
| `LogValidator` | Validates a `LogInput` (`message` 3 to 4096 characters, `service` 3 to 64, `time` an ISO date time) |
| `normalizeLogInput(input)` | Fills `time` (now) and `labels` (`{}`) to turn a `LogInput` into a `Log` |

Attach an entity to a log line with `LogFlag.REF_TYPE` and `LogFlag.REF_ID`; entity views in the Hub UI filter on exactly these
two labels:

```typescript
import { LogFlag } from '@privateaim/telemetry-kit';

logger.info('Created bucket for analysis', {
    [LogFlag.REF_TYPE]: 'analysis',
    [LogFlag.REF_ID]: analysisId,
});
```

## Events

An `Event` is an append-only audit record: who (`actorType`, `actorId`, `actorName`) did what (`scope`, `name`) to which
resource (`refType`, `refId`), from which request (`requestPath`, `requestMethod`, `requestIpAddress`, `requestUserAgent`).

| Method | Does |
|---|---|
| `event.getMany(query?)` / `event.getOne(id, query?)` | Reads events |
| `event.create(data)` | Records an event |
| `event.delete(id)` | Deletes one event |

`EventValidator` enforces the record's rules, and the telemetry service runs it on both the `POST /events` and the message-bus
ingest path:

- `scope` is a closed vocabulary: `EventScope.ENTITY`, `BUILDER` or `SYNCHRONIZER`. `name` and `refType` are free-form strings of 3 to 64 characters.
- `data` passes through `sanitizeEventData()`: keys matching `EVENT_DATA_SECRET_KEY_REGEX` (`password`, `secret`, `hash`, `token`, `credential`) are dropped, only scalar values are kept, and a `diff` keeps only scalar `{ next, previous }` pairs.
- `requestPath`, `requestUserAgent` and `actorName` are truncated (256, 512 and 64 characters) instead of rejected.
- An unparseable `requestIpAddress` becomes `null` instead of failing the whole record.

## Responses

`getOne`, `create` and `delete` resolve to the `{ data, meta }` record envelope (`EntityRecordResponse`); `getMany` resolves
to `EntityCollectionResponse` (`{ data, meta: { total, limit?, offset?, schema? } }`). Query-capable `GET`s describe their
queryable vocabulary under `meta.schema`; the reading rules are in
[query capability discovery](https://hub.docs.privateaim.net/reference/core/core-http-kit.html#query-capability-discovery).

`log.getMany` is the exception: its filters are dynamic labels rather than a declared vocabulary, so its `meta` carries only
`total`, `limit` and `offset`.

## Timeouts and cancellation

`timeout` (milliseconds) bounds each request; none is set by default. Every method takes one optional `APIRequestOptions`
object (`{ signal?, timeout? }`) as its last parameter: `signal` aborts the call, `timeout` overrides the client's for this
call. A timed-out call rejects with a hapic client error whose `code` is `ETIMEDOUT`.

```typescript
const { data: logs } = await client.log.getMany(
    { filters: { labels: { refType: 'analysis', refId: analysisId } } },
    { timeout: 5_000 },
);
```

## Contract

`APIClient` implements `ITelemetryClient`, and each sub-API implements its own interface. Depend on the contract, not the
class, so a test can hand in a `FakeClient`:

```typescript
import type { ITelemetryClient } from '@privateaim/telemetry-kit';

async function countLogs(client: ITelemetryClient, analysisId: string) {
    const { meta } = await client.log.getMany({
        filters: { labels: { refType: 'analysis', refId: analysisId } },
    });

    return meta.total;
}
```

| Sub-API | Contract |
|---|---|
| `event` | `IEventAPI` (append-only: no `update`) |
| `log` | `ILogAPI` (no `getOne` or `update`, a query-keyed `deleteMany`) |

`pickEntityAPI(client, type)` resolves the `event` sub-API from its `DomainType` string at runtime and returns `undefined` for
any other type, `log` included.

## Testing

`@privateaim/telemetry-kit/testing` ships a `FakeClient`: a real `APIClient` wired to hapic's `MemoryTransport`. Only the
transport is replaced, so header merging, body transformation, decoding, hooks and the client's error hook still run, and no
network is touched.

```typescript
import { createFakeClient } from '@privateaim/telemetry-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /logs': () => ({ data: [{ message: 'hello' }], meta: { total: 1 } }),
    },
});

const { data: logs } = await client.log.getMany();

// Every dispatched request is recorded, normalized.
console.log(client.requests);
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored, and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response body; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests go to the `fallback` option, which defaults to `{ data: [], meta: { total: 0 } }`.
- A recorded request's `options` holds the `signal` and `timeout` it was sent with (client defaults included), each key only when set.

## Notes

- **Label filters go under `labels`.** The typed query accepts `filters: { labels: { refType, refId } }`; the service strips the `labels.` prefix and matches each key exactly. A label may appear only once per query.
- **Log reads and deletes need a label filter.** The service answers `log.getMany` and `log.deleteMany` with 400 (`Filter labels must be specified.`) when the query carries no root filter, although the `query` parameter is typed optional.
- **Keep the fake's default `baseURL`.** It is `http://fake.test`. A `baseURL` with a path shifts every pathname, and handler patterns silently stop matching.
- **`Event.updatedAt` always equals `createdAt`.** Events have no update route; the column exists only for the released migration.
- **`refType` is free-form.** The kit sits below core-kit and storage-kit, so it cannot type their `DomainType`; producers pass their own.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
