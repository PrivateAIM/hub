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

## Architecture

- **LogStore port** (`core/services/log-store/types.ts`) — defines `query`, `write`, `delete` operations
- **VictoriaLogsLogStore** — production implementation with query injection protection
- **MemoryLogStore** — in-memory fallback for startup and testing
- **EventComponent** / **LogComponent** — AMQP consumers for async event and log ingestion

::: warning
The telemetry service is the log writer itself, so its own logger cannot use the log component caller (would be circular). It uses a `MemoryLogStore` fallback internally.
:::
