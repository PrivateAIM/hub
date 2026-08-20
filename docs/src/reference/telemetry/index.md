# Telemetry (server-telemetry)

The Telemetry service handles log aggregation via VictoriaLogs and event tracking via a database. It provides query and write APIs for structured logs.

## Running

```bash
# Development
npm run dev --workspace=apps/server-telemetry

# CLI
npm run cli --workspace=apps/server-telemetry -- start

# Docker
docker run -e ... privateaim/hub telemetry cli start
```

## Dependencies

- **Database** — MySQL, PostgreSQL, or SQLite (for event entities)
- **Authup** — OAuth2 identity provider
- **VictoriaLogs** (optional) — log storage backend
- **RabbitMQ** — AMQP message bus

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `VICTORIA_LOGS_URL` | — | VictoriaLogs base URL |
| `VICTORIA_LOGS_INGESTOR_URL` | — | VictoriaLogs ingest endpoint (overrides base URL) |
| `VICTORIA_LOGS_QUERIER_URL` | — | VictoriaLogs query endpoint (overrides base URL) |

All VictoriaLogs variables are optional. When unset, an in-memory log store is used as a fallback.

### Inherited

See [Shared Configuration](/reference/#shared-configuration) and [Database Configuration](/reference/#database-configuration).

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | List events |
| `GET` | `/events/:id` | Get event |
| `POST` | `/events` | Create event |
| `DELETE` | `/events/:id` | Delete event |
| `GET` | `/logs` | Query logs (VictoriaLogs) |
| `POST` | `/logs` | Write logs |
| `DELETE` | `/logs` | Delete logs |
| `GET` | `/docs` | Swagger/OpenAPI documentation |

## Response Shapes

Event and log endpoints answer with a `{ data, meta }` envelope — the record (or the record array)
under `data`. `GET /events` and `GET /events/:id` advertise the endpoint's queryable vocabulary at
`meta.schema`; `POST /events`, `DELETE /events/:id` and `POST /logs` carry `meta: {}`.

Two surfaces stay outside that contract:

| Endpoint | Shape |
|----------|-------|
| `GET /` | `{ version, timestamp }` — service metadata, flat |
| `DELETE /logs` | `null` (202), flat |

::: warning `GET /logs` is deliberately schemaless
The log collection is decoded as an **open** query: its filters are dynamic VictoriaLogs labels
rather than a declared rapiq vocabulary, so there is nothing to describe. It is the one query
endpoint in Hub that carries **no** `meta.schema` — `meta` holds only `total`, `limit` and `offset`.
:::

See [API Reference](/guide/development/api#response-shapes) for the full contract and the
`meta.schema` reading rules.

## Architecture

- **LogStore port** (`core/services/log-store/types.ts`) — defines `query`, `write`, `delete` operations
- **VictoriaLogsLogStore** — production implementation with query injection protection
- **MemoryLogStore** — in-memory fallback for startup and testing
- **EventComponent** / **LogComponent** — AMQP consumers for async event and log ingestion.
  EventComponent also owns the retention sweep: expiring events are dropped once at
  start and daily at 01:00, in bounded batches so a matured retention window never
  becomes one long-running delete.

::: warning
The telemetry service is the log writer itself, so its own logger cannot use the log component caller (would be circular). It uses a `MemoryLogStore` fallback internally.
:::
