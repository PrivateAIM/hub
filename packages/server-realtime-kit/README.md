<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-realtime-kit ⚡</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-realtime-kit)](https://www.npmjs.com/package/@privateaim/server-realtime-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Socket.IO helpers for FLAME Hub services: a Redis-adapted server, Authup socket authentication and room subscriptions.**

server-core and server-messenger use it so their socket servers authenticate, log and scale out across replicas the same way.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Authentication](#authentication) · [Rooms](#room-subscriptions) · [API](#api) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/messenger/server-realtime-kit.html)

---

## Installation

```bash
npm install @privateaim/server-realtime-kit socket.io
```

ESM only, Node.js `>=26.0.0`. `socket.io` and `redis-extension` are peer dependencies.

## Usage

```typescript
import { createAuthupTokenVerifier } from '@privateaim/server-http-kit';
import { createServer, mountAuthorizationMiddleware, mountLoggingMiddleware } from '@privateaim/server-realtime-kit';

const server = createServer(httpServer, {
    logger,
    redisPublishClient,
    redisSubscribeClient,
});

const nsp = server.of(/^\/resources(?:\/[^/]+)?$/);

mountLoggingMiddleware(nsp, { logger });
mountAuthorizationMiddleware(nsp, {
    authupClient,
    baseURL: config.authupURL,
    tokenVerifier: createAuthupTokenVerifier({
        baseURL: config.authupURL,
        client: { id: config.clientId, secret: config.clientSecret, realm: config.realm },
        redisClient: redisPublishClient,
    }),
    logger,
});
```

`createServer(httpServer, options?)` creates a Socket.IO `Server` on an existing Node HTTP server:

| Option | Effect |
|---|---|
| `redisPublishClient` + `redisSubscribeClient` | Both set: the `@socket.io/redis-adapter` broadcasts across replicas. Only one set: a warning is logged and no adapter is used |
| `logger` | Engine `connection_error` events are logged on the `websocket` log channel |

- CORS allows every origin with credentials; transports are `websocket` and `polling`.
- The type parameters (`ListenEvents`, `EmitEvents`, `ServerSideEvents`, `SocketData`) type the event maps, e.g. those from
  `@privateaim/core-realtime-kit`.

## Authentication

- `mountAuthorizationMiddleware(nsp, options)` verifies the handshake token with `tokenVerifier` (build it with
  `createAuthupTokenVerifier` from [`@privateaim/server-http-kit`](https://www.npmjs.com/package/@privateaim/server-http-kit),
  which refuses malformed tokens before introspection) and sets `socket.data.identity` and `socket.data.permissionEvaluator`.
  A token without the `global` scope keeps its identity but has no grants.
- A connection without an identity is refused with an `UnauthorizedError`; connects and disconnects of authenticated sockets are
  logged with `actorType` and `actorId` labels.
- Without `baseURL` or `authupClient` no socket is verified, so every connection is refused (fail closed).
- `createAuthorizationMiddleware(options)` returns only the verifying middleware, without the refusal and the connect logs.
- `isSocketAuthenticated(socket)` tells whether a socket carries an identity.

## Room subscriptions

```typescript
import { subscribeSocketRoom, unsubscribeSocketRoom } from '@privateaim/server-realtime-kit';

subscribeSocketRoom(socket, 'nodes');
subscribeSocketRoom(socket, 'nodes');
unsubscribeSocketRoom(socket, 'nodes'); // still joined
unsubscribeSocketRoom(socket, 'nodes'); // left
```

Subscriptions are counted per room in `socket.data.roomSubscriptions`: the socket joins on the first subscribe and leaves the room
only when the last subscription is gone, so two views subscribing to the same room do not cut each other off.

## API

| Export | Kind | Purpose |
|---|---|---|
| `createServer` | function | Socket.IO server with optional Redis adapter |
| `mountAuthorizationMiddleware`, `createAuthorizationMiddleware`, `AuthorizationMiddlewareRegistrationOptions` | functions, type | Authup handshake authentication |
| `mountLoggingMiddleware` | function | Debug logs of connects, disconnects and namespace errors |
| `mountForceLoggedInMiddleware` | function | Refuses a socket without an identity with `UnauthorizedError`; mount it after the authorization middleware |
| `isSocketAuthenticated`, `subscribeSocketRoom`, `unsubscribeSocketRoom` | functions | Socket helpers |
| `Server`, `Namespace`, `Socket`, `Middleware`, `SocketData`, `SocketIdentity` | types | Socket.IO types bound to Hub's `SocketData` |

## Notes

- **Both Redis clients or none.** The adapter needs a publish and a subscribe client; passing only one logs a warning and
  leaves broadcasts local to the replica.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
