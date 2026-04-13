# Architecture

## System Overview

```
                    ┌─────────────┐
                    │  client-ui  │  Nuxt 4 SSR
                    │  (browser)  │
                    └──────┬──────┘
                           │ HTTP / WebSocket
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ server-core │ │server-storage│ │server-telemetry│
    │  (REST API) │ │ (S3/MinIO)  │ │(VictoriaLogs)│
    └──────┬──────┘ └─────────────┘ └──────────────┘
           │
    ┌──────┴──────┐
    │    AMQP     │  RabbitMQ message bus
    └──────┬──────┘
           ▼
    ┌─────────────┐
    │server-worker│  Docker container execution
    └─────────────┘

External services: Authup (OAuth2), Redis (pub/sub + caching), MySQL/Postgres
```

## HTTP Layer — Routup

Services use **Routup** (a lightweight HTTP framework with decorator support). Route handlers follow a consistent pattern:

```typescript
// packages/server-core/src/components/<entity>/handlers/read.ts
import { DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse } from '@routup/decorators';

export async function handleAnalysisReadMany(req: Request, res: Response) {
    const query = useRequestQuery(req);           // Parse query params (rapiq)
    const dataSource = useDataSource();            // Get TypeORM DataSource
    const repository = dataSource.getRepository(AnalysisEntity);
    const { data, total } = await repository.findAndCount(query);
    return send(res, { data, meta: { total } });
}
```

Routes are registered in each component's `index.ts` and mounted on the Routup router.

## Data Layer — TypeORM

Entities are defined as TypeORM decorated classes in `packages/server-core/src/components/<entity>/entity.ts`:

```typescript
@Entity({ name: 'analyses' })
export class AnalysisEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    name: string | null;

    @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: ProjectEntity;
}
```

**Multi-database support**: MySQL, PostgreSQL, SQLite. The `DB_TYPE` env var selects the driver. Migrations are in `packages/server-core/src/components/**/migrations/` with separate files per database dialect.

## Domain Events & Messaging

Events flow through AMQP (RabbitMQ) via `amqp-extension`:

```typescript
// Publishing an event
import { publishMessage } from 'amqp-extension';

await publishMessage({
    type: 'analysisUpdated',
    data: { id: analysis.id, status: 'running' },
    metadata: { realmId },
});
```

TypeORM subscribers listen for entity lifecycle events and publish domain events:

```typescript
@EventSubscriber()
export class AnalysisSubscriber implements EntitySubscriberInterface<AnalysisEntity> {
    afterInsert(event: InsertEvent<AnalysisEntity>) {
        // Publish to AMQP
    }
}
```

## Authentication — Authup

All services integrate with **Authup** (OAuth2 identity provider):

- `@authup/server-adapter` middleware validates tokens on incoming requests
- `@authup/access` handles per-realm permission checks
- The client-ui uses `@authup/client-web-nuxt` for session management

Requests carry an OAuth2 bearer token. The middleware resolves the user/robot identity and attaches it to the request context.

## Real-Time Communication

Socket.io with Redis adapter for cross-instance pub/sub:

- `server-messenger` hosts the Socket.io server
- `core-realtime-kit` defines typed event names and payloads
- `server-realtime-kit` provides helpers for emitting events from services

## Key Domain Entities

| Entity              | Purpose                                          |
|---------------------|--------------------------------------------------|
| `Analysis`          | A distributed computation task                   |
| `AnalysisBucket`    | File storage container for an analysis           |
| `Project`           | User project grouping nodes and analyses         |
| `ProjectNode`       | A compute node assigned to a project             |
| `Node`              | Global registry of available compute nodes       |
| `MasterImage`       | Base Docker images available for worker tasks    |
| `Registry`          | Docker registry configuration                   |
| `RegistryProject`   | Project within a Docker registry                 |

## Configuration

Environment-based via `dotenv` + `envix`. Key env vars:

| Variable        | Purpose                           |
|-----------------|-----------------------------------|
| `DB_TYPE`       | `mysql`, `postgres`, `better-sqlite3` |
| `DB_HOST/PORT`  | Database connection               |
| `AUTHUP_URL`    | Authup identity provider URL      |
| `REDIS_URL`     | Redis for pub/sub and caching     |
| `AMQP_URL`      | RabbitMQ connection               |
| `MINIO_*`       | MinIO/S3 storage credentials      |
