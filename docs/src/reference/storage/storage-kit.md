# @privateaim/storage-kit

Storage domain types and HTTP client for the PrivateAIM storage service.

## Installation

```bash
npm install @privateaim/storage-kit
```

## Usage

### HTTP Client

```typescript
import { HTTPClient } from '@privateaim/storage-kit';

const client = new HTTPClient({
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

### Response Shapes

Every single-record method (`getOne`, `create`, `update`, `delete`) resolves to the
`{ data, meta }` record envelope — destructure `data` at the call site. `getMany` is unchanged:
collections were already enveloped.

Query-capable `GET`s advertise the endpoint's queryable vocabulary under `meta.schema`
(`fields`/`filters`/`sort`/`relations`/`pagination` on collections, the `fields` + `relations`
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
| `http` | `HTTPClient` with bucket and bucket-file API methods |
| `domains` | `Bucket`, `BucketFile` types and validators |

## Dependencies

- `@privateaim/kit` — Core utilities
- `hapic` — HTTP client base
- `rapiq` — Query parameter building
