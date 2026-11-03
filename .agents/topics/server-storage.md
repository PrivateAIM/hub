# server-storage

Read before changing apps/server-storage.

## Architecture

File/object storage service, backed by MinIO/S3 or the local filesystem behind a
common `IStorageAdapter` port.

**Adapters:**
- `BucketEntity` / `BucketFileEntity` — TypeORM entities in `adapters/database/entities/`
- `BucketSubscriber` / `BucketFileSubscriber` — pre-instantiated in `DatabaseModule` (no `@EventSubscriber()`)
- `BucketController` / `BucketFileController` — thin HTTP controllers with upload/stream endpoints

**Service-specific modules:**
- `StorageModule` — selects the storage backend from config and registers it under
  `StorageInjectionKey` as an `IStorageAdapter` port: `MinioStorageAdapter` (MinIO/S3)
  or `FsStorageAdapter` (local filesystem). Controllers and components depend on the
  port, not on a MinIO client.
- `ComponentsModule` — resolves the storage adapter from the container, starts the
  bucket + bucket-file consumers via `RemoteWorker` (hubwire)

## Directory layout

```
apps/server-storage/src/
├── core/                          # Domain logic
│   └── utils/
│       └── stream-to-buffer.ts    # Stream utility
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # BucketEntity, BucketFileEntity
│   │   ├── subscribers/           # BucketSubscriber, BucketFileSubscriber
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   └── controllers/
│   │       ├── bucket/            # BucketController (CRUD + upload + stream)
│   │       └── bucket-file/       # BucketFileController (CRUD + stream)
│   └── storage/                   # IStorageAdapter impls: minio.ts, fs.ts
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerStorageApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, subscribers)
│   │   ├── http/                  # HTTPModule (router, controllers, server)
│   │   ├── storage/               # StorageModule (IStorageAdapter: minio | fs)
│   │   └── components/            # ComponentsModule (starts bucket consumers)
│   ├── components/                # AMQP task consumers (bucket, bucket-file)
│   └── domains/                   # Domain utility helpers
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource` |
| StorageModule | `storage` | `config` | `IStorageAdapter` (`MinioStorageAdapter` or `FsStorageAdapter`) |
| ComponentsModule | `components` | `storage`, `database` | nothing (starts bucket + bucket-file consumers, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `storage` | `Server`, `Router` |

The storage backend is a **port**, not a hard-wired MinIO client: `StorageModule`
picks `MinioStorageAdapter` or `FsStorageAdapter` from config and registers it under
`StorageInjectionKey`.
