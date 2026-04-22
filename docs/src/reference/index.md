# Services & Packages

PrivateAIM Hub is composed of five backend services, a frontend, and shared libraries. Each service area groups the runnable application with its related packages.

## Service Areas

| Area | Service | Packages |
|------|---------|----------|
| [Core](/reference/core/) | Main REST API | core-kit, core-http-kit, core-realtime-kit |
| [Worker](/reference/worker/) | Background Docker execution | server-core-worker-kit |
| [Storage](/reference/storage/) | File/object storage (MinIO) | storage-kit, server-storage-kit |
| [Telemetry](/reference/telemetry/) | Log aggregation (VictoriaLogs) | telemetry-kit, server-telemetry-kit |
| [Messenger](/reference/messenger/) | Real-time messaging (Socket.io) | messenger-kit, server-realtime-kit |
| [Frontend](/reference/frontend/) | Nuxt 4 web application | client-vue |

## Shared Packages

Foundation libraries used across all services:

| Package | Description |
|---------|-------------|
| [@privateaim/kit](/reference/shared/kit) | Core utilities: crypto, domain events, permissions |
| [@privateaim/server-kit](/reference/shared/server-kit) | Logging, auth, AMQP, Redis, DI modules |
| [@privateaim/server-db-kit](/reference/shared/server-db-kit) | TypeORM utilities, data source setup |
| [@privateaim/server-http-kit](/reference/shared/server-http-kit) | HTTP middleware, request helpers, Swagger |

## Shared Configuration

All backend services inherit a common set of environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment: `development`, `production`, `test` |
| `PORT` | `3000` | HTTP server port |
| `REALM` | `master` | Default Authup realm |
| `CLIENT_ID` | `system` | Authup client ID |
| `CLIENT_SECRET` | `start123` | Authup client secret |
| `PUBLIC_URL` | — | Public URL of this service |
| `AUTHUP_URL` | — | Authup identity provider URL |
| `REDIS_CONNECTION_STRING` | — | Redis connection string |
| `RABBITMQ_CONNECTION_STRING` | — | RabbitMQ (AMQP) connection string |

## Database Configuration

Services with a database (`server-core`, `server-storage`, `server-telemetry`) also read:

| Variable | Description |
|----------|-------------|
| `DB_TYPE` | `mysql`, `postgres`, or `better-sqlite3` |
| `DB_HOST` | Database hostname |
| `DB_PORT` | Database port |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DATABASE` | Database name (or `:memory:` for SQLite) |

## Docker

All services are packaged in a single Docker image. The `entrypoint.sh` script selects the service:

```bash
docker run privateaim/hub core cli start
docker run privateaim/hub storage cli start
docker run privateaim/hub telemetry cli start
docker run privateaim/hub messenger cli start
docker run privateaim/hub core-worker
docker run privateaim/hub ui
```

See [Docker Image](/guide/deployment/docker) for build instructions.
