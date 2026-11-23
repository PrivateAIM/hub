<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-core 🌐</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Core REST API of FLAME Hub for analyses, projects, nodes, registries and master images.**

It owns the domain records and their approval workflows, and hands image builds and distributions to the worker over RabbitMQ.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.

[Usage](#usage) · [Configuration](#configuration) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/core/)

---

## Usage

The service needs Node.js `>=26.0.0`, a database (MySQL, PostgreSQL or SQLite) and Authup. Redis, RabbitMQ and Harbor are optional.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Start the HTTP API
npm run cli --workspace=apps/server-core -- start

# Database migrations: run | revert | status | generate
npm run cli --workspace=apps/server-core -- migration run
```

`start` creates the database when it does not exist and applies pending migrations before it serves, so a separate `migration run` is optional.

### Docker

The service ships in the shared `ghcr.io/privateaim/hub` image. The entrypoint takes the service name, then the npm script and its arguments:

```bash
docker run \
    -e DB_TYPE=postgres -e DB_HOST=db -e DB_USERNAME=hub -e DB_PASSWORD=secret -e DB_DATABASE=hub \
    -e AUTHUP_URL=http://authup:3000/ \
    -p 3000:3000 \
    ghcr.io/privateaim/hub core cli start
```

### What it serves

- **Entity APIs**: analyses, projects, nodes, registries, registry projects and master images, as `{ data, meta }` envelopes ([endpoints](https://hub.docs.privateaim.net/reference/core/#key-endpoints)).
- **Credentials**: node and analysis OAuth2 client credentials, node registry credentials, and storage capability tokens minted with `POST /analyses/:id/storage/token` ([capability tokens](https://hub.docs.privateaim.net/reference/core/#storage-capability-tokens)).
- **Realtime**: a Socket.IO server on the same port, fed by entity events over Redis.
- **Health**: anonymous `/livez` and `/readyz` probes ([health endpoints](https://hub.docs.privateaim.net/guide/deployment/configuration.html#health-endpoints)); OpenAPI documentation at `/docs`.

## Configuration

Environment variables, read once at startup (a `.env` file in the working directory is loaded too).

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development`, `production` or `test` |
| `PORT` | `3000` | HTTP and Socket.IO port |
| `PUBLIC_URL` | `http://127.0.0.1:<PORT>/` | Public URL of this service |
| `AUTHUP_URL` | none | Authup identity provider URL |
| `REALM` | `master` | Authup realm of the service client |
| `CLIENT_ID` | `system` | Authup client the service authenticates as |
| `CLIENT_SECRET` | `start123` | Secret of that client |
| `REDIS_CONNECTION_STRING` | none | Redis for the read cache and realtime events; `true` means `redis://127.0.0.1` |
| `RABBITMQ_CONNECTION_STRING` | none | RabbitMQ for the worker, storage and telemetry; `true` means `amqp://root:start123@127.0.0.1` |
| `HARBOR_URL` | none | Harbor connection string with credentials in the URL; at startup it creates or updates the registry named `default` |
| `TELEMETRY_URL` | none | server-telemetry URL, for the analysis log endpoints |
| `MASTER_IMAGES_OWNER` | `PrivateAim` | GitHub owner of the master images repository |
| `MASTER_IMAGES_REPOSITORY` | `master-images` | GitHub repository of the master images |
| `MASTER_IMAGES_BRANCH` | `master` | Branch the master images are synchronized from |
| `SKIP_PROJECT_APPROVAL` | `false` | Approve projects without an administrator |
| `SKIP_ANALYSIS_APPROVAL` | `false` | Approve analyses without an administrator |
| `COOKIE_PREFIX` | none | Prefix of the `access_token` cookie read when a request has no `Authorization` header; must match client-ui's prefix |
| `TRUST_PROXY` | every hop | Trusted `X-Forwarded-For` hops: `true`, `false`, a hop count or a comma list of IPs and CIDRs |
| `SHUTDOWN_DELAY` | `0` | Seconds to keep serving after a stop signal while `/readyz` answers 503 (0 to 3600) |

The database is configured through `DB_TYPE` (`mysql`, `postgres` or `better-sqlite3`, required), `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE`
([database variables](https://hub.docs.privateaim.net/guide/deployment/configuration.html#database-variables)).

## Notes

- **Without RabbitMQ nothing is built or distributed.** The message bus falls back to memory, so build and distribution commands reach no worker, and the stuck-process reconciler is not scheduled.
- **`TRUST_PROXY` trusts every hop by default.** Audit IPs and rate-limit keys stay forgeable until a deployment sets it ([client addresses](https://hub.docs.privateaim.net/guide/deployment/configuration.html#client-addresses-and-rate-limiting)).
- **Replicas share one migration lock.** Boot migrations and the Harbor setup run under a database lock (`server-core:migration`), so replicas that start together apply them once; the pool needs at least two connections.
- **Approval skips are for development.** `SKIP_PROJECT_APPROVAL` and `SKIP_ANALYSIS_APPROVAL` bypass the workflow described in [approval workflows](https://hub.docs.privateaim.net/guide/user/approval.html).

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
