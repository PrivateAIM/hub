# @privateaim/server-telemetry-kit

Server-side telemetry components including a Winston transport for forwarding logs to the telemetry service, and AMQP consumer components for event/log ingestion.

## Installation

```bash
npm install @privateaim/server-telemetry-kit
```

## Usage

### Log Component Dispatcher

```typescript
import { LogComponentDispatcher } from '@privateaim/server-telemetry-kit';

const dispatcher = new LogComponentDispatcher({ messageBus });
await dispatcher.dispatchWrite({ level: 'info', message: 'Hello' });
```

::: warning Removed: `EventCommand.CLEAN`
The event component no longer has a `CLEAN` command, and its dispatcher has no
`callClean()` / `dispatchClean()`. Expired events are swept by a scheduled component inside server-telemetry (once at
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
| `services` | Log component dispatcher, Winston transport |

## Dependencies

- `@privateaim/server-kit` — Server foundation
- `hubwire` — Component and dispatcher base classes
- `@privateaim/telemetry-kit` — Telemetry types
- `winston-transport` — Custom Winston transport base
