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

## Capability Tokens

Besides a login, server-storage accepts an Authup **capability token** (`kind: capability_token`,
audience `storage`) minted by server-core through
[`POST /analyses/:id/storage-tokens`](/reference/core/#storage-capability-tokens). It is verified
locally (signature against Authup's `/jwks`, `aud`, `kind`, `exp`) and grants only the actions on the
resources in its `cap` claim. A capability request carries no identity: every route not listed below
answers it 401.

| Where | Routes |
|-------|--------|
| `Authorization: Bearer` header | `GET /buckets`, `GET /buckets/:id`, `POST /buckets/:id/upload`, `GET /bucket-files`, `GET /bucket-files/:id`, `DELETE /bucket-files/:id` |
| `?dt=<token>` query parameter | `GET /buckets/:id/stream`, `GET /bucket-files/:id/stream` only, and only for a token living at most 60 s (`exp - iat`) |

Bucket create, update, delete and clear are login only. A token in the query is never accepted on any
other route, and a query token that lives longer than 60 s is refused (401). Only one `dt` is allowed.

`cap` entries are `type:id:actions`:

| Entry | Covers |
|-------|--------|
| `bucket:<id>:read` | The bucket, its tar stream and every file in it |
| `bucket:<id>:write` | Uploads into the bucket |
| `bucket:<id>:delete` | Deleting files of the bucket |
| `bucket-file:<id>:read` / `:delete` | That one file only |

Listings are narrowed to the covered buckets and files: a filter on another bucket returns nothing.
Stream responses send `Referrer-Policy: no-referrer` so a token in the URL does not leak, and the
query string is never logged. Login requests behave as before; server-core remains the authority on
who may upload (it judges each file when it registers it).

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
