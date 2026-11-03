# Database

Read before changing an entity, a column, a migration, timestamps or a boot lock.

## Database Migrations

Migrations live in `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/`.
SQLite never runs them: the options builder wires `migrations: []` for `better-sqlite3`,
so boot and the test suites `synchronize()` from the entity classes. Adopted from authup
([authup-conventions.md](../references/authup-conventions.md#database-migrations)).

- **One named migration per feature**, in **both** dialects, with a descriptive name and
  a doc-comment header explaining *why*.
- **Nothing a migration does may be invisible from its name.** A bundled file must name
  every change in its file name and doc comment
  (`1784000000000-RegistryFkSetNullAndRenameAnalysis.ts`). A rename never hides behind an
  unrelated name: a hidden `analysis_entity` → `analysis` rename misled every later
  migration.
- **A `RENAME TABLE` must re-derive every constraint name on the table** (or let
  `migration generate` write the DDL). typeorm hashes index/FK names from table + column
  names, but a rename keeps the old strings, so schema and metadata silently disagree and
  every `migration generate` and the drift gate report spurious drop/recreates (#1823,
  repaired by `1788400000000-AlignAnalysesConstraintNames`).
- **Consolidation is optional and happens at release time**, not merge time: squash a
  window into one file per dialect, keeping the earliest timestamp. Anyone who ran the
  pre-squash files drops their dev DB or fixes its `migrations` table by hand.
- **Released migrations are immutable.** Amend freely only on the unmerged branch. Check
  the release tags before touching an existing file; a merged-but-unreleased one changes
  only via release-time consolidation.
- **Verify with the round-trip** (`run` → `revert` × N → `run`) on MySQL and PostgreSQL
  ([Migration Tests](#migration-tests)). MySQL DDL is not transactional: fix a broken
  `up()` against a fresh database.
- **FK delete rules**: cascade only when the child cannot exist without the parent
  (`registry_projects.registry_id`). A child that merely points at the parent uses
  `ON DELETE SET NULL` (`nodes.registry_id`, `nodes.registry_project_id`,
  `analyses.registry_id`).

#### UTC Timestamps & Boot Locks

`DataSourceOptionsBuilder` (`server-db-kit`) ends with typeorm-extension's
`pinTimezone(options, 'UTC')`, so boot, the `migration` CLI and the test apps stamp, read
and bind the zone-less `created_at`/`updated_at` columns in UTC (#1900). Never build a
production `DataSource` from options that bypass the builder. A conflicting setting
(non-UTC mysql `timezone`, `dateStrings`, `typeCast`, a postgres `TimeZone`) throws an
`OptionsError` at boot by design. Rejected: pinning only the read side, because it shifts
every value on a local-time database. Operator notes:
[configuration.md](../../docs/src/guide/deployment/configuration.md#timestamps-are-stamped-and-read-in-utc).

A pass that must not run twice at once goes through `withDataSourceLock(dataSource, name, fn)`
(server-db-kit, 60 s timeout, then fails instead of running unlocked):

- each `DatabaseModule`'s boot migration and the CLI `run`/`revert`:
  `MIGRATION_DATABASE_LOCK` (`'server-<x>:migration'`, in each service's
  `app/modules/database/constants.ts`);
- server-core's Harbor setup (find-then-insert on the `default` registry):
  `HARBOR_SETUP_DATABASE_LOCK` (`app/modules/harbor/constants.ts`);
- server-core's node-client sync and registry migration/cleanup
  (`server-core:registry-migration:<registryId>`).

The helper checks for `better-sqlite3` **before** creating a query runner: that driver
shares ONE runner, so releasing it would pull it from under other users. Do not
"simplify" this to `strict: false`. Lock names are a deployment contract: a renamed lock
is a different mutex, so old and new replicas would not wait for each other during a
rolling upgrade.

#### Table Naming

Table names are **plural** snake_case (`nodes`, `registry_projects`, `analyses`,
`analysis_buckets`), set explicitly with `@Entity({ name: 'analyses' })`. There is no
naming strategy.

#### Column Naming

**snake_case survives in exactly two places: physical column names and migration
files.** Everything else (entity properties, domain types, validator mounts, rapiq
allow-lists, request/response fields) is camelCase (#1501; consumer guide:
[migration-camelcase.md](../../docs/src/guide/development/migration-camelcase.md)).
Every camelCase property therefore carries an explicit column name:

```typescript
@Column({ name: 'display_name', type: 'varchar', length: 256, nullable: true })
displayName: string | null;

// A scalar FK and its relation name the SAME physical column.
@Column({ name: 'registry_id', nullable: true })
registryId: Registry['id'] | null;

@ManyToOne(() => RegistryEntity, { onDelete: 'SET NULL', nullable: true })
@JoinColumn({ name: 'registry_id' })
registry: RegistryEntity | null;
```

- Single-word properties (`name`, `description`) need no `name:`.
- **No `SnakeNamingStrategy`.** A `snakeCase()` edge case would mismap a future column
  invisibly: the `synchronize()`-based suites write and read through the same metadata,
  so only production diverges from the frozen migration column.
- `@Unique([...])` / `@Index([...])` take camelCase **property** names. TypeORM derives
  generated constraint names from `column.databaseName`, so this needs no DDL. An
  *explicitly* named constraint keeps its frozen snake_case string; never "fix" it.
- Alias-qualified query-builder strings are property paths (`'registry.accountSecret'`).

Two guards enforce this:

| Guard | Catches |
|---|---|
| `apps/<service>/test/unit/adapters/database/column-naming.spec.ts` (`collectColumnNamingViolations`) | a forgotten `@Column({ name })`: a column name with an uppercase letter or not equal to `snakeCase(property)` |
| `apps/<service>/test/unit/core/query/schema-entity-parity.spec.ts` | an allow-list key with no entity column and a declared `indexes` sequence no entity index backs (rapiq's `assertSchemaMatchesEntity`); an allow-listed filter/sort key that leads no declared sequence (`collectNonLeadingQueryKeys`); a schema missing from `entitySchemas` |

Both build a `DataSource` from the **production** `DataSourceOptionsBuilder` on in-memory
sqlite (`toMetadataOnlyDataSourceOptions`, server-test-kit), so the entity list cannot
drift. The column guard skips a relation-owned column **only** when its `propertyName`
IS the relation (a `@JoinColumn` with no scalar FK); skipping on `relationMetadata` alone
would exempt every FK column, letting a consistent typo (`registryid` in both decorators)
pass.

Every entity schema declares `indexes`: **query-surface-only** property-name sequences,
each a leftmost prefix of a real PK/unique/`@Index`, with `filters: { indexed: true }`
(anchor mode) and `sorts: { indexed: true }` (#1842). A key that leads no sequence makes
enforcement reject (filters, 400) or silently drop (sorts) a query the allow-list
advertises. **Adding a key to `filters.allowed` / `sorts.allowed` requires a backing
entity index in the same change, plus its migration when the index is new.**

**Never allow-list a filter on a column behind `dateToISOStringTransformer`.**
Transformers apply on read, never to WHERE binds, so the filter compares an ISO string
against the driver's native format and matches wrong rows silently. Sorting on such a
column is fine.

**Every validator extends `TypedContainer<T>` from `@privateaim/kit`, never
`Container<T>`.** validup's `mount` accepts `Path<T> | (string & {})`, so a stale key
compiles, stops validating, and the field is dropped from the write with a `200`.
`TypedContainer` re-types `mount` via `declare` (no runtime code) to drop the
`(string & {})` arm; `Path<T>` still admits nested/wildcard forms and genuinely
snake_case `T` keys (the Harbor webhook validator). The narrowing is a type test,
`packages/kit/test/types/typed-container.test-d.ts` (vitest typecheck mode), because
`tsconfig.build.json` checks `src/**` only. It stays until validup drops the arm upstream.

#### Naming exceptions

These stay snake_case and must not be swept into a rename:

- `PermissionName` values (`analysis_create`, …), persisted in Authup.
- OAuth2 / OIDC parameters (`client_id`, `redirect_uri`, `code_verifier`, authup's
  `AuthorizationRequest`).
- Token introspection payloads (`OAuth2TokenPermission` / `TokenVerificationData`:
  `realm_id`, `sub_kind`, …).
- Third-party payloads: `@hapic/harbor`'s `project_id`, dockerode, MinIO, VictoriaLogs
  query syntax.
- Environment variables.

## Migration Tests

The `test` CI job builds its schema with `dataSource.synchronize()`, so it never runs a
migration. The `tests-migrations` job runs the migration CLI for server-core,
server-storage, server-telemetry and server-messenger against fresh MySQL and Postgres:

1. `migration run`
2. `migration revert` × N (every `down()`)
3. `migration run` (idempotency)
4. `npm run test:schema-drift`

It does **not** catch data-correctness bugs in `UPDATE`/`INSERT` migrations on existing
rows; smoke-test those against a populated database.

The drift step exists because the migration chain and the entities are two independent
descriptions of one schema that nothing else compares (#1823).
`scripts/assert-schema-drift.mjs` wraps typeorm-extension's `assertSchemaMatchesMetadata`
with `skipWithoutMigrations: true` (sqlite has none) and rethrows anything but a
`SchemaDriftError`, so an unreachable database is not reported as drift.

Rejected: porting authup's populated round-trip (`verify-latest-migration.mjs`). It boots
the real app to seed, and the job has databases only (no Authup); open follow-up.

The job first checks that compiled migrations exist under
`apps/<service>/dist/adapters/database/migrations/<db>/`: run from the wrong directory,
typeorm reports "No migrations are pending" and exits 0.

Locally (the CLI creates the database if missing):

```bash
docker compose up -d mysql           # or postgres
cd apps/server-core                  # or server-storage / server-telemetry / server-messenger

export DB_TYPE=mysql DB_HOST=127.0.0.1 DB_PORT=3306 \
       DB_USERNAME=root DB_PASSWORD=start123 DB_DATABASE=app
# postgres: DB_TYPE=postgres DB_PORT=5432 DB_USERNAME=postgres

node dist/cli/index.mjs migration run
node dist/cli/index.mjs migration revert    # once per migration
node dist/cli/index.mjs migration run
npm run test:schema-drift
```

## UTC & Lock Specs (server-telemetry)

`apps/server-telemetry/test/unit/adapters/database/timestamp-timezone.spec.ts` and
`database-lock.spec.ts` guard the UTC pin and `withDataSourceLock` against a real server
(skipped on sqlite). The timezone spec sets the Node zone to a fixed offset
(`Etc/GMT+9`); a DST zone makes the assertion seasonal. On mysql it changes the
server-wide `time_zone`, so every suite on that server must build options through the
builder.

## camelCase entity properties, domain types & HTTP API

See [Column Naming](#column-naming) and [Naming exceptions](#naming-exceptions) (#1501).
Telemetry log labels are camelCase too (`refType`).

## typeorm-extension 4.2.0 adoption (#1900, port of authup #3652)

See [UTC Timestamps & Boot Locks](#utc-timestamps--boot-locks).
