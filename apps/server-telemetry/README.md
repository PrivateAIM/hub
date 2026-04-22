# @privateaim/server-telemetry 📊

[![npm version][npm-src]][npm-href]

Log aggregation and event tracking service for PrivateAIM Hub — backed by VictoriaLogs.

## Usage

```bash
# Development
npm run dev --workspace=apps/server-telemetry

# CLI
npm run cli --workspace=apps/server-telemetry -- start

# Docker
docker run privateaim/hub telemetry cli start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `AUTHUP_URL` | — | Authup identity provider URL |
| `VICTORIA_LOGS_URL` | — | VictoriaLogs base URL |
| `VICTORIA_LOGS_INGESTOR_URL` | — | VictoriaLogs ingest endpoint |
| `VICTORIA_LOGS_QUERIER_URL` | — | VictoriaLogs query endpoint |
| `RABBITMQ_CONNECTION_STRING` | — | RabbitMQ connection |

Plus [database configuration](../../docs/src/reference/index.md#database-configuration).

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).

[npm-src]: https://img.shields.io/npm/v/@privateaim/server-telemetry
[npm-href]: https://npmjs.com/package/@privateaim/server-telemetry
