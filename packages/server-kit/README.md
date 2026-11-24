<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-kit 🔧</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-kit)](https://www.npmjs.com/package/@privateaim/server-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Shared foundation of the FLAME Hub services: DI modules, startup, health, logging, message bus, cache and Authup.**

Every Hub service builds on it, so you do not write the logger, Redis, message bus, read cache, Authup client or shutdown handling
per service. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Health](#application-lifecycle-and-health) · [Message bus](#message-bus) · [Tagged cache](#tagged-cache) · [Authup](#authup) · [Read scoping](#read-scoping-and-query-helpers) · [API](#api) · [Documentation](https://hub.docs.privateaim.net/reference/shared/server-kit.html)

---

## Installation

```bash
npm install @privateaim/server-kit
```

ESM only, Node.js `>=26.0.0`. `@authup/access`, `redis-extension` and `typeorm-extension` are peer dependencies.

## Usage

`BaseApplicationBuilder` collects [orkos](https://www.npmjs.com/package/orkos) modules into an application; `startApplication`
runs its setup and owns the SIGINT/SIGTERM shutdown.

```typescript
import {
    BaseApplicationBuilder,
    createAuthupClientTokenCreator,
    createHealthShutdownHook,
    startApplication,
} from '@privateaim/server-kit';

const app = new BaseApplicationBuilder()
    .withLogger()
    .withRedis({ connectionString: 'redis://127.0.0.1:6379' })
    .withMessageBus()
    .withAuthupHook({
        tokenCreator: createAuthupClientTokenCreator({
            baseURL: 'http://127.0.0.1:3010',
            clientId: 'system',
            clientSecret: 'secret',
            realm: 'master',
        }),
    })
    .withAuthupClient({ baseURL: 'http://127.0.0.1:3010' })
    .withEntityEvent()
    .build();

await startApplication(app, { onSignal: createHealthShutdownHook(app.container) });
```

- Each `with*()` method takes the module options, or `false` to leave the module out.
- The builder has no config, database or HTTP module: a service subclasses it and pushes its own modules onto `this.modules`.
- A module without explicit options reads its settings from the `BaseServerConfig` registered under `ConfigInjectionKey`
  (`redisConnectionString`, `rabbitMqConnectionString`, `authupURL`, `clientId`, `clientSecret`, `realm`). With neither, the
  module registers nothing (Redis, Authup client, Authup hook) or falls back to an in-process implementation (message bus).

### DI modules

| Module | Registers | Options |
|---|---|---|
| `LoggerModule` | `LoggerInjectionKey`: a winston logger, console transport unless `transports` are given | `{ options?, transports? }` |
| `RedisModule` | `RedisClientInjectionKey`, plus duplicates under `RedisPublishClientInjectionKey` and `RedisSubscribeClientInjectionKey` | `{ connectionString? }` |
| `MessageBusModule` | `MessageBusInjectionKey`, and `RemoteMessageBusInjectionKey` over AMQP only | `{ driverFactory?, silentRoutings? }` |
| `TaggedCacheModule` | `TaggedCacheInjectionKey` | `{ prefix }` (required) |
| `EntityEventModule` | `EntityEventPublisherInjectionKey` | `{ handlers?, handlerFactory? }` |
| `AuthupHookModule` | `AuthupClientAuthenticationHookInjectionKey`: mints client-credential tokens for outbound Authup calls | `ClientAuthenticationHookOptions` |
| `AuthupClientModule` | `AuthupClientInjectionKey`, with the hook attached when one is registered | `{ baseURL? }` |

Each module exports its name as `<X>_MODULE_NAME` (e.g. `MESSAGE_BUS_MODULE_NAME`), which other modules list as a dependency.

## Application lifecycle and health

```typescript
import {
    Health,
    HealthInjectionKey,
    createDatabaseHealthCheck,
    createHealthLogObserver,
} from '@privateaim/server-kit';

const health = new Health({
    readiness: [createDatabaseHealthCheck(dataSource)],
    onReadinessChange: createHealthLogObserver(logger),
});

container.register(HealthInjectionKey, { useValue: health });

// in the module's onReady(), once every module finished its setup
health.markStarted();
```

- `Health` is the state behind `GET /livez` and `GET /readyz`; mount the routes with `mountHealthRoutes` from
  [`@privateaim/server-http-kit`](https://www.npmjs.com/package/@privateaim/server-http-kit).
- Both probes fail until `markStarted()`. Liveness fails otherwise only on its own `liveness` checks; readiness fails on a failing
  `readiness` check and from `markStopping()` on.
- `createDatabaseHealthCheck(source, { timeout?, ttl? })` runs `SELECT 1` with a 1 s timeout and reuses a result for 1 s. A query
  outliving the timeout is not repeated until it settles, so a stalled database gets no pile of probe queries.
- `onReadinessChange` fires when the set of failing readiness checks changes, not on every probe.
- `startApplication(app, { onSignal })` calls `onSignal` on the first SIGINT/SIGTERM. `createHealthShutdownHook(container)` marks
  the registered `Health` as stopping and answers the configured `shutdownDelay` (seconds) in milliseconds; the process keeps
  serving for that long, then tears down within 30 s. A second signal ends the delay early. A process that never finished setup
  skips the delay.

See [health endpoints](https://hub.docs.privateaim.net/guide/deployment/configuration.html#health-endpoints) and
[graceful shutdown](https://hub.docs.privateaim.net/guide/deployment/configuration.html#graceful-shutdown) for the deployment side.

## Configuration

`ConfigInjectionKey` is typed `BaseServerConfig`: `env`, `port`, `realm`, `clientId`, `clientSecret` and the optional `publicURL`,
`authupURL`, `redisConnectionString`, `rabbitMqConnectionString`, `cookiePrefix`, `trustProxy` and `shutdownDelay`. Each service
registers it from its own `ConfigModule`; server-kit reads no environment variables for it.

`canonicalizeTrustProxy(raw)` turns a string-form `TRUST_PROXY` into routup's `trustProxy` shape: an integer is a hop count, a
boolean word (`true`, `yes`, `on`, ...) trusts every hop or none, anything else is a comma-separated allowlist of IPs, CIDRs or
presets. A hop count beyond the safe integer range throws.

## Logger

```typescript
import { LoggerMemoryTransport, createLogger } from '@privateaim/server-kit';

const memory = new LoggerMemoryTransport();
const logger = createLogger({ transports: [memory] });

logger.info('Service started', { component: 'http' });
```

`createLogger()` builds a winston logger at level `debug` with error stacks and timestamps. Without transports it uses the console
transport, which logs `info` and above when the environment variable `env` (lower case, read with envix) is `production`, `debug`
otherwise. `LoggerMemoryTransport` keeps entries in
`items` for tests.

## Message bus

The message bus, its drivers, components, dispatchers, workers and scheduled components come from
[`hubwire`](https://www.npmjs.com/package/hubwire) (AMQP driver: `@hubwire/amqp`). server-kit only wires the bus into the container:

```typescript
import { buildMessage } from 'hubwire';
import { MessageBusInjectionKey } from '@privateaim/server-kit';

const bus = container.resolve(MessageBusInjectionKey);

await bus.publish(buildMessage({
    type: 'build',
    data: { id },
    metadata: { routing: { type: 'work', key: 'worker' } },
}));
```

- `MessageBusModule` always registers an `IMessageBus` under `MessageBusInjectionKey`: over AMQP when
  `rabbitMqConnectionString` is configured (topic exchange `MESSAGE_BUS_TOPIC_EXCHANGE` = `FLAME`, `MESSAGE_BUS_MAX_ATTEMPTS` = 5
  deliveries), otherwise in process (memory driver). `driverFactory` replaces that choice.
- Only a bus on another driver than the memory driver is also registered as `RemoteMessageBusInjectionKey`. The memory driver
  keeps a WORK message until a consumer takes it, so a publisher whose consumer is another service resolves that token and stays
  unbuilt without AMQP.
- `publish()` resolves once the driver took the message, never after a handler ran. A handler reads the delivery attempt as
  `metadata.delivery = { attempt, maxAttempts }`.
- `teardown()` closes the bus and with it the connection.
- The hook factories log through a hub logger: `createMessageBusLogHooks(logger, { silentRoutings })` (the module uses it;
  publishes to a silent routing are not logged, so the log queue does not feed itself), `createAmqpDriverLogHooks`,
  `createRemoteWorkerLogHooks` and `createScheduledComponentLogHooks(logger, name)`.

## Redis

`RedisModule` creates one client from the connection string and registers factories for a publish and a subscribe duplicate.
`createRedisClient`, `RedisClient`, `RedisClientOptions` and `buildRedisKeyPath` come from
[`redis-extension`](https://www.npmjs.com/package/redis-extension).

## Tagged cache

`TaggedCacheModule` registers a tag-invalidated read cache ([`@rapiq/cache`](https://www.npmjs.com/package/@rapiq/cache)) under
`TaggedCacheInjectionKey` (typed `ITaggedCache`). Its `prefix` option is required: services share one Redis, so each names its own
namespace.

```typescript
import { TaggedCacheInjectionKey, TaggedCacheModule } from '@privateaim/server-kit';

const module = new TaggedCacheModule({ prefix: 'hub-core' });

const cache = container.resolve(TaggedCacheInjectionKey);
const node = await cache.remember(`node:${id}`, () => repository.findOneBy({ id }), {
    tags: () => [`node:${id}`],
});

await cache.invalidate([`node:${id}`]);
```

- With a client under `RedisClientInjectionKey` the cache runs the `@rapiq/cache-redis` driver on a duplicate of that client. The
  duplicate fails fast (`maxRetriesPerRequest: 1`, no offline queue, `commandTimeout: 500`, reconnect backoff capped at 2 s) and
  carries no `keyPrefix` (the driver refuses one); the service client's `keyPrefix` is prepended to `prefix` instead. Without Redis
  each process uses an in-memory driver.
- Entries live `TAGGED_CACHE_TTL` (60 s), so a lost invalidation is bounded by one minute.
- `setup()` waits for the connection at most `TAGGED_CACHE_CONNECT_TIMEOUT` (1 s) and never fails on a Redis outage; reads then
  fall through to the database.
- Failures are logged as one `warn` line per `TAGGED_CACHE_ERROR_LOG_INTERVAL` (10 s) when a logger is registered.
- `teardown()` unregisters the key and closes only the duplicate, never the service client.

`createTaggedCache({ redis?, prefix, onError })` builds the same cache without a container and returns `{ cache, ready, dispose }`;
`throttle(fn, interval, now?)` is the log throttle.

## Entity events

```typescript
import { EntityEventModule, EntityEventRedisHandler, RedisClientInjectionKey } from '@privateaim/server-kit';

const module = new EntityEventModule({
    handlerFactory: (container) => [new EntityEventRedisHandler(container.resolve(RedisClientInjectionKey))],
});
```

- `EntityEventPublisher.publish()` runs every registered handler, also after one failed, then rethrows the first error.
  `safePublish()` logs the error instead.
- `EntityEventRedisHandler` publishes `{ type, event, data }` to a Redis channel per destination (`namespace/channel`).
  `EntityEventSocketHandler` emits `<refType><Event>` (e.g. `nodeCreated`) to a Socket.IO room per destination through
  `@socket.io/redis-emitter`.
- `dataPrevious` (the pre-update snapshot) is for in-process handlers only; the Redis and socket handlers never put it on the wire.

## Authup

| Export | Purpose |
|---|---|
| `createAuthupClientTokenCreator(ctx)` / `createAuthupUserTokenCreator(ctx)` | Token creators (client credentials or password grant) for an Authup client hook, bounded by `HTTPClientTimeout.AUTHUP` |
| `exchangeAuthupToken(ctx, input)` | RFC 8693 token exchange as the acting client, for a capability token (`{ token, expiresIn }`) |
| `resolveAuthupPolicySubject(data)` | The policy subject of an introspected token: always its identity, its grants only when the scope includes `global` |
| `createAuthupPermissionEvaluator(cache, subject)` | An `IPermissionEvaluator` over an `AuthorizationCatalogCache` (`@authup/server-kit/core`) |
| `isIntrospectableToken(token)` / `assertIntrospectableToken(token)` | Compact-JWS shape and length guard run before introspection |
| `AuthupClient`, `AuthupClientModule`, `AuthupHookModule` | The Authup HTTP client and its DI wiring |

- A token without the `global` scope keeps its identity but gets an empty grant set: a permission check denies it (403), while
  identity-reading policies still see the real caller.
- `exchangeAuthupToken` answers a timeout with a `504 upstream_timeout` and every other failure, a refused subject token included,
  with a `502 upstream_error`, never a 401.

## Read scoping and query helpers

```typescript
import { findManyScoped, scopeReadQuery } from '@privateaim/server-kit';

const scope = await scopeReadQuery(query, actor, { names: ['node_read'], schema: nodeSchema });
const { data, meta } = await findManyScoped(repository, scope, actor);
```

- `scopeReadQuery` runs authup's `scopeReadQuery` (`@authup/access`), which pre-gates the read permissions (any of `names`, a missing grant throws) and lowers the caller's reach onto the
  query: unchanged for `allow`, the compiled condition AND-appended for `conditional`, matching nothing for `deny`. For `post` (a
  grant policy that does not lower) the query stays unnarrowed and `findManyScoped` decides each row by evaluation on one read,
  widening the projection for the check and trimming it again. `compile: false` skips the reach for global catalogs.
- `describeQuerySchema(schema, parameters?)` serializes a rapiq schema into the `SchemaDescription` controllers publish under
  `meta.schema`; pass `RECORD_QUERY_PARAMETERS` on single-record reads. See
  [query capability discovery](https://hub.docs.privateaim.net/guide/development/api.html#query-capability-discovery).
- `collectRootFilterValues(query)` flattens an `and` of `eq` filters into a `field -> value` map for the log endpoints and rejects
  any other operator, compound or repeated field with a 400.

`IEntityRepository<T>`, `ActorContext` and `AbstractEntityService` are the ports and base class the services' `core/` layers build on.

## Outbound HTTP timeouts

`HTTPClientTimeout` holds the request deadline in milliseconds per kind of peer:

| Key | Value | Used for |
|---|---|---|
| `AUTHUP` | 10 000 | Authup REST and OAuth2 token requests |
| `SERVICE` | 30 000 | Hub services (core, storage, telemetry) and GitHub |
| `HARBOR` | 60 000 | Harbor, which answers repository and artifact copies synchronously |
| `VICTORIA_LOGS` | 20 000 | VictoriaLogs ingest and query, shorter than `SERVICE` so telemetry answers 504 before its caller gives up |

The deadline covers dispatch and reading the response body, so a call that streams a body passes `timeout: 0`.

## API

| Area | Exports |
|---|---|
| Application | `BaseApplicationBuilder`, `startApplication`, `StartApplicationOptions` |
| Health | `Health`, `HealthInjectionKey`, `createDatabaseHealthCheck`, `runHealthChecks`, `createHealthShutdownHook`, `createHealthLogObserver`, `HEALTH_LIVENESS_PATH`, `HEALTH_READINESS_PATH` |
| Config | `ConfigInjectionKey`, `CONFIG_MODULE_NAME`, `BaseServerConfig`, `TrustProxy`, `canonicalizeTrustProxy`, `EnvironmentName` |
| Logger | `LoggerModule`, `LoggerInjectionKey`, `createLogger`, `Logger`, `LoggerConsoleTransport`, `LoggerMemoryTransport` |
| Message bus | `MessageBusModule`, `MessageBusInjectionKey`, `RemoteMessageBusInjectionKey`, `MESSAGE_BUS_TOPIC_EXCHANGE`, `MESSAGE_BUS_MAX_ATTEMPTS`, the four `create*LogHooks` factories |
| Redis | `RedisModule`, `RedisClientInjectionKey`, `RedisPublishClientInjectionKey`, `RedisSubscribeClientInjectionKey`, `createRedisClient`, `buildRedisKeyPath` |
| Cache | `TaggedCacheModule`, `TaggedCacheInjectionKey`, `createTaggedCache`, `throttle`, `TAGGED_CACHE_TTL`, `TAGGED_CACHE_CONNECT_TIMEOUT`, `TAGGED_CACHE_ERROR_LOG_INTERVAL` |
| Entity events | `EntityEventModule`, `EntityEventPublisher`, `EntityEventPublisherInjectionKey`, `EntityEventRedisHandler`, `EntityEventSocketHandler`, `buildEntityEventRedisChannel` |
| Authup | see [Authup](#authup) |
| Core | `IEntityRepository`, `ActorContext`, `AbstractEntityService`, `scopeReadQuery`, `findManyScoped`, `describeQuerySchema`, `RECORD_QUERY_PARAMETERS`, `collectRootFilterValues`, `widenReadProjection`, `trimReadProjection` |
| Misc | `HTTPClientTimeout`, `ObjectLiteral`, `hasOwnProperty` |

## Notes

- **Publishing to another service needs the remote bus.** Resolve `RemoteMessageBusInjectionKey` for a message only another
  service consumes. The always-registered bus falls back to the memory driver without AMQP and keeps such messages in the heap
  until `close()`.
- **`describeQuerySchema()` results are shared and deep-frozen.** Spread them (`meta: { ...meta, schema }`); assigning into one
  throws.
- **Exchange and cache names are part of the deployment.** `MESSAGE_BUS_TOPIC_EXCHANGE` and the tagged cache `prefix` select the
  exchange and the key namespace other replicas use; renaming one splits them.
- **A Redis outage degrades the cache, not the service.** Reads fall through to the database; another process's invalidation
  during the outage reaches this process only through the 60 s ttl.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
