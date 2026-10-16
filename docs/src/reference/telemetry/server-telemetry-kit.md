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

::: warning Removed: `EventCommand.CLEAN`
The event component no longer has a `CLEAN` command, and `callClean()` is gone from its
caller. Expired events are swept by a scheduled component inside server-telemetry (once at
start, then daily at 01:00), so there is nothing to send.
:::

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
- `synergos` — Component and caller base classes
- `@privateaim/telemetry-kit` — Telemetry types
- `winston-transport` — Custom Winston transport base
