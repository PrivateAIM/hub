# @privateaim/server-storage 📦

[![npm version][npm-src]][npm-href]

File and object storage service for PrivateAIM Hub — backed by MinIO (S3-compatible).

## Usage

```bash
# Development
npm run dev --workspace=apps/server-storage

# CLI
npm run cli --workspace=apps/server-storage -- start

# Docker
docker run privateaim/hub storage cli start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `AUTHUP_URL` | — | Authup identity provider URL |
| `MINIO_CONNECTION_STRING` | `http://admin:start123@127.0.0.1:9000` | MinIO connection (**required**) |
| `RABBITMQ_CONNECTION_STRING` | — | RabbitMQ connection |

Plus [database configuration](../../docs/src/reference/index.md#database-configuration).

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).

[npm-src]: https://img.shields.io/npm/v/@privateaim/server-storage
[npm-href]: https://npmjs.com/package/@privateaim/server-storage
