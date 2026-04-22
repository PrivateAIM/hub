# @privateaim/server-telemetry-kit

Server-side telemetry components including a Winston transport for forwarding logs to the telemetry service, and AMQP consumer components for event/log ingestion.

## Installation

```bash
npm install @privateaim/server-telemetry-kit
```

## Usage

### Log Component Caller

```typescript
import { useLogComponentCaller } from '@privateaim/server-telemetry-kit';

const caller = useLogComponentCaller();
await caller.write({ level: 'info', message: 'Hello' });
```

### Winston Transport

```typescript
import { TelemetryTransport } from '@privateaim/server-telemetry-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | AMQP consumer components for events and logs |
| `core` | Core telemetry utilities |
| `services` | Log component caller, Winston transport |

## Dependencies

- `@privateaim/server-kit` — Server foundation
- `@privateaim/telemetry-kit` — Telemetry types
- `winston-transport` — Custom Winston transport base
