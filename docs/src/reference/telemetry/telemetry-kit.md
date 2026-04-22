# @privateaim/telemetry-kit

Telemetry and observability domain types with Zod validation schemas for logging and event tracking.

## Installation

```bash
npm install @privateaim/telemetry-kit
```

## Usage

### HTTP Client

```typescript
import { HTTPClient } from '@privateaim/telemetry-kit';

const client = new HTTPClient({
    baseURL: 'http://localhost:4002',
});

// Query logs
const logs = await client.log.getMany({ query: 'level:error' });

// Create an event
await client.event.create({ name: 'analysis.started', /* ... */ });
```

### Domain Types

```typescript
import { Event, Log } from '@privateaim/telemetry-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `http` | `HTTPClient` with event and log API methods |
| `domains` | `Event`, `Log` types and Zod validators |

## Dependencies

- `@validup/adapter-zod` — Zod validation adapter
- `validup` — Validation utilities
- `zod` — Schema validation
