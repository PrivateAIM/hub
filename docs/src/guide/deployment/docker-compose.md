# Docker Compose

The [hub-deployment](https://github.com/PrivateAIM/hub-deployment) repository provides a ready-to-use Docker Compose setup that orchestrates all Hub services with their infrastructure dependencies.

::: warning
The Docker Compose setup is suited for **testing and development** only. For production deployments, use the [Kubernetes (Helm)](/guide/deployment/kubernetes) approach.
:::

## Prerequisites

- Docker and Docker Compose
- An external Harbor registry (not included in the compose stack)

## Quick Start

```bash
# Clone the deployment repository
git clone https://github.com/PrivateAIM/hub-deployment.git
cd hub-deployment/docker-compose

# Configure environment
cp .env.example .env
# Edit .env as needed

# Start all services
docker compose up -d
```

The stack will be available at `http://localhost:3000` via the Nginx reverse proxy.

## Services

The compose stack includes:

### Infrastructure

| Service | Image | Purpose |
|---------|-------|---------|
| `postgres` | PostgreSQL 18 | Shared database |
| `redis` | Redis 8 | Pub/sub and caching |
| `rabbitmq` | RabbitMQ 3 (management) | Message queue |
| `minio` | MinIO | Object storage (S3-compatible) |
| `victoria-logs` | VictoriaLogs | Log aggregation |
| `grafana` | Grafana | Monitoring dashboards |

### Hub Services

| Service | Command | Purpose |
|---------|---------|---------|
| `authup` | — | Authentication (OAuth2) |
| `core` | `core cli start` | Main REST API |
| `core-worker` | — | Background worker (Docker execution) |
| `storage` | — | File/object storage |
| `messenger` | — | Real-time messaging |
| `telemetry` | — | Log collection |
| `ui` | — | Frontend application |
| `nginx` | — | Reverse proxy (port 3000) |

### Networking

All services run on a bridge network (`hub`) with a configurable subnet (default: `172.40.1.0/24`).

Nginx routes requests by path prefix:

| Path | Service |
|------|---------|
| `/` | UI |
| `/core/` | Core API (WebSocket enabled) |
| `/auth/` | Authup |
| `/storage/` | Storage |
| `/telemetry/` | Telemetry |
| `/messenger/` | Messenger (WebSocket enabled) |

## Environment Variables

Create a `.env` file from the provided `.env.example`:

```bash
# Hub image configuration
HUB_IMAGE=ghcr.io/privateaim/hub
HUB_IMAGE_TAG=latest
SUBNET=172.40.1.0/24
```

| Variable | Default | Description |
|----------|---------|-------------|
| `HUB_IMAGE` | `ghcr.io/privateaim/hub` | Hub Docker image name |
| `HUB_IMAGE_TAG` | `latest` | Image version tag |
| `SUBNET` | `172.40.1.0/24` | Docker network subnet |
| `HARBOR_URL` | — | Container registry (`<user>:<passwd>@<host>`, no `https://`) |
| `AUTHUP_PUBLIC_URL` | `http://localhost:3000/auth/` | Public auth URL |
| `CORE_PUBLIC_URL` | `http://localhost:3000/core/` | Public core API URL |
| `STORAGE_PUBLIC_URL` | `http://localhost:3000/storage/` | Public storage URL |
| `TELEMETRY_PUBLIC_URL` | `http://localhost:3000/telemetry/` | Public telemetry URL |
| `COOKIE_DOMAIN` | `localhost` | Cookie domain for auth |
| `MQ_CONNECTION_URL` | `amqp://root:start123@172.40.1.1` | RabbitMQ connection |

See [Configuration](/guide/deployment/configuration) for service-specific environment variables.
