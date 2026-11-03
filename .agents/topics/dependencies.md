# Dependencies and Upgrades

Read before changing package.json dependencies, the lockfile, or bumping @authup/*, rapiq, validup or TypeScript.

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

#### Root `overrides`

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
itself, so there is no conflict and authup's store runs inside its
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

## authup beta.62 / rapiq 2.2 / validup 2 dependency bump

authup beta.62 / rapiq 2.2 / validup 2 dependency bump — Implemented (`@authup/*` beta.59 → **beta.62**, `@rapiq/*` 2.0.0-beta.19 → **2.2.0** stable, `@ebec/core` **1.3.2** + `@ebec/http` **4.3.2**, hapic **3.0.2** family, `validup`/`@validup/*` 1.x → **2.0.1**, `ilingo` **6.2.0** / `@ilingo/vue` **6.1.1** / `@ilingo/validup*` **1.2.0**, `typeorm-extension` 4.0.0-beta.1 → **4.1.0**, `@trapi/cli` **2.0.5**). Four things in it are not version-string churn:

- **The issue model moved from validup to `@ebec/core`** (port of [authup f9db4e1a](https://github.com/authup/authup/commit/f9db4e1a740292b1d1ca178c3a5764fadaf84d0f)). validup 2.0 dropped the re-export, so `Issue` / `defineIssueItem` now come from `@ebec/core` while the validator engine (`Container`, `ValidupError`, `isValidupError`, `stringifyPath`, …) stays on validup. `HubError` declares no `issues` of its own — it inherits `readonly issues: ReadonlyArray<Issue>` from `BaseError`, populated from constructor options, so `sanitizeError` passes validup issues in rather than `push`ing them after construction. `packages/errors` dropped its validup dependency entirely.
- **`isHubError` is now chain-only, and that was mandatory.** Its old shape fallback (`isBaseError(input) && Array.isArray(input.issues)`) became a *misclassifier* under this bump: `@ebec/core` 1.3.2 gives **every** `BaseError` an `issues` array and rapiq 2.2's `ParseError` carries one too, so every rapiq decode error matched and `sanitizeError` returned it unchanged — a foreign `code`, not mapped to 400. Restoring the old guard fails 7 of the 8 specs in `packages/server-http-kit/test/unit/sanitize-error.spec.ts`, four of which predate this change. The guard now reads the `@instanceof` chain only, via `matchesInstanceof`, which also matches the JSON-serialized form — so a hub error survives a hop between services. `HubError.toJSON()` re-appends the chain after spreading `data`, since `data` is an open bag that could otherwise overwrite the one key the guard reads.
- **`sort` → `sorts` is wire-visible in `meta.schema`.** rapiq 2.1 made `sorts` canonical on every developer-authored surface and `describe()` emits **only** `sorts` — no alias. All 16 entity schemas, the client query build inputs and `ListMeta` moved; `createList` reads both spellings (definedness, not key presence) because client-vue is published and a consumer may still spell it `sort`. **The URL parameter is unchanged — a query string still carries `?sort=-updatedAt`.** rapiq 2.1 also added schema index declarations, so descriptions gained `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed` (all `null`/`false` at the time — the schemas began declaring `indexes` with #1842, item 24). Docs updated in `docs/src/guide/development/api.md` and `docs/src/reference/{core/core-http-kit,storage/storage-kit}.md`.

- **The rapiq parse trace is forwarded into the HTTP error payload**, and that is a fix, not a nicety. rapiq 2.2 collects every violation and raises one aggregate whose message is a bare count (`The input was rejected: 1 violation.`), so without it a rejected query answers 400 naming nothing. `sanitizeError` now passes `ParseError.issues` through — unmapped, because `@ebec/core` 1.3.2 vendored blemish's issue model verbatim and the two `Issue` types are mutually assignable. The rapiq branch had to move **above** the validup branch: `isValidupError` also falls back to a shape check (any `Error` with a non-empty well-formed `issues` array), so with @ebec/core 1.3.2 it now swallows traced rapiq errors — the same inversion `isHubError` had to be narrowed for, one library up. Error-payload shape documented in [api.md](../../docs/src/guide/development/api.md#error-responses).

The one follow-up this deliberately did **not** do — declaring `indexes` on hub's schemas to back the query surface with real entity indexes (authup did, in its own PR) — has since landed as [#1842](https://github.com/PrivateAIM/hub/issues/1842); see item 24. The enforcement point was wired here all along: `assertSchemaMatchesEntity` (called by every service's `schema-entity-parity.spec.ts`) verifies declared `indexes` on top of its key check, and is not vacuous, since every schema declares some. Note a rejected query still yields **one** issue rather than one per bad key: the expression dialect throws structurally on the first disallowed filter key and ends the parse, while the other parameters run in rapiq's default drop mode. Adopting `throwOnFailure` across every parameter is what would change that. The root `overrides` key is now **removed** — see [conventions.md](#root-overrides).

## authup beta.63 dependency bump

authup beta.63 dependency bump — Implemented (`@authup/*` beta.62 → **beta.63** across all 13 packages, plus `@tada5hi/eslint-config` 2.3.1 → **2.4.0**, `eslint` **10.9.1**, `typescript-eslint` **8.68.0**, `vitest` **4.1.11**, `nx` **23.1.1**, `mysql2` **3.24.2**, `@types/node` **26.3.0**, `@swc/core` **1.16.1**, `happy-dom` **20.11.6**, `lint-staged` **17.3.0**, `pinia` **4.0.3**, `vue-tsc` **3.3.11**, `uuid` **14.0.2**, `locter` **4.1.1**, `@nuxt/icon` **2.5.1**, `@tada5hi/commitlint-config` **1.3.2**, and eight caret ranges realigned to the version already hoisted). **TypeScript stays at 6.0.3** — see below. Four things in it are not version-string churn:

- **The post-login destination moved out of `AuthorizationRequest` and into the callback URI's query**, and this is **deployment-breaking**. `AuthorizationRequest.target` is gone; `@authup/client-web-nuxt`'s routing interceptor now reads `redirect` from the callback route. `apps/client-ui/pages/login/index.vue` builds the callback as a `URL`, sets `redirect` on it, and hands the **same string** to `saveAuthorizationRequest` and `buildAuthorizeURL` (RFC 6749 §4.1.3 replays it byte-for-byte). The consequence operators must act on: Authup matches a registered `redirectUri` against the full canonical URL **including the query** (`isSimpleURLMatch` builds `origin + pathname + search + hash`), so an **exact** `<ui-origin>/login/callback` registration stops matching once a destination rides along — verified empirically against authup's own matcher. Register `<ui-origin>/login/callback**`. The breakage looks intermittent, because a login from the bare login page carries no `redirect` and still succeeds; only deep-link logins fail. Documented in [reference/frontend](../../docs/src/reference/frontend/index.md#authentication).
- **The Authup image's writable directory moved**, `/usr/src/app/writable` → `/var/lib/authup`, and it took the whole test suite down silently. Hub copied its generated provisioning module to the old path; a provisioning file at an unread path is simply never loaded, so the container started, reported healthy, answered introspection normally — with Authup's own 71 permissions and **none** of hub's. The symptom was 33 failures across server-core/storage/telemetry reading `The evaluation of permissions <name> failed`, with nothing pointing at a mount path. `WRITABLE_DIRECTORY_PATH` is now **set by hub** in the container env with the copy target derived from the same constant, so mount and server agree by construction. `assertAuthupProvisioning()` (global setup, both the container **and** external-`AUTHUP_URL` paths) mints the admin token, introspects it and diffs the resolved permission set against the suite's, turning the next such miss into one immediate error naming the missing permissions. Negative-controlled: it rejects an unprovisioned name and accepts the real set.
- **`store.user` narrowed to `Pick<User, 'id' | 'name' | 'displayName'>`** and the `user` cookie is gone (authup does not fetch `/userinfo`; the session is derived from the introspection). `apps/client-ui/components/layout/header.vue` read `user.email` for `<VCGravatar>`. **The email is not absent from the wire** — the introspection response the store consumes still carries `email` and `email_verified` (verified empirically against a beta.63 container) — but `buildUser()` destructures only `name` and `nickname` and the store exposes no raw payload, so no consumer has a supported way to reach it and no real Gravatar hash can be derived. The header now passes `user.id`, which the component md5s — verified against gravatar.com that a *hashed* value yields a distinct per-account identicon while an unhashable one (a raw UUID as `hash`) collapses every user onto one shared placeholder. Do **not** recover the address by re-introspecting from the UI: that repeats, on every render, the round-trip authup deliberately removed. Restoring a real avatar is an upstream ask (expose the claim on the store), not a hub workaround.
- **`OAuth2TokenPayload.sub_name` was removed as a claim authup never populated**, which retroactively explains a hub bug: `identity.attributes.name` — and therefore `metadata.actorName` on every audited write, a persisted column rendered on the admin events page — has **always** been `undefined`. Both `TokenVerificationDataMinimal` picks dropped it (behaviour-preserving). Do **not** restore it by reading a claim off the introspection payload: `JWTClaims` carries `[key: string]: any`, so any key type-checks as `any` and a wrong guess fails silently rather than at the compiler — the claim has to be declared upstream first.

**TypeScript 7.0.2 was evaluated and deliberately NOT adopted.** TS 7's npm package ships no JS compiler API (`require('typescript')` exports only `version`/`versionMajorMinor`; a stable API is promised for 7.1), and three load-bearing tools consume it: `vue-tsc` 3.3.11 crashes (`ERR_PACKAGE_PATH_NOT_EXPORTED` on `./lib/tsc`) and is hub's **only real declaration emit** (`packages/client-vue`) plus what `nuxi typecheck` runs; `typescript-eslint` 8.68 peers `>=4.8.4 <6.1.0`; `@trapi/metadata` imports ~50 TS API symbols and backs `build:swagger`. `tsc --noEmit` itself IS a clean drop-in (22 of 24 `tsconfig.build.json` pass under TS 7, the 2 failures reproduce identically under 6.0.3, and `experimentalDecorators`/`emitDecoratorMetadata`/`strict:false` all carry over). 6.0.3 is the last 6.x ever published. The `baseUrl` removal prep — dropping `baseUrl` + `ignoreDeprecations` from the root config and rewriting 89 `paths` values across 21 child tsconfigs to be relative to their own file — is verified to work under **both** 6.0.3 and 7.0.2, so it can land on its own whenever; see [conventions.md](../conventions.md#typescript).

One fix in here is not from the bump at all: `apps/server-telemetry/test/unit/event.spec.ts` hard-coded `expiresAt: '2025-08-08…'` — a **past** date — with `expiring: true`. `EventComponentCleanerHandler.initialize()` sweeps expired rows on **every** application start, so a sibling spec file booting its own app deleted that row between this spec's `create` and its `delete`. It raced only under full-suite parallelism, which is why it passed in isolation and produced a different failure on each run. The fixture is now relative to `Date.now()`.

## authup beta.65 dependency bump

authup beta.65 dependency bump — Implemented (`@authup/*` beta.63 → **beta.65** across all 13 packages). The jump skips over beta.64, which shipped a large server-core/console rewrite (config-as-one-document, consoles-as-services, FHS image layout) that touches none of the packages hub actually imports — but three of its changes reach hub anyway, plus one from beta.65 itself:

- **The testcontainers provisioning path moved again, and this time the env var is gone, not just its default.** beta.64's FHS image layout retires `WRITABLE_DIRECTORY_PATH` outright (the one hub pinned after the beta.63 move, item 20 above) and splits it into `LOG_DIRECTORY_PATH` (what the process writes, default `/var/log/authup`) and `PROVISIONING_DIRECTORY_PATH` (what it only reads, default `/etc/authup/provisioning` — naming the provisioning directory itself, with no `provisioning/` subpath appended the way the old key had). `packages/server-test-kit/src/testcontainers/containers.ts` now pins `PROVISIONING_DIRECTORY_PATH` explicitly (same "agree by construction" rationale as before) and mounts `hub.mjs` directly under it. Verified against a real beta.65 container: server-storage (3 permissions), server-core (19) and server-telemetry (6) all pass their full Docker-backed suites, so `assertAuthupProvisioning()` actually resolved hub's permissions rather than silently missing them again.
- **`store.user` regains `email`** (`client-web-kit` beta.64, authup#3517, mirrors the beta.63 narrowing, item 20 above). `apps/client-ui/components/layout/header.vue`'s Gravatar now hashes `user.email` again instead of the `user.id` placeholder workaround; the real per-account avatar is back with no re-introspection round-trip. `buildUser()` answers `email: ''` rather than omitting the field when the introspected token carries none (reachable for a provisioning-created user whose entry skips authup's own placeholder-backfill), and `@vuecs/gravatar` has no empty-string guard — `md5('')` would collapse every such user onto one shared avatar, the exact collision the deleted workaround existed to prevent — so the template falls back to `user.email || user.id`. `identity.attributes.name` (the audited-write `actorName`) is a **different, still-unresolved** gap: `OpenIDClaims` (which now types `name`/`email`/… on `OAuth2TokenIntrospectionResponse`) is not folded into `@authup/server-adapter-kit`'s `TokenVerificationData` (`OAuth2TokenPayload & { permissions }`), so the claim is present on the wire but still untyped for the one type hub's middleware actually reads — restoring it safely (no cast) needs that type widened upstream first, same conclusion as before, just a shorter remaining gap.
- **The account console moved to `/console/account`** (`server-core`/`client-web-kit` beta.64, part of mounting all three consoles under `/console/{admin,account,auth}`). `apps/client-ui/core/account.ts`'s default (`<authupUrl>/account`, used whenever `NUXT_PUBLIC_ACCOUNT_URL` is unset) now points at `<authupUrl>/console/account`; docs updated in [reference/frontend](../../docs/src/reference/frontend/index.md#account-self-service). The same beta.64 release also closed authup#3495 (same-origin sub-path deployments do not collide on console cookies — server-side `cookiePath` scoping, automatic), so that row of the [Session cookies](../../docs/src/reference/frontend/index.md#session-cookies) table is not a hub-side "wait for upstream" caveat.
- **`cookiePrefix` (`client-web-nuxt` beta.64, authup#3527/#3529) is wired but left empty by default.** It namespaces every session cookie name so a sibling authup client reachable at a widened `NUXT_PUBLIC_COOKIE_DOMAIN` — Authup's own hosted pages included — can't collide with hub's cookies; the issue that got it built was filed *from* this bump ("Observed in FLAME Hub, which widens the domain so a sibling service can read the token on a file download"). `apps/client-ui/nuxt.config.ts` sets it from `COOKIE_PREFIX`/`NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` (no `cookiePrefixRuntimeKey` exists to redirect it through a top-level key the way `apiURL`/`cookieDomain` do, so it stays nested under `public.authup`). Left unset by default rather than defaulting to e.g. `flame_`: setting it unconditionally would rename cookies for every deployment, including the majority that leave `cookieDomain` empty and gain nothing from a prefix, and switching it later requires everyone to sign out first (the un-prefixed names are afterwards neither read nor swept).

Two changes were investigated and found to need **no hub action**: `email_verified`/OIDC claims getting declared (`core-kit`/`specs` beta.64, authup#3518/#3519) touches only server-core's own claims builder and a `User.emailVerified` field hub never constructs; and `Client.scope`/`Client.rootUrl` removal (beta.64) don't appear in hub's code — the `.scope` references in `apps/client-ui/pages/admin/clients/[id]/url.vue` and `FEvent.ts` are an unrelated `ClientScope.scope` relation and hub's own telemetry `Event.scope`, respectively.
