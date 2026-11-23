<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/storage-kit 📦</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/storage-kit)](https://www.npmjs.com/package/@privateaim/storage-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Bucket and file types, capability tokens and a typed HTTP client for the FLAME Hub storage service.**

You get typed bucket and file calls, streaming downloads and multi-file uploads, plus a cache for storage capability tokens,
instead of hand-built requests against the storage API. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Responses](#responses) · [Timeouts and cancellation](#timeouts-and-cancellation) · [Capability tokens](#capability-tokens) · [Contract](#contract) · [Testing](#testing) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/storage/storage-kit.html)

---

## Installation

```bash
npm install @privateaim/storage-kit @privateaim/kit hapic @rapiq/core @rapiq/codec-url @authup/core-kit
```

The package is ESM only and needs Node.js `>=26.0.0`. `@privateaim/kit`, `hapic`, `@rapiq/core`, `@rapiq/codec-url` and
`@authup/core-kit` are peer dependencies.

## Usage

```typescript
import { APIClient } from '@privateaim/storage-kit';

const client = new APIClient({ baseURL: 'http://localhost:4001' });

client.setAuthorizationHeader({ type: 'Bearer', token: accessToken });

const { data: buckets, meta } = await client.bucket.getMany();
const { data: bucket } = await client.bucket.create({ name: 'analysis-bucket' });

const formData = new FormData();
formData.append('file', new Blob(['print("hello")']), 'main.py');

const { data: files } = await client.bucket.upload(bucket.id, formData);

const stream = await client.bucketFile.stream(files[0].id);
```

`APIClient` takes hapic's client options (`baseURL`, `headers`, `timeout`, `transport`, …) and exposes two sub-APIs:
`bucket` and `bucketFile`.

| Method | Does |
|---|---|
| `bucket.getMany`, `getOne`, `create`, `update`, `delete` | Entity verbs on buckets |
| `bucket.upload(id, formData)` | Uploads one or more files into the bucket |
| `bucket.clear(id)` | Empties the bucket (every file and stored object) but keeps it |
| `bucket.stream(id)` / `bucketFile.stream(id)` | Downloads a bucket (as a tar archive) or one file as a `ReadableStream` |
| `getStreamPath(id)` / `getStreamURL(id)` | The download path, or the absolute URL resolved against the base URL |
| `bucketFile.getMany`, `getOne`, `create`, `update`, `delete` | Entity verbs on bucket files (files are usually created by `bucket.upload`) |

## Responses

Every single-record method (`getOne`, `create`, `update`, `delete`, `clear`) resolves to the `{ data, meta }` record
envelope (`EntityRecordResponse`); `getMany` resolves to `EntityCollectionResponse` (`{ data, meta: { total, limit?, offset?, schema? } }`).
Query-capable `GET`s describe their queryable vocabulary under `meta.schema` and mutations carry `meta: {}`; the reading rules
are in [query capability discovery](https://hub.docs.privateaim.net/reference/core/core-http-kit.html#query-capability-discovery).

Two endpoints stay outside the record envelope:

- `bucket.stream` and `bucketFile.stream` return a flat binary stream.
- `bucket.upload` answers with a collection (`{ data: files, meta: { total } }`), because one request creates many files; it carries no `schema`.

## Timeouts and cancellation

`timeout` (milliseconds) bounds each request, including reading its response body; none is set by default. Every method takes
one optional `APIRequestOptions` object (`{ signal?, timeout? }`) as its last parameter: `signal` aborts the call, `timeout`
overrides the client's for this call.

```typescript
const controller = new AbortController();

const stream = await client.bucketFile.stream(fileId, { signal: controller.signal });
```

`bucket.stream`, `bucketFile.stream` and `bucket.upload` send `timeout: 0` unless you pass one, so a long transfer is never cut
off. A timed-out call rejects with a hapic client error whose `code` is `ETIMEDOUT`, an aborted one with `ECONNABORTED`.

## Capability tokens

Storage accepts a capability token in place of a user token: a short-lived token whose `cap` entries
(`type:id:actions`) name exactly the buckets and files it may touch. server-core mints them
(`analysis.createStorageToken` in [`@privateaim/core-http-kit`](https://www.npmjs.com/package/@privateaim/core-http-kit)).

`StorageCapabilityTokenProvider` caches one token per cap set, and `withAuthorization()` returns a client that sends it on
every request:

```typescript
import { APIClient, StorageCapabilityTokenProvider } from '@privateaim/storage-kit';

const provider = new StorageCapabilityTokenProvider({
    mint: ({ cap }) => coreClient.analysis.createStorageToken(analysisId, { cap }),
});

const cap = [`bucket:${bucketId}:read`];

const scoped = new APIClient({ baseURL: 'http://localhost:4001' }).withAuthorization(
    () => provider.getToken(cap),
    { onRefused: () => provider.invalidate(cap) },
);

const stream = await scoped.bucket.stream(bucketId);
```

- `getToken(cap)` re-mints within `refreshMargin` seconds (default 60) of the token's expiry, shares one mint between concurrent callers, and never caches a failed mint. The cache key ignores the order of the entries.
- `invalidate(cap?)` drops the token of one cap set, or every token.
- `withAuthorization(resolve, { onRefused? })` calls `resolve({ method })` before each request and sends `Authorization: Bearer <token>`. `onRefused` runs when storage answers 401 or 403; the error still propagates.
- The scoped client copies the parent's base URL, timeout, headers and transport, but none of its hooks.

The vocabulary for checking entries:

| Export | Purpose |
|---|---|
| `StorageCapabilityType` | `bucket`, `bucketFile` |
| `StorageCapabilityAction` | `read`, `write`, `delete` |
| `assertStorageCapabilityEntry(entry)` | Throws a `TypeError` for an unknown type or an action the type does not allow (`bucketFile` allows only `read` and `delete`) |
| `capabilityCoversBucket(entries, bucketId, action)` | Whether a parsed capability grants `action` on the bucket |
| `capabilityCoversBucketFile(entries, file, action)` | Whether it grants `action` on the file, directly or through its bucket |
| `capabilityBucketIds` / `capabilityBucketFileIds` | The ids a capability grants an action on |
| `STORAGE_CAPABILITY_TOKEN_MAX_LIFETIME` | 3600 seconds |

Parse the raw `type:id:actions` strings with `parseCapabilityEntries()` from `@privateaim/kit` before passing them to these helpers.

## Domain types

| Export | Purpose |
|---|---|
| `Bucket` | `name`, `region`, `realmId` and the free-form owner reference `refType` / `refId` |
| `BucketFile` | `name`, `path`, `directory`, `hash`, `size` and its `bucketId` |
| `BucketValidator` | Validates bucket input (`name` 3 to 256 characters; `region`, `realmId`, `refType`, `refId` on create only) |
| `assertBucketRefPairing(data)` | Throws a `BadRequestError` when `refId` is set without `refType` |
| `DomainType` / `DomainTypeMap` | `bucket`, `bucketFile` and their entity types |

## Contract

`APIClient` implements `IStorageClient`, and each sub-API implements its own interface. Depend on the contract, not the class,
so a test can hand in a `FakeClient`:

```typescript
import type { IStorageClient } from '@privateaim/storage-kit';

async function countBuckets(client: IStorageClient) {
    const { meta } = await client.bucket.getMany();

    return meta.total;
}
```

| Sub-API | Contract |
|---|---|
| `bucket` | `IBucketAPI` (entity verbs plus `clear`, `upload`, `stream`) |
| `bucketFile` | `IBucketFileAPI` (entity verbs plus `stream`) |

`pickEntityAPI(client, type)` resolves a sub-API from a `DomainType` string at runtime and returns `undefined` for an unknown
type.

## Testing

`@privateaim/storage-kit/testing` ships a `FakeClient`: a real `APIClient` wired to hapic's `MemoryTransport`. Only the
transport is replaced, so header merging, body transformation, decoding, hooks and the client's error hook still run, and no
network is touched.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/storage-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /buckets/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
        'DELETE /buckets/:id': () => fakeResponse(404, { message: 'not found' }),
    },
});

const { data: bucket } = await client.bucket.getOne('abc');

// Every dispatched request is recorded, normalized.
console.log(client.requests);
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored, and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response body; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests go to the `fallback` option, which defaults to `{ data: [], meta: { total: 0 } }`.
- A recorded request's `options` holds the `signal` and `timeout` it was sent with (client defaults included), each key only when set. A client from `withAuthorization()` shares the fake's transport, so its requests are recorded too, with empty `options`.

## Notes

- **Keep the fake's default `baseURL`.** It is `http://fake.test`. A `baseURL` with a path shifts every pathname, and handler patterns silently stop matching.
- **`getStreamURL()` keeps the base URL's path.** It appends to the base URL even without a trailing slash (`https://host/storage` gives `https://host/storage/buckets/<id>/stream`). A bare URL carries no credentials.
- **`refType` is free-form.** The storage kit does not depend on core-kit, so it cannot type the owning service's `DomainType`.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
