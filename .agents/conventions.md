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

ESLint 10 with `@tada5hi/eslint-config` 3 (flat config):

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

Config: `eslint.config.js` — extends `@tada5hi/eslint-config` with Vue-specific overrides (`no-explicit-any` off for `.vue` files). Ignores: `dist`, `*.d.ts`, `node_modules`, `.nuxt`, `.nx`, `writable`, `.output`.

The shared config enforces statement/class-member spacing, `I`-prefixed interfaces,
exported type declarations in `types.ts`, and no external-package re-exports in
barrels. Existing public names that are not `I`-prefixed use type aliases instead.
Buffer encoding APIs and existing base64 conversions are retained; the corresponding
Unicorn preferences stay disabled for server code and the isomorphic `kit` package.
CI, release, documentation builds and the Docker image use Node 26.
The root and every workspace declare `engines.node: >=26.0.0`.

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
npm run build:js      # tsdown (unbundle: true, preserves directory structure)
npm run build:types   # tsc --noEmit -p tsconfig.build.json  (TYPECHECK ONLY)
npm run build         # rimraf dist/ + both above
```

Config: `tsdown.config.ts` per service — `entry: ['src/**/*.ts']`, `format: 'esm'`, `unbundle: true`, `dts: false`, `sourcemap: true`.

> tsdown 0.23 removed `bundle`. A leftover `bundle: false` is **silently ignored** (the config is not
> type-checked by any `build:types`), so the build still succeeds but emits hashed shared chunks and
> inlines any import the service does not declare in its own `package.json` into
> `dist/node_modules/` — a second module instance. Declare every runtime import directly.

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
- **No re-export shims.** Never forward another package's (or module's) symbols from a local file (`export { scopeReadQuery } from '@privateaim/server-kit'` "so call sites keep importing from core"). When code moves into a shared package, rewrite every import to the new home and delete the old file. Directory barrels (`index.ts` re-exporting its own siblings) are fine.
- **Contract-first**: declare the port/contract interface explicitly and have the class carry `implements`. Never derive a public contract from a class (`typeof Client`, mapped-over-class tricks) — that inverts the dependency and leaks private/protected shape. The four HTTP clients follow this: `ICoreClient` / `IStorageClient` / `ITelemetryClient` / `IMessengerClient`, plus one `I<X>API` per sub-API. Hub does **not** adopt authup's companion rule that `interface` is reserved for class-implemented contracts — hub's core-kit domain entities are bare `interface`s by design.
- **`tsconfig.json` vs `tsconfig.build.json`**: `tsconfig.build.json` is what CI runs; it declares neither `baseUrl` nor `paths`, so it resolves through `node_modules`/`dist`. The paths-mapped `tsconfig.json` resolves kits to `src` and needs `"ignoreDeprecations": "6.0"` under TypeScript 6.0.3, because every `paths` value is repo-root-relative and therefore depends on the deprecated `baseUrl`. **Follow-up**: TypeScript 7.0 removes `baseUrl` outright — drop it and rewrite each `paths` value relative to its own tsconfig before then.
- When a kit ships a subpath (e.g. `./testing`), map it in the consuming `tsconfig.json` **alongside** the bare specifier (`"@privateaim/core-http-kit/testing": ["./packages/core-http-kit/src/testing"]`). Without it the subpath falls through to `dist` and the package enters the program twice; because `BaseAPI` carries `protected client`, any signature typed with a concrete API class then fails cross-copy with TS2322.

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

## Query Filters

A rapiq filter that needs an **operator** — contains, negation, comparison,
membership — is built with the typed helpers from `@rapiq/core`, never with a
hand-built wire-marker string:

```typescript
import { and, contains, eq, inArray, not } from '@rapiq/core';

// Bad — the v0.9 wire-marker dialect
{ filters: { name: `~${q}~`, status: '!' + s } }

// Good
{ filters: and(contains('name', q), not(eq('status', s)), inArray('id', ids)) }
```

Object-literal equality and array filters (`{ filters: { realmId: [id, null] } }`)
are current rapiq v2 syntax, not legacy — leave them as they are.

ESLint enforces this (`no-restricted-syntax` in `eslint.config.js`): a string
literal, `+` concatenation or template literal starting with `~`, `!`, `<` or `>`
as a value under a `filters` key is an error. It sees only script code, so a
filter assembled inside a Vue **template** expression is not covered.

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

Automated via **release-please** (Google) for versioning + **monoship** (`tada5hi/monoship@v2`) for npm publishing. Every package shares one version and one `v<version>` tag.

**The `linked-versions` plugin does not link anything** under `"include-component-in-tag": false`: it finds its group through `strategy.getComponent()`, which returns `''` there, so each package bumps on its own commits (googleapis/release-please#1750, fix #1749 unmerged). To keep every package on one version, give each package without a bump-worthy commit since the last release a touch commit before releasing (the `version-bump` skill does this).

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
- **Business services** (`core/services/`): Accept all dependencies via constructor (repositories, dispatchers)
- **Service port interfaces** (`core/services/types.ts`): `IAnalysisBuilderDispatcher`, `IBucketDispatcher`, etc.
- **No TypeORM, no routup** imports anywhere in `core/`. Use container DI via injection keys.

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
- **Shared modules** (logger, redis, message-bus, authup, entity-event) live in `packages/server-kit/src/<name>/`. `message-bus/` holds only the DI module, the injection key and the log-hook factories (`hooks.ts`): the bus, its drivers, components, dispatchers (`LocalDispatcher` / `RemoteDispatcher`) and workers (`RemoteWorker`) come from [`hubwire`](https://github.com/tada5hi/hubwire) (`@hubwire/amqp` for the AMQP driver). Observability is a `hooks` option, never a logger — build it with the server-kit factories rather than per service
- **Every module that starts components stops them** — `ComponentsModule` (and server-core's `AggregatorsModule`) keep what they started in one `IComponent[]` and `await` each `stop()` in `teardown()`, then each `settled?.()` (only a scheduled component has it; its `stop()` never waits for a pass in flight, which must not outlive the database); a scheduled job is `defineScheduledComponent` (hubwire), never a hand-rolled `node-cron` task or `setInterval`
- **Per-service modules** (database, minio, victoria-logs, etc.) live in `apps/<service>/src/app/modules/<name>/`
- Each service has `app/builder.ts` (`ServiceXApplicationBuilder extends BaseApplicationBuilder`) with `withConfig()`, `withDatabase()`, `withHTTP()`
- Each service has `app/factory.ts` with `createApplication()` using the builder
- **`start.ts` should be minimal** — just `createApplication()` + `app.setup()`. All orchestration (DB, HTTP, swagger, harbor, components) happens in modules.
- **HTTPModule starts the server** — `server.listen()` is inside the module with a Promise, not in `start.ts`. Socket server is toggleable via `options.socket`.

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
| New DI modules | `docs/src/reference/<service>/index.md` and the module inventory in `.agents/topics/<service>.md` |
| README changes | Keep `README.md` in the affected app/package in sync |

## References

External project references live in `.agents/references/`. When looking up source code in a referenced project (e.g., authup, routup, hapic), always update the corresponding reference file with:

- The source file path / function name in the external project
- The corresponding Hub file path / function name
- Any behavioral differences between the implementations

This builds a cumulative mapping over time so future work can quickly find corresponding code without re-searching.
