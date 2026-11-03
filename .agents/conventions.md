# Conventions

## Commit Messages

**Conventional Commits** (`@tada5hi/commitlint-config`, enforced by Husky + commitlint), e.g. `feat(server-core): add analysis bucket file upload`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`. The type and scope drive release-please bumps.

## Linting

ESLint 10 flat config extending `@tada5hi/eslint-config` (`eslint.config.js`): `npm run lint` / `npm run lint:fix`. The shared config enforces `I`-prefixed interfaces (existing public names without the prefix use type aliases), exported types in `types.ts`, no external-package re-exports in barrels, and the agent-docs checks. Unicorn's Buffer/base64 preferences stay off for server code and `kit`. Node 26 everywhere (`engines.node: >=26.0.0` in the root and every workspace).

## Pre-commit Hooks

Husky runs lint-staged (ESLint `--fix` on `*.{vue,js,ts}`) and commitlint.

## Build System

### Libraries (kits)

tsdown per package (`entry: 'src/index.ts'`, `format: 'esm'`, `dts: true`): ESM only, `dist/index.mjs` + `dist/index.d.mts`. `client-vue` is the exception: `@vitejs/plugin-vue` + `@tsdown/css`, declarations from `vue-tsc` (`.d.ts`).

#### Subpath exports

A kit ships a subpath (the four HTTP kits' `./testing`) with a second tsdown entry and one `exports` key:

```jsonc
// tsdown.config.ts: entry: ['src/index.ts', 'src/testing/index.ts']
"./testing": { "types": "./dist/testing/index.d.mts", "import": "./dist/testing/index.mjs" }
```

- tsdown names entries relative to their lowest common ancestor, so there is no basename collision.
- Use `.d.mts`; authup's `exports` blocks point at `.d.ts` and are wrong here.
- A second entry turns `dist/index.d.mts` into a re-export shim over a hashed chunk; a check grepping for a declaration body there silently fails.
- Nothing in CI verifies an `exports` map. After changing one, run `node --input-type=module -e "await import('@privateaim/<kit>/testing')"`.

### Services

tsdown (`entry: ['src/**/*.ts']`, `unbundle: true`, `dts: false`) plus `build:types` (`tsc --noEmit`). CLI entry points are `dist/cli/index.mjs`.

- tsdown 0.23 removed `bundle`: a leftover `bundle: false` is silently ignored and inlines any import the service does not declare into `dist/node_modules/` (a second module instance). Declare every runtime import in the service's own `package.json`.
- `build:types` emits nothing anywhere except client-vue. Every `tsconfig.build.json` includes `src/**` only, so **test files are type-checked by nothing in CI**: run `tsc --noEmit -p <pkg>/tsconfig.json` before pushing test-only changes.

### Nx Orchestration

`npm run build` / `npm run test` are `nx run-many`; `dependsOn: ["^build"]` orders packages and results are cached.

## TypeScript

- `@tada5hi/tsconfig`, ES2022, ESNext modules, bundler resolution, `strict: false`, decorators on (TypeORM), `"type": "module"` everywhere.
- Interfaces carry an `I` prefix; types do not. Types and interfaces live in `types.ts` in the same directory.
- **No re-export shims.** Never forward another package's symbols from a local file so call sites keep their import. When code moves into a shared package, rewrite every import and delete the old file. Directory barrels over their own siblings are fine.
- **Contract-first**: declare the interface and have the class `implements` it; never derive a contract from a class (`typeof Client`). Hub does not adopt authup's rule that `interface` is reserved for class contracts: core-kit entities are bare interfaces.
- `tsconfig.build.json` (what CI runs) has no `baseUrl`/`paths` and resolves through `dist`. The paths-mapped `tsconfig.json` resolves kits to `src` and needs `"ignoreDeprecations": "6.0"` because its `paths` depend on `baseUrl`, which TypeScript 7 removes.
- Map a kit subpath (e.g. `@privateaim/core-http-kit/testing`) in the consuming `tsconfig.json` next to the bare specifier, or the package enters the program twice and API-class signatures fail with TS2322.

## Validation

Zod 4 schemas through validup; validators live in the domain kits (`packages/<kit>/src/domains/<entity>/validator.ts`) and extend `TypedContainer<T>` from `@privateaim/kit` (see [database](topics/database.md#column-naming)).

## Query Filters

A rapiq filter that needs an **operator** (contains, negation, comparison, membership) uses the typed helpers from `@rapiq/core`, never a wire-marker string:

```typescript
// Bad: { filters: { name: `~${q}~`, status: '!' + s } }
{ filters: and(contains('name', q), not(eq('status', s)), inArray('id', ids)) }
```

Object-literal equality and arrays (`{ filters: { realmId: [id, null] } }`) are current rapiq v2 syntax. ESLint (`no-restricted-syntax` in `eslint.config.js`) rejects a `filters` value starting with `~`, `!`, `<` or `>`, in script code only, not in Vue templates.

## Database Migrations

Both dialects, one named migration per feature, released migrations immutable, verified with the run → revert × N → run round-trip and the drift gate. Full rules: [database](topics/database.md#database-migrations).

## Logging

Winston → `LoggerTransport` (server-telemetry-kit) → VictoriaLogs, where every string/number/boolean metadata key becomes a queryable label; entity views filter on `refType` + `refId`.

**Keep human-readable tokens in the message; move opaque UUIDs to labels.** Filenames, paths, names, enum-like types and counts stay inline. Never interpolate an entity id: attach it as `LogFlag.REF_TYPE` + `LogFlag.REF_ID` (secondary ids as named labels). `REF_TYPE` takes the `DomainType` of the referenced entity's own kit (`@privateaim/core-kit`, `@privateaim/storage-kit`), not telemetry-kit's. A log without them never appears on the entity view.

```typescript
this.logger?.info('Created bucket for analysis', {
    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
    [LogFlag.REF_ID]: analysis.id,
});
```

## Release Process

release-please versions, monoship (`tada5hi/monoship@v2`) publishes; all packages share one version and one `v<version>` tag. The `linked-versions` plugin links nothing under `"include-component-in-tag": false` (googleapis/release-please#1750), so a package without a bump-worthy commit since the last release needs a touch commit (the `version-bump` skill) to stay on the shared version.

## Hexagonal Architecture (all services)

### Dependency Rule

`core/` imports only domain packages (`@privateaim/*-kit`, `@privateaim/kit`, `@privateaim/server-kit`, `@ebec/http`, `@authup/access`), never typeorm, routup, `adapters/` or `app/`. `adapters/` implement core ports; `app/` wires both.

### Core Layer Conventions

Entity services own validation and take repositories through the constructor; ports are `IXRepository extends IEntityRepository<T>` and `IXService` in `types.ts`. Business services take every dependency (repositories, dispatchers) through the constructor; their ports live in `core/services/types.ts`.

### Subscriber Conventions

Subscribers are constructed with their dependencies in `DatabaseModule.setup()` and pushed onto `dataSource.subscribers`; no `@EventSubscriber()` auto-discovery. They only publish domain events (`BaseSubscriber`); business logic belongs in services.

## DI Modules

- One directory per orkos module under `app/modules/<name>/`: `constants.ts` (one `TypedToken<T>` from `eldin` per key), `types.ts`, `module.ts`, `index.ts`.
- Shared modules (logger, redis, message-bus, authup, entity-event, config) live in `packages/server-kit/src/<name>/` and export their name as `<X>_MODULE_NAME`. `message-bus/` holds only the DI module, its keys and the log-hook factories; bus, drivers, dispatchers and workers come from hubwire (`@hubwire/amqp` for AMQP). Observability is a `hooks` option built with the server-kit factories, never a logger.
- **Every module that starts components stops them** in `teardown()`, then awaits each `settled?.()`. A scheduled job is `defineScheduledComponent`, never a hand-rolled `node-cron` task or `setInterval`.
- Start commands stay minimal (`createApplication()` + `app.setup()`); `HTTPModule` calls `listen()` itself and `options.socket` toggles the socket server.

## Docker

One `Dockerfile` builds the monorepo; `entrypoint.sh` picks the service from env vars. `docker-compose up` starts MySQL and Postgres for local development.

## Documentation Site

`docs/` is the VitePress site (`@privateaim/docs`, `npm run dev|build --workspace=docs`) and the authoritative reference for Hub. Structure: [docs-site](topics/docs-site.md).

### Keeping Docs in Sync

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

`.agents/references/` maps external projects (authup, routup, hapic) to hub. When you look up code in one, record the external path/function, the hub counterpart and any behavioral difference in the matching reference file.
