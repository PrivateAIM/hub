# @privateaim/server-storage-kit

Server-side storage components for AMQP-driven bucket and file operations.

## Installation

```bash
npm install @privateaim/server-storage-kit
```

## Usage

```typescript
import { AnalysisBucketType, DomainType, buildAnalysisBucketName } from '@privateaim/core-kit';
import { BucketComponentDispatcher } from '@privateaim/server-storage-kit';

const dispatcher = new BucketComponentDispatcher({ messageBus });

// What server-core sends for each bucket of an analysis.
await dispatcher.dispatchCreate({
    name: buildAnalysisBucketName(AnalysisBucketType.CODE, analysis.id),
    realmId: analysis.realmId,
    refType: DomainType.ANALYSIS,
    refId: analysis.id,
});
```

The payload is a `Partial<Bucket>`. The finished event carries the stored bucket (with its `refType` / `refId`), and the
failure event echoes `refType`, `refId` and `name`, so the requester can attribute either. `dispatchDelete` and
`dispatchClear` take `{ id }` of the bucket.

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | Bucket and bucket-file component dispatchers (`BucketComponentDispatcher`, `BucketFileTaskDispatcher`, `BucketFileEventDispatcher`) |

## Dependencies

- `@privateaim/kit` — Core utilities (peer)
- `@privateaim/server-kit` — Server foundation (peer)
- `@privateaim/storage-kit` — Storage types (peer)
- `hubwire` — Dispatcher base classes
