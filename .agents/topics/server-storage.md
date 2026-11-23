# server-storage

Read before changing apps/server-storage.

## Architecture

File/object storage service, backed by MinIO/S3 or the local filesystem behind the
`IStorageAdapter` port (`core/storage/types.ts`).

**Adapters:**
- `BucketEntity` / `BucketFileEntity` — TypeORM entities in `adapters/database/entities/`
- `BucketSubscriber` / `BucketFileSubscriber` — pushed onto the `DataSource` by `DatabaseModule` after `initialize()` (no `@EventSubscriber()`)
- `BucketController` / `BucketFileController` — thin HTTP controllers with upload/stream endpoints
- `MinioStorageAdapter` / `FsStorageAdapter` — `adapters/storage/`

**Service-specific modules:**
- `StorageModule` — selects the backend from config and registers it under
  `StorageInjectionKey`. Controllers and components depend on the port, not on a
  MinIO client.
- `ComponentsModule` — starts the bucket + bucket-file consumers via `RemoteWorker` (hubwire)

## Directory layout

```
apps/server-storage/src/
├── core/
│   ├── capability/                # capability-token coverage of buckets and files
│   ├── entities/                  # bucket, bucket-file: ports, services, rapiq schemas
│   ├── query/
│   ├── storage/                   # IStorageAdapter port
│   └── utils/
├── adapters/
│   ├── database/                  # entities/, subscribers/, migrations/{mysql,postgres}
│   ├── http/controllers/          # bucket, bucket-file, root (`requester.ts` maps capability or actor)
│   └── storage/                   # minio.ts, fs.ts
├── app/
│   ├── modules/                   # DI modules; database/repositories/, http/dispatchers/
│   ├── components/                # bucket, bucket-file bus consumers
│   └── domains/bucket/
└── cli/                           # citty CLI
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource`, `BucketRepository`, `BucketFileRepository` |
| StorageModule | `storage` | `config` | `StorageInjectionKey` (`MinioStorageAdapter` or `FsStorageAdapter`) |
| ComponentsModule | `components` | `storage`, `database`, `messageBus` | nothing (starts bucket + bucket-file consumers, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `storage`, `messageBus`, `authupClient`? | `App`, `Server` |
