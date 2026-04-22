# Core API (server-core)

The Core API is the main REST service of PrivateAIM Hub. It manages analyses, projects, nodes, registries, and master images, and coordinates workflows through AMQP messaging.

## Running

```bash
# Development (from repo root)
npm run server-api

# CLI
npm run cli --workspace=apps/server-core -- start

# Docker
docker run -e ... privateaim/hub core cli start
```

## Dependencies

- **Database** — MySQL, PostgreSQL, or SQLite
- **Authup** — OAuth2 identity provider
- **Redis** — pub/sub and caching
- **RabbitMQ** — AMQP message bus (for worker communication)
- **Harbor** (optional) — Docker registry for analysis images

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `HARBOR_URL` | — | Harbor registry URL |
| `TELEMETRY_URL` | — | Telemetry service URL |
| `VAULT_CONNECTION_STRING` | `start123@http://127.0.0.1:8090/v1/` | Vault connection for secrets |
| `MASTER_IMAGES_OWNER` | `PrivateAim` | GitHub owner for master images |
| `MASTER_IMAGES_REPOSITORY` | `master-images` | GitHub repository name |
| `MASTER_IMAGES_BRANCH` | `master` | GitHub branch |
| `SKIP_PROJECT_APPROVAL` | `false` | Skip project approval workflow |
| `SKIP_ANALYSIS_APPROVAL` | `false` | Skip analysis approval workflow |

### Inherited

See [Shared Configuration](/reference/#shared-configuration) and [Database Configuration](/reference/#database-configuration).

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/analyses` | Analysis CRUD |
| `GET/POST/PUT/DELETE` | `/projects` | Project CRUD |
| `GET/POST/PUT/DELETE` | `/nodes` | Node CRUD |
| `GET/POST/PUT/DELETE` | `/registries` | Registry CRUD |
| `GET/POST/PUT/DELETE` | `/master-images` | Master image CRUD |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

## Architecture

The Core API follows the [hexagonal architecture](/getting-started/architecture) with:

- **Domain services** for each entity (validation, permission checks, business logic)
- **AMQP aggregators** consuming events from other services (builder, distributor, storage, authup)
- **AMQP task consumers** for registry and analysis metadata processing
- **TypeORM subscribers** publishing domain events on entity changes

## Approval Workflows

By default, projects and analyses require administrator approval before execution. This can be disabled for development:

```bash
SKIP_PROJECT_APPROVAL=true
SKIP_ANALYSIS_APPROVAL=true
```

See [Approval Workflows](/guide/user/approval) for details on the approval process.
