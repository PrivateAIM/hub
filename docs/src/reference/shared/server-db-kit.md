# @privateaim/server-db-kit

TypeORM database utilities including data source configuration, subscriber helpers, and migration support.

## Installation

```bash
npm install @privateaim/server-db-kit
```

## Usage

### Data Source Setup

```typescript
import { createDataSourceOptions } from '@privateaim/server-db-kit';

const options = createDataSourceOptions({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'hub',
});
```

Every option set the builder produces for MySQL or PostgreSQL is pinned to UTC
with typeorm-extension's `pinTimezone(options, 'UTC')` (session timezone, reader
and `Date` writer); a setting contradicting the pin throws an `OptionsError`.
TypeORM's own query result cache is always off (`cache: false`, whatever
`DB_CACHE` says): use the read cache below instead.

### Database Locks

```typescript
import { withDataSourceLock } from '@privateaim/server-db-kit';

await withDataSourceLock(dataSource, 'server-core:migration', () => synchronizeDatabaseSchema(dataSource));
```

Runs the callback while holding a named, session-scoped advisory lock on a
dedicated query runner (typeorm-extension's `withDatabaseLock`), so concurrent
replicas run it one at a time. It throws a `DatabaseLockError` after 60 s
(`timeout` option) rather than running unlocked. On `better-sqlite3` the callback
runs unlocked and no query runner is created. Keep lock names stable across
releases: a renamed lock is a different mutex.

### Read Cache

```typescript
import { QueryCache } from '@privateaim/server-db-kit';
import { defineQuery } from '@rapiq/core';

const queryCache = new QueryCache({ dataSource, registry, ttl: 60_000, cache: taggedCache });

// after every dataSource.initialize(), which rebuilds the subscribers array
const subscriber = queryCache.createSubscriber({ resolveSchemaName, onError });
if (subscriber) dataSource.subscribers.push(subscriber);

const node = await queryCache.rememberQuery({
    key: `node/clientBinding?${JSON.stringify([clientId, realmId])}`,
    query: defineQuery({ filters: { clientId, realmId } }),
    schema: 'node',
    caseSensitive: ['clientId'],
}, () => repository.findOne({ where: { clientId, realmId } }), { manager: repository.manager });
```

A tag-invalidated read cache over [`@rapiq/cache`](https://www.npmjs.com/package/@rapiq/cache).
A stored value carries the tags its query depends on (collection, scoped column value, record),
and the `CacheInvalidationSubscriber` from `createSubscriber()` bumps the tags of every written
row after its transaction committed. The reader and the subscriber share the schema registry and
one scoped value spelling (`QUERY_CACHE_SCOPED_VALUE_NORMALIZER`, canonical lower-case uuids).

- Without a `cache` every read goes to the database and `createSubscriber()` returns `undefined`.
- A read whose manager (or, on `better-sqlite3`, the shared connection) has an open transaction
  bypasses the cache.
- A failed invalidation makes the process read past the cache for one `ttl`.
- A hit is a plain copy of the stored value, never an entity instance.
- Raw SQL fires no subscriber, and a criteria `update` / `delete` bumps the collection tag only:
  such writes reach a cached value only through its ttl or a collection tag it carries.

### Entity Subscribers

```typescript
import { EntitySubscriber } from '@privateaim/server-db-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `data-source` | Data source options builder and TypeORM configuration (pinned to UTC) |
| `lock` | `withDataSourceLock` — named advisory lock around boot passes |
| `query-cache` | `QueryCache` (`IQueryCache`) — tag-invalidated read cache and its invalidation subscriber; `QUERY_CACHE_SCOPED_VALUE_NORMALIZER` |
| `subscriber` | Base subscriber class for entity lifecycle events |
| `transformer` | TypeORM value transformers: `dateToISOStringTransformer`, `bigintNumberTransformer`, `serializedTextTransformer` |

## Dependencies

- `@authup/kit` — Serialization helpers
- `@privateaim/kit` — Core utilities
- `@privateaim/server-kit` — Server foundation
- `@rapiq/cache` — Tag-invalidated result cache
- `@rapiq/core` — Schema registry and query representation
- `typeorm` — ORM
- `typeorm-extension` — TypeORM helpers
