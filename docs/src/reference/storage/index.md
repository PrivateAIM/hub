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
| `POST` | `/buckets` | Create bucket (no `refId`, see below) |
| `GET` | `/buckets/:id` | Get bucket |
| `POST` | `/buckets/:id` | Update bucket |
| `DELETE` | `/buckets/:id` | Delete bucket |
| `POST` | `/buckets/:id/clear` | Empty a bucket — remove every file, keep the bucket |
| `POST` | `/buckets/:id/upload` | Upload files into a bucket |
| `GET` | `/buckets/:id/stream` | Stream the bucket contents as a tar |
| `GET` | `/bucket-files` | List files |
| `GET` | `/bucket-files/:id` | Get file |
| `DELETE` | `/bucket-files/:id` | Delete file |
| `GET` | `/bucket-files/:id/stream` | Stream file contents |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

A bucket with a `refType` **and** `refId` is unique per `(refType, refId, name)`. Only the service
owning the referenced resource sets a `refId`, through the `create` bus command; `POST /buckets` with
a `refId` answers 400, since storage cannot check who owns the referenced resource. A repeated bus
create of a triple that already exists in the same realm answers with the existing bucket instead of
a second one; the same triple in another realm fails. Buckets without a ref are not deduplicated: they
may share a name.

A bucket records its creator (`actorId`/`actorType`): for `POST /buckets` the authenticated identity
(an actor in the body is ignored), for a bus create the actor named in the command. The creator may
update, clear and delete the bucket, and delete its files, without `bucket_update`/`bucket_delete`;
everyone else needs the permission and realm access. Buckets created before this was fixed carry no
actor and are not backfilled, so only permission holders can manage them.

Uploading (`POST /buckets/:id/upload`) into a bucket **without** a `refId` requires being its creator,
or `bucket_update` with realm access; anyone else gets 403 before a file is stored. A bucket **with**
a `refId` (e.g. an analysis bucket) accepts uploads from any authenticated caller, because its
legitimate uploaders span realms and storage cannot evaluate the referencing service's permissions:
the owning service checks each upload when it registers it (see
[Writing analysis buckets and files](/guide/deployment/configuration#writing-analysis-buckets-and-files-requires-analysis-update)).

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
- **BucketComponent** — AMQP consumer for asynchronous bucket operations: `create`, `delete` and
  `clear` (removes every object and bucket-file row but keeps the bucket, emitting
  `clearingStarted` / `clearingFinished` / `clearingFailed`)
- **Subscribers** — publish domain events on bucket/file changes
