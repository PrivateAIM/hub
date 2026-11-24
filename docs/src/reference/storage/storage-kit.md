# @privateaim/storage-kit

Storage domain types and HTTP client for the PrivateAIM storage service.

## Installation

```bash
npm install @privateaim/storage-kit
```

## Usage

### HTTP Client

```typescript
import { APIClient } from '@privateaim/storage-kit';

const client = new APIClient({
    baseURL: 'http://localhost:4001',
});

// List buckets — { data: Bucket[], meta: { total, limit?, offset?, schema? } }
const { data: buckets, meta } = await client.bucket.getMany();

// Get a bucket — { data: Bucket, meta: { schema } }
const { data: bucket } = await client.bucket.getOne(bucketId);

// Create a bucket — { data: Bucket, meta: {} }
const { data: created } = await client.bucket.create({ name: 'analysis-bucket' });

// Stream file contents — flat, no envelope
const stream = await client.bucketFile.stream(fileId);
```

### Timeouts

`timeout` (milliseconds) bounds each request, including reading its response body; none is set
by default. `bucket.stream`, `bucketFile.stream` and `bucket.upload` pass `timeout: 0`, so a long
transfer is never cut off. A client from `withAuthorization()` keeps the parent's timeout.

Every API method takes one optional `APIRequestOptions` object (`{ signal?, timeout? }`) as its
last parameter: `signal` aborts the call, `timeout` overrides the client's for this call (and
replaces the `timeout: 0` of `stream` and `upload`). Semantics as in
[`@privateaim/core-http-kit`](/reference/core/core-http-kit#cancellation-per-call-timeouts).

```typescript
const stream = await client.bucketFile.stream(fileId, { signal: controller.signal });
```

### Response Shapes

Every single-record method (`getOne`, `create`, `update`, `delete`, `clear`) resolves to the
`{ data, meta }` record envelope — destructure `data` at the call site. `getMany` is unchanged:
collections were already enveloped.

Query-capable `GET`s advertise the endpoint's queryable vocabulary under `meta.schema`
(`fields`/`filters`/`sorts`/`relations`/`pagination` on collections, the `fields` + `relations`
subset on record reads); mutations carry `meta: {}`. The reading rules are documented once, in
[`@privateaim/core-http-kit`](/reference/core/core-http-kit#query-capability-discovery).

Two storage endpoints deliberately stay outside the record envelope:

- `GET /buckets/:id/stream` and `GET /bucket-files/:id/stream` are **flat** binary streams.
- `POST /buckets/:id/upload` answers with a **collection** (`{ data: files, meta: { total } }`),
  because it uploads many files — it is not a record response, and it carries no `schema`.

### Type Renames

The envelope shipped with a rename and **no deprecated aliases**:
`SingleResourceResponse` → `EntityRecordResponse` (now the envelope, not the bare record) and
`CollectionResourceResponse` → `EntityCollectionResponse`. Both are re-exported from the package
barrel. See the [core-http-kit migration note](/reference/core/core-http-kit#migration).

### Domain Types

```typescript
import { Bucket, BucketFile } from '@privateaim/storage-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `http` | `APIClient` with bucket and bucket-file API methods |
| `IStorageClient` / `ClientOptions` | The client contract and its construction options |
| `pickEntityAPI` | Runtime lookup of a sub-API by `DomainType` string; returns `undefined` for a type without an entity API. The record type parameter is asserted by the caller, not checked |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute` |
| `domains` | `Bucket`, `BucketFile` types and validators |
| `StorageCapabilityType` / `StorageCapabilityAction` / `assertStorageCapabilityEntry` | Capability vocabulary: types `bucket`, `bucketFile` (the storage `DomainType` values); actions `read`, `write`, `delete`; `capabilityCoversBucket` / `capabilityCoversBucketFile` decide coverage (a bucket entry covers its files) |
| `StorageCapabilityTokenProvider` / `IStorageCapabilityTokenProvider` | Caches a minted token per cap set (re-mints within 60 s of expiry, shares concurrent mints, never caches a failure) |
| `IStorageClient.withAuthorization(resolve)` | A scoped client that sends `Authorization: Bearer <await resolve({ method })>` on each request. It copies the parent's base URL, timeout, headers and transport, but none of its hooks |

## Contract

`APIClient` implements `IStorageClient`, and each sub-API implements its own
`I<X>API` interface:

```typescript
import type { IStorageClient } from '@privateaim/storage-kit';

// Depend on the CONTRACT, not the class — that is what lets a test hand you a
// fake, and what keeps the type structural.
function doWork(client: IStorageClient) { /* … */ }
```

| Sub-API | Contract |
|---|---|
| `bucket` | `IBucketAPI` (entity verbs plus `clear`/`upload`/`stream`) |
| `bucketFile` | `IBucketFileAPI` (entity verbs plus `stream`) |

## Testing

`@privateaim/storage-kit/testing` ships a `FakeClient`: a real `APIClient` wired to hapic's
`MemoryTransport`. Only the transport is replaced, so header merging, body
transformation, decoding, retries and the client's own `RESPONSE_ERROR` hook all
still run.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/storage-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /buckets/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
    },
});

const { data: bucket } = await client.bucket.getOne('abc');
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response **body**; return `fakeResponse(status, body)` for a non-2xx.
- Unmatched requests fall back to `{ data: [], meta: { total: 0 } }`.
- A recorded request's `options` holds the `signal` and `timeout` it was sent with (client
  defaults included), each key only when set. A client from `withAuthorization()` records
  empty `options`.
- Keep the default path-free `baseURL` — a `baseURL` carrying a path shifts every
  pathname, and patterns silently stop matching.

## Dependencies

- `@privateaim/kit` — Core utilities (peer)
- `@authup/core-kit` — Authup types (peer)
- `@authup/core-http-kit` — Path-segment encoding of ids (peer)
- `hapic` — HTTP client base (peer)
- `@rapiq/core`, `@rapiq/codec-url` — Query parameter building (peer)
- `@privateaim/errors` — Shared error types
- `validup`, `@validup/zod`, `zod` — Validation
