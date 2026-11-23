# Worker (server-core-worker)

The Worker service executes background tasks — primarily building and distributing Docker containers for analyses. It is purely queue-driven with no database.

## Running

```bash
# From the repo root: build every workspace, then start the worker
npm run build
npm run start --workspace=apps/server-core-worker

# Docker
docker run -e ... ghcr.io/privateaim/hub core-worker start
```

::: info
Unlike other services, the worker has no CLI interface. It starts directly via `node dist/index.mjs` using `dotenv/config`.
:::

## Dependencies

- **Authup** — OAuth2 identity provider
- **RabbitMQ** — AMQP message bus (receives tasks from Core API); roll out the worker before server-core, since server-core may send commands only the new worker understands
- **Core API** — REST client for status updates
- **Storage API** — REST client for file access
- **Docker** — local Docker daemon for container execution

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTHUP_URL` | — | Authup identity provider URL (**required**) |
| `CORE_URL` | — | Core API base URL (**required**) |
| `STORAGE_URL` | — | Storage service base URL (**required**) |
| `RABBITMQ_CONNECTION_STRING` | `amqp://root:start123@127.0.0.1` | RabbitMQ connection |

A missing `AUTHUP_URL`, `CORE_URL` or `STORAGE_URL` stops the start; each must be a valid URL. The worker does not read `SHUTDOWN_DELAY` or `TRUST_PROXY`.

### Inherited

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3000` | HTTP port of `/`, `/livez` and `/readyz` (see [Health endpoints](/guide/deployment/configuration#health-endpoints)) |
| `REALM` | `master` | Authup realm |
| `CLIENT_ID` | `system` | Authup client ID |
| `CLIENT_SECRET` | `start123` | Authup client secret |

## Components

The worker runs four AMQP task consumers:

| Component | Purpose |
|-----------|---------|
| Analysis Builder | Builds Docker images from analysis code |
| Analysis Distributor | Pushes images to target registries |
| Master Image Builder | Builds base Docker images from GitHub |
| Master Image Synchronizer | Syncs master image catalog |

A handler failure that can go away on its own (connection errors, a 5xx/429 from
an HTTP API, an unreachable docker daemon) is thrown back to the message bus,
which retries the command with backoff. Every other failure, and a retryable one
on the last delivery attempt, is reported as the matching `*_FAILED` event.

## Health Check

The worker exposes a minimal HTTP server for health checking:

```
GET http://localhost:3000/
```
