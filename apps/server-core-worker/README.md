# @privateaim/server-core-worker 🏭

[![npm version][npm-src]][npm-href]

Background worker service for PrivateAIM Hub — builds and distributes Docker containers for federated analyses.

## Usage

```bash
# Development
npm run dev --workspace=apps/server-core-worker

# Docker
docker run privateaim/hub core-worker
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Health-check HTTP port |
| `AUTHUP_URL` | — | Authup identity provider URL |
| `CORE_URL` | — | Core API base URL (**required**) |
| `STORAGE_URL` | — | Storage service base URL (**required**) |
| `RABBITMQ_CONNECTION_STRING` | `amqp://root:start123@127.0.0.1` | RabbitMQ connection |

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).

[npm-src]: https://img.shields.io/npm/v/@privateaim/server-core-worker
[npm-href]: https://npmjs.com/package/@privateaim/server-core-worker
