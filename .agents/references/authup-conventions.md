# Authup Conventions Reference

Reference: [authup/authup/.agents/conventions.md](https://github.com/authup/authup/blob/master/.agents/conventions.md)

This documents the conventions Hub should adopt as part of modernization (see Plans 001, 003-005).

## Tooling Comparison

| Tool | Authup | Hub (Current) | Hub (Target) |
|------|--------|---------------|--------------|
| Task runner | Nx | Nx | Nx (keep) |
| JS bundling | Rollup | Rollup | tsdown (Plan 001) |
| Linting | ESLint + `@tada5hi/eslint-config-vue-typescript` | ESLint 8 + same config | ESLint 10 + `@tada5hi/eslint-config` (Plan 001) |
| Test runner | Vitest + SWC | Vitest + SWC | Keep |
| Pre-commit | Husky + lint-staged | Husky + lint-staged | Keep |
| Commit style | commitlint (Conventional Commits) | commitlint | Keep |

## Validation & Error Handling

**Authup pattern:**
- Validation uses `validup` framework with `@validup/adapter-zod`
- Validators run inside core services, not controllers
- Services receive raw `Record<string, any>` and call `validator.run(data, { group })`
- Errors use `@authup/errors` (HTTP-aware via `@ebec/http`)

**Hub current:** Validation is mixed — some in handlers, some in kit validators. Should converge to service-layer validation.

**Hub target:** Match authup — validators in services, raw data from controllers.

## File Organization Rules

1. Exported **types** must live in `types.ts` files, not inline in implementation
2. Barrel `index.ts` files re-export from `types.ts` and implementation modules
3. No explanatory comments unless explicitly requested

## Database Migrations

Source: [`.agents/conventions.md` § Database Migrations](https://github.com/authup/authup/blob/master/.agents/conventions.md) (authup), verified 2026-07-26.

**Authup pattern:**
- **One named migration per feature.** Each feature/PR adds its own migration in both
  dialects with a descriptive class/file name (`1784289540000-CamelCaseAttributes.ts`,
  `1784460916000-RemoveRobots.ts`) and a doc-comment header explaining the change.
- **Consolidation happens at release time, not merge time.** A release window's
  migrations *may* be squashed into one file per dialect as a deliberate last step
  before the release PR merges (keeping the earliest timestamp). Shipping several
  named migrations in one release is fine.
- **Released migrations are immutable.** A migration may be amended while it lives
  only on its own unmerged branch; once released, never touch it.
- After adding or amending a migration, run the round-trip: `migration run` →
  `revert` × N → `run`.

**Hub mapping:** same layout — `apps/<service>/src/adapters/database/migrations/{mysql,postgres}/`,
same sqlite carve-out (`migrations: []`, boot falls back to `synchronize()`), and the
same round-trip check is already documented in [testing.md](../testing.md#migration-tests)
and run by the `tests-migrations` CI job. See
[conventions.md § Database Migrations](../conventions.md#database-migrations).

**Hub divergence:** hub allows several changes to share one migration file, where
authup keeps them strictly one-per-feature until release-time squashing. Hub's
constraint is instead that the file name and doc comment must name every change the
migration performs, so nothing a migration does is invisible from its name.

## Table Naming

**Authup pattern:** every table is plural and prefixed — `auth_users`, `auth_roles`,
`auth_scopes`, `auth_sessions`, `auth_role_permissions`, `auth_identity_provider_accounts`.
No singular exceptions across ~20 tables.

**Hub mapping:** Hub is unprefixed but otherwise matches — `nodes`, `projects`,
`registries`, `registry_projects`, `master_images`, `analysis_nodes`, `analysis_buckets`.
The analysis table was the sole singular outlier (`analysis_entity` → `analysis` →
`analyses`, the last step by `RegistryFkSetNullAndRenameAnalysis1784000000000`).

## Configuration Naming

| Pattern | Example |
|---------|---------|
| Boolean toggles | `registrationEnabled`, `skipProjectApproval` |
| Env vars | `REGISTRATION_ENABLED`, `SKIP_PROJECT_APPROVAL` |
| Config keys | camelCase matching TypeScript property |

Hub currently uses `SKIP_PROJECT_APPROVAL` and `SKIP_ANALYSIS_APPROVAL` — these already follow the pattern.

## Workflow Convention

After making changes, always:
1. Build the affected package: `npm run build -w <workspace>`
2. Run ESLint on changed files: `npx eslint --fix path/to/changed/files`
3. Fix any build or lint errors before considering done

## Best Practices (from Authup, applicable to Hub)

- Use **ESM** and modern TypeScript/JavaScript
- Prefer **Web APIs** over Node.js-specific APIs where possible
- Use hexagonal architecture in services
- Use domain interfaces (from `core-kit`) in ports, TypeORM entity classes only in adapters
- Before adding new code, study surrounding patterns and naming
- No `useX()` singleton accessors — use DI constructor injection

## Contract-First HTTP Clients & the `./testing` Subpath

Adopted from authup (`packages/core-http-kit/src/{client,testing}`,
`packages/client-web-kit/test/utils/index.ts`), with two deliberate divergences.

**Authup pattern:** each HTTP client declares an explicit contract interface that
the class `implements`, and the package ships a `./testing` subpath exporting a
`FakeClient` / `createFakeClient` / `matchRoute` so downstream component tests
run against a real client object without a network.

**Hub mapping:**

| Authup | Hub |
|---|---|
| `packages/core-http-kit/src/client/type.ts` (`type.ts`, singular) | `packages/core-http-kit/src/client/types.ts` (plural — hub's `types.ts` convention wins) |
| `IClient` (per-package) | `ICoreClient` / `IStorageClient` / `ITelemetryClient` / `IMessengerClient` (service-prefixed) |
| `packages/core-http-kit/src/testing/{matcher,module,types}.ts` | same layout, in all four hub HTTP kits |
| `dist/testing/index.{d.ts,mjs}` | `dist/testing/index.{d.mts,mjs}` |
| `packages/client-web-kit/test/utils/index.ts` (unpublished harness) | `packages/client-vue/test/utils/index.ts` (unpublished harness) |

**Hub divergence 1 — service-prefixed contract names.** hapic itself exports
`IClient`, and hub imports it unaliased in every `domains/base.ts`. A hub-local
`IClient` in the same package would be same-name-different-shape shadowing, made
easy to miss by the root `strict: false`. Service prefixes also remove the
aliasing consumers already do (`import type { APIClient as StorageClient }`),
and client-vue imports all three clients in one file, where distinct names are
mandatory anyway. The hapic import is aliased to `IBaseClient` throughout.

**Hub divergence 2 — `MemoryTransport` instead of overriding `request()`.**
authup's `FakeClient extends Client` overrides `request()`. Hub instead injects
hapic 3's `MemoryTransport` through the (widened) `ClientOptionsInput`
constructor and leaves the request pipeline intact. Three concrete wins:

1. All four hub clients install a `HookName.RESPONSE_ERROR` message-rewrite hook
   **in their constructor**, and server-side DI additionally calls
   `hook.attach(client)` with authup's `ClientAuthenticationHook`. Overriding
   `request()` bypasses both; injecting a transport does not. Each kit's
   `fake-client.spec.ts` pins this by asserting the rewritten `error.message`.
2. authup's fake hard-codes `new Response(null, { status: 200 })` and cannot
   produce a non-2xx. `MemoryTransport` accepts a `MemoryResponseInit` or a real
   `Response`, so `fakeResponse(400, …)` becomes a genuine hapic `ClientError`.
3. Client-level defaults set via `setAuthorizationHeader()` are visible in the
   recorded request — authup documents their absence as a limitation of its fake.

Both repos keep the fake a **real subclass**, which matters for the
`client[entityType]` own-property dispatch sites and for hapic's
`Symbol.for('hapic/Client')` marker that `isClient()` checks.

**Do NOT port:** authup's rule that `interface` is reserved for class-implemented
contracts (hub's core-kit domain entities are bare `interface`s), nor its
dependency-classification rule forbidding internal packages in
`peerDependencies` (see [conventions.md](../conventions.md#dependency-classification)).
