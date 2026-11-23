# Dependencies and Upgrades

Read before changing package.json dependencies, the lockfile, or bumping @authup/*, rapiq, validup or TypeScript.

## Dependency Classification

Hub's practice is **bimodal** and deliberately differs from authup's:

| Package group | Runtime deps declared as |
|---|---|
| Client/domain kits (`core-http-kit`, `messenger-http-kit`) | `peerDependencies` + an identical `devDependencies` mirror. **No `dependencies` block**, internal `@privateaim/*` / `@authup/*` included. |
| Client/domain kits with a validator stack (`storage-kit`, `telemetry-kit`) | The same peer+dev mirror, **plus** a plain `dependencies` block for the validator stack (`@validup/zod`, `validup`, `zod`; storage-kit also `@privateaim/errors`). |
| Server kits and apps | Plain `dependencies`. |
| Test-only deps | `devDependencies`, plus a tsdown `external` entry if they could otherwise be bundled (`packages/server-test-kit/tsdown.config.ts`: `external: [/^testcontainers/, /^vitest/]`). |

authup forbids internal packages in `peerDependencies`; hub does not follow that
rule, because applying it would disturb release-please's `node-workspace` plugin
(`updatePeerDependencies: true` in `release-please-config.json`).

#### Root `overrides`

- `npm install` runs **without `--force`**. On ERESOLVE, fix the conflict; never
  use `--force` or `--legacy-peer-deps` — both silently produce a tree that
  disagrees with the manifests (`--legacy-peer-deps` drops pinia and breaks the
  client-ui build).
- **There are no overrides**; the root manifest has no `overrides` key. Before
  adding one, check it is needed: an override rewrites the ranges npm records in
  the lockfile, so the lockfile then shows every requirer "agreeing" and a stale
  override looks load-bearing. Query the registry for the real range:

  ```bash
  npm view <pkg>@<version> peerDependencies.<dep> dependencies.<dep>
  ```

- Keep `validup` on one range everywhere (`^2.0.1`). `@validup/vue`'s
  `useValidup()` and `isValidupError()` duck-type against one module instance, so
  two copies silently stop recognising each other's `Container`/`Issue` values.
- **Check for a split tree after every bump in the authup/validup/ilingo
  ecosystem**, even when all declared ranges agree: npm may install identical
  versions as nested copies (seen for `@authup/client-web-kit`, `@validup/vue`,
  `@ilingo/validup-vue`) without warning. `npm dedupe` fixes it. `npm ls` prints
  one line per requirer, so read the placement keys instead:

  ```bash
  python3 -c "import json;d=json.load(open('package-lock.json'))['packages'];\
  print([k for k in d if k.endswith('node_modules/@validup/vue')])"
  ```

- The root `devDependencies.ioredis` (`^6`) is a hoisting lever: the optional `^5` peers of `typeorm`
  and `unstorage` otherwise keep ioredis 6 off the root, and npm nests a copy of ioredis,
  `redis-extension` and `@authup/server-adapter-kit` under each workspace. `npm dedupe` then
  ERESOLVEs on those peers; re-hoist by deleting the nested lock entries and running `npm install`.
  Only `nitropack`'s nested ioredis 5 is expected. Drop the entry once `typeorm` admits `^6`.
- Never regenerate the lockfile with `npm install --package-lock-only`: it
  resolves optional dependencies for the current platform only and drops the
  others (`@esbuild/*`, `@node-rs/*`, `@tailwindcss/oxide-*`), which breaks
  `npm ci` on CI. A plain `npm install` keeps them.

## authup beta.62 / rapiq 2.2 / validup 2 dependency bump

Error-model invariants from this bump:

- `Issue` / `defineIssueItem` come from `@ebec/core`; the validator engine
  (`Container`, `ValidupError`, `isValidupError`, `stringifyPath`) from validup.
  `HubError` inherits `issues` from `BaseError` (pass them via constructor
  options, do not `push`); `packages/errors` has no validup dependency.
- **`isHubError` reads the `@instanceof` chain only** (`matchesInstanceof`,
  `packages/errors/src/check.ts`), which also matches the JSON-serialized form.
  Never add a shape fallback (`issues` array): every `@ebec/core` `BaseError` and
  rapiq's `ParseError` carry `issues`, so it would misclassify rapiq errors and
  skip their 400 mapping. `HubError.toJSON()` writes the chain after spreading
  `data`, so `data` cannot overwrite it.
- **In `sanitizeError` the rapiq branch must stay above the validup branch**
  (`packages/server-http-kit/src/core/error/sanitize.ts`): `isValidupError` also
  shape-matches any `Error` with a well-formed `issues` array and would swallow
  rapiq errors. The rapiq `ParseError.issues` are forwarded into the payload,
  since rapiq's own message is only a violation count. See
  [api.md](../../docs/src/guide/development/api.md#error-responses).
- `meta.schema` emits `sorts` (rapiq's `describe()` has no `sort` alias), but the
  URL parameter stays `?sort=`. client-vue's `createList` reads both spellings,
  because published consumers may still write `sort`.
- A rejected query yields one issue, not one per bad key: the expression dialect
  throws on the first disallowed filter key. Only adopting `throwOnFailure` on
  every parameter changes that.

## authup beta.63 dependency bump

- **Register the UI redirect URI as `<ui-origin>/login/callback**`.** The
  post-login destination rides in the callback URI's `redirect` query
  (`apps/client-ui/pages/login/index.vue`), and Authup matches a registered
  `redirectUri` against the full URL including the query, so an exact
  registration fails only deep-link logins. See
  [reference/frontend](../../docs/src/reference/frontend/index.md#authentication).
- **Audit `actorName` is always `undefined`.** `TokenVerificationData` declares
  no subject-name claim, so `identity.attributes` carries only `id`
  (`packages/server-http-kit/src/middlewares/authup/utils.ts`). Do not read a
  claim off the introspection payload: `JWTClaims` has an index signature, so a
  wrong key type-checks as `any`. The claim must be declared upstream first.
- **TypeScript 7 is not adopted; stay on 6.0.x** (6.0.3 is the last 6.x). TS 7's
  npm package ships no compiler API (promised for 7.1), and `vue-tsc` (client-vue
  declaration emit and `nuxi typecheck`), `typescript-eslint` (peers
  `typescript <6.1.0`) and `@trapi/metadata` (`build:swagger`) need it.
  `tsc --noEmit` itself works under TS 7. Dropping `baseUrl` and
  `ignoreDeprecations` from the root `tsconfig.json` (rewriting `paths` relative
  to each file) works under both and can land on its own; see
  [conventions.md](../conventions.md#typescript).
- Spec fixtures for expiring rows must be relative to `Date.now()`: the event
  cleaner sweeps expired rows on every application start, so a past `expiresAt`
  races sibling spec files.

## authup beta.65 dependency bump

- **Re-check the Authup image's provisioning path on every bump.** A provisioning
  file at a path the image does not read is ignored silently: the container is
  healthy but holds none of hub's permissions. `containers.ts`
  (`packages/server-test-kit/src/testcontainers/`) sets
  `PROVISIONING_DIRECTORY_PATH=/etc/authup/provisioning` itself and mounts
  `hub.mjs` there, and `assertAuthupProvisioning()` fails global setup naming any
  missing permission.
- The header Gravatar uses `user.email || user.id`: authup's `buildUser()`
  answers `email: ''` when the token carries none, and `md5('')` would give every
  such user one shared avatar. Do not re-introspect from the UI to get claims.
- The account console default is `<authupUrl>/console/account`
  (`apps/client-ui/core/account.ts`, overridden by `NUXT_PUBLIC_ACCOUNT_URL`).
- `cookiePrefix` is wired from `COOKIE_PREFIX` /
  `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` and **empty by default** (nested under
  `public.authup`; no runtime key exists). A default prefix would rename every
  deployment's cookies, and changing it forces everyone to sign out, since
  un-prefixed cookies are then neither read nor swept.
