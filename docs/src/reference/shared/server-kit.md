# @privateaim/server-kit

Server-side foundation package providing logging, authentication integration, AMQP messaging, Redis, caching, and DI module infrastructure. Used by all Hub backend services.

## Installation

```bash
npm install @privateaim/server-kit
```

## Usage

### Logger (Winston)

```typescript
import { createLogger } from '@privateaim/server-kit';

const logger = createLogger();
logger.info('Service started');
```

`createLogger({ options?, transports? })` builds a winston logger at level `debug`; without `transports` it uses the
console transport. In a service, `LoggerModule` builds the logger the same way and registers it under
`LoggerInjectionKey`.

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

### Tagged Cache

`TaggedCacheModule` registers a tag-invalidated read cache ([`@rapiq/cache`](https://github.com/tada5hi/rapiq))
under `TaggedCacheInjectionKey` (typed `ITaggedCache`). Its `prefix` option is required: services share one
Redis, so each names its own namespace.

```typescript
import { TaggedCacheInjectionKey, TaggedCacheModule } from '@privateaim/server-kit';

new TaggedCacheModule({ prefix: 'hub-core' });

const cache = container.resolve(TaggedCacheInjectionKey);
const node = await cache.remember(`node:${id}`, () => repository.findOneBy({ id }), {
    tags: () => [`node:${id}`],
});
await cache.invalidate([`node:${id}`]);
```

- With a client under `RedisClientInjectionKey` (`RedisModule`, optional dependency) the cache uses the
  `@rapiq/cache-redis` driver on a **duplicate** of that client. The duplicate fails fast
  (`maxRetriesPerRequest: 1`, no offline queue, `commandTimeout: 500`, reconnect backoff capped at 2 s)
  and carries no `keyPrefix` (the driver refuses one); the service client's `keyPrefix` is prepended to
  `prefix` instead. Without Redis each process uses an in-memory driver.
- Entries live `TAGGED_CACHE_TTL` (60 s); a lost invalidation is therefore bounded by one minute.
- `setup()` awaits the connection for at most `TAGGED_CACHE_CONNECT_TIMEOUT` (1 s) and never fails on a
  Redis outage; reads then fall through to the database.
- Failures are logged as one `warn` line per `TAGGED_CACHE_ERROR_LOG_INTERVAL` (10 s) through the
  `LoggerModule` logger (optional dependency).
- `teardown()` unregisters the key and closes only the duplicate, never the service client.

`createTaggedCache({ redis?, prefix, onError })` builds the same cache without the container and returns
`{ cache, ready, dispose }`; `throttle(fn, interval, now?)` is the log throttle.

### Authup Integration

```typescript
import {
    AuthupClientInjectionKey,
    AuthupClientModule,
    AuthupHookModule,
} from '@privateaim/server-kit';
```

`AuthupHookModule` registers a hook that mints client-credential tokens for outbound Authup calls, and
`AuthupClientModule` registers the Authup HTTP client under `AuthupClientInjectionKey`, with that hook attached when
one is registered. Without explicit options both read `authupURL`, `clientId`, `clientSecret` and `realm` from the
config under `ConfigInjectionKey`, and register nothing when no Authup URL is configured.

### Outbound HTTP Timeouts

`HTTPClientTimeout` holds the request deadline in milliseconds for each kind of peer:
`AUTHUP` (10 000, the Authup client and the OAuth2 token creators), `SERVICE` (30 000, the core,
storage and telemetry clients and GitHub), `HARBOR` (60 000) and `VICTORIA_LOGS` (20 000, shorter than `SERVICE` so telemetry answers a VictoriaLogs timeout before its caller gives up). A call
that streams a request or response body passes `timeout: 0`. A timed-out request inside an HTTP
request is answered `504` with the code `upstream_timeout`; the worker retries it.

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
    // A service adds its own config, database and HTTP modules by pushing them onto this.modules.
}

const app = new MyAppBuilder()
    .withLogger()
    .withRedis()
    .withMessageBus()
    .withAuthupHook()
    .withAuthupClient()
    .withEntityEvent()
    .build();
```

The builder provides `withLogger`, `withRedis`, `withMessageBus`, `withAuthupHook`, `withAuthupClient` and
`withEntityEvent`. Each takes the module options, or `false` to leave the module out. It has no config, database or
HTTP module of its own.

## API

### Exports

| Module | Description |
|--------|-------------|
| `app` | `BaseApplicationBuilder` (its `build()` returns an orkos `Application`); `startApplication(app, { onSignal })` — one-shot SIGINT/SIGTERM shutdown with drain delay; `Health`, `HealthInjectionKey`, `createDatabaseHealthCheck` (1 s bound, 1 s reuse), `createHealthShutdownHook`, `createHealthLogObserver` — the state behind `/livez` and `/readyz` (routes: `mountHealthRoutes` in `@privateaim/server-http-kit`) |
| `logger` | `createLogger()`, `LoggerModule`, `LoggerInjectionKey`, `LoggerConsoleTransport`, `LoggerMemoryTransport` |
| `message-bus` | `MessageBusModule`, `MessageBusInjectionKey`, `MESSAGE_BUS_TOPIC_EXCHANGE` — DI wiring for the `hubwire` message bus; `createMessageBusLogHooks`, `createAmqpDriverLogHooks`, `createRemoteWorkerLogHooks`, `createScheduledComponentLogHooks` — hubwire `hooks` that log through a hub logger |
| `redis` | Redis module and connection helpers |
| `cache` | `TaggedCacheModule`, `TaggedCacheInjectionKey`, `TAGGED_CACHE_MODULE_NAME`, `TAGGED_CACHE_TTL`, `TAGGED_CACHE_ERROR_LOG_INTERVAL`, `createTaggedCache()`, `throttle()` — the tag-invalidated read cache |
| `authup` | `AuthupClient`, `AuthupClientModule`, `AuthupHookModule`, the client and user token creators, `createAuthupPermissionEvaluator`; `exchangeAuthupToken` (RFC 8693 token exchange as the Hub client) |
| `config` | `BaseServerConfig` type, `ConfigInjectionKey`, `CONFIG_MODULE_NAME`, `canonicalizeTrustProxy()`; each service reads its own configuration |
| `core/query` | `describeQuerySchema()`, `RECORD_QUERY_PARAMETERS` — rapiq schema description for `meta.schema`; `collectRootFilterValues()` — flattens an `and`-of-`eq` filter tree into label equalities for the log endpoints and rejects any other operator with a 400 |
| `entity-event` | Entity event pub/sub system |
| `constants` | Module names, injection keys, `HTTPClientTimeout` |

### Shared DI Modules

| Module Class | Purpose |
|-------------|---------|
| `LoggerModule` | Winston logger under `LoggerInjectionKey`; options `{ options?, transports? }`, console transport when no `transports` are given |
| `RedisModule` | Redis client registration |
| `TaggedCacheModule` | Tag-invalidated read cache (`@rapiq/cache`) on a duplicate of the Redis client, or in memory without Redis; options `{ prefix }` |
| `MessageBusModule` | Registers the `hubwire` message bus (AMQP or memory driver) with log hooks, and as `RemoteMessageBusInjectionKey` unless it is the memory driver; closes it on teardown. `silentRoutings`: routings whose publishes are not logged |
| `AuthupHookModule` | Client-credential token hook for outbound Authup calls |
| `AuthupClientModule` | Authup HTTP client under `AuthupClientInjectionKey`, with the hook attached when registered |
| `EntityEventModule` | Domain event dispatching |

## Dependencies

- `winston` — Logging
- `@privateaim/errors` — Shared error types
- `@hapic/oauth2` — OAuth2 client
- `@rapiq/core` — Query schema definition and description (`describeQuerySchema`)
- `@rapiq/cache`, `@rapiq/cache-redis` — Tagged read cache and its Redis driver (`TaggedCacheModule`)
- `orkos` — Module system (`IModule`)
- `eldin` — DI container (`TypedToken`)
- `envix` — Reads `NODE_ENV` for the console transport's log level
- `hubwire` — Message bus, components, dispatchers and workers
- `@hubwire/amqp` — AMQP driver (brings `amqp-extension`), which `MessageBusModule` imports
