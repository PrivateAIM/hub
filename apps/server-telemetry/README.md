<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-telemetry 📊</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Log and audit event service of FLAME Hub, backed by VictoriaLogs and a database.**

The other services ship their logs and entity events to it over RabbitMQ; it stores logs in VictoriaLogs, audit events in its database, and serves both over HTTP.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.

[Usage](#usage) · [Configuration](#configuration) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/telemetry/)

---

## Usage

The service needs Node.js `>=26.0.0`, a database (MySQL, PostgreSQL or SQLite) and Authup. VictoriaLogs, Redis and RabbitMQ are optional.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Start the HTTP API
npm run cli --workspace=apps/server-telemetry -- start

# Database migrations: run | revert | status | generate
npm run cli --workspace=apps/server-telemetry -- migration run
```

`start` creates the database when it does not exist and applies pending migrations before it serves.

### Docker

The service ships in the shared `ghcr.io/privateaim/hub` image:

```bash
docker run \
    -e DB_TYPE=postgres -e DB_HOST=db -e DB_USERNAME=hub -e DB_PASSWORD=secret -e DB_DATABASE=telemetry \
    -e AUTHUP_URL=http://authup:3000/ \
    -e VICTORIA_LOGS_URL=http://victoria-logs:9428 \
    -p 3000:3000 \
    ghcr.io/privateaim/hub telemetry cli start
```

### What it serves

- **Events**: `GET`, `POST` and `DELETE` on `/events`, the audit trail of entity changes, filterable on `scope`, `name`, `refType`, `refId` and `realmId`.
- **Logs**: `GET`, `POST` and `DELETE` on `/logs`, queried against VictoriaLogs by label ([endpoints](https://hub.docs.privateaim.net/reference/telemetry/#key-endpoints)).
- **Bus ingestion**: log lines and entity events published by core, storage, messenger and the worker over RabbitMQ.
- **Health**: anonymous `/livez` and `/readyz` probes; OpenAPI documentation at `/docs`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development`, `production` or `test` |
| `PORT` | `3000` | HTTP port |
| `PUBLIC_URL` | `http://localhost:3000` | Public URL of this service |
| `AUTHUP_URL` | none | Authup identity provider URL |
| `REALM` | `master` | Authup realm of the service client |
| `CLIENT_ID` | `system` | Authup client the service authenticates as |
| `CLIENT_SECRET` | `start123` | Secret of that client |
| `VICTORIA_LOGS_URL` | none | VictoriaLogs base URL |
| `VICTORIA_LOGS_INGESTOR_URL` | none | VictoriaLogs ingest endpoint, overrides the base URL for writes |
| `VICTORIA_LOGS_QUERIER_URL` | none | VictoriaLogs query endpoint, overrides the base URL for reads |
| `EVENT_RETENTION_DAYS` | `7` | Days a bus-ingested event is kept before the daily sweep drops it; `0` keeps events forever |
| `REDIS_CONNECTION_STRING` | none | Redis for realtime entity events |
| `RABBITMQ_CONNECTION_STRING` | none | RabbitMQ to ingest logs and events from the other services |
| `COOKIE_PREFIX` | none | Prefix of the `access_token` cookie read when a request has no `Authorization` header; must match client-ui's prefix |
| `TRUST_PROXY` | every hop | Trusted `X-Forwarded-For` hops: `true`, `false`, a hop count or a comma list of IPs and CIDRs |
| `SHUTDOWN_DELAY` | `0` | Seconds to keep serving after a stop signal while `/readyz` answers 503 (0 to 3600) |

The database is configured through `DB_TYPE` (`mysql`, `postgres` or `better-sqlite3`, required), `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE`
([database variables](https://hub.docs.privateaim.net/guide/deployment/configuration.html#database-variables)).

## Notes

- **Without VictoriaLogs, logs live in memory.** When none of the `VICTORIA_LOGS_*` variables is set, an in-memory store takes the logs; they are lost on restart and not shared between replicas.
- **Retention is stamped at ingest.** `EVENT_RETENTION_DAYS` applies when a bus-ingested event arrives without its own `expiresAt`; changing it does not touch stored rows, and events created through `POST /events` never expire. The sweep runs once at start and daily at 01:00.
- **Event data is sanitized on write.** Keys containing `password`, `secret`, `hash`, `token` or `credential` (any case) are dropped from the event data, on both the HTTP and the bus path.
- **`GET /logs` carries no `meta.schema`.** Its filters are dynamic VictoriaLogs labels, so it is the one query endpoint without a declared vocabulary.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
