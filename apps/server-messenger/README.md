# @privateaim/server-messenger 💬

[![npm version][npm-src]][npm-href]

Real-time messaging service for PrivateAIM Hub — powered by Socket.io with Redis adapter.

## Usage

```bash
# Development
npm run dev --workspace=apps/server-messenger

# CLI
npm run cli --workspace=apps/server-messenger -- start

# Docker
docker run privateaim/hub messenger cli start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP/WebSocket server port |
| `AUTHUP_URL` | `http://127.0.0.1:3010/` | Authup identity provider URL |
| `REDIS_CONNECTION_STRING` | `redis://127.0.0.1` | Redis connection (**required**) |

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).

[npm-src]: https://img.shields.io/npm/v/@privateaim/server-messenger
[npm-href]: https://npmjs.com/package/@privateaim/server-messenger
