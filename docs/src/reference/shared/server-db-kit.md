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

### Entity Subscribers

```typescript
import { EntitySubscriber } from '@privateaim/server-db-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `data-source` | Data source options builder and TypeORM configuration |
| `subscriber` | Base subscriber class for entity lifecycle events |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@privateaim/server-kit` — Server foundation
- `typeorm` — ORM
- `typeorm-extension` — TypeORM helpers
