# Conventions

## Commit Messages

**Conventional Commits** enforced by commitlint (`@tada5hi/commitlint-config`) + Husky:

```
type(scope): description

# Examples:
feat(server-core): add analysis bucket file upload
fix(deps): bump the minorandpatch group with 10 updates
chore: release master
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

## Linting

ESLint 10 with `@tada5hi/eslint-config` (flat config):

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

Config: `eslint.config.js` — extends `@tada5hi/eslint-config` with Vue-specific overrides (`no-explicit-any` off for `.vue` files). Ignores: `dist`, `*.d.ts`, `node_modules`, `.nuxt`, `.nx`, `writable`, `.output`.

## Pre-commit Hooks

Husky runs on every commit:
1. **lint-staged** — ESLint with fix on `*.{vue,js,ts}`
2. **commitlint** — Validates commit message format (`commitlint.config.mjs`)

## Build System

### Libraries (kits)

Built with **tsdown** (powered by rolldown/oxc):

```bash
npm run build         # rimraf dist/ && tsdown
```

Config: `tsdown.config.ts` per package — `entry: 'src/index.ts'`, `format: 'esm'`, `dts: true`, `sourcemap: true`.

Output: ESM only (`dist/index.mjs`) with TypeScript declarations (`dist/index.d.mts`).

**Special case:** `client-vue` uses `@vitejs/plugin-vue` + `@tsdown/css` for Vue SFC compilation, with `vue-tsc` for type declarations (`dts: false` in tsdown, separate `build:types` script).

#### Subpath exports

A kit ships an extra subpath by adding a second tsdown entry and a matching
`exports` key. The four HTTP clients use this for `./testing`:

```ts
// tsdown.config.ts
entry: ['src/index.ts', 'src/testing/index.ts']
```

```jsonc
// package.json — add ONLY this key; module/types/files/scripts stay unchanged
"./testing": { "types": "./dist/testing/index.d.mts", "import": "./dist/testing/index.mjs" }
```

- tsdown names array entries by their path **relative to the entries' lowest
  common ancestor**, not by basename. The LCA of the two entries above is `src`,
  so they emit `dist/index.mjs` and `dist/testing/index.mjs` — there is no
  basename collision.
- Use `.d.mts`. Hub kits emit declarations from tsdown `dts: true`; authup emits
  `.d.ts` from a separate `tsc`, so copying authup's `exports` block verbatim
  ships a broken `types` path.
- A second entry moves the declaration bodies into a shared hashed
  `dist/index-<hash>.d.mts` chunk and makes `dist/index.d.mts` a re-export shim.
  `files: ["dist"]` already covers it, but any check that greps for a
  declaration *body* in `index.d.mts` will now silently fail — grep the export
  list instead.
- **Nothing in CI verifies an `exports` map** (`build:types` is `--noEmit`, no
  test imports from `dist`). Verify by hand after changing one:
  `node --input-type=module -e "await import('@privateaim/<kit>/testing')"`.

### Services

Built with **tsdown** (JS) + **tsc** (typecheck gate):

```bash
npm run build:js      # tsdown (bundle: false, preserves directory structure)
npm run build:types   # tsc --noEmit -p tsconfig.build.json  (TYPECHECK ONLY)
npm run build         # rimraf dist/ + both above
```

Config: `tsdown.config.ts` per service — `entry: ['src/**/*.ts']`, `format: 'esm'`, `bundle: false`, `dts: false`, `sourcemap: true`.

Output: ESM files (`dist/**/*.mjs`) preserving source directory structure. CLI entry points at `dist/cli/index.mjs`.

> **`build:types` does not emit anything.** Every workspace runs `tsc --noEmit`
> — it is a typecheck gate, not a declaration step. Kit declarations come from
> tsdown `dts: true`. The one exception is `packages/client-vue`, which really
> does emit, via `vue-tsc --declaration --emitDeclarationOnly` (and therefore
> ships `.d.ts`, not `.d.mts`).
>
> Consequence: **test files are type-checked by nothing** in CI — every
> `tsconfig.build.json` has `include: ['src/**/*.ts']`. Run
> `tsc --noEmit -p <pkg>/tsconfig.json` (the paths-mapped config) before pushing
> test-only changes.

### Nx Orchestration

Nx handles cross-package build ordering via `dependsOn: ["^build"]` in `nx.json`. Build results are cached.

```bash
npm run build         # npx nx run-many -t build
npm run test          # npx nx run-many -t test
```

## TypeScript

- Extends `@tada5hi/tsconfig` with project-specific overrides
- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- `strict: false` (migration to `strict: true` is a future effort)
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`) — required for TypeORM entities
- All packages use `"type": "module"` (ESM-only, no CJS exports)
- **Naming**: Interfaces always have an `I` prefix (e.g. `IEntityRepository`, `IAnalysisStorageManager`). Types do not (e.g. `ActorContext`, `EntityPersistContext`).
- **Types/interfaces** always live in `types.ts` in the same directory, never inline in module files
- **Contract-first**: declare the port/contract interface explicitly and have the class carry `implements`. Never derive a public contract from a class (`typeof Client`, mapped-over-class tricks) — that inverts the dependency and leaks private/protected shape. The four HTTP clients follow this: `ICoreClient` / `IStorageClient` / `ITelemetryClient` / `IMessengerClient`, plus one `I<X>API` per sub-API. Hub does **not** adopt authup's companion rule that `interface` is reserved for class-implemented contracts — hub's core-kit domain entities are bare `interface`s by design.
- **`tsconfig.json` vs `tsconfig.build.json`**: `tsconfig.build.json` is what CI runs; it declares neither `baseUrl` nor `paths`, so it resolves through `node_modules`/`dist`. The paths-mapped `tsconfig.json` resolves kits to `src` and needs `"ignoreDeprecations": "6.0"` under TypeScript 6.0.3, because every `paths` value is repo-root-relative and therefore depends on the deprecated `baseUrl`. **Follow-up**: TypeScript 7.0 removes `baseUrl` outright — drop it and rewrite each `paths` value relative to its own tsconfig before then.
- When a kit ships a subpath (e.g. `./testing`), map it in the consuming `tsconfig.json` **alongside** the bare specifier (`"@privateaim/core-http-kit/testing": ["./packages/core-http-kit/src/testing"]`). Without it the subpath falls through to `dist` and the package enters the program twice; because `BaseAPI` carries `protected client`, any signature typed with a concrete API class then fails cross-copy with TS2322.

