# @privateaim/server-realtime-kit

Socket.io server helpers with Authup authentication middleware and Redis adapter support for scalable real-time communication.

## Installation

```bash
npm install @privateaim/server-realtime-kit
```

## Usage

### Socket Server Setup

```typescript
import { createSocketServer } from '@privateaim/server-realtime-kit';

const io = createSocketServer(httpServer, {
    authupURL: 'http://localhost:3000',
    redisURL: 'redis://localhost:6379',
});
```

### Authentication Middleware

```typescript
import { createSocketAuthMiddleware } from '@privateaim/server-realtime-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `server` | Socket.io server creation with Redis adapter |
| `middlewares` | Authup token validation for socket connections |
| `helpers` | Socket utility helpers |
| `types` | Socket-related TypeScript types |

## Dependencies

- `socket.io` — WebSocket server
- `@socket.io/redis-adapter` — Redis-backed Socket.io adapter
- `@authup/server-adapter` — Token validation
- `@privateaim/server-kit` — Server foundation
