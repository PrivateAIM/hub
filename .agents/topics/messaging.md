# Messaging and Components

Read before changing the message bus wiring, a dispatcher, a worker, an aggregator, a scheduled component or a process-status transition.

Retries, ordering, status locking, the reconciler and bucket reply correlation are in [messaging delivery semantics](messaging-delivery.md).

## Domain Events & Messaging

TypeORM subscribers in `adapters/database/subscribers/` publish domain events via the entity event system; events flow through Redis pub/sub and AMQP (RabbitMQ). Implementation classes live in `app/aggregators/` and `app/components/`.

server-core wires its AMQP consumers in two DI modules:

- **AggregatorsModule** (`app/modules/aggregators/`) consumes events from other services (builder, distributor, storage, master-image, authup). Aggregators depend only on core services and repository ports, never on a `DataSource`: the worker status rules live in core as `applyEvent` on `AnalysisBuilder` / `AnalysisDistributor` / `MasterImageBuilderService`.
- **ComponentsModule** (`app/modules/components/`) registers `RegistryComponentDispatcher` and starts the registry consumer, the node-client sync (only with an Authup client) and the analysis reconciler (only when `RemoteMessageBusInjectionKey` is bound: a memory bus has no worker to consume its checks).

**The bus.** server-kit's `MessageBusModule` always registers hubwire's `MessageBus` (`IMessageBus`) under `MessageBusInjectionKey`: `@hubwire/amqp`'s `AmqpMessageBusDriver` (topic exchange `MESSAGE_BUS_TOPIC_EXCHANGE` = `FLAME`, `maxAttempts` = `MESSAGE_BUS_MAX_ATTEMPTS`) when a RabbitMQ connection string is configured, else `MemoryMessageBusDriver`. `teardown()` calls `IMessageBus.close()`. Every driver keeps one contract:

- `publish()` / `dispatch()` resolve `void` once the transport took the message; they never wait for or report a handler.
- A WORK message waits in its queue until a consumer takes it, on the memory driver too.
- A handler reads its attempt from `metadata.delivery = { attempt, maxAttempts }`.

Dispatchers (`RemoteDispatcher`) and workers (`RemoteWorker`) require a bus, so every module building one declares the `messageBus` dependency and `resolve`s it.

**Cross-service publishes need AMQP.** A publisher whose only consumer is another service resolves `RemoteMessageBusInjectionKey`, which `MessageBusModule` registers only for a non-memory driver, and is not built without it: log transports and `EntityEventHandler` (server-core, server-storage, server-messenger, server-core-worker; telemetry consumes its own), the worker's analysis log lines, server-storage's bucket and file events. On the memory driver those messages would sit in the heap until `close()`. Ceiling: server-core's commands to the worker and to storage use the always-registered bus, so without AMQP a triggered command waits in the memory queue until shutdown. The logger-transport `save` callbacks `tryResolve` lazily, because a line logged during boot can arrive before the bus is set up.

**Observability is hooks, not a logger.** hubwire logs nothing; a hook that throws is ignored. Build hooks only with server-kit's `message-bus/hooks.ts` factories (`createMessageBusLogHooks`, `createAmqpDriverLogHooks`, `createRemoteWorkerLogHooks`, `createScheduledComponentLogHooks`). Message ids go in the `messageId` label, never in the text. Every service factory passes `TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS` (server-telemetry-kit) as `silentRoutings`: logging the publish of a log line would feed the logger's transport back into the bus.

**Registry dispatch.** With a bus, `RegistryComponentDispatcher` only dispatches to `registryCommands` (`RemoteDispatcher`); the registry consumer runs it and the bus retries a throwing command, but the Harbor handlers log and swallow Harbor errors, so those are not retried. Without a bus it runs the component through a `LocalDispatcher`, and a failing call is not re-queued. `registryCommands` is not `ordered` (making it ordered answers 406 until the existing queue is deleted), so two commands for one project must be one command: a rename sends one `PROJECT_RELINK` carrying the previous `externalName` (see [registry project renames](../../docs/src/guide/deployment/configuration.md#registry-project-renames)). Separate admin `PROJECT_UNLINK` / `PROJECT_LINK` requests can still race. Robot credentials therefore arrive shortly after the request returns; `FNodeRegistryCredentials` re-reads up to 3 times until the secret appears.

Nothing double-handles in-process: the only routings a service both publishes and consumes are server-core's `registryCommands` (intended) and telemetry's own event queue, whose entity events `EntityEventHandler` skips (`refType === event`).

## Shared Components

Components, dispatchers, workers and the bus come from [`hubwire`](https://github.com/tada5hi/hubwire) (shared with authup); the AMQP retry and redelivery guard live in amqp-extension, transitive through `@hubwire/amqp` (hub declares no direct dependency). Hub keeps only its own policy: routings, `ordered` reply queues, the exchange name, the hook factories.

- **One `IComponent { start, stop, status }` contract** covers the message-handler router (`Component` behind a `RemoteWorker`) and scheduled jobs (`defineScheduledComponent({ schedule, run, runOnStart?, hooks? })`). Never hand-roll a `node-cron` task or `setInterval`. `start()` never rejects; a `run` that throws is reported to `hooks.onError` and does not stamp `lastSuccessAt`.
- Node-client sync and the reconciler throw after logging a partial failure (`failed > 0`) and pass **no** hooks, so a failure is logged once at error level; the event cleaner and messenger sweeper pass `createScheduledComponentLogHooks` (warn).
- The telemetry event cleaner is a scheduled component (`'0 1 * * *'` plus a pass at start), not a command, so a failing first pass is logged and boot continues. The messenger sweeper uses `runOnStart: false`.
- `ComponentError` lives in the worker (`apps/server-core-worker/src/app/components/error.ts`), its only user. The three domain kits (`server-core-worker-kit`, `server-storage-kit`, `server-telemetry-kit`) extend hubwire's `Component`, so their consumers need `hubwire` installed.

## hubwire 0.2 migration

Hub's dispatcher subclasses extend `RemoteDispatcher` and expose `dispatch*` methods; lifecycle rules:

- **Teardown stops, then waits.** Every `ComponentsModule` (and server-core's `AggregatorsModule`, messenger's `SweeperModule`) keeps its components in one `IComponent[]`, `stop()`s each, then awaits `settled?.()` on each: `stop()` never waits for a cron pass in flight, and that pass must not outlive the database.
- **No start/teardown handshake.** server-core starts components fire-and-forget. That is safe because `RemoteWorker.stop()` waits for its own start and leaves no consumer, `settled()` covers a scheduled component's first pass, and the authup aggregator attaches its listener before it subscribes, so a `stop()` mid-start removes it. Keep that listen-then-subscribe order.
- **Tests wait for handlers, not for `publish()`.** The memory driver delivers on a later microtask: bus-backed specs `drain()` (`@hubwire/test`) before asserting, assert a failing handler through `onError`, and use `FakeMessageBus` for a bus that must only record.
