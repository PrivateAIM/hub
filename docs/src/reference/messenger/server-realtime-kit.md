# @privateaim/server-realtime-kit

Socket.io server helpers with Authup authentication middleware and Redis adapter support for scalable real-time communication.

## Installation

```bash
npm install @privateaim/server-realtime-kit
```

## Usage

### Socket Server Setup

```typescript
import { createServer } from '@privateaim/server-realtime-kit';

const io = createServer(httpServer, {
    redisPublishClient,
    redisSubscribeClient,
    logger,
});
```

`createServer(httpServer, { redisPublishClient?, redisSubscribeClient?, logger? })` builds a Socket.io server
(websocket and polling transports, every origin allowed with credentials). With both Redis clients it uses the
Redis adapter; with only one it logs a warning and runs without it. The clients are `redis-extension` clients,
for example the ones `RedisModule` registers under `RedisPublishClientInjectionKey` and
`RedisSubscribeClientInjectionKey`. With a `logger`, engine connection errors are logged.

### Authentication Middleware

```typescript
import { mountAuthorizationMiddleware } from '@privateaim/server-realtime-kit';

mountAuthorizationMiddleware(io, {
    tokenVerifier, // e.g. createAuthupTokenVerifier() from @privateaim/server-http-kit
    authupClient,
    baseURL: 'http://localhost:3010',
    logger,
});
```

`createAuthorizationMiddleware(options)` returns the Authup token middleware alone; `mountAuthorizationMiddleware`
mounts it on a server or namespace, rejects a connection without an identity with an `UnauthorizedError` and logs
each identified connection. It fails closed: without `baseURL` or `authupClient` no connection gets an identity.

## API

### Exports

| Module | Description |
|--------|-------------|
| `server` | `createServer()`: Socket.io server creation with Redis adapter |
| `middlewares` | `createAuthorizationMiddleware`, `mountAuthorizationMiddleware` (Authup token validation), `mountForceLoggedInMiddleware`, `mountLoggingMiddleware` |
| `helpers` | `isSocketAuthenticated`, `subscribeSocketRoom`, `unsubscribeSocketRoom` |
| `types` | `Server`, `Namespace`, `Socket`, `Middleware`, `SocketData`, `SocketIdentity` |

## Dependencies

- `socket.io` — WebSocket server (peer dependency)
- `redis-extension` — Redis client type (peer dependency)
- `@socket.io/redis-adapter` — Redis-backed Socket.io adapter
- `@authup/server-adapter-socket-io`, `@authup/server-adapter-kit` — Token validation
- `@privateaim/server-kit` — Server foundation
