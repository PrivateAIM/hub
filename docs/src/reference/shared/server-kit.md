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

The message bus, its drivers, components and callers live in
[`ergos`](https://github.com/tada5hi/ergos), a standalone library shared with Authup.
server-kit only wires it into the DI container: `MessageBusModule` registers ergos's
`MessageBus` under `MessageBusInjectionKey`, with the AMQP driver (`ergos/amqp`, topic
exchange `MESSAGE_BUS_TOPIC_EXCHANGE` = `FLAME`) when a RabbitMQ connection string is
configured and the in-process memory driver otherwise. Its `teardown()` closes the
connection.

```typescript
import { MessageBusInjectionKey, MessageBusModule } from '@privateaim/server-kit';
import { Component, MessageBusWorkerComponentCaller, defineScheduledComponent } from 'ergos';
```

::: warning Breaking change
`BaseComponent`, the component callers, `ComponentError`, `MessageBus`, the message bus
drivers, payload helpers and routing types, and the `Aggregator` type are no longer
exported by server-kit, and no aliases remain. Import them from `ergos`; renamed on the
way: `BaseComponent` → `Component`, `Component` (type) → `IComponent`, `ComponentCaller`
→ `IComponentCaller`, `buildMessageBusPublishPayload` → `buildMessageBusPayload`.
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
| `message-bus` | `MessageBusModule`, `MessageBusInjectionKey`, `MESSAGE_BUS_TOPIC_EXCHANGE` — DI wiring for the `ergos` message bus |
| `redis` | Redis module and connection helpers |
| `authup` | Authup authentication middleware module |
| `cache` | Cache module (Redis-backed) |
| `config` | Configuration reading via `envix` |
| `core/query` | `describeQuerySchema()`, `RECORD_QUERY_PARAMETERS` — rapiq schema description for `meta.schema`; `collectRootFilterValues()` — flattens an `and`-of-`eq` filter tree into label equalities for the log endpoints and rejects any other operator with a 400 |
| `entity-event` | Entity event pub/sub system |
| `constants` | Module names, injection keys |

### Shared DI Modules

| Module Class | Purpose |
|-------------|---------|
| `LoggerModule` | Winston logger with optional telemetry transport |
| `RedisModule` | Redis client registration |
| `MessageBusModule` | Registers the `ergos` message bus (AMQP or memory driver), closes it on teardown |
| `AuthupModule` | Authup middleware and token validation |
| `CacheModule` | Redis-backed caching |
| `EntityEventModule` | Domain event dispatching |

## Dependencies

- `winston` — Logging
- `@ebec/http` — HTTP error types
- `@hapic/oauth2` — OAuth2 client
- `@rapiq/core` — Query schema definition and description (`describeQuerySchema`)
- `orkos` — Module system (`IModule`)
- `eldin` — DI container (`TypedToken`)
- `envix` — Environment variable reading
- `ergos` — Message bus, components and callers
- `amqp-extension` — peer dependency of the AMQP driver (`ergos/amqp`), which `MessageBusModule` imports
