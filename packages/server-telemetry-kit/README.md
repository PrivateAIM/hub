<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-telemetry-kit 📊</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-telemetry-kit)](https://www.npmjs.com/package/@privateaim/server-telemetry-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Send FLAME Hub logs and audit events to server-telemetry: Winston transport, entity event handler and dispatchers.**

A service adds one Winston transport and one entity event handler, and its log lines and entity changes reach the telemetry
service over the message bus, without hand-built payloads or routing names. Part of the
[FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Log transport](#log-transport) · [Audit events](#audit-events) · [Dispatchers and routings](#dispatchers-and-routings) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/telemetry/server-telemetry-kit.html)

---

## Installation

```bash
npm install @privateaim/server-telemetry-kit
```

The package ships ESM only and needs Node.js `>=26.0.0`. `@privateaim/kit`, `@privateaim/server-kit` and
`@privateaim/telemetry-kit` are peer dependencies; it depends on [`hubwire`](https://github.com/tada5hi/hubwire) and
`winston-transport`.

## Usage

Forward every log line of a service to server-telemetry:

```typescript
import { createLogger } from '@privateaim/server-kit';
import { LogComponentDispatcher, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';

const dispatcher = new LogComponentDispatcher({ messageBus });

const logger = createLogger({
    transports: [
        new LoggerTransport({
            labels: {
                [LogFlag.SERVICE]: 'hub-server-core',
                [LogFlag.CHANNEL]: LogChannel.SYSTEM,
            },
            save: async (log) => {
                await dispatcher.dispatchWrite(log);
            },
        }),
    ],
});
```

Register the bus with `silentRoutings: TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS` (an option of server-kit's `MessageBusModule`),
so the bus does not log the publishes that carry log lines and audit events (see [Notes](#notes)).

## Log transport

`LoggerTransport` extends `winston-transport`. It turns each Winston entry into a telemetry-kit `LogInput` and hands it to your
`save` function.

| Option | Type | Description |
|---|---|---|
| `save` | `(log: LogInput) => Promise<void> \| void` | Required. Receives each normalized entry, for example to publish it with `LogComponentDispatcher` |
| `labels` | `Record<string, string>` | Labels added to every entry |
| ...rest | `TransportStreamOptions` | Passed on to `winston-transport` (`level`, `silent`, ...) |

How an entry is normalized:

- `message` is the entry's `stack` when one exists (errors logged with `format.errors({ stack: true })`), otherwise its message.
- `time` is the entry's `timestamp`, or the current time.
- `level`, `channel` and `service` (`LogFlag.LEVEL`, `LogFlag.CHANNEL`, `LogFlag.SERVICE`) become top-level fields, whether they
  come from `labels` or the entry. Without them an entry has level `debug`, channel `system` and service `unknown`.
- Every other metadata key with a string, number or boolean value becomes a label (VictoriaLogs indexes each one). Objects and
  arrays are dropped. Attach entity ids as `LogFlag.REF_TYPE` + `LogFlag.REF_ID` labels, so the line shows up on that entity's view.

## Audit events

`EntityEventHandler` turns server-kit entity events (created, updated, deleted) into telemetry audit events and publishes them.

```typescript
import { EntityEventHandler, EventComponentDispatcher } from '@privateaim/server-telemetry-kit';

const handler = new EntityEventHandler({
    eventComponentDispatcher: new EventComponentDispatcher({ messageBus }),
    logger,
});
```

Pass it to server-kit's entity event module (`handlers` or `handlerFactory`). The event record it builds:

- `name` is the domain event (`created`, `updated`, `deleted`), `scope` is `entity`, `refType` / `refId` name the row.
- `realmId` is the row's own `realmId` when it has one, so event reads can be realm-scoped.
- `actorId`, `actorType`, `actorName`, `requestPath`, `requestMethod`, `requestIpAddress` and `requestUserAgent` are copied from
  the event metadata.
- An update with a previous state carries `data.diff`: `{ [key]: { next, previous } }` for every changed scalar property.

`eventComponentDispatcher` accepts any `IEventPublisher` (an object with `dispatchCreate(payload)`), so a test can pass a
recording fake instead of a message bus. Without one, the handler logs a debug line and drops the event.

## Dispatchers and routings

| Export | Routing (`work`) | Method | Payload |
|---|---|---|---|
| `LogComponentDispatcher` | `LogTaskMessageBusRouting` (`telemetryLogTasks`) | `dispatchWrite` | `LogWriteCommandPayload` (`Partial<Log>`) |
| `EventComponentDispatcher` | `EventTaskMessageBusRouting` (`telemetryEventTasks`) | `dispatchCreate` | `EventCreateCommandPayload` (`Partial<Event>`) |

Both extend hubwire's `RemoteDispatcher` and take `{ messageBus }`; each method takes optional `ComponentMetadata` as its second
argument and resolves once the message is published. Use FLAME Hub's `RemoteMessageBusInjectionKey`: server-telemetry is the
only consumer.

The package also exports the command and event names server-telemetry handles (`LogCommand.WRITE`, `LogEvent`,
`EventCommand.CREATE`, `EventEvent`), `EventComponentEventMap` for typing an event component, and the `LogCommandMap` /
`LogCommandContext` / `LogEventMap` / `LogEventContext` types.

## Notes

- **Silence the telemetry routings.** Without `TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS` in `silentRoutings`, publishing a log line
  writes a bus log line, which the transport publishes again.
- **Catch errors in `save`.** The transport calls Winston's `next()` once `save` settles, but does not catch a rejection: a
  `save` that throws becomes an unhandled promise rejection.
- **Credentials and timestamps never enter a diff.** Keys matching `EVENT_DATA_SECRET_KEY_REGEX` (`password`, `secret`, `hash`,
  `token`, `credential`) are skipped, as are `createdAt`, `updatedAt` and `expiresAt`. The timestamp list is explicit: a new
  timestamp column appears in diffs until it is added to that list.
- **Nested values are not diffed.** Object and array properties are left out of `data.diff`.
- **Telemetry's own events are not audited.** An entity event whose `refType` is telemetry-kit's `DomainType.EVENT` is ignored.
- **Retention is set by server-telemetry.** The handler sends no expiry; server-telemetry stamps it at ingest.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
