# @privateaim/server-storage-kit

Server-side storage components for AMQP-driven bucket and file operations.

## Installation

```bash
npm install @privateaim/server-storage-kit
```

## Usage

```typescript
import { BucketComponentDispatcher } from '@privateaim/server-storage-kit';

const dispatcher = new BucketComponentDispatcher({ messageBus });
await dispatcher.dispatchCreate({ name: 'analysis-bucket' });
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | Bucket and bucket-file component dispatchers (`BucketComponentDispatcher`, `BucketFileTaskDispatcher`, `BucketFileEventDispatcher`) |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@privateaim/server-kit` — Server foundation
- `@privateaim/storage-kit` — Storage types
