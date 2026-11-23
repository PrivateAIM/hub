<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-db-kit 🗄️</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-db-kit)](https://www.npmjs.com/package/@privateaim/server-db-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**TypeORM helpers for FLAME Hub services: UTC-pinned options, boot locks, a tagged read cache and event subscribers.**

You do not repeat the data source normalization, the migration lock, the cache invalidation or the entity-event subscriber in
each service. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Locks](#database-locks) · [Read cache](#read-cache) · [Subscribers](#entity-subscribers) · [Transformers](#value-transformers) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/shared/server-db-kit.html)

---

## Installation

```bash
npm install @privateaim/server-db-kit typeorm typeorm-extension
```

ESM only, Node.js `>=26.0.0`. `typeorm` and `typeorm-extension` are peer dependencies.

## Usage

```typescript
import { DataSource } from 'typeorm';
import { DataSourceOptionsBuilder } from '@privateaim/server-db-kit';

const builder = new DataSourceOptionsBuilder();
builder.setEntities([NodeEntity, ProjectEntity]);
builder.setMigrationDirectory('src/adapters/database/migrations');

// DB_TYPE, DB_HOST, DB_PORT, ... (typeorm-extension's env reader)
const dataSource = new DataSource(builder.buildWithEnv());
```

`buildWithEnv()` reads the options with typeorm-extension's `readDataSourceOptionsFromEnv()` and throws when there are none;
`buildWith(options)` normalizes options you pass. Either way:

- Only `mysql`, `postgres` and `better-sqlite3` are accepted; any other type throws.
- `logging` and TypeORM's own result cache (`cache`, env `DB_CACHE`) are always off. Use the [read cache](#read-cache) instead.
- `setEntities()` and `setSubscribers()` are appended to the entities and subscribers already in the options.
- For MySQL and PostgreSQL, migrations load from `<migrationDirectory>/<type>/*.{ts,js,mjs}` (default directory
  `src/database/migrations`, mapped from `src` to `dist` outside just-in-time transpilation) with `migrationsTransactionMode: 'each'`.
  better-sqlite3 gets no migrations.
- MySQL and PostgreSQL options are pinned to UTC with typeorm-extension's `pinTimezone(options, 'UTC')` (session timezone, reader
  and `Date` writer). A setting contradicting the pin throws an `OptionsError`.

## Database locks

```typescript
import { withDataSourceLock } from '@privateaim/server-db-kit';

await withDataSourceLock(dataSource, 'server-core:migration', () => dataSource.runMigrations());
```

- The callback runs while a named, session-scoped advisory lock is held on a dedicated query runner (typeorm-extension's
  `withDatabaseLock`), so replicas booting at once run it one at a time.
- The callback's own queries use other pooled connections, so the pool needs at least two.
- After `DATA_SOURCE_LOCK_TIMEOUT` (60 s, `timeout` option) it throws a `DatabaseLockError` rather than running unlocked.
- On `better-sqlite3` the callback runs unlocked and no query runner is created.

## Read cache

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

A tag-invalidated read cache over [`@rapiq/cache`](https://www.npmjs.com/package/@rapiq/cache). A stored value carries the tags its
query depends on (collection, scoped column value, record), and the `CacheInvalidationSubscriber` from `createSubscriber()` bumps
the tags of every written row after its transaction committed. The reader and the subscriber share the schema registry and one
scoped value spelling (`QUERY_CACHE_SCOPED_VALUE_NORMALIZER`, canonical lower-case uuids). `remember(key, tags, read, options?)`
caches a read whose tags you name yourself.

- Without a `cache` every read goes to the database and `createSubscriber()` returns `undefined`.
- A read whose manager (or, on `better-sqlite3`, the shared connection) has an open transaction bypasses the cache.
- A failed invalidation makes this process read past the cache for one `ttl` and moves its keys to a new generation. Other
  processes sharing the store are not reached.
- A hit is a plain copy of the stored value, never an entity instance.
- Raw SQL fires no subscriber, and a criteria `update` / `delete` bumps the collection tag only: such writes reach a cached value
  only through its ttl or a collection tag it carries.

`TaggedCacheModule` in [`@privateaim/server-kit`](https://www.npmjs.com/package/@privateaim/server-kit) provides the `cache`.

## Entity subscribers

```typescript
import { BaseSubscriber } from '@privateaim/server-db-kit';

const subscriber = new BaseSubscriber<NodeEntity>({
    refType: 'node',
    destinations: (data) => [{ channel: 'nodes' }, { channel: ['nodes', data.id] }],
    publisher,
});

dataSource.subscribers.push(subscriber);
```

- `BaseSubscriber` publishes a `created` event after insert, `updated` (with `dataPrevious`) after update and `deleted` before
  remove, through an `IEntityEventPublisher` (`safePublish`, so a failing publish does not fail the write). Without a publisher it
  does nothing; `setPublisher()` attaches one later.
- The event metadata is the query runner's `data`, i.e. the `{ data }` passed to `save()` / `remove()` (the audit trail).
- Columns declared `select: false` are removed from the event payload (on a copy, never on the live entity).

## Value transformers

| Transformer | Read | Write |
|---|---|---|
| `dateToISOStringTransformer` | `Date` becomes an ISO-8601 string | passes through |
| `bigintNumberTransformer` | string becomes a `number`, `null` for empty; throws above `Number.MAX_SAFE_INTEGER` | throws above `Number.MAX_SAFE_INTEGER` |
| `serializedTextTransformer` | `@authup/kit` `deserialize`, `null` for empty (also legacy `'null'` / `'undefined'` text) | `serialize`, but `null` / `undefined` become SQL `NULL` |

```typescript
import { Column } from 'typeorm';
import { dateToISOStringTransformer } from '@privateaim/server-db-kit';

class NodeEntity {
    @Column({ name: 'created_at', type: 'datetime', transformer: dateToISOStringTransformer })
    createdAt: string;
}
```

## API

| Export | Kind | Purpose |
|---|---|---|
| `DataSourceOptionsBuilder` | class | Normalized, UTC-pinned data source options |
| `withDataSourceLock`, `DATA_SOURCE_LOCK_TIMEOUT` | function, constant | Named advisory lock around boot passes |
| `QueryCache` (`IQueryCache`), `QUERY_CACHE_SCOPED_VALUE_NORMALIZER` | class, constant | Tag-invalidated read cache and its invalidation subscriber |
| `BaseSubscriber` | class | Entity subscriber publishing domain events |
| `dateToISOStringTransformer`, `bigintNumberTransformer`, `serializedTextTransformer` | constants | TypeORM value transformers |

## Notes

- **Lock names are a deployment contract.** A renamed lock is a different mutex: during a rolling upgrade the outgoing and the
  incoming replica would each hold their own.
- **Never allow-list a filter on a column behind `dateToISOStringTransformer`.** Transformers do not apply to WHERE binds, so the
  filter compares an ISO string against the driver's native format and silently matches wrong rows. Sorting on such a column is
  fine.
- **Writes outside the entity manager bypass the cache.** Write cached entities through `save` / `remove`; raw SQL and criteria
  updates are not seen by the record tags.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
