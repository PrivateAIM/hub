<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-messenger 💬</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Durable store-and-forward message broker of FLAME Hub, with REST send, pull and ack and a push wakeup.**

Messages are stored per recipient in a database until acknowledged or expired; a payload-free wakeup tells the recipient to pull, so a client that was offline loses nothing.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.

[Usage](#usage) · [Messaging](#messaging) · [Configuration](#configuration) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/messenger/)

---

## Usage

The service needs Node.js `>=26.0.0`, a database (MySQL or PostgreSQL; SQLite for tests), Redis and Authup. RabbitMQ is optional.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Start the HTTP and Socket.IO server
npm run cli --workspace=apps/server-messenger -- start

# Database migrations: run | revert | status | generate
npm run cli --workspace=apps/server-messenger -- migration run
```

`start` creates the database when it does not exist and applies pending migrations before it serves.

### Docker

The service ships in the shared `ghcr.io/privateaim/hub` image:

```bash
docker run \
    -e DB_TYPE=postgres -e DB_HOST=db -e DB_USERNAME=hub -e DB_PASSWORD=secret -e DB_DATABASE=messenger \
    -e AUTHUP_URL=http://authup:3000/ \
    -e REDIS_CONNECTION_STRING=redis://redis \
    -p 3000:3000 \
    ghcr.io/privateaim/hub messenger cli start
```

## Messaging

Every route acts as the authenticated identity (a user, robot or client, e.g. a node's `client_credentials` token); there is no analysis in the path and the payload is opaque.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/messages` | Send `{ recipients, data?, metadata? }`; one stored row per recipient |
| `GET` | `/messages?limit=<n>&wait=<ms>` | Pull pending messages, oldest first; `wait` long-polls for up to 30 seconds |
| `POST` | `/messages/ack` | Acknowledge `{ ids }`; acknowledged messages are deleted |
| `GET` | `/messages/stream` | Server-Sent Events stream of `messagePending` wakeups, with a `: ping` comment every 15 seconds |

- A wakeup carries only the recipient, never the payload: the recipient pulls with `GET /messages` on each event, and once after reconnecting.
- Wakeups reach every instance through Redis pub/sub, then each instance notifies its own SSE streams, Socket.IO connections and parked long-polls.
- Messages expire after 24 hours; a pull never returns an expired message and a sweep removes them every minute.
- Contract types live in [`@privateaim/messenger-kit`](https://hub.docs.privateaim.net/reference/messenger/messenger-kit.html), the HTTP client in [`@privateaim/messenger-http-kit`](https://hub.docs.privateaim.net/reference/messenger/messenger-http-kit.html).

A legacy Socket.IO relay (direct `send` plus presence) still runs beside the broker on the same port; it is retired together with the socket wakeup.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development`, `production` or `test` |
| `PORT` | `3000` | HTTP and Socket.IO port |
| `AUTHUP_URL` | `http://127.0.0.1:3010/` | Authup identity provider URL |
| `REALM` | `master` | Authup realm of the service client |
| `CLIENT_ID` | `system` | Authup client the service authenticates as; needs `permission_read` |
| `CLIENT_SECRET` | `start123` | Secret of that client |
| `REDIS_CONNECTION_STRING` | none (**required**) | Redis for cross-instance wakeups and the Socket.IO adapter |
| `RABBITMQ_CONNECTION_STRING` | none | RabbitMQ to ship the service's logs to server-telemetry |
| `COOKIE_PREFIX` | none | Prefix of the `access_token` cookie read when a request has no `Authorization` header; must match client-ui's prefix |
| `TRUST_PROXY` | every hop | Trusted `X-Forwarded-For` hops: `true`, `false`, a hop count or a comma list of IPs and CIDRs |
| `SHUTDOWN_DELAY` | `0` | Seconds to keep serving after a stop signal while `/readyz` answers 503 (0 to 3600) |

The database is configured through `DB_TYPE` (`mysql`, `postgres` or `better-sqlite3`, required), `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE`
([database variables](https://hub.docs.privateaim.net/guide/deployment/configuration.html#database-variables)).

## Notes

- **The start fails without `REDIS_CONNECTION_STRING`.** The variable is read as required. When Redis is set but unreachable at start, the wakeup falls back to memory and wakes only clients on the same instance.
- **Authup is mandatory.** Without it every request and socket connection answers 401. The service client reads Authup's authorization catalog for authenticated requests (cached for 60 s), so it needs `permission_read` ([Authup for server-messenger](https://hub.docs.privateaim.net/guide/deployment/configuration.html#server-messenger-authenticates-against-authup)).
- **Delivery is at least once.** A message stays in the mailbox until its recipient acknowledges it or it expires; a client that pulls and crashes before the ack receives it again.
- **`/livez` and `/readyz` are anonymous** health probes; readiness checks only the database.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
