# @privateaim/server-core-worker-kit

Worker task type definitions and AMQP component constants for the background worker service.

## Installation

```bash
npm install @privateaim/server-core-worker-kit
```

## Usage

```typescript
import {
    WorkerComponentName,
} from '@privateaim/server-core-worker-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | Worker component definitions (builder, distributor, master-image) |
| `constants` | Component names and queue routing keys |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@privateaim/core-kit` — Domain types
- `@privateaim/server-kit` — Server foundation
