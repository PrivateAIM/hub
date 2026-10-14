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
| `subscriber` | Base subscriber class for entity lifecycle events |
| `transformer` | TypeORM value transformers: `dateToISOStringTransformer`, `bigintNumberTransformer`, `serializedTextTransformer` |

## Dependencies

- `@authup/kit` — Serialization helpers
- `@privateaim/kit` — Core utilities
- `@privateaim/server-kit` — Server foundation
- `typeorm` — ORM
- `typeorm-extension` — TypeORM helpers