## Dependency Classification

Hub's practice is **bimodal**, and deliberately differs from authup's. Record
the actual shape before moving anything:

| Package group | Runtime deps declared as |
|---|---|
| Client/domain kits (`core-http-kit`, `messenger-http-kit`) | `peerDependencies` + an identical `devDependencies` mirror. **No `dependencies` block at all** — including for internal `@privateaim/*` / `@authup/*`. |
| Client/domain kits with a validator stack (`storage-kit`, `telemetry-kit`) | The same peer+dev mirror, **plus** a plain `dependencies` block for `{"@validup/zod","validup","zod"}`. |
| Server kits and apps | Plain `dependencies`. |
| Test-only deps | `devDependencies`, plus a tsdown `external` entry if they could otherwise be bundled (see `packages/server-test-kit/tsdown.config.ts`: `external: [/^testcontainers/, /^vitest/]`). |

authup's convention forbids internal packages in `peerDependencies`. **Hub does
not follow that rule.** Applying it here would rewrite ~7 manifests and disturb
release-please's `node-workspace` plugin (`updatePeerDependencies: true` in
`release-please-config.json`).

### Root `overrides`

`npm install` runs **without `--force`**. If it ever ERESOLVEs again, fix the
conflict — do not reach for `--force` or `--legacy-peer-deps`. Both silently
produce a tree that disagrees with the manifests: the pre-bump lockfile
declared `pinia@^4.0.2` and `@pinia/nuxt@^1.0.1` while actually installing
`3.0.4` / `0.11.3`, and `--legacy-peer-deps` drops pinia outright and breaks
the client-ui build.

**There are currently no overrides at all**, and the `overrides` key is absent
from the root manifest. `typeorm`, `vue`, `validup`, `@vuecs/core` and finally
`pinia` were each overridden historically and have all been removed as their
requirers converged on compatible ranges; the resolved tree stayed unchanged
each time, every one of them a single hoisted copy.

