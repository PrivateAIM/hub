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
| `DELETE` | `/buckets/:id` | Delete bucket |
| `GET` | `/bucket-files` | List files |
| `POST` | `/bucket-files` | Upload file |
| `GET` | `/bucket-files/:id/stream` | Stream file contents |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

## Architecture

- **BucketEntity** / **BucketFileEntity** — TypeORM entities tracking storage metadata
- **MinioModule** — creates and registers the S3 client in the DI container
- **BucketComponent** — AMQP consumer for asynchronous bucket operations
- **Subscribers** — publish domain events on bucket/file changes
