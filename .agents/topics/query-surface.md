# Query Surface

Read before changing a rapiq schema (allow-lists, indexes), the depth bound of query inputs, or the indexes backing them.

## rapiq v2 + authup beta.54 Follow-ups

- **The depth-3 bound on query inputs is permanent** (`QueryBuildInput<T, 3>` in
  client-vue). `@authup/client-web-kit` declares
  `EntityListQueryInput<T> = QueryInput<T> | IQuery` with
  `QueryInput<T> = QueryBuildInput<T, 3>` as a design decision: rapiq's default
  depth 5 explodes TypeScript's inferred-type serialization for self-recursive
  entities, and UI queries never use more than three relation segments. Widening
  hub alone brings back the TS7056 emit failure and a variance mismatch against
  authup's components. It is not a workaround for rapiq#821.
- The `Schema<any>[]` registries (`entitySchemas` in each service's
  `core/query/module.ts`, the cache in server-kit's `core/query/describe.ts`) stay
  `any`: rapiq's `Schema<T>` is invariant, so a heterogeneous array has no other
  type until rapiq ships an existential `AnySchema`.
- Filters with operators use the typed helpers; see
  [conventions.md](../conventions.md#query-filters) (ESLint-enforced).

## Indexed query surface + schema drift gate (#1842, #1823)

- **`indexes` declares the query surface, not the table.** Each sequence is
  property-name-spelled and a leftmost prefix of a real PK/unique/`@Index`.
  Entity indexes whose leading column is not queryable (nodes'
  `(externalName, registryId)`, events' `(expiring, expiresAt)`) are not declared.
  Schemas opt into `filters.indexed` (anchor mode) and `sorts.indexed`.
- **Every `filters.allowed` / `sorts.allowed` key must lead a declared
  sequence**, so a key added to an allow-list needs its backing entity index and
  migration in the same change. Each service's `schema-entity-parity.spec.ts`
  checks this with `collectNonLeadingQueryKeys` (`@privateaim/server-test-kit`).
  A key that leads nothing makes rapiq reject the filter (400) or drop the sort
  silently. See [database.md](database.md#column-naming).
- Accepted write cost: the invariant puts indexes on low-cardinality columns no
  known query uses (`analyses.configuration_locked`,
  `analysis_bucket_files.root`, the storage `actor_type` columns). Narrowing
  those allow-lists, and dropping the indexes, is an open follow-up.
- **Never allow-list a filter on a `dateToISOStringTransformer` column.**
  Transformers do not apply to WHERE binds, so the filter compares an ISO string
  against the native format and silently matches wrong rows. The event schema
  therefore filters no timestamps; authup's event schema keeps `createdAt`
  filterable and has the same exposure. Sorting on them is fine.
- Event sorts allow `createdAt` only (events are append-only, so `updatedAt`
  equals it; `expiresAt` leads no index). `sorts.default: { createdAt: 'DESC' }`
  is the floor sorts fall back to, since a rejected sort fails soft.
- Every schema states its sort allow-list explicitly: under `strict`, a schema
  with only `sorts.default` allows just the default key and drops the rest.
- A `text` column (`analyses.description`) is not filterable: MySQL utf8mb4
  cannot index it within the 3072-byte key bound.
- **MySQL `down()` must not drop an explicit index on an FK column.** Creating it
  makes InnoDB drop the implicit FK index, so `DROP INDEX` then fails
  non-transactionally. Rename it back to the constraint's name instead
  (`ALTER TABLE … RENAME INDEX`). Do not drop and re-add the FK under
  `SET FOREIGN_KEY_CHECKS=0`: a checks-off `ADD FOREIGN KEY` does not validate
  existing rows. When a FK must be dropped and re-added (MySQL has no
  `RENAME CONSTRAINT`), restore `FOREIGN_KEY_CHECKS` in a `finally`, since the
  pooled connection keeps the session setting.
- **Postgres migrations run with `migrationsTransactionMode: 'each'`**
  (server-db-kit `DataSourceOptionsBuilder`). With `'all'`, every pending
  migration shares one transaction and holds each lock (e.g. ACCESS EXCLUSIVE on
  `analyses`) until the whole chain commits at boot.
- **A table rename must re-derive every constraint name** (#1823): typeorm hashes
  them from table and column names, a rename keeps the old strings, and every
  later `migration generate` then emits spurious drops. See
  [database.md](database.md#database-migrations).
- **The drift gate** (`scripts/assert-schema-drift.mjs` in all four server apps,
  `npm run test:schema-drift`, run by the `tests-migrations` CI job) compares the
  migrated schema with the entity metadata, which nothing else does: the suites
  `synchronize()` from the entities. authup's populated round-trip
  (`verify-latest-migration.mjs`) is not ported, because it boots the real app,
  which needs Authup and other infrastructure the migration job lacks. See
  [database.md](database.md#migration-tests).
