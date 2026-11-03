# Database

Read before changing an entity, a column, a migration, timestamps or a boot lock.

## Database Migrations

Migrations live in `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/`.
SQLite never runs them — the options builder wires `migrations: []` for
`better-sqlite3`, so boot (and the test suite) falls back to `dataSource.synchronize()`
from the entity classes.

Adopted from authup — see [authup-conventions.md](../references/authup-conventions.md#database-migrations).

- **One named migration per feature.** Each feature/PR adds its migration in
  **both** dialects, with a descriptive class/file name and a doc-comment header
  explaining *why* the change is being made.
- **Nothing a migration does may be invisible from its name.** Bundling several
  changes into one file is allowed, but then the file name and the doc comment
  must name *every* one of them (e.g.
  `1784000000000-RegistryFkSetNullAndRenameAnalysis.ts`). The failure mode this
  prevents is real: `AddDisplayName1780300000000` silently renamed
  `analysis_entity` → `analysis`, and that hidden rename has since misled every
  later migration that referenced the table by its old name. A rename in
  particular must never hide behind an unrelated migration name.
- **A `RENAME TABLE` must re-derive every constraint name on the table** (or let
  `migration generate` write the DDL). typeorm hashes auto-generated index/FK
  names from table + column names, but a rename carries the old name strings
  over, so the live schema and the entity metadata silently disagree — every
  later `migration generate` opens with spurious drop/recreates, and the drift
  gate reports the same noise. The two `analyses` renames left seven
  `analysis_entity`-derived hashes behind, repaired by
  `1788400000000-AlignAnalysesConstraintNames` (#1823).
- **Consolidation happens at release time, not merge time.** A release window's
  migrations may be squashed into one file per dialect as a deliberate last step
  before the release PR merges (keeping the earliest timestamp so ordering against
  the released chain holds) — but this is optional; shipping several named
  migrations in one release is fine. Anyone who executed the pre-squash files must
  drop their dev DB (the CLI re-creates it) or fix its `migrations` table by hand.
- **Released migrations are immutable.** Amend freely while the migration lives only
  on its own unmerged branch; once it ships in a release, never touch it. Before
  touching an existing migration, verify against the release tags / last
  release-PR merge that it has not shipped — folding a change into an
  already-released file is the failure mode this rule exists to prevent. A
  merged-but-unreleased migration may still be recreated, but only via the
  release-time consolidation path above.
- **Always verify with the round-trip** — `migration run` → `revert` × N → `run`,
  against both MySQL and PostgreSQL. See [testing.md](#migration-tests).
  Note that MySQL DDL is not transactional: a migration that fails halfway leaves
  the schema partially altered, so a broken `up()` must be fixed against a fresh
  database.
- **The drift gate closes what the round-trip cannot see.** Every server app
  ships `scripts/assert-schema-drift.mjs` (`npm run test:schema-drift`): after
  `migration run`, it asserts the migrated schema matches the entity metadata
  via typeorm-extension's `assertSchemaMatchesMetadata`
  (`skipWithoutMigrations: true`, so the sqlite leg skips; anything but a
  `SchemaDriftError` is rethrown — an unreachable database is not drift). The
  `tests-migrations` CI job runs it after the idempotency replay.
- **FK delete rules**: cascade only when the child genuinely cannot exist without
  the parent (`registry_projects.registry_id`). When the child is an independent
  resource that merely *points at* the parent, use `ON DELETE SET NULL` so deleting
  the parent detaches instead of destroying — `nodes.registry_id`,
  `nodes.registry_project_id` and `analyses.registry_id` all had to be corrected
  from cascade to set-null for this reason.

#### UTC Timestamps & Boot Locks

`DataSourceOptionsBuilder` (`server-db-kit`) ends with typeorm-extension's
`pinTimezone(options, 'UTC')`, so every path that builds options — boot, the
`migration` CLI, the test apps — pins the session timezone, the reader and the
`Date` writer (#1900). Never build a production `DataSource` from options that
bypass the builder, or the zone-less `created_at`/`updated_at` columns are
stamped and read in different zones again. A conflicting setting (non-UTC mysql
`timezone`, `dateStrings`, `typeCast`, a postgres `TimeZone`) throws an
`OptionsError` at boot by design; pinning only the read side was rejected
upstream because it shifts every value on a local-time database.

Every boot pass that must not run twice at once goes through
`withDataSourceLock(dataSource, name, fn)`: each `DatabaseModule`'s migration
run and the matching CLI `run`/`revert` hold `MIGRATION_DATABASE_LOCK`
(`'server-<x>:migration'`, in each service's `app/modules/database/constants.ts`),
and server-core's Harbor setup holds `HARBOR_SETUP_DATABASE_LOCK` (it is
find-then-insert on the `default` registry). The helper checks for
`better-sqlite3` **before** creating a query runner — that driver hands out ONE
shared runner, so releasing it would pull it from under whatever else uses it;
do not "simplify" this to `strict: false`. Lock names are part of the
deployment contract: a renamed lock is a different mutex, so an outgoing and an
incoming replica would not wait for each other during a rolling upgrade.

#### Table Naming

Table names are **plural** and snake_case: `nodes`, `projects`, `registries`,
`registry_projects`, `master_images`, `analyses`, `analysis_nodes`, `analysis_buckets`.
Set them explicitly with `@Entity({ name: 'analyses' })` — there is no naming strategy.

#### Column Naming

**snake_case survives in exactly two places: physical column names, and
migration files.** Everything else — entity properties, domain types, validator
mounts, rapiq allow-lists, request/response fields — is camelCase (#1501).

Every camelCase property therefore carries an explicit column name:

```typescript
@Column({ name: 'display_name', type: 'varchar', length: 256, nullable: true })
displayName: string | null;

@CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
createdAt: string;

// A scalar FK and its relation name the SAME physical column.
@Column({ name: 'registry_id', nullable: true })
registryId: Registry['id'] | null;

@ManyToOne(() => RegistryEntity, { onDelete: 'SET NULL', nullable: true })
@JoinColumn({ name: 'registry_id' })
registry: RegistryEntity | null;
```

- Single-word properties (`name`, `nodes`, `description`) need no `name:` — the
  derived name already equals the property.
- **No `SnakeNamingStrategy`.** A global strategy is one point of failure, and a
  `snakeCase()` edge case would mismap a future column *invisibly*: the
  `synchronize()`-based suites build their schema from the same metadata they
  read through, so write and read stay self-consistent and only production
  diverges from the frozen migration column.
- `@Unique([...])` / `@Index([...])` take **property** names, so they are
  camelCase. This needs no DDL migration: TypeORM derives auto-generated
  constraint and index names from the table plus `column.databaseName`, not from
  property names. An *explicitly* named constraint keeps its frozen snake_case
  name string forever — never "fix" it to match.
- Query-builder strings that are **alias-qualified** are property paths and
  follow the property (`'registry.accountSecret'`); TypeORM resolves them through
  entity metadata.

Two guards enforce this, and both are in CI via the ordinary spec globs:

| Guard | Catches |
|---|---|
| `apps/<service>/test/unit/adapters/database/column-naming.spec.ts` | a forgotten `@Column({ name })` — asserts no column name has an uppercase letter and that each equals `snakeCase(property)` |
| `apps/<service>/test/unit/core/query/schema-entity-parity.spec.ts` | a rapiq allow-list key that resolves against no entity column, plus a declared `indexes` sequence no entity index backs, via rapiq's `assertSchemaMatchesEntity`; an allow-listed filter/sort key that leads no declared sequence, via `collectNonLeadingQueryKeys` (`@privateaim/server-test-kit`); plus a coverage assertion against `entitySchemas` so a schema added later cannot go unguarded |

Both build a `DataSource` from the **production** `DataSourceOptionsBuilder` with
an in-memory sqlite driver (`toMetadataOnlyDataSourceOptions` in
`@privateaim/server-test-kit`), so the entity list cannot drift from production.
The `DataSource` itself needs no external database — the enclosing service suite
still provisions one through its `globalSetup`.

The column guard skips a relation-owned column **only** when its `propertyName`
IS the relation — a `@JoinColumn` with no paired scalar FK. Skipping on
`relationMetadata` alone would exempt every FK column, so a consistently applied
typo (`@Column({ name: 'registryid' })` plus a matching `@JoinColumn`) would pass
both the guard and the `synchronize()`-based suites.

Since #1842 every entity schema also declares `indexes` — **query-surface-only**
property-name sequences, each a leftmost prefix of a real PK/unique/`@Index` —
and opts into rapiq's indexed policies (`filters: { indexed: true }`, anchor
mode, plus `sorts: { indexed: true }`). The parity spec pins the invariant from
both sides: `assertSchemaMatchesEntity` rejects a declared sequence no entity
index backs, and `collectNonLeadingQueryKeys` rejects an allow-listed
filter/sort key that leads no declared sequence — a key that leads nothing makes
enforcement reject (filters, a hard 400) or drop (sorts, silently unsorted) a
query the allow-lists themselves advertise. **Adding a key to any
`filters.allowed` / `sorts.allowed` therefore requires the backing entity index
and its migration in the same change** — the parity spec fails otherwise.

Never allow-list a filter on a column behind `dateToISOStringTransformer` — the
timestamp-filter trap. Transformers apply on read, never to WHERE binds, so such
a filter compares an ISO string against the driver's native storage format and
matches wrong rows *silently*. This is why the telemetry event schema's
`createdAt`/`updatedAt` filters were removed; sorting on them is fine (no bind
involved).

validup `mount()` keys are guarded by the compiler, not by a spec. `Container`'s
`mount` signature is `Path<T> | (string & {})`, so any string compiles and a stale
key silently stops validating that field — the value is then dropped from the
write, and the request still returns `200`. **Every validator therefore extends
`TypedContainer<T>` from `@privateaim/kit`, never `Container<T>` directly**; it
re-types `mount` to `ITypedContainer<T, C>['mount']`, which is validup's own
overload set minus that second arm. `declare` makes this a pure type-level
narrowing — the emitted class body is empty.

`Path<T>` still admits the nested and wildcard forms (`registry.accountSecret`,
`registry.*`), and a container whose `T` genuinely has snake_case properties keeps
its keys — which is why the Harbor webhook validator is unaffected.

The narrowing itself is covered by `packages/kit/test/types/typed-container.test-d.ts`,
run through vitest's typecheck mode (`typecheck.enabled` in that package's
`vitest.config.ts`). It has to be a **type test**: every `tsconfig.build.json`
includes `src/**` only, so a `@ts-expect-error` in an ordinary spec would be
checked by nothing in CI.

The proper fix belongs upstream in validup; `TypedContainer` stands until the
`(string & {})` arm is gone.

#### Naming exceptions

These stay snake_case and must not be swept into a rename:

- `PermissionName` values (`analysis_create`, …) — persisted in Authup's
  database; authup keeps its own values snake_case too.
- OAuth2 / OIDC parameters — `client_id`, `client_secret`, `grant_type`,
  `redirect_uri`, `code_verifier`, and authup's `AuthorizationRequest`.
- Token introspection payloads — `OAuth2TokenPermission` / `TokenVerificationData`
  (`realm_id`, `sub_kind`, …) are the wire shape hub consumes, not owns.
- Third-party payloads — `@hapic/harbor`'s `project_id`, dockerode, MinIO,
  VictoriaLogs query syntax.
- Environment variables.

## Migration Tests

The `test` CI job runs the integration suite against MySQL, Postgres, and SQLite, but the schema is built via `dataSource.synchronize()` (see `apps/<service>/test/app/database.ts`) — migration files in `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/` are **not** exercised by that suite.

A separate `tests-migrations` CI job runs the migration CLI end-to-end for `server-core`, `server-storage`, `server-telemetry`, and `server-messenger` against a fresh MySQL and Postgres container:

1. `migration run` — applies all migrations forward
2. `migration revert` × N — undoes every migration in reverse order (verifies every `down()` works)
3. `migration run` — re-applies the full chain (verifies idempotency)
4. `npm run test:schema-drift` — asserts the migrated schema matches the entity metadata

This catches SQL syntax errors, cross-DB type mismatches, and `down()` regressions across every migration. It does **not** catch data-correctness bugs in `UPDATE`/`INSERT` migrations against pre-existing rows — those still require manual smoke-testing against a populated database.

The drift step (4) exists because the migration chain and the entity classes are two
**independent** descriptions of the same schema, and nothing else compares them: the
round-trip exercises only the chain, while the integration suites `synchronize()` from
the entities — so a migration that writes something the entities do not describe (or an
entity change with no migration) passed every gate and surfaced only as
`migration generate` noise (issue #1823: the `analyses` table carried
`analysis_entity`-derived constraint names through two table renames).
`scripts/assert-schema-drift.mjs` (all four server apps) wraps typeorm-extension's
`assertSchemaMatchesMetadata` with `skipWithoutMigrations: true` — sqlite carries no
migrations, so there are never two descriptions to compare — and rethrows anything that
is not a `SchemaDriftError`, so an unreachable database is not reported as drift.

authup's populated round-trip (`verify-latest-migration.mjs`) was deliberately **not**
ported. The blocker is that the script boots the real application to do the seeding,
and hub's `tests-migrations` job carries none of the infrastructure a hub service boots
against (Authup at minimum — the job provides databases only). A port would also have
to seed around telemetry's documented-lossy IPv6 `down()` (the newest telemetry
migration narrows `request_ip_address` back to varchar(15) on revert). Open follow-up.

The job pre-flights with a sanity check that the compiled migrations exist under `apps/<service>/dist/adapters/database/migrations/{mysql,postgres}/` — without this guard, running the CLI from the wrong working directory results in typeorm silently reporting "No migrations are pending" with exit code 0, masking the failure.

Locally, run the same `run → revert × N → run → drift` flow against a running compose stack:

```bash
# MySQL
docker compose up -d mysql
cd apps/server-core               # or: server-storage / server-telemetry / server-messenger

export DB_TYPE=mysql DB_HOST=127.0.0.1 DB_PORT=3306 \
       DB_USERNAME=root DB_PASSWORD=start123 DB_DATABASE=app

node dist/cli/index.mjs migration run
node dist/cli/index.mjs migration revert    # repeat once per migration
node dist/cli/index.mjs migration run       # idempotency replay
npm run test:schema-drift                   # migrated schema ↔ entity metadata
```

```bash
# Postgres
docker compose up -d postgres
cd apps/server-core

export DB_TYPE=postgres DB_HOST=127.0.0.1 DB_PORT=5432 \
       DB_USERNAME=postgres DB_PASSWORD=start123 DB_DATABASE=app

node dist/cli/index.mjs migration run
node dist/cli/index.mjs migration revert
node dist/cli/index.mjs migration run
npm run test:schema-drift
```

The CLI auto-creates the target database if it does not exist.

## UTC & Lock Specs (server-telemetry)

Two specs in `apps/server-telemetry/test/unit/adapters/database/` pin #1900
against a real server and skip on sqlite (except the lock spec's no-runner
check):

- `timestamp-timezone.spec.ts` sets the database default to UTC+14
  (`ALTER DATABASE … SET timezone` / `SET GLOBAL time_zone`, restored in
  `afterAll`) and the Node process to `Etc/GMT+9` (fixed offset — a DST zone
  makes the offset assertion seasonal), then checks that a pinned pool reads the
  true instant and that bound `Date`s bracket it. A control pool built from the
  raw env options proves the environment really is skewed. On mysql the
  `SET GLOBAL` is server-wide, so every other suite sharing that server must be
  pinned too — they are, through the builder.
- `database-lock.spec.ts` pins mutual exclusion, the timeout and per-name
  independence of `withDataSourceLock`.

Both were negative-controlled: building `server-db-kit` without the pin / with
the lock bypassed fails them on mysql and postgres.

## camelCase entity properties, domain types & HTTP API

camelCase entity properties, domain types & HTTP API — Implemented (#1501, port of authup #3273). snake_case now survives in exactly two places: physical **column names** and **migration files**. 69 identifiers / ~3 500 occurrences over 402 files. **Zero DDL**: every camelCase property carries an explicit `@Column({ name })`, and TypeORM derives auto-generated constraint/index names from `column.databaseName`, so flipping `@Unique(['nodeId', 'analysisId'])` regenerates identical names — no migration ships. Deliberately **no** `SnakeNamingStrategy` (a `snakeCase()` edge case would mismap a column invisibly, since the `synchronize()`-based suites read through the same metadata they wrote). Two guards close the compiler-blind halves: `column-naming.spec.ts` (forgotten `name:`) and `schema-entity-parity.spec.ts` (rapiq allow-list key resolving against no column), both driver-free via `toMetadataOnlyDataSourceOptions`. Kept snake_case: `PermissionName` values (stored in Authup), OAuth2/OIDC parameters, token-introspection payloads, third-party payloads (`@hapic/harbor`'s `project_id`), env vars. Telemetry log labels DID move (`ref_type` → `refType`), so pre-upgrade log lines are not selectable by the new names. Fixed en route: the audit-diff `endsWith('_at')` heuristic (would have started recording timestamp churn on every update), two fail-open `'account_secret'` string gates (now `satisfies keyof T`), the header's `user.display_name` read (authup's `User` is `displayName` + an index signature, so it was always `undefined`), a dead `run_status` table column, and dead realm-query helpers. Breaking for every API consumer and all `@privateaim/*` packages — see [the migration guide](../../docs/src/guide/development/migration-camelcase.md) and [conventions.md](#column-naming).

## typeorm-extension 4.2.0 adoption (#1900, port of authup #3652)

typeorm-extension 4.2.0 adoption (#1900, port of authup #3652) — Implemented. `DataSourceOptionsBuilder` (`server-db-kit`) ends with `pinTimezone(options, 'UTC')`, so boot, the migration CLI and the test apps all stamp, read and bind zone-less timestamps in UTC; a contradicting driver setting fails the boot with an `OptionsError`. `withDataSourceLock` (`server-db-kit`) wraps typeorm-extension's `withDatabaseLock` around each service's boot migration and the CLI `run`/`revert` (`'server-<x>:migration'`) and server-core's Harbor setup (`'server-core:harbor-setup'`, find-then-insert). It checks for `better-sqlite3` before creating a runner (that driver shares ONE runner) instead of passing `strict: false`, and times out after 60 s rather than running unlocked. Covered by `apps/server-telemetry/test/unit/adapters/database/{timestamp-timezone,database-lock}.spec.ts`, both negative-controlled on mysql + postgres. Operator notes (local-time databases, conversion SQL, lock behaviour) in [configuration.md](../../docs/src/guide/deployment/configuration.md#timestamps-are-stamped-and-read-in-utc); details in [conventions.md](#utc-timestamps--boot-locks).
