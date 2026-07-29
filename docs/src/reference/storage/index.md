# Storage (server-storage)

The Storage service manages file and object storage backed by MinIO (S3-compatible). It provides bucket and file CRUD operations with streaming support.

## Running

```bash
# Development
npm run dev --workspace=apps/server-storage

# CLI
npm run cli --workspace=apps/server-storage -- start

# Docker
docker run -e ... privateaim/hub storage cli start
```

## Dependencies

- **Database** — MySQL, PostgreSQL, or SQLite
- **Authup** — OAuth2 identity provider
- **MinIO** — S3-compatible object storage (**required**)
- **RabbitMQ** — AMQP message bus

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `MINIO_CONNECTION_STRING` | `http://admin:start123@127.0.0.1:9000` | MinIO connection (**required**) |

### Inherited

See [Shared Configuration](/reference/#shared-configuration) and [Database Configuration](/reference/#database-configuration).

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/buckets` | List buckets |
| `POST` | `/buckets` | Create bucket |
| `GET` | `/buckets/:id` | Get bucket |
| `POST` | `/buckets/:id` | Update bucket |
| `DELETE` | `/buckets/:id` | Delete bucket |
| `POST` | `/buckets/:id/upload` | Upload files into a bucket |
| `GET` | `/buckets/:id/stream` | Stream the bucket contents as a tar |
| `GET` | `/bucket-files` | List files |
| `GET` | `/bucket-files/:id` | Get file |
| `DELETE` | `/bucket-files/:id` | Delete file |
| `GET` | `/bucket-files/:id/stream` | Stream file contents |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

## Response Shapes

Every bucket and bucket-file endpoint answers with a `{ data, meta }` envelope — the record (or the
record array) under `data`. Query-capable `GET`s advertise the endpoint's queryable vocabulary at
`meta.schema`; mutations carry `meta: {}`.

Three surfaces stay outside the record envelope:

| Endpoint | Shape |
|----------|-------|
| `GET /` | `{ version, timestamp }` — service metadata, flat |
| `GET /buckets/:id/stream`, `GET /bucket-files/:id/stream` | flat binary streams with attachment headers |
| `POST /buckets/:id/upload` | a **collection** (`{ data: files, meta: { total } }`), because it uploads many files — no `schema` |

See [API Reference](/guide/development/api#response-shapes) for the full contract and the
`meta.schema` reading rules.

## Architecture

- **BucketEntity** / **BucketFileEntity** — TypeORM entities tracking storage metadata
- **MinioModule** — creates and registers the S3 client in the DI container
- **BucketComponent** — AMQP consumer for asynchronous bucket operations
- **Subscribers** — publish domain events on bucket/file changes
