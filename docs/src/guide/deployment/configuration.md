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

## Database Variables

Used by `server-core`, `server-storage`, and `server-telemetry`:

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
One of them is a deployment decision rather than a service address:

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_PUBLIC_COOKIE_DOMAIN` | No | `Domain` attribute for the UI's session cookies. **Leave empty.** |

### Where Authup is served matters

The UI and Authup's own hosted pages persist their sessions under the **same cookie
names**. If both can see each other's cookies, they hydrate, rotate and revoke each
other's tokens, and the user is logged out on the next page reload.

Empty (host-only) cookies are correct in every layout. Setting a `Domain` delivers the
cookies to every subdomain of that value — including Authup's host, if it sits below it.
Serving Authup on a path of the UI's own origin additionally requires an Authup build
containing [authup#3495](https://github.com/authup/authup/issues/3495).

The layout matrix and the upgrade caveat are documented under
[Session cookies](../../reference/frontend/index.md#session-cookies).
