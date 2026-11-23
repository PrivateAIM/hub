<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-storage 📦</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Bucket and file storage service of FLAME Hub, backed by MinIO (S3) or the local filesystem.**

It stores analysis code, temporary and result files, streams them back as files or tar archives, and accepts short-lived capability tokens minted by server-core.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.

[Usage](#usage) · [Configuration](#configuration) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/storage/)

---

## Usage

The service needs Node.js `>=26.0.0`, a database (MySQL, PostgreSQL or SQLite) and Authup. MinIO, Redis and RabbitMQ are optional.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Start the HTTP API
npm run cli --workspace=apps/server-storage -- start

# Database migrations: run | revert | status | generate
npm run cli --workspace=apps/server-storage -- migration run
```

`start` creates the database when it does not exist and applies pending migrations before it serves.

### Docker

The service ships in the shared `ghcr.io/privateaim/hub` image:

```bash
docker run \
    -e DB_TYPE=postgres -e DB_HOST=db -e DB_USERNAME=hub -e DB_PASSWORD=secret -e DB_DATABASE=storage \
    -e AUTHUP_URL=http://authup:3000/ \
    -e MINIO_CONNECTION_STRING=http://minioadmin:minioadmin@minio:9000 \
    -p 3000:3000 \
    ghcr.io/privateaim/hub storage cli start
```

### What it serves

- **Buckets and files**: CRUD on `/buckets` and `/bucket-files`, uploads with `POST /buckets/:id/upload`, `POST /buckets/:id/clear` to empty a bucket, and streams of a file or of a whole bucket as a tar ([endpoints](https://hub.docs.privateaim.net/reference/storage/#key-endpoints)).
- **Bus commands**: bucket `create`, `delete` and `clear` sent by server-core over RabbitMQ.
- **Capability tokens**: an Authup capability token (audience `storage`) grants only the actions in its `cap` claim, in the `Authorization` header or, for streams only, as a `?dt=` query parameter living at most 60 seconds ([capability tokens](https://hub.docs.privateaim.net/reference/storage/#capability-tokens)).
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
| `CAPABILITY_CLIENT_ID` | `CLIENT_ID` | Authup client (id, or name in `REALM`) whose capability-token exchanges are accepted: the client server-core authenticates as |
| `MINIO_CONNECTION_STRING` | none | MinIO or S3 endpoint as `http(s)://<access-key>:<secret-key>@<host>:<port>`; `https` enables TLS |
| `STORAGE_PATH` | `<cwd>/writable/storage` | Directory for files when `MINIO_CONNECTION_STRING` is unset |
| `REDIS_CONNECTION_STRING` | none | Redis for realtime entity events |
| `RABBITMQ_CONNECTION_STRING` | none | RabbitMQ for bucket commands and telemetry |
| `COOKIE_PREFIX` | none | Prefix of the `access_token` cookie read when a request has no `Authorization` header (stream downloads); must match client-ui's prefix |
| `TRUST_PROXY` | every hop | Trusted `X-Forwarded-For` hops: `true`, `false`, a hop count or a comma list of IPs and CIDRs |
| `SHUTDOWN_DELAY` | `0` | Seconds to keep serving after a stop signal while `/readyz` answers 503 (0 to 3600) |

The database is configured through `DB_TYPE` (`mysql`, `postgres` or `better-sqlite3`, required), `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE`
([database variables](https://hub.docs.privateaim.net/guide/deployment/configuration.html#database-variables)).

## Notes

- **MinIO is optional, but the fallback is local.** Without `MINIO_CONNECTION_STRING` files go to the local filesystem (`STORAGE_PATH`), which several replicas do not share and a container loses unless the path is a volume.
- **A malformed connection string stops the start.** `MINIO_CONNECTION_STRING` needs a protocol, a user, a password, a host and an explicit port, with nothing after the port (no trailing `/`). User and password may contain only letters, digits and `_`; anything else fails with `Invalid MINIO_CONNECTION_STRING format.`
- **Capability tokens need a matching client.** A token exchanged by any client other than `CAPABILITY_CLIENT_ID` is refused (401). A client name, rather than an id, is looked up through Authup and needs `client_read` for storage's own client.
- **Without RabbitMQ no analysis bucket is created.** server-core sends bucket commands over the bus; the in-memory fallback receives none of them.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
