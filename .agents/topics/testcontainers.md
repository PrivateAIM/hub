# Testcontainers and Always-On Authup

Read before changing the test setup of the HTTP-facing services, Authup provisioning for tests, or server-test-kit's testcontainers helpers.

## Testcontainers & Always-On Authup

The HTTP-facing services (`server-core`, `server-storage`, `server-telemetry`,
`server-messenger`) run their suites against a **real Authup** and a **real
database**, with authorization **enforced**. There is no `dryRun` or fake-identity
fallback: without Authup a request gets no identity and answers 401.
server-messenger provisions no permission names (it authorizes by identity) and
mints distinct users with `createRestrictedAccessToken()`. Each dependency is
chosen by env:

| Dependency | External (used as-is)             | Otherwise (testcontainer)          |
|------------|-----------------------------------|------------------------------------|
| Database   | `DB_TYPE` set (CI services, `test:mysql`, `test:psql`) | PostgreSQL container |
| Authup     | `AUTHUP_URL` set                  | `authup/authup:<@authup/core-kit version>` container |

Helpers in `@privateaim/server-test-kit` (`src/testcontainers/`, `src/authup-token.ts`, `src/setup.ts`):

- `provideDatabase(project, suite)` — each suite gets its **own** database,
  `<DB_DATABASE>_<suite>`, dropped and re-created once in global setup and
  published to workers via vitest `provide`. The service suites run concurrently
  against one server, so workers must never create the suite database
  (check-then-create races); they create only server-core's per-worker
  `app_core_<pool>` copies. SQLite is in-memory per worker.
- `provideAuthup(project, permissionNames)` — starts an Authup container (unless
  `AUTHUP_URL` is set) provisioned with exactly the names the service checks,
  listed in its `test/setup.ts`. The `admin` role's `globalPermissions: ['*']`
  picks them up, so the `admin`/`master` token resolves them. The generated module
  is mounted at `/etc/authup/provisioning/hub.mjs`, and hub **sets**
  `PROVISIONING_DIRECTORY_PATH` to that directory rather than inheriting the
  image default. Silent trap: a provisioning file at a path Authup does not read
  is ignored, the container stays healthy, and every permission check fails later.
- `provideAuthup(..., { tokenExchange })` provisions the built-in `system` client with the
  token exchange grant and one capability for `audience` (`value`, `maxAge`, `realmScope`);
  `createCapabilityToken({ subjectToken, cap })` then exchanges a real token as `system`.
  Without the option the exchange is refused.
- `assertAuthupProvisioning(baseURL, permissionNames)` — runs in global setup for
  both the container and the external-`AUTHUP_URL` path; it introspects the admin
  token and fails immediately, naming any missing permission.
- Authup runs on **the same engine as hub** (`resolveAuthupDatabaseEnv`): its own
  MySQL/PostgreSQL container on a shared Docker network, or in-memory SQLite on
  the sqlite leg.
- `hydrateTestEnv()` — the side-effecting `@privateaim/server-test-kit/setup`
  module (in each `vitest.config` `setupFiles`, with `reflect-metadata`) copies
  provided values into `process.env` before the test app is built.
- `stopTestContainers()` — teardown.
- `createAdminAccessToken()` / `createAdminAuthorizationHeader()` — a real
  `admin`/`master` token for raw `fetch` requests (uploads, streaming).

The Authup image is tagged with the **installed `@authup/core-kit` version**
(`resolveAuthupImage()`); `AUTHUP_IMAGE_TAG` overrides it. Never use an untagged
`authup/authup`: testcontainers reuses a cached `latest`, so the suite can pass
against a stale Authup.

Each test app registers `AuthupHookModule` + `AuthupClientModule`, so the
middleware takes the real introspection path. This does **not** activate
`NodeClientService` / `AnalysisClientService`: the test database module builds
serviceless subscribers, keeping enforcement and client provisioning decoupled.

## Testcontainers + Always-On Authup

CI runs Authup through testcontainers, with Authup provisioning generated from
`PermissionName`; the database stays a workflow service.
