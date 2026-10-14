# Configuration

All Hub services are configured via environment variables, managed by `envix` through each service's `ConfigModule`.

## Common Variables

These variables are shared across all services:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP server port (default varies by service) |
| `AUTHUP_URL` | Yes | Authup identity provider URL |
| `REDIS_URL` | No | Redis connection URL (for pub/sub and caching) |
| `AMQP_URL` | No | RabbitMQ connection URL |
| `COOKIE_PREFIX` | No | Namespace prefixed onto the `access_token` cookie the authup middleware falls back to when a request carries no `Authorization` header (e.g. a bucket/file stream download). See [Frontend Variables](#frontend-variables-client-ui) — must match client-ui's `COOKIE_PREFIX`. |

## Authup upgrade to beta.68

Upgrade the Authup server and all Hub services together. Hub now requires Authup
`1.0.0-beta.68` and reads `GET /authorization` using the service's own
`CLIENT_ID` / `CLIENT_SECRET` credentials. Grant that client `permission_read`
with `realmScope: "ownOrNull"` for a single realm, or `"any"` when serving multiple
realms. The default `"own"` grant cannot read global policy definitions. The
built-in `system` client already has the required access.

Each authenticated HTTP request and socket connection fetches one catalog and
combines it with the caller's introspected grants. All permission checks within
that request/connection reuse the local evaluator. Catalog errors fail the
request; there is no fallback to permission names. Catalogs are not cached across
requests. Existing token-introspection caching and socket-session lifetimes still
apply, so changes to grants are visible when those are refreshed.

Scope restricts what a caller can do, not who it is. Grants are only evaluated
for tokens carrying the `global` scope; a token issued without it (e.g. a custom
login client registered without `global`) still authenticates and keeps its
identity, but is evaluated with **no grants**, so every permission check denies
with 403. Policies that read the identity still see the real caller, and paths
that authorize by identity rather than by permission — a node or analysis client
reading its own credentials, the messenger mailbox, bucket ownership, realm
socket rooms — still honour such a token. Authup applies the same rule since
authup#3723.
client-ui requests `global openid`, and Authup's client-credentials and password
grants always issue `global`.

This preserves policy trees and grant realm scopes at the evaluator boundary.
Existing endpoints that only perform a permission pre-check still perform a
pre-check: this upgrade does not add row-policy checks or collection filtering to
those endpoints. Restricting every entity read/write by resource attributes is a
separate service-level change.

The frontend kit uses a single `POST /authorization/check` batch for UI gates and
refreshes it at the policy expiry returned by Authup. Hub navigation follows those
refreshes. Browser users do not need `permission_read` merely to render menus.

Authup's beta.67 upgrade also applies its folders/event-aggregate migration and
pins database timestamps to UTC. Follow the
[Authup upgrade notes](https://github.com/authup/authup/releases/tag/v1.0.0-beta.67)
for existing databases that used local time. Beta.68 quotes newly serialized
strings; Hub's text transformer reads both these and legacy unquoted messenger
payloads, so no Hub data migration is needed.

## server-messenger authenticates against Authup

**Breaking.** server-messenger now verifies every REST request and socket
connection against Authup, like the other services. Before, its REST surface
never registered an Authup client and attached one fixed master-realm user to
**every** request: no token was needed, and every caller read and acknowledged
the same mailbox. Treat any message stored by an affected version as exposed.

What an operator must do:

- Grant the messenger's service client (`CLIENT_ID`, default `system`)
  `permission_read`, with the same `realmScope` guidance as in
  [Authup upgrade to beta.68](#authup-upgrade-to-beta-68) — every authenticated
  request reads the authorization catalog. The built-in `system` client already
  has it.
- Make sure `AUTHUP_URL`, `CLIENT_ID` and `CLIENT_SECRET` are set for the
  messenger. Every Hub service now fails closed without Authup: no identity is
  attached, so every authenticated route answers 401 and every socket
  connection is refused. The previous no-Authup fallback (a fixed master-realm
  user, plus a `dryRun` mode that granted every permission) is removed.
- Callers (nodes) must send a bearer token on every request, including the
  `GET /messages/stream` SSE stream.

## Malformed bearer tokens no longer authenticate

**Security fix, no operator action required in Hub.** Authup up to
`1.0.0-beta.69` falls back to the token in the introspection request's own
`Authorization` header when the submitted `token` fails its validator (shorter
than 16 or longer than 2048 characters). Hub's token verifier sends that header
with the service's **own** credentials, so a malformed bearer — `Bearer x`, an
oversized string, or a garbage `access_token` cookie — was introspected as the
Hub service client (`active`, `global` scope, its grants) and every Hub service
acted on it as that client.

Every Hub service now refuses a credential that is not structurally a compact
JWS within those bounds **before** introspecting it, answering 401 (sockets:
connection refused). The fallback itself is fixed upstream in authup#3724;
upgrading Authup to the first release after `1.0.0-beta.69` closes the upstream
half, until then the Hub-side guard is what stops it. Any
token-verifier cache (Redis `token:*` keys) may hold entries for such strings —
flush it once after upgrading.

## Authup upgrade to beta.69

Hub now requires Authup `1.0.0-beta.69`, a security release. Read the
[Authup upgrade guide](https://authup.org/guide/deployment/upgrading#security-hardening-that-changes-behaviour)
before upgrading. Hub needs no code or data changes; these points concern the
Authup deployment Hub runs against:

- **Tokens are bound to their realm.** On a Redis-backed Authup, drop the
  `oauth2_token_claims*` keys once after upgrading, or tokens verified before the
  upgrade keep bypassing the new check until they expire.
- **Client reads are realm-gated.** Hub's service client creates and reads the
  per-node and per-analysis Authup clients in the realm of that node or analysis. A Hub client
  whose `client_*` grants are `own` or `ownOrNull` no longer sees clients in
  other realms; grant `any` (the built-in `system` client already has it).
- **HTTP Basic names resolve in the route realm or the master realm.** Hub's
  Harbor webhook authenticates with the registry client's **id**, which resolves
  globally, so it is unaffected.
- **Rate limiting is two-stage.** Behind one NAT address (a clinic or office
  network) raise `rateLimitAnonymousMax`, and pin Authup's `trustProxy` to the
  hop count of your proxy.
- **Some users sign in once more.** Token cookies are now written `SameSite=Lax`,
  and `Secure` on https. Behind a TLS-terminating proxy, forward
  `X-Forwarded-Proto` (the [reverse proxy](./reverse-proxy.md) example already
  does) so server-side cookie writes in client-ui get `Secure` too.

## Database Variables

Used by `server-core`, `server-storage`, `server-telemetry`, and `server-messenger`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_TYPE` | Yes | `mysql`, `postgres`, or `better-sqlite3` |
| `DB_HOST` | Yes* | Database hostname |
| `DB_PORT` | Yes* | Database port |
| `DB_USERNAME` | Yes* | Database username |
| `DB_PASSWORD` | Yes* | Database password |
| `DB_DATABASE` | Yes | Database name (or `:memory:` for SQLite) |

*Not required for SQLite.

### SQLite has no upgrade path

Migrations only run for `mysql` and `postgres`. On SQLite the schema is built from
the entity classes by `synchronize()`, and only when no schema exists yet — so an
**existing** SQLite database is never migrated or altered on upgrade.

Schema changes therefore break a persistent SQLite deployment. The rename of the
`analysis` table to `analyses` is one such change: a SQLite database created before
it keeps the old table, and queries against the new name fail.

Use SQLite only for tests and throwaway/in-memory (`:memory:`) instances. For any
database you intend to keep, use MySQL or PostgreSQL. To carry an existing SQLite
database across a schema change, export its data and re-import it into a freshly
created database.

### Timestamps are stamped and read in UTC

On MySQL and PostgreSQL every Hub service pins its database sessions to UTC
(`time_zone` on MySQL, `TimeZone` on PostgreSQL), reads the zone-less
`created_at` / `updated_at` columns back as UTC, and binds `Date` parameters in
UTC — whatever timezone the database server or the host running Hub is set to.
The same pin applies to the `migration` CLI. There is nothing to configure, and
`DB_PIN_TIMEZONE` is not needed. A database and host already running in UTC (the
container image sets no `TZ`) see no change.

Before, the database stamped these columns in its session timezone, the driver
read them in the process timezone, and the messenger's expiry sweep compared
its `expires_at` column against a `Date` bound in the process timezone, so the
three only agreed when every clock ran in UTC.

**If the database itself ran in local time**, rows it stamped before this
upgrade hold local wall-clock values and now read as UTC, shifted by that offset.
Rows written afterwards are correct. Check the database's zone before upgrading:

```sql
-- PostgreSQL
SHOW timezone;
-- MySQL
SELECT @@global.time_zone, @@system_time_zone;
```

If it is not UTC and the historical values matter, convert them **while no Hub
service is writing**: stop every replica of the old version, run the conversion,
then start the new version. Do not convert after the new version has started, or
during a rolling upgrade where old and new replicas write side by side: the
statements cannot tell a legacy local-time row from a correct UTC one, so they
would shift the correct rows too. Convert each table and column once, with the
zone the database used:

```sql
-- PostgreSQL
UPDATE events SET created_at = (created_at AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'UTC';
-- MySQL (needs the server's time zone tables loaded)
UPDATE events SET created_at = CONVERT_TZ(created_at, 'Europe/Berlin', '+00:00');
```

A database setting that contradicts the pin stops the boot with an error naming
it: a MySQL `timezone` other than UTC, a MySQL `dateStrings` or `typeCast`, or a
PostgreSQL `TimeZone` other than UTC in the driver's startup `options` (e.g. via
`DB_DRIVER_EXTRA`). Remove it — half a pin would shift values instead of fixing
them. A MySQL replication setup is refused the same way for now, since its
per-connection session cannot be pinned yet.

### Replicas and boot-time migrations

Each service applies pending migrations when it starts. On MySQL and PostgreSQL
it now does so while holding a database lock named after the service
(`server-core:migration`, `server-storage:migration`, …), so replicas that start
at the same time apply the chain once: one runs it, the others wait and then
find nothing pending. The `migration run` / `migration revert` CLI commands take
the same lock, so a migration job and a booting replica cannot overlap either.
server-core's Harbor registry setup (`HARBOR_URL`) is serialized the same way.

A replica that cannot get the lock within 60 seconds fails its boot instead of
migrating unlocked; the orchestrator restarts it, and by then the chain has been
applied. Each lock holds one pooled connection while the migration runs on
another, so the connection pool needs at least two connections.

## Storage Variables (server-storage)

| Variable | Required | Description |
|----------|----------|-------------|
| `MINIO_ENDPOINT` | Yes | MinIO/S3 endpoint URL |
| `MINIO_ACCESS_KEY` | Yes | S3 access key |
| `MINIO_SECRET_KEY` | Yes | S3 secret key |
| `MINIO_USE_SSL` | No | Enable SSL for MinIO connection |
| `MINIO_PORT` | No | MinIO port |

## Telemetry Variables (server-telemetry)

| Variable | Required | Description |
|----------|----------|-------------|
| `VICTORIA_LOGS_URL` | Yes | VictoriaLogs endpoint URL |
| `EVENT_RETENTION_DAYS` | No | Days an audit/event row is kept before the daily sweep removes it (default `7`; `0` = keep forever) |

## Frontend Variables (client-ui)

The full list lives in the [frontend reference](../../reference/frontend/index.md#environment-variables).
Two of them are deployment decisions rather than service addresses, and go together:

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_PUBLIC_COOKIE_DOMAIN` | No | `Domain` attribute for the UI's session cookies. **Leave empty.** |
| `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` | No | Namespace prefixed onto every session cookie name. Set this **whenever `NUXT_PUBLIC_COOKIE_DOMAIN` is widened**, so Authup's own hosted pages can't collide with the UI's cookies on that domain. |

Setting a prefix is only safe once the backend agrees on it: `server-core`,
`server-storage`, `server-telemetry` and `server-messenger` each fall back to
reading the `access_token` cookie (for requests that can't carry an
`Authorization` header — a stream download is a top-level navigation) when the
identity middleware finds nothing else. That fallback needs the **same**
prefix, via each service's own `COOKIE_PREFIX` env var (see
[Common Variables](#common-variables)) — set it to the exact same value as
`NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` / `COOKIE_PREFIX`, verbatim (no separator
is inserted automatically on either side).

### Where Authup is served matters

The UI and Authup's own hosted pages persist their sessions under the **same cookie
names**. If both can see each other's cookies, they hydrate, rotate and revoke each
other's tokens, and the user is logged out on the next page reload.

Empty (host-only) cookies are correct in every layout. Setting a `Domain` delivers the
cookies to every subdomain of that value — including Authup's host, if it sits below
it — in which case also set `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` to keep the two cookie
sets apart. Serving Authup on a path of the UI's own origin no longer needs either
variable as of Authup `1.0.0-beta.64` ([authup#3495](https://github.com/authup/authup/issues/3495)):
the consoles scope their own cookies to that sub-path automatically.

The layout matrix and the upgrade caveat are documented under
[Session cookies](../../reference/frontend/index.md#session-cookies).
