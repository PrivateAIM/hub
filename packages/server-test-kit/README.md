<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-test-kit 🧪</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-test-kit)](https://www.npmjs.com/package/@privateaim/server-test-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Test fakes and Testcontainers helpers for FLAME Hub services: in-memory repositories, actors, Authup and databases.**

Service specs run against port fakes instead of `vi.fn()` stubs, and HTTP suites get a real Authup and database per suite
without hand-written container setup. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Actors](#actors) · [Fake repository](#fake-repository) · [Fake Authup client](#fake-authup-client) · [Testcontainers](#testcontainers) · [Tokens](#tokens) · [Schema guards](#schema-guards) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/guide/development/setup.html#running-tests)

---

## Installation

```bash
npm install --save-dev @privateaim/server-test-kit
```

The package ships ESM only and needs Node.js `>=26.0.0`. Its peer dependencies are the Authup kits (`@authup/access`,
`@authup/core-http-kit`, `@authup/core-kit`, `@authup/server-test-kit`), `@privateaim/core-http-kit`, `@privateaim/server-kit`,
`@rapiq/core`, `@rapiq/adapter-memory`, `hapic`, `typeorm` and `typeorm-extension`. The [Testcontainers](#testcontainers)
helpers additionally need `testcontainers` and `vitest`, which are not peers, so a suite that uses only the fakes does not need them.

## Usage

A service spec wires the real service with a fake repository and a fake actor, then asserts on the result and on the checks
the service made:

```typescript
import { createScopedActor, FakeEntityRepository } from '@privateaim/server-test-kit';
import { expect, it } from 'vitest';

it('lists only the nodes of the actor realm', async () => {
    const repository = new FakeEntityRepository<Node>();
    repository.seed([
        { id: 'a', name: 'own', realmId: 'realm-a' },
        { id: 'b', name: 'foreign', realmId: 'realm-b' },
    ]);

    const service = new NodeService({ repository });
    const actor = createScopedActor({ realmId: 'realm-a', realmScope: 'own' });

    const { data } = await service.getMany({}, actor);

    expect(data.map((node) => node.id)).toEqual(['a']);
    expect(actor.permissionEvaluator.compileCalls).toHaveLength(1);
});
```

## Actors

Each factory returns a `FakeActorContext`: an `ActorContext` whose `permissionEvaluator` is `FakePermissionEvaluator` from
`@authup/server-test-kit`, so a spec reads `preEvaluateCalls`, `evaluateCalls` or `compileCalls` without a cast.

| Factory | Behaviour |
|---|---|
| `createAllowAllActor(realmId?)` | Every evaluation passes; `compile()` answers `post`, so a scoped read reaches every row of every realm |
| `createDenyAllActor(realmId?)` | Every evaluation throws authup's `PermissionError` |
| `createScopedActor(options)` | Every grant carries `realmScope`, enforced the way Authup enforces it |

`createScopedActor` options:

| Option | Type | Default | Description |
|---|---|---|---|
| `realmScope` | `'any' \| 'ownOrNull' \| 'own' \| 'none'` | (required) | The `realm_scope` of every grant |
| `realmId` | `string` | random UUID | The actor's realm |
| `identity` | `ActorContext['identity']` | a user of `realmId` | The actor's identity |
| `policy` | `(attributes) => boolean` | none | A grant policy that does not lower onto a column: `compile()` answers `post`, and a record passes only when the realm scope matches and the policy holds for the row |

- An evaluation with realm data passes only when `realmScopeMatches` does; one without (a capability pre-gate) passes.
- `compile()` answers like Authup lowers the scope: `any` is `allow`, `own` is `realmId = <realm>`, `ownOrNull` also matches
  `null`, `none` is `deny`.
- With a `policy`, an evaluation without a row (`attributes`) denies.
- A spec about realm reach needs the scoped actor; the allow-all actor reaches everything.

`FakePermissionEvaluator` itself is not re-exported; import it, `EvaluatorBehavior`, `EvaluatorCall` and `EvaluatorMethodName`
from `@authup/server-test-kit`.

## Fake repository

`FakeEntityRepository<T>` implements server-kit's `IEntityRepository<T>` in memory.

```typescript
const repository = new FakeEntityRepository<Node>();

repository.seed({ id: 'a', name: 'node', realmId: 'realm-a' });

const node = await repository.findOneById('a');
await repository.save({ ...node, name: 'renamed' });

expect(repository.getAll()[0].name).toEqual('renamed');
expect(repository.findManyCalls).toHaveLength(0);
```

- `findMany(query)` applies the query's **filters** through `@rapiq/adapter-memory`, so a scope the service appended narrows
  the result like the database would. Fields, sorts and pagination are ignored; `meta` reports the match count, offset 0, limit 50.
- `findManyCalls` records every query `findMany` received, for asserting the appended scope.
- Reads return a copy of the stored row. Mutating a loaded entity changes nothing until you `save()` it.
- `merge(entity, data)` mutates `entity` in place and sets `updatedAt`, like TypeORM's `merge`: snapshot it first when you
  compare before and after.
- `create(data)` fills `id`, `createdAt` and `updatedAt`; `findOneBy` / `findManyBy` match by strict equality on every key.
- Helpers: `seed(entity | entities)`, `getAll()`, `clear()`. `validateJoinColumns()` is a no-op.

## Fake Authup client

`createFakeAuthupClient({ handlers, fallback, baseURL })` returns a `FakeAuthupClient`: a real `AuthupClient` from server-kit on
an in-memory hapic transport, so header handling, body decoding and error mapping stay live.

```typescript
import { createFakeAuthupClient, fakeAuthupResponse } from '@privateaim/server-test-kit';

const authup = createFakeAuthupClient({
    handlers: {
        'GET /clients/:id': ({ params }) => ({ data: { id: params.id, name: 'node-client' }, meta: {} }),
        'DELETE /clients/:id': () => fakeAuthupResponse(404, { message: 'not found' }),
    },
});

expect(authup.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
```

- Handler keys are `'<METHOD> /<path>'` with `:name` placeholders; `'*'` is a catch-all that loses to any specific pattern.
- A handler returns the response body (status 200), or a `Response` from `fakeAuthupResponse(status, body)`. A non-2xx goes
  through hapic's real error pipeline, so `isClientErrorWithStatusCode(error, 404)` recognizes it.
- An unmatched request gets `fallback`, by default `{ data: [], meta: { total: 0 } }`.
- `requests` records every request in order (`method`, `url`, decoded `body`, `params`, lower-cased `headers`).
- `matchAuthupRoute` is the route matcher, if you need it directly.

Use this instead of `@authup/core-http-kit/testing`'s fake client, which always answers 200 and cannot reach a 404 branch.

## Testcontainers

HTTP suites run against a real Authup and a real database, with authorization enforced. A vitest global setup provides both:

```typescript
// test/setup.ts
import type { TestProject } from 'vitest/node';
import { provideAuthup, provideDatabase, stopTestContainers } from '@privateaim/server-test-kit';

export async function setup(project: TestProject) {
    await provideDatabase(project, 'storage');
    await provideAuthup(project, ['bucket_create', 'bucket_update', 'bucket_delete']);
}

export async function teardown() {
    await stopTestContainers();
}
```

```typescript
// test/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globalSetup: ['test/setup'],
        setupFiles: ['reflect-metadata', '@privateaim/server-test-kit/setup'],
    },
});
```

| Dependency | Used as-is when | Otherwise |
|---|---|---|
| Database | `DB_TYPE` is set (`mysql` / `postgres` use the `DB_*` connection; `better-sqlite3` stays in memory per worker) | A `postgres:18` container |
| Authup | `AUTHUP_URL` is set | An `authup/authup` container tagged with the installed `@authup/core-kit` version (`AUTHUP_IMAGE_TAG` overrides it) |

- `provideDatabase(project, suite)` gives each suite its own database, `<DB_DATABASE>_<suite>`, dropped and re-created once
  before any worker starts. `suite` must match `[a-z][a-z0-9_]*`.
- `provideAuthup(project, permissionNames, options?)` provisions exactly the permission names the suite checks as global
  permissions, which the built-in `admin` role resolves. With `options.tokenExchange` (`audience`, `value`, `maxAge`,
  `realmScope`) it also enables token exchange on the built-in `system` client for that audience.
- Both paths, container and external `AUTHUP_URL`, run `assertAuthupProvisioning()`: it introspects an admin token and fails
  global setup naming every missing permission.
- Authup runs on the same engine as the suite: its own MySQL or PostgreSQL container on a shared network, or in-memory SQLite.
- The `@privateaim/server-test-kit/setup` entry calls `hydrateTestEnv()`, which copies the provided connection and Authup URL
  into each worker's `process.env` before the test application is built.

Lower-level helpers for custom setups: `startAuthupContainer`, `startPostgresContainer`, `buildAuthupProvisioning`,
`buildAuthupProvisioningModule`, `readDatabaseConnectionEnv`, `applyDatabaseConnectionEnv`, `buildSuiteDatabaseName`,
`recreateDatabase`, `isServerDatabaseType`, `hasDatabaseEnv`, `hasAuthupEnv`, `resolveAuthupDatabaseEnv`.

## Tokens

All token helpers mint against `process.env.AUTHUP_URL` (or a `baseURL` argument) and throw when it is unset.

| Helper | Returns |
|---|---|
| `createAdminAccessToken(baseURL?)` | An access token of the `admin` user (password `start123`, realm `master`), which holds every provisioned permission |
| `createAdminAuthorizationHeader(baseURL?)` | The same token as a `Bearer ...` header value, for raw `fetch` requests (uploads, streams) |
| `createRestrictedAccessToken(permissionNames?, baseURL?)` | A token of a new master-realm user holding exactly `permissionNames` (default none), to test a real denial |
| `createCapabilityToken({ subjectToken, cap, expiresIn?, audience? })` | A capability token exchanged as the `system` client; `audience` defaults to `storage`. Needs `provideAuthup(..., { tokenExchange })` |

`createRestrictedAccessToken` grants only global permissions (bound to neither a realm nor a client; `selectGlobalPermission`
picks that row) and throws when a name is not provisioned. `buildAuthupURL(base, path)` resolves a path without dropping a
sub-path of the Authup URL.

## Schema guards

Helpers for specs that check entity metadata and rapiq schemas against each other:

| Helper | Returns |
|---|---|
| `toMetadataOnlyDataSourceOptions(options)` | The service's DataSource options on in-memory SQLite without migrations, to build entity metadata without a database |
| `collectColumnNamingViolations(dataSource)` | Columns whose database name contains an upper-case letter or differs from the snake_case of the property (a missing or mistyped `@Column({ name })`) |
| `collectUncoveredColumns(schema, metadata, exclusions?)` | Selectable columns in neither `fields.default` nor `fields.allowed`; such a column never appears in a response |
| `collectNonLeadingQueryKeys(schema.describe())` | Allow-listed filter and sort keys (`filters.<key>`, `sorts.<key>`) that lead no declared `indexes` sequence |

Each spec asserts an empty result:

```typescript
const dataSource = new DataSource(toMetadataOnlyDataSourceOptions(options));
await dataSource.initialize();

expect(collectColumnNamingViolations(dataSource)).toEqual([]);
expect(collectUncoveredColumns(nodeSchema, dataSource.getMetadata(NodeEntity))).toEqual([]);
expect(collectNonLeadingQueryKeys(nodeSchema.describe())).toEqual([]);
```

## Notes

- **Assert the right denial.** The fakes deny with authup's `PermissionError`, as production does. Use
  `toThrow(PermissionError)` for an evaluator denial and `toThrow(PermissionDeniedError)` only where hub code throws after a
  predicate said no. A hand-written evaluator behavior must also throw `PermissionError`: `reachesRecord` reads only that as
  "not reached".
- **Provision exactly what the service checks.** List the permission names the service evaluates in its `test/setup.ts`; a name
  that does not resolve for the admin token fails global setup. An external `AUTHUP_URL` must expose the `admin` / `start123` /
  `master` user and have those permissions provisioned by hand.
- **`collectNonLeadingQueryKeys` checks root keys only.** A dotted relation key added to a root allow-list is reported as an
  offender; extend the helper rather than weakening the check. An empty or missing `indexes` list makes every allowed key an
  offender.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
