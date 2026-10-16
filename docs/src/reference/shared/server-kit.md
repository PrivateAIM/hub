# @privateaim/server-kit

Server-side foundation package providing logging, authentication integration, AMQP messaging, Redis, caching, and DI module infrastructure. Used by all Hub backend services.

## Installation

```bash
npm install @privateaim/server-kit
```

## Usage

### Logger (Winston)

```typescript
import { useLogger, LoggerModule } from '@privateaim/server-kit';

const logger = useLogger();
logger.info('Service started');
```

### Message Bus

The message bus, its drivers, components, dispatchers and workers live in
[`hubwire`](https://github.com/tada5hi/hubwire), a standalone library shared with Authup (`hubwire`, plus
`@hubwire/amqp` for the AMQP driver). server-kit only wires it into the DI container:
`MessageBusModule` always registers a `MessageBus` (typed `IMessageBus`) under
`MessageBusInjectionKey`, with the AMQP driver (`@hubwire/amqp`, topic
exchange `MESSAGE_BUS_TOPIC_EXCHANGE` = `FLAME`) when a RabbitMQ connection string is
configured and the in-process memory driver otherwise. Its `teardown()` closes the
bus (`IMessageBus.close()`), and with it the connection. Only a bus on another driver than
the memory driver is also registered as `RemoteMessageBusInjectionKey`: the memory driver
keeps a WORK message until a consumer takes it, so a publisher whose consumer is another
service (log lines and entity events for server-telemetry) resolves that token and stays
unbuilt without AMQP.

```typescript
import { MessageBusInjectionKey, MessageBusModule } from '@privateaim/server-kit';
import { Component, RemoteWorker, defineScheduledComponent } from 'hubwire';
```

A handler sees the driver's delivery attempt as `metadata.delivery = { attempt, maxAttempts }`
(`MESSAGE_BUS_MAX_ATTEMPTS` = 5 over AMQP, `1/1` on the memory driver). `publish()` resolves
once the transport took the message, never after a handler ran.

::: warning Breaking change
`BaseComponent`, the component callers, `ComponentError`, `MessageBus`, the message bus
drivers, payload helpers and routing types, and the `Aggregator` type are no longer
exported by server-kit, and no aliases remain. Import them from `hubwire`
(`@hubwire/amqp` for the AMQP driver); renamed on the way: `BaseComponent` → `Component`,
`Component` (type) → `IComponent`, `ComponentCaller` → `IDispatcher`,
`MessageBusDispatchComponentCaller` → `RemoteDispatcher`, `MessageBusWorkerComponentCaller`
→ `RemoteWorker`, `DirectComponentCaller` → `LocalDispatcher`, `MessageBusPayload` → `Message`,
`MessageBusRouting` → `MessageRouting`, `buildMessageBusPublishPayload` → `buildMessage`.
Dispatchers and workers require a `messageBus`; a `RemoteWorker` takes `hooks` instead of a
`logger`, a `RemoteDispatcher` takes neither. The hub caller subclasses now extend
`RemoteDispatcher`, lost their `hooks` option and are renamed: `*ComponentCaller` →
`*ComponentDispatcher`, `BucketFile*Caller` → `BucketFile*Dispatcher`, their `call*` methods →
`dispatch*` (e.g. `callExecute` → `dispatchExecute`).
`createDispatchCallerLogHooks` was removed (a publish no longer reports an undelivered
message) and `createWorkerCallerLogHooks` is now `createRemoteWorkerLogHooks`.
`CompoundComponentCaller` was removed without replacement.
:::

### Redis

```typescript
import { RedisModule } from '@privateaim/server-kit';
```

### Authup Integration

```typescript
import { AuthupModule } from '@privateaim/server-kit';
```

### Query Schema Description

`describeQuerySchema()` serializes a rapiq entity schema into the `SchemaDescription` that
controllers publish under `meta.schema` — the static upper bound of an endpoint's queryable
vocabulary. Pass `RECORD_QUERY_PARAMETERS` on single-record reads to advertise only the
`fields` + `relations` subset a record read processes.

```typescript
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';

// Collection GET — full vocabulary
return { data, meta: { ...meta, schema: describeQuerySchema(nodeSchema) } };

// Record GET — fields + relations only
return { data: entity, meta: { schema: describeQuerySchema(nodeSchema, RECORD_QUERY_PARAMETERS) } };
```

Descriptions are memoized per `(schema, parameters)` and **deep-frozen**: the returned object is
shared by reference, so never mutate it. Always spread when merging — `meta: { ...meta, schema }`,
never `meta.schema = ...` (that throws under ESM strict mode).

See [API Reference](/guide/development/api#query-capability-discovery) for the consumer-side
reading rules.

### Application Builder

```typescript
import { BaseApplicationBuilder } from '@privateaim/server-kit';

class MyAppBuilder extends BaseApplicationBuilder {
    // Add withConfig(), withDatabase(), withHTTP() etc.
}
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `app` | `BaseApplicationBuilder`, `Application` base class |
| `logger` | Winston logger setup and `LoggerModule` |
| `message-bus` | `MessageBusModule`, `MessageBusInjectionKey`, `MESSAGE_BUS_TOPIC_EXCHANGE` — DI wiring for the `hubwire` message bus; `createMessageBusLogHooks`, `createAmqpDriverLogHooks`, `createRemoteWorkerLogHooks`, `createScheduledComponentLogHooks` — hubwire `hooks` that log through a hub logger |
| `redis` | Redis module and connection helpers |
| `authup` | Authup authentication middleware module |
| `config` | Configuration reading via `envix` |
| `core/query` | `describeQuerySchema()`, `RECORD_QUERY_PARAMETERS` — rapiq schema description for `meta.schema`; `collectRootFilterValues()` — flattens an `and`-of-`eq` filter tree into label equalities for the log endpoints and rejects any other operator with a 400 |
| `entity-event` | Entity event pub/sub system |
| `constants` | Module names, injection keys |

### Shared DI Modules

| Module Class | Purpose |
|-------------|---------|
| `LoggerModule` | Winston logger with optional telemetry transport |
| `RedisModule` | Redis client registration |
| `MessageBusModule` | Registers the `hubwire` message bus (AMQP or memory driver) with log hooks, and as `RemoteMessageBusInjectionKey` unless it is the memory driver; closes it on teardown. `silentRoutings`: routings whose publishes are not logged |
| `AuthupModule` | Authup middleware and token validation |
| `EntityEventModule` | Domain event dispatching |

## Dependencies

- `winston` — Logging
- `@ebec/http` — HTTP error types
- `@hapic/oauth2` — OAuth2 client
- `@rapiq/core` — Query schema definition and description (`describeQuerySchema`)
- `orkos` — Module system (`IModule`)
- `eldin` — DI container (`TypedToken`)
- `envix` — Environment variable reading
- `hubwire` — Message bus, components, dispatchers and workers
- `@hubwire/amqp` — AMQP driver (brings `amqp-extension`), which `MessageBusModule` imports
