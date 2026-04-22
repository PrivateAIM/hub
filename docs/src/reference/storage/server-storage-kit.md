# @privateaim/server-storage-kit

Server-side storage components for AMQP-driven bucket and file operations.

## Installation

```bash
npm install @privateaim/server-storage-kit
```

## Usage

```typescript
import { useBucketComponentCaller } from '@privateaim/server-storage-kit';

const caller = useBucketComponentCaller();
await caller.create({ name: 'analysis-bucket' });
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | Bucket and bucket-file AMQP component callers |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@privateaim/server-kit` — Server foundation
- `@privateaim/storage-kit` — Storage types
