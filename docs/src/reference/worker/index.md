# Worker (server-core-worker)

The Worker service executes background tasks — primarily building and distributing Docker containers for analyses. It is purely queue-driven with no database.

## Running

```bash
# Development (from repo root)
npm run server-train-manager

# Docker
docker run -e ... privateaim/hub core-worker
```

::: info
Unlike other services, the worker has no CLI interface. It starts directly via `node dist/index.mjs` using `dotenv/config`.
:::

## Dependencies

- **Authup** — OAuth2 identity provider
- **RabbitMQ** — AMQP message bus (receives tasks from Core API)
- **Core API** — REST client for status updates
- **Storage API** — REST client for file access
- **Docker** — local Docker daemon for container execution

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `CORE_URL` | — | Core API base URL (**required**) |
| `STORAGE_URL` | — | Storage service base URL (**required**) |
| `RABBITMQ_CONNECTION_STRING` | `amqp://root:start123@127.0.0.1` | RabbitMQ connection |

### Inherited

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3000` | Health-check HTTP port |
| `REALM` | `master` | Authup realm |
| `CLIENT_ID` | `system` | Authup client ID |
| `CLIENT_SECRET` | `start123` | Authup client secret |
| `AUTHUP_URL` | — | Authup URL |

## Components

The worker runs four AMQP task consumers:

| Component | Purpose |
|-----------|---------|
| Analysis Builder | Builds Docker images from analysis code |
| Analysis Distributor | Pushes images to target registries |
| Master Image Builder | Builds base Docker images from GitHub |
| Master Image Synchronizer | Syncs master image catalog |

## Health Check

The worker exposes a minimal HTTP server for health checking:

```
GET http://localhost:3000/
```
