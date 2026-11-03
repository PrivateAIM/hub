# Testcontainers and Always-On Authup

Read before changing the test setup of the HTTP-facing services, Authup provisioning for tests, or server-test-kit's testcontainers helpers.

## Testcontainers & Always-On Authup

The HTTP-facing services (`server-core`, `server-storage`, `server-telemetry`,
`server-messenger`) run their suites against a **real Authup instance** and a
**real database**, and the authorization middleware **actually enforces**
permissions (`dryRun` and the no-Authup fake identity are gone from the kits
entirely — without Authup a request gets no identity and answers 401).
server-messenger provisions **no** permission names (it authorizes by identity
only) and uses `createRestrictedAccessToken()` to mint distinct users for its
mailbox-isolation spec. Each
dependency is provided one of two ways, decided by env:

| Dependency | External (used as-is)             | Otherwise (testcontainer)          |
|------------|-----------------------------------|------------------------------------|
| Database   | `DB_TYPE` set (CI services, `test:mysql`, `test:psql`) | PostgreSQL container |
| Authup     | `AUTHUP_URL` set                  | `authup/authup:<@authup/core-kit version>` container |

The shared helpers live in `@privateaim/server-test-kit`
(`src/testcontainers/`, `src/authup-token.ts`, `src/setup.ts`):

- `provideDatabase(project, suite)` — start a PostgreSQL container when no `DB_TYPE` is set,
  else use the configured server. On mysql/postgres the suite gets its **own**
  database, `<DB_DATABASE>_<suite>` (`app_core`, `app_storage`, …), dropped and
  re-created once here in global setup, then published to the workers via vitest
  `provide`. All four service suites run concurrently against CI's one database
  server; sharing `app` made every worker's check-then-create `createDatabase`
  race the other suites (`Key (datname)=(app) already exists`). Workers therefore
  never create the suite database — only server-core's per-worker
  `app_core_<pool>` copies, which no other process can name. SQLite is unaffected
  (in-memory per worker).
- `provideAuthup(project, permissionNames)` — start an Authup container (unless
  `AUTHUP_URL` is set), provisioned with exactly the permission names the calling
  service checks. Each service passes its own set (`server-storage` 3, `server-telemetry`
  6, `server-core` 25), listed in its `test/setup.ts`. The built-in `admin` role's
  `globalPermissions: ['*']` picks those up at provisioning time, so the `admin`/`master`
  token resolves them via introspection. The generated `.mjs` is mounted at
  `<PROVISIONING_DIRECTORY_PATH>/hub.mjs`, where `PROVISIONING_DIRECTORY_PATH` is
  **set by hub** to `/etc/authup/provisioning` rather than inherited from the image.
  Authup `1.0.0-beta.63` moved the writable directory once already (`/usr/src/app/writable`
  → `/var/lib/authup`), and `1.0.0-beta.64`'s FHS image layout retired
  `WRITABLE_DIRECTORY_PATH` outright, splitting it into `LOG_DIRECTORY_PATH` (what the
  process writes) and `PROVISIONING_DIRECTORY_PATH` (what it only reads) — the latter now
  names the provisioning directory itself, with no `provisioning/` subpath appended. A
  provisioning file written anywhere else is simply never read — the container still
  starts and reports healthy, and the only symptom is every endpoint in the suite later
  failing with `The evaluation of permissions <name> failed`. Pinning it keeps the mount
  target and the server in agreement by construction.
- `assertAuthupProvisioning(baseURL, permissionNames)` — runs in global setup for **both**
  the container and the external-`AUTHUP_URL` path. It mints the admin token, introspects
  it, and diffs the resolved permission set against the suite's, so a provisioning miss
  fails once, immediately, with the missing names — instead of as a wall of authorization
  failures dozens of assertions away from the cause.
- Authup runs on the **same database engine as hub** in each environment
  (`resolveAuthupDatabaseEnv`): a dedicated `authup` database on the same
  MySQL/PostgreSQL server (reached via `host.docker.internal`), or its own in-memory
  SQLite on the sqlite leg. This keeps the whole stack on one engine per run.
- `hydrateTestEnv()` — worker-side; the side-effecting `@privateaim/server-test-kit/setup`
  module (wired into each `vitest.config` `setupFiles` alongside `reflect-metadata`)
  copies the provided values into `process.env` before the test app is built.
- `stopTestContainers()` — teardown.
- `createAdminAccessToken()` / `createAdminAuthorizationHeader()` — mint a real
  `admin`/`master` token for tests that issue raw `fetch` requests (uploads,
  streaming) instead of the authenticated API client.

The Authup image is `authup/authup`, tagged with the **installed `@authup/core-kit`
version** — `resolveAuthupImage()` reads it from the resolved package at run time, so
the server under test always matches the client libraries hub compiles against. Set
`AUTHUP_IMAGE_TAG` to pin a different image.

> Do **not** revert this to an untagged `authup/authup`. Untagged resolves to `latest`,
> and testcontainers reuses a locally cached image instead of re-pulling, so a machine
> holding an older `latest` runs the whole suite against a stale Authup — green, while
> never exercising the version being shipped. That is exactly what happened during the
> beta.58 → beta.59 bump: the suite passed against a cached beta.57.

Each test app registers `AuthupHookModule` + `AuthupClientModule` so the middleware
takes the real introspection path rather than the fake-identity fallback.

Enabling the Authup client does **not** activate `NodeClientService` /
`AnalysisClientService`: the test database module builds serviceless subscribers
that short-circuit, keeping enforcement and client-provisioning decoupled.

## Testcontainers + Always-On Authup

[Testcontainers + Always-On Authup](../plans/015-test-authup-testcontainers.md) — Implemented (server-core/storage/telemetry test suites run against a real Authup + real DB via testcontainers when not externally provided, with **real authorization enforcement** — `dryRun` removed). Shared helpers in `@privateaim/server-test-kit`; Authup provisioning generated from `PermissionName`; CI runs Authup via testcontainers (DB stays a workflow service).
