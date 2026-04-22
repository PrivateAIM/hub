# Messenger (server-messenger)

The Messenger service provides real-time messaging between Hub components via Socket.io. It has no database — it is a pure WebSocket relay.

## Running

```bash
# Development (from repo root)
npm run server-realtime

# CLI
npm run cli --workspace=apps/server-messenger -- start

# Docker
docker run -e ... privateaim/hub messenger cli start
```

## Dependencies

- **Redis** — pub/sub for Socket.io adapter (**required**)
- **Authup** — OAuth2 identity provider (token validation on socket connect)

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_CONNECTION_STRING` | `redis://127.0.0.1` | Redis connection (**required**) |
| `AUTHUP_URL` | `http://127.0.0.1:3010/` | Authup URL |

### Inherited

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3000` | HTTP/WebSocket server port |
| `REALM` | `master` | Authup realm |
| `CLIENT_ID` | `system` | Authup client ID |
| `CLIENT_SECRET` | `start123` | Authup client secret |

## Architecture

This is the most minimal Hub service:

- **Socket controllers** — connection lifecycle and message relay handlers
- **HTTPModule** — creates HTTP server + Socket.io server with Authup middleware
- No database, no AMQP consumers, no Swagger
