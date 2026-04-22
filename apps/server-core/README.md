# @privateaim/server-core 🌐

[![npm version][npm-src]][npm-href]

Main REST API service for PrivateAIM Hub — manages analyses, projects, nodes, registries, and master images.

## Usage

```bash
# Development
npm run dev --workspace=apps/server-core

# CLI
npm run cli --workspace=apps/server-core -- start

# Docker
docker run privateaim/hub core cli start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `AUTHUP_URL` | — | Authup identity provider URL |
| `REDIS_CONNECTION_STRING` | — | Redis connection |
| `RABBITMQ_CONNECTION_STRING` | — | RabbitMQ connection |
| `HARBOR_URL` | — | Harbor registry URL |
| `TELEMETRY_URL` | — | Telemetry service URL |
| `VAULT_CONNECTION_STRING` | `start123@http://127.0.0.1:8090/v1/` | Vault connection |
| `SKIP_PROJECT_APPROVAL` | `false` | Skip project approval workflow |
| `SKIP_ANALYSIS_APPROVAL` | `false` | Skip analysis approval workflow |

Plus [database configuration](../../docs/src/reference/index.md#database-configuration).

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).

[npm-src]: https://img.shields.io/npm/v/@privateaim/server-core
[npm-href]: https://npmjs.com/package/@privateaim/server-core
