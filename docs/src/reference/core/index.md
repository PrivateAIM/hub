# Core API (server-core)

The Core API is the main REST service of FLAME Hub. It manages analyses, projects, nodes, registries, and master images, and coordinates workflows through AMQP messaging.

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
| `GET/POST/DELETE` | `/analyses` | Analysis CRUD (update is `POST /analyses/:id`) |
| `GET/POST/DELETE` | `/projects` | Project CRUD |
| `GET/POST/DELETE` | `/nodes` | Node CRUD |
| `GET/POST/DELETE` | `/registries` | Registry CRUD |
| `GET/DELETE` | `/master-images` | Master image read + delete (`POST /master-images/command` runs sync/build) |
| `GET/POST` | `/nodes/:id/client/credentials` | Read / update the node's OAuth2 client credentials (secret, name, display name) — usable by the node's own client or a `NODE_UPDATE` manager |
| `GET` | `/nodes/:id/registry/credentials` | Read the node's own registry project (Harbor robot) credentials — accessible to the node's own client without any management permission |
| `GET/POST` | `/analyses/:id/client/credentials` | Read / rotate the analysis's OAuth2 client credentials |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

## Response Shapes

Every entity endpoint answers with a `{ data, meta }` envelope — the record (or the record array)
under `data`, response-scoped extras under `meta`. Query-capable `GET`s additionally advertise the
endpoint's queryable vocabulary at `meta.schema`; mutations carry `meta: {}`.

Four surfaces of this service deliberately stay **flat**, because they are protocol, credential or
bulk-delete shapes rather than entity records:

| Endpoint | Shape |
|----------|-------|
| `GET /` | `{ version, timestamp }` — service metadata |
| `POST /services/:id/hook`, `POST /services/:id/command` | `null` (202) — Harbor webhook / command protocol |
| `GET`/`POST` `/nodes/:id/client/credentials`, `GET`/`POST` `/analyses/:id/client/credentials`, `GET /nodes/:id/registry/credentials` | credential payloads |
| `DELETE /analysis-logs`, `DELETE /analysis-node-logs` | `null` (202) |

`GET /analyses/:id/client/permissions` is a collection but carries **no** `meta.schema` — it proxies
Authup `ClientPermission` records, for which no Hub-side query schema exists.

See [API Reference](/guide/development/api#response-shapes) for the full contract and the
`meta.schema` reading rules.

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
