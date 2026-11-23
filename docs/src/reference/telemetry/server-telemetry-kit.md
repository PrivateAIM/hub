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

::: warning Breaking change
`LogComponentCaller` / `EventComponentCaller` are now `LogComponentDispatcher` /
`EventComponentDispatcher` (`callWrite` → `dispatchWrite`, `callCreate` → `dispatchCreate`). The
`EntityEventHandler` context key `eventComponentCaller` is now `eventComponentDispatcher`, and its
port `IEventPublisher` requires `dispatchCreate()` instead of `callCreate()`.
:::

### Winston Transport

`LoggerTransport` turns each Winston entry into a telemetry-kit `LogInput` and hands it to a `save` callback. Every string, number or boolean metadata key becomes a label; `labels` sets fixed ones.

```typescript
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentDispatcher, LoggerTransport } from '@privateaim/server-telemetry-kit';

const dispatcher = new LogComponentDispatcher({ messageBus });

const transport = new LoggerTransport({
    labels: {
        [LogFlag.SERVICE]: 'hub-server-worker',
        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
    },
    save: async (data) => {
        await dispatcher.dispatchWrite(data);
    },
});
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | `LogComponentDispatcher` / `EventComponentDispatcher`, their commands, routings and payload types |
| `core` | `EntityEventHandler`, which turns entity domain events into telemetry events |
| `services` | `LoggerTransport` (Winston transport) and its options |

## Dependencies

- `@privateaim/server-kit` — Server foundation (peer)
- `@privateaim/telemetry-kit` — Telemetry types (peer)
- `@privateaim/kit` — Core utilities (peer)
- `hubwire` — Dispatcher base classes
- `winston-transport` — Custom Winston transport base
- `smob` — Object comparison
