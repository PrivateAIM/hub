<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/core-http-kit 🔗</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/core-http-kit)](https://www.npmjs.com/package/@privateaim/core-http-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Typed HTTP client for the FLAME Hub core API, with a fake client for tests.**

You stop writing URL building, query encoding and response typing for every core entity, and you test consumers without a
server. Built on [hapic](https://github.com/tada5hi/hapic); part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Responses](#responses) · [Queries](#queries) · [Timeouts and cancellation](#timeouts-and-cancellation) · [Contract](#contract) · [Testing](#testing) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/core/core-http-kit.html)

---

## Why core-http-kit?

| Concern | Hand-written `fetch` calls | core-http-kit |
|---|---|---|
| **Typing** | Cast each JSON body to a guessed shape | Every method returns the entity type from `@privateaim/core-kit` inside the `{ data, meta }` envelope |
| **Query strings** | Encode `filter`, `sort`, `include` and `page` by hand | Pass a typed rapiq query object; the client encodes it |
| **Errors** | Read the status and dig the server's message out of the body | A non-2xx rejects with a hapic client error whose `message` is the server's `message` |
| **Testing consumers** | Mock `fetch` or start a server | `FakeClient` answers from handlers in memory while the real request pipeline runs |

## Installation

```bash
npm install @privateaim/core-http-kit @privateaim/core-kit @privateaim/kit hapic @rapiq/core @rapiq/codec-url @authup/core-kit @authup/kit
```

The package is ESM only and needs Node.js `>=26.0.0`. Everything above besides the kit itself is a peer dependency, so your
application and the client share one instance of hapic and rapiq.

## Usage

```typescript
import { Client } from '@privateaim/core-http-kit';

const client = new Client({ baseURL: 'http://localhost:4000' });

client.setAuthorizationHeader({ type: 'Bearer', token: accessToken });

const { data: analyses, meta } = await client.analysis.getMany();
const { data: project } = await client.project.create({ name: 'my-project' });
const { data: node } = await client.node.getOne(nodeId);
await client.analysis.update(analyses[0].id, { displayName: 'Updated' });
const { data: removed } = await client.analysis.delete(analyses[0].id);
```

`Client` takes hapic's client options (`baseURL`, `headers`, `timeout`, `transport`, …). The client exposes one sub-API per
entity: `analysis`, `analysisBucket`, `analysisBucketFile`, `analysisLog`, `analysisNode`, `analysisNodeEvent`,
`analysisNodeLog`, `masterImage`, `masterImageGroup`, `node`, `project`, `projectNode`, `registry`, `registryProject` and
`service`.

## Responses

Every entity method resolves to an envelope: the payload under `data`, response-scoped extras under `meta`.

| Type | Shape | Returned by |
|---|---|---|
| `EntityRecordResponse<R, M>` | `{ data: R, meta: M }` | `getOne`, `create`, `update`, `delete`, `runCommand` |
| `EntityCollectionResponse<R>` | `{ data: R[], meta: { total, limit?, offset?, schema? } }` | `getMany` |
| `EntityRecordMeta` | `Record<string, any> & { schema?: SchemaDescription }` | default `M` of `EntityRecordResponse` |

Mutations answer with an empty `meta` (`{}`). Query-capable `GET`s fill `meta.schema` with the endpoint's queryable
vocabulary (allowed `fields`, `filters`, `sorts`, `relations` and the pagination cap), so a consumer can build a valid query
without reading server source. The reading rules are in
[query capability discovery](https://hub.docs.privateaim.net/reference/core/core-http-kit.html#query-capability-discovery).

Some methods stay outside the envelope:

| Method | Resolves to |
|---|---|
| `analysis.createStorageToken(id, { cap, lifetime? })` | `{ token, expiresAt }`, a storage capability token |
| `node.getClientCredentials`, `node.setClientCredentials`, `node.getRegistryCredentials` | The flat credential payload |
| `analysis.streamFiles(id)`, `analysis.downloadResult(id)` | A `ReadableStream` of the archive |
| `analysis.getFilesDownloadPath(id)`, `analysis.getResultDownloadPath(id)` | A path relative to the base URL |
| `analysisLog.delete(query)`, `analysisNodeLog.delete(query)`, `service.runCommand`, `service.runRegistryCommand` | `void` |

## Queries

`getMany` and `getOne` take an `EntityQueryInput<T>`: a typed [rapiq](https://github.com/tada5hi/rapiq) query object (or a
prebuilt `IQuery`) that the client encodes into the URL.

```typescript
import { getManyAll } from '@privateaim/core-http-kit';

const { data: nodes } = await client.node.getMany({
    filters: { online: true },
    sorts: { name: 'ASC' },
    pagination: { limit: 10 },
});

// Follow the pagination until every record is retrieved.
const analysisNodes = await getManyAll((page) => client.analysisNode.getMany({
    filters: { analysisId },
    pagination: page,
}));
```

- The server caps the page size (`meta.schema.pagination.maxLimit`, 50 by default); `getMany` returns one page.
- `getManyAll` requests pages of 50 and stops at `meta.total` or at the first empty page.
- `buildQueryString(input)` is exported for code that builds a URL itself.

## Timeouts and cancellation

`timeout` (milliseconds) bounds each request, including reading its response body. The client sets none by default.

Every method takes one optional `APIRequestOptions` object (`{ signal?, timeout? }`) as its last parameter: `signal` aborts the
call, `timeout` overrides the client's for this call.

```typescript
import { isClientErrorDueTimeout } from 'hapic';

const client = new Client({ baseURL: 'http://localhost:4000', timeout: 30_000 });
const controller = new AbortController();

try {
    await client.project.getMany(
        { pagination: { limit: 10 } },
        { signal: controller.signal, timeout: 2_000 },
    );
} catch (e) {
    if (isClientErrorDueTimeout(e)) {
        // the call ran past 2 seconds
    }
}
```

- A timed-out call rejects with a hapic client error whose `code` is `ETIMEDOUT`, an aborted one with `ECONNABORTED`.
- A method with an optional argument before the options takes `undefined` in its place: `getOne(id, undefined, { signal })`.
- `analysis.streamFiles` and `analysis.downloadResult` send `timeout: 0` unless you pass one, because the deadline would keep running while you read the stream.

## Errors

The client registers a response-error hook: when the server answers with a JSON body carrying `message`, the rejected error's
`message` is replaced by it. Use hapic's guards to inspect the error:

```typescript
import { isClientErrorWithStatusCode } from 'hapic';

try {
    await client.node.getOne(nodeId);
} catch (e) {
    if (isClientErrorWithStatusCode(e, 404)) {
        // not found
    }
}
```

## Contract

`Client` implements `ICoreClient`, and each sub-API implements its own `I<X>API` interface. Depend on the contract, not the
class, so a test can hand in a `FakeClient`:

```typescript
import type { ICoreClient } from '@privateaim/core-http-kit';

async function countOnlineNodes(client: ICoreClient) {
    const { meta } = await client.node.getMany({ filters: { online: true } });

    return meta.total;
}
```

| Sub-API | Contract |
|---|---|
| `analysis` | `IAnalysisAPI` (entity verbs plus `runCommand`, `createStorageToken`, `streamFiles`, `downloadResult`) |
| `analysisBucket` / `analysisBucketFile` | `IAnalysisBucketAPI` / `IAnalysisBucketFileAPI` |
| `analysisLog` / `analysisNodeLog` | `IAnalysisLogAPI` / `IAnalysisNodeLogAPI` (telemetry `Log` records, query-keyed `delete`) |
| `analysisNode` | `IAnalysisNodeAPI` |
| `analysisNodeEvent` | `IAnalysisNodeEventAPI` (read-only) |
| `masterImage` / `masterImageGroup` | `IMasterImageAPI` / `IMasterImageGroupAPI` (`getMany`, `getOne`, `delete`; `masterImage` adds `runCommand`) |
| `node` | `INodeAPI` (entity verbs plus credentials) |
| `project` / `projectNode` | `IProjectAPI` / `IProjectNodeAPI` |
| `registry` / `registryProject` | `IRegistryAPI` / `IRegistryProjectAPI` |
| `service` | `IServiceAPI` (protocol surface, no entity shape) |

The generic shapes are `IEntityAPISlim<T>` (`getMany`, `getOne`, `create`, `delete`) and `IEntityAPI<T>` (plus `update`).
`pickEntityAPI(client, type)` resolves a sub-API from a `DomainType` string at runtime and returns `undefined` for a type
without an entity API (the log sub-APIs, `service`).

## Testing

`@privateaim/core-http-kit/testing` ships a `FakeClient`: a real `Client` wired to hapic's `MemoryTransport`. Only the transport
is replaced, so header merging, body transformation, decoding, hooks and the client's error hook still run, and no network is
touched.

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
console.log(client.requests[0]); // { method: 'GET', url, params: { id: 'abc' }, headers, body, options }
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored, and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response body; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests go to the `fallback` option, which defaults to `{ data: [], meta: { total: 0 } }`.
- A recorded request has lower-cased `headers`, a parsed `body`, and `options` with the `signal` and `timeout` it was sent with (client defaults included, so a stream method shows `timeout: 0`), each key only when set.
- `matchRoute(method, url, handlers)` is the matcher the fake uses, exported for custom transports.

## Notes

- **Keep the fake's default `baseURL`.** It is `http://fake.test`. A `baseURL` with a path shifts every pathname, and handler patterns silently stop matching.
- **`getManyAll` ignores a `limit` you pass.** It always requests pages of 50; put your other query keys next to `pagination: page`.
- **The `meta.schema` description is the static allow-list.** Authorization gates and realm scoping can still strip keys per request.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