`pinia` was the last to go, at authup `1.0.0-beta.62`: it existed because
`@pinia/nuxt` 1.x peers `pinia@^4.0.2` while `@authup/client-web-kit` still
peered `^3.0.0`, which made `npm install` ERESOLVE. beta.62 peers `^4.0.2`
itself, so the conflict is gone and authup's store no longer runs outside its
declared peer range. `packages/client-vue/test/` remains the regression net for
that path (the harness installs `@authup/client-web-kit` first and its
`usePermissionCheck` sites call `injectStore()`).

`validup` in particular is now `^2.0.1` across all its declarations — a mixed
range there is not cosmetic. `@validup/vue`'s `useValidup()` and validup's own
`isValidupError()` duck-type against a specific module instance, so two
side-by-side copies silently stop recognising each other's `Container`/`Issue`
values.

**Check for a split tree after any bump in this ecosystem**, even when every
declared range agrees. The authup beta.62 bump initially left
`@authup/client-web-kit`, `@validup/vue` and `@ilingo/validup-vue` installed as
three nested copies each (under `apps/client-ui`, `packages/client-vue` and
`node_modules/@authup/client-web-nuxt`) at *identical versions* — npm had
simply declined to hoist them. `npm dedupe` collapsed all three back to one
copy. Nothing warns about this, and `npm ls <pkg>` prints one line per
requirer, so read the placement keys instead:

```bash
python3 -c "import json;d=json.load(open('package-lock.json'))['packages'];\
print([k for k in d if k.endswith('node_modules/@validup/vue')])"
```

Never regenerate the lockfile with `npm install --package-lock-only` to answer
such a question. It resolves optional dependencies for the **current platform
only** and silently drops every other one — on macOS that removed all 82
`@esbuild/*`, `@node-rs/*` and `@tailwindcss/oxide-*` entries for Linux and
Windows, which would break `npm ci` on CI. A plain `npm install` preserves the
entries it does not need to touch.

Before adding an override, check whether one is actually needed — an override
**rewrites the ranges npm records in the lockfile**, so reading the lockfile
back will show every requirer already "agreeing" and makes a stale override
look load-bearing. Query the registry for the real declared range instead:

```bash
npm view <pkg>@<version> peerDependencies.<dep> dependencies.<dep>
```

## Validation

**Zod 4** schemas via `validup` adapters. Domain types in kit packages have corresponding validators:

```typescript
// packages/core-kit/src/domains/<entity>/validator.ts
import { z } from 'zod';
export const analysisSchema = z.object({
    name: z.string().max(128).optional(),
    // ...
});
```

## Database Migrations

Migrations live in `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/`.
SQLite never runs them — the options builder wires `migrations: []` for
`better-sqlite3`, so boot (and the test suite) falls back to `dataSource.synchronize()`
from the entity classes.

