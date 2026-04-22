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

// List buckets
const buckets = await client.bucket.getMany();

// Upload a file
await client.bucketFile.create({ bucket_id: bucketId, /* ... */ });

// Stream file contents
const stream = await client.bucketFile.stream(fileId);
```

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