Adopted from authup — see [authup-conventions.md](references/authup-conventions.md#database-migrations).

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
- **Consolidation happens at release time, not merge time.** A release window's
  migrations may be squashed into one file per dialect as a deliberate last step
  before the release PR merges (keeping the earliest timestamp so ordering against
  the released chain holds). Shipping several named migrations in one release is fine.
- **Released migrations are immutable.** Amend freely while the migration lives only
  on its own unmerged branch; once it ships in a release, never touch it.
- **Always verify with the round-trip** — `migration run` → `revert` × N → `run`,
  against both MySQL and PostgreSQL. See [testing.md](testing.md#migration-tests).
  Note that MySQL DDL is not transactional: a migration that fails halfway leaves
  the schema partially altered, so a broken `up()` must be fixed against a fresh
  database.
- **FK delete rules**: cascade only when the child genuinely cannot exist without
  the parent (`registry_projects.registry_id`). When the child is an independent
  resource that merely *points at* the parent, use `ON DELETE SET NULL` so deleting
  the parent detaches instead of destroying — `nodes.registry_id`,
  `nodes.registry_project_id` and `analyses.registry_id` all had to be corrected
  from cascade to set-null for this reason.

### Table Naming

Table names are **plural** and snake_case: `nodes`, `projects`, `registries`,
`registry_projects`, `master_images`, `analyses`, `analysis_nodes`, `analysis_buckets`.
Set them explicitly with `@Entity({ name: 'analyses' })` — there is no naming strategy.

### Column Naming

**snake_case survives in exactly two places: physical column names, and
migration files.** Everything else — entity properties, domain types, validator
mounts, rapiq allow-lists, request/response fields — is camelCase (plan 017).

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
| `apps/<service>/test/unit/core/query/schema-entity-parity.spec.ts` | a rapiq allow-list key that resolves against no entity column, via rapiq's `assertSchemaMatchesEntity`, plus a coverage assertion against `entitySchemas` so a schema added later cannot go unguarded |

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

The narrowing itself is pinned by `packages/kit/test/types/typed-container.test-d.ts`,
run through vitest's typecheck mode (`typecheck.enabled` in that package's
`vitest.config.ts`). It has to be a **type test**: every `tsconfig.build.json`
includes `src/**` only, so a `@ts-expect-error` in an ordinary spec would be
checked by nothing in CI.

The proper fix belongs upstream in validup; `TypedContainer` stands until the
`(string & {})` arm is gone.

### Naming exceptions

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

## Entity Resolution (client-vue)

`createEntityManager` resolves an entity two ways, and they are mutually
exclusive by design — **an id-driven resolve never falls back to the collection.**

- **By id.** An id that was *supplied* is an exact selector: resolve that record
  or nothing. A `getOne` that throws (404, 403) resolves `null`; it must not drop
  into the collection branch, which would substitute a different entity for the
  one that was asked for.
- **By query.** Only when no id was supplied, and only when the query carries a
  real selector. `fields` and `include` say *what* to return, never *which* row,
  so a projection-only query matches everything and the `limit: 1` read hands
  back an arbitrary record from the actor's readable scope.

**Supplied is presence, not truthiness.** `''` is a supplied id — it is how a
form says "no entity yet" (`FProjectForm` initialises `form.masterImageId = ''`
and passes it straight in as `entityId`). It resolves `null` quietly, with no
request: a blank id must not reach `getOne` either, because `getOne('')` builds
`GET /<collection>/` and lets the arbitrary-row read back in through another
door. `null` and `undefined` are *absent*, so they still fall through to the
query branch.

A selector means at least one filter whose value is not `undefined` — rapiq drops
`undefined` values before the request, so `{ analysisId: undefined, type: 'code' }`
widens to every code bucket rather than narrowing. `null` stays a selector; it is
a meaningful filter value.

The helpers are `isEntityIdSupplied` / `isEntityIdResolvable` / `hasQuerySelector`
in `packages/client-vue/src/core/entity-manager/utils.ts`, and they are **type
guards** rather than boolean predicates — the truthiness checks they replaced were
also narrowing `EntityID<RECORD> | null | undefined` for the `getOne` call. Only
`nuxi typecheck` (Nuxt 4 strict, via client-ui's `build:types`) catches losing
that; the repo itself builds at `strict: false`.

Why this matters: the failure is silent and looks like a working page. A detail
page whose route param stopped resolving rendered — and permitted edit and delete
of — the first row in scope, which is how a registry project's Harbor robot
`accountSecret` ended up in a form belonging to a different record.

`packages/client-vue/test/unit/core/entity-manager.spec.ts` pins every branch, and
`test/unit/components/f-master-image-picker.spec.ts` pins the create-mode path on a
real form component.

## Icons

`apps/client-ui` bundles only the icons it renders: `@nuxt/icon`'s standalone
vite plugin (options in `apps/client-ui/icon-bundle.config.ts`) scans source for
`<collection>:<name>` literals and emits that subset into
`virtual:nuxt-icon-bundle/register`, which `plugins/vuecs.ts` imports. It
registers through `addIcon` from `@iconify/vue` — the same global store
`<VCIcon>` resolves against — so no component knows about it.

**Rule: an icon name must be a literal.** A composed name is invisible to the
scan, so it is never bundled and `@iconify/vue` falls back to fetching it from
the public Iconify API at runtime:

```vue
<!-- Bad — never bundled; resolved over the network, or not at all -->
<VCIcon :name="'fa6-brands:' + entity.buildOs" />

<!-- Good — a computed switch over literals (FProcessStatus.vue,
     FAnalysisBuildStep.vue) -->
<VCIcon v-if="buildOsIcon" :name="buildOsIcon" />
```

The same applies to `packages/client-vue` and `packages/client-vue-theme`: they
are scanned as source, and they are published, so a consuming app's scanner sees
exactly the same literals.

Both halves fail **silently** — an unmatched glob or a composed name yields an
empty icon slot, not a build error. `apps/client-ui/test/unit/icon-bundle.spec.ts`
guards the glob list by pinning one uniquely-attributable icon per scanned
source; it drives the real plugin, so it needs no build output.

## Logging

Logs flow through Winston → `LoggerTransport` (`packages/server-telemetry-kit/src/services/logger/transport.ts`) → telemetry/VictoriaLogs, where every string/number/boolean key of the metadata object becomes a **queryable label**. UI views (e.g. the analysis log panel) filter by these labels — see `AnalysisLogController`, which queries `refType=analysis` + `refId=<id>`.

**Rule: keep human-readable tokens in the message; move opaque UUIDs to labels.**

- **Human-readable tokens stay inline** — filenames, paths, entity names, enum-like types (`CODE`/`RESULT`, `user`/`robot`), counts. They give the line meaning; stripping them collapses distinct lines into identical text (`Packing file` × N).
- **Opaque UUIDs move to labels** — never interpolate an entity id into the message string. Attach it via `LogFlag.REF_TYPE` + `LogFlag.REF_ID` (`packages/telemetry-kit/src/domains/log/constants.ts`) for the primary referenced entity, plus named labels (`bucketId`, `targetId`, …) for secondary ids. `LogFlag.REF_TYPE` takes the referenced entity's `DomainType` — import it from **that entity's own kit** (`@privateaim/core-kit` for analysis, `@privateaim/storage-kit` for bucket/bucket-file), **not** telemetry-kit's `DomainType` (which only covers `event`/`log`).

```typescript
import { DomainType } from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';

// Bad — opaque UUID baked into the message, unreadable and unqueryable
this.logger?.info(`Created bucket for analysis ${analysis.id}`);

// Good — readable message, ids as labels (canonical pattern in
// apps/server-core-worker/src/app/components/analysis-builder/handlers/execute/module.ts)
this.logger?.info('Created bucket for analysis', {
    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
    [LogFlag.REF_ID]: analysis.id,
});
```

Adding `REF_TYPE`/`REF_ID` also makes a log visible on the matching entity view (logs without them never surface there). Thrown `Error` messages and non-UUID descriptors (names, paths, counts, URLs) are exempt.

## Release Process

Automated via **release-please** (Google) for versioning + **monoship** (`tada5hi/monoship@v2`) for npm publishing. Creates release PRs that bump versions across all packages in lockstep (current: 0.8.31).

## Hexagonal Architecture (all services)

All services follow a hexagonal (ports & adapters) architecture matching authup's `apps/server-core/src/` layout:

```
src/
├── core/          # Domain logic — zero imports from adapters/, app/, typeorm, routup
├── adapters/      # External system implementations (database, HTTP, socket)
└── app/           # Orchestration — DI modules, wiring, factory, infrastructure
```

### Dependency Rule

**core/ → nothing** (only external domain packages like `@privateaim/core-kit`, `@privateaim/kit`, `@privateaim/server-kit`, `@ebec/http`, `@authup/access`)
**adapters/ → core/ and app/** (implements core ports, may use app DI modules)
**app/ → core/ and adapters/** (wires everything together)

### Core Layer Conventions

- **Entity services** (`core/entities/<name>/service.ts`): Own validation (`this.validator.run(data, { group: ValidatorGroup.CREATE })`), receive repos via constructor injection
- **Port interfaces** (`core/entities/<name>/types.ts`): `IXRepository extends IEntityRepository<T>`, `IXService`
- **Business services** (`core/services/`): Accept all dependencies via constructor (repositories, callers, task managers)
- **Service port interfaces** (`core/services/types.ts`): `IAnalysisBuilderCaller`, `IBucketCaller`, `ITaskManager`, etc.
- **No TypeORM, no routup** imports anywhere in `core/`. Use container DI via injection keys.

### Controller Conventions

Controllers are truly thin — only: extract request → build `ActorContext` → delegate to service → shape the response. **Zero validation, zero business logic.**

The controller owns the **wire shape**; services keep returning bare domain entities. Every entity record response is the `{ data, meta }` envelope, every collection response is `{ data, meta: { total, limit?, offset?, schema? } }`.

```typescript
@DGet('', [ForceLoggedInMiddleware])
async getMany(@DContext() event: IAppEvent): Promise<EntityCollectionResponse<Node>> {
    const query = useRequestQuery(event);
    const { data, meta } = await this.service.getMany(query);
    return { data, meta: { ...meta, schema: describeQuerySchema(nodeSchema) } };
}

@DGet('/:id', [ForceLoggedInMiddleware])
async getOne(@DPath('id') id: string, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
    const query = useRequestQuery(event);
    const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);

    return { data: entity, meta: { schema: describeQuerySchema(nodeSchema, RECORD_QUERY_PARAMETERS) } };
}

@DPost('', [ForceLoggedInMiddleware])
async add(@DBody() data: NodeCreatePayload, @DContext() event: IAppEvent): Promise<EntityRecordResponse<Node>> {
    const actor = buildActorContext(event);
    const entity = await this.service.create(data, actor);
    event.response.status = 201;
    return { data: entity, meta: {} };
}
```

Rules:

- **Annotate every return type**, including `getMany` — `@trapi/swagger` derives the OpenAPI response schema from the method signature; an unannotated method emits an anonymous inline schema. Types come from `@privateaim/core-http-kit` / `storage-kit` / `telemetry-kit` (`EntityRecordResponse`, `EntityCollectionResponse`).
- **Mutations carry `meta: {}`** — never omitted, never `undefined`. When a command can legitimately produce no entity, coalesce explicitly (`{ data: entity ?? null, meta: {} }`, annotated `EntityRecordResponse<X | null>`); `data: undefined` serializes to a malformed envelope with the key dropped.
- **Query-capable `GET`s attach `meta.schema`** via `describeQuerySchema()` from `@privateaim/server-kit`: the full description on collections, `describeQuerySchema(x, RECORD_QUERY_PARAMETERS)` (fields + relations) on record reads. The schema object comes from the entity barrel, which re-exports `schema.ts`.
- **Never mutate the description** — it is memoized and deep-frozen, shared by reference. Always spread: `meta: { ...meta, schema: … }`. `meta.schema = …` throws a `TypeError`.
- `meta.schema` is the **static** allow-list upper bound. Actor-dependent gates (the `accountSecret` field gate, realm scoping) are deliberately not reflected there — the runtime gate in the service is what enforces access.
- **Protocol, credential, stream and bespoke shapes stay flat** — no envelope. See [architecture.md](architecture.md#response-envelope--query-capability-discovery) for the explicit endpoint list.
- Hub uses **no** `send()`/`sendCreated()` helpers (only `sendStream` in storage): return the value and set the status via `event.response.status`.

### Repository Field Selection Conventions

Repository adapters define `DEFAULT_FIELDS` (returned by default) and optionally `ALLOWED_FIELDS` (requestable via `?fields=+field_name`). Sensitive columns with `select: false` on the TypeORM entity must be in `ALLOWED_FIELDS` but NOT in `DEFAULT_FIELDS`.

```typescript
// app/modules/database/repositories/registry/repository.ts
const DEFAULT_FIELDS: ParseAllowedOption<RegistryEntity> = [
    'id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt',
];

const ALLOWED_FIELDS: ParseAllowedOption<RegistryEntity> = [
    ...DEFAULT_FIELDS,
    'accountSecret',  // select: false on entity — only returned when explicitly requested
];

// In findMany():
const fieldsParsed = parseQueryFields<RegistryEntity>(fields, {
    default: DEFAULT_FIELDS,
    allowed: ALLOWED_FIELDS,  // NOT DEFAULT_FIELDS — allows opt-in field selection
    defaultPath: 'registry',
});
```

When an entity has permission-gated fields, the service's `getMany`/`getOne` methods accept `ActorContext` and check permissions before allowing access:

```typescript
// core/entities/registry/service.ts
async getMany(query: Record<string, any>, actor: ActorContext) {
    await this.checkSecretFieldAccess(query, actor);
    return this.repository.findMany(query);
}
```

The controller passes `buildActorContext(req)` for GET endpoints on these entities.

### Subscriber Conventions

Subscribers are **pre-instantiated** with dependencies in `DatabaseModule.setup()` and pushed onto `dataSource.subscribers`. No `@EventSubscriber()` decorators — no auto-discovery.

```typescript
// In DatabaseModule.setup():
dataSource.subscribers.push(
    new NodeSubscriber({ nodeClientService }),
    new AnalysisSubscriber(),
    new RegistrySubscriber(),
);
```

Subscribers are purely for domain event publishing (via `BaseSubscriber`). Business logic (metadata recalculation, storage management) lives in entity services, not subscribers.

## DI Modules

Each DI module (orkos `IModule` implementation) lives in its own directory under `app/modules/<name>/`:

```
app/modules/<name>/
├── constants.ts     # TypedToken injection keys
├── types.ts         # Option types/interfaces
├── module.ts        # IModule class implementation
└── index.ts         # Barrel re-exports
```

- **Injection keys** use `TypedToken<T>` from `eldin` — one constant per token, co-located with the module that registers it
- **Types/interfaces** always live in `types.ts`, never inline in `module.ts`
- **Module names** are string constants in `ModuleName` enum (`packages/server-kit/src/services/module-names.ts`)
- **Shared modules** (logger, redis, amqp, authup, cache, entity-event, queue-router) live in `packages/server-kit/src/services/<name>/`
- **Per-service modules** (database, minio, victoria-logs, etc.) live in `apps/<service>/src/app/modules/<name>/`
- Each service has `app/builder.ts` (`ServiceXApplicationBuilder extends BaseApplicationBuilder`) with `withConfig()`, `withDatabase()`, `withHTTP()`
- Each service has `app/factory.ts` with `createApplication()` using the builder
- **`start.ts` should be minimal** — just `createApplication()` + `app.setup()`. All orchestration (DB, HTTP, swagger, harbor, components) happens in modules.
- **HTTPModule starts the server** — `server.listen()` is inside the module with a Promise, not in `start.ts`. Socket server is toggleable via `options.socket`.

### server-core Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`?, `authupClient`? | `DataSource`, 13 repo adapters, `RegistryManager` |
| ComponentsModule | `components` | `database` | `TaskManager`, `RegistryComponentCaller` |
| AnalysisModule | `analysis` | `database`, `components` | `Builder`, `Configurator`, `Distributor`, `StorageManager`, 3 metadata recalculators |
| HarborModule | `harbor` | `config`, `database` | nothing (sets up registry) |
| AggregatorsModule | `aggregators` | `database`, `components` | nothing (starts AMQP event consumers) |
| HTTPModule | `http` | `config`, `database`, `analysis`, `telemetryClient`? | `App`, `Server`, `Router` |
| TelemetryClientModule | `telemetryClient` | `config`, `authupHook`? | `TelemetryClient` |

`?` marks an **optional** dependency (`{ name, optional: true }`) — the module still
sets up when that one is absent.

### server-telemetry Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource` |
| VictoriaLogsModule | `victoriaLogs` | `config` | `VictoriaLogsClient`, `LogStore` |
| ComponentsModule | `components` | `database`, `victoriaLogs` | nothing (starts event + log consumers) |
| HTTPModule | `http` | `config`, `database`, `victoriaLogs` | `Server`, `Router` |

### server-storage Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource` |
| StorageModule | `storage` | `config` | `IStorageAdapter` (`MinioStorageAdapter` or `FsStorageAdapter`) |
| ComponentsModule | `components` | `storage`, `database` | nothing (starts bucket + bucket-file consumers) |
| HTTPModule | `http` | `config`, `database`, `storage` | `Server`, `Router` |

The storage backend is a **port**, not a hard-wired MinIO client: `StorageModule`
picks `MinioStorageAdapter` or `FsStorageAdapter` from config and registers it under
`StorageInjectionKey`.

### server-core-worker Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| CoreClientModule | `coreClient` | `config`, `authupHook`? | nothing (calls `setCoreClient()`) |
| StorageClientModule | `storageClient` | `config`, `authupHook`? | nothing (calls `setStorageClient()`) |
| DockerModule | `docker` | none | `DockerInjectionKey` (dockerode client) |
| ComponentsModule | `components` | `coreClient`, `storageClient`, `docker` | nothing (starts 4 worker components) |
| HTTPModule | `http` | `config` | `Server` (health-check only) |

### server-messenger Module Inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource`, `MessageRepository` |
| WakeupModule | `wakeup` | `config`, `redis`? | `WakeupInjectionKey` |
| SweeperModule | `sweeper` | `database` | nothing (expires stored messages) |
| HTTPModule | `http` | `config`, `database`, `wakeup` | `Server`, `SocketServer` |

server-messenger is **no longer** the database-less relay this table used to describe:
the durable mailbox from plan 013 phase 1 gave it a `DataSource` + `MessageRepository`,
a `SweeperModule` that expires stored messages, and a `WakeupModule` backing the
payload-free `messagePending` notification (redis pub/sub + socket emit).

## Docker

Multi-service `Dockerfile` builds the entire monorepo. The `entrypoint.sh` script selects which service to start based on env vars.

```bash
docker build -t privateaim/hub .
docker-compose up       # Local dev: MySQL + Postgres
```

## Documentation Site

The `docs/` directory contains a VitePress site — the authoritative reference for Hub. It is a workspace member (`@privateaim/docs`).

```bash
npm run dev --workspace=docs     # Dev server
npm run build --workspace=docs   # Build static site
```

### Keeping Docs in Sync

When making changes that affect any of the following, **update the corresponding docs page(s)**:

| Change | Docs to update |
|--------|---------------|
| Service env vars (ConfigModule) | `docs/src/reference/<service>/index.md` |
| New/changed API endpoints | `docs/src/reference/<service>/index.md` and `docs/src/guide/development/api.md` |
| New/changed package exports | `docs/src/reference/<service>/<kit>.md` |
| Entity changes (new fields, new entities) | `docs/src/guide/user/` pages and `docs/src/getting-started/architecture.md` |
| Deployment config changes | `docs/src/guide/deployment/configuration.md` |
| New DI modules | `docs/src/reference/<service>/index.md` and `.agents/conventions.md` module inventory |
| README changes | Keep `README.md` in the affected app/package in sync |

### Using Docs as Context

When you need context beyond the code (deployment patterns, admin workflows, env var semantics, platform concepts), check docs first:

- `docs/src/reference/` — per-service configuration, env vars, endpoints, related packages
- `docs/src/guide/user/` — user-facing workflows (projects, analyses, approval, realms)
- `docs/src/guide/deployment/` — Docker Compose, Kubernetes, reverse proxy configuration
- `docs/src/guide/development/` — local setup, repo structure, contributing

### Docs Structure

```
docs/src/
├── .vitepress/config.mjs   # Nav, sidebar, theme config
├── index.md                 # Landing page
├── getting-started/         # Overview, architecture
├── guide/
│   ├── user/                # Projects, analyses, realms, nodes, approval
│   ├── deployment/          # Config, Docker, K8s, reverse proxy
│   └── development/         # Setup, repo structure, API, contributing
├── reference/               # Services + packages (grouped by service area)
│   ├── shared/              # kit, server-kit, server-db-kit, server-http-kit
│   ├── core/                # server-core service + core-kit, core-http-kit, core-realtime-kit
│   ├── worker/              # server-core-worker + server-core-worker-kit
│   ├── storage/             # server-storage + storage-kit, server-storage-kit
│   ├── telemetry/           # server-telemetry + telemetry-kit, server-telemetry-kit
│   ├── messenger/           # server-messenger + messenger-kit, server-realtime-kit
│   └── frontend/            # client-ui + client-vue
├── about/team.{md,vue}      # Team page
└── public/images/           # UI screenshots and architecture diagram
```

## References

External project references live in `.agents/references/`. When looking up source code in a referenced project (e.g., authup, routup, hapic), always update the corresponding reference file with:

- The source file path / function name in the external project
- The corresponding Hub file path / function name
- Any behavioral differences between the implementations

This builds a cumulative mapping over time so future work can quickly find corresponding code without re-searching.
