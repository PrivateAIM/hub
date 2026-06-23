# Messenger (server-messenger)

The Messenger service is the Hub's **durable store-and-forward message broker** for analysis-to-analysis (and, generally, identity-to-identity) messaging. It persists messages in a database and exposes a REST send/pull/ack API, with a payload-free Socket.io **wakeup** that tells a recipient to pull. It is analysis-agnostic — the payload is opaque (end-to-end ciphertext for analysis messaging) and `analysisId`, when present, rides in message metadata.

> A legacy Socket.io **relay** (direct `send` + presence) still runs alongside the broker during the migration to the dedicated node broker; it is removed at decommission.

## Running

```bash
# Development (from repo root)
npm run dev --workspace=apps/server-messenger

# CLI
npm run cli --workspace=apps/server-messenger -- start

# Migrations
npm run cli --workspace=apps/server-messenger -- migration run

# Docker
docker run -e ... privateaim/hub messenger cli start
```

## Dependencies

- **Database** (MySQL / PostgreSQL; SQLite for tests) — durable mailbox
- **Redis** — cross-instance wakeup pub/sub + Socket.io adapter
- **Authup** — OAuth2 identity provider (token validation on REST + socket connect)

## REST API

Authenticated as the calling identity (e.g. a node's `client_credentials` token). The whole resource is identity-level — there is no analysis in the path.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/messages` | Send `{ recipients: MessageParty[], data?, metadata? }`. Sender = the authenticated identity; recipients are any kind (`user` / `robot` / `client`). One stored row per recipient. Returns the created message ids. |
| `GET`  | `/messages?limit=<n>&wait=<ms>` | Pull the caller's pending messages, oldest first. `wait` enables long-poll: park up to `wait` ms (capped at 30s) for a pending message before returning empty. |
| `POST` | `/messages/ack` `{ ids }` | Acknowledge messages by id — the broker deletes them (delete-on-ack). |
| `GET`  | `/messages/stream` | Server-Sent Events stream of payload-free `messagePending` wakeups for the caller (and one on connect). The client pulls via `GET /messages` on each event. |

Messages carry a uniform TTL (24h); a background sweep reaps expired rows. Contract types live in `@privateaim/messenger-kit`; the Hapic client is `@privateaim/messenger-http-kit`.

## Wakeup (`messagePending`)

When a message is sent, the broker publishes a payload-free wakeup. Across instances it fans out via Redis pub/sub; each instance then notifies its locally-connected recipients through whichever channel they use:

- **SSE** (`GET /messages/stream`) — the preferred push channel: HTTP-native, one-way, no socket.io dependency on the consumer.
- **Socket.io** `messagePending` — the legacy push channel; retired together with the legacy relay at decommission.
- **Long-poll** (`GET /messages?wait`) — the universal fallback when no stream is held; the parked request resolves on the wakeup.

The payload is never sent over any wakeup channel — it carries only the recipient identity, and the recipient pulls the actual message(s) via REST. A recipient reconnecting a stream should pull once to catch up (the durable mailbox means nothing is lost across gaps).

## Environment Variables

### Service-Specific

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_TYPE` | `better-sqlite3` | `mysql`, `postgres`, or `better-sqlite3` |
| `DB_HOST` / `DB_PORT` | — | Database connection |
| `DB_USERNAME` / `DB_PASSWORD` | — | Database credentials |
| `DB_DATABASE` | — | Database name |
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

Hexagonal, like the other Hub services:

- **`adapters/database/`** — single `message` TypeORM entity (uuid pk, `created_at` ordering, bigint-epoch `expires_at`), PostgreSQL + MySQL migrations
- **`adapters/http/`** — thin REST controllers (`/messages` send/pull/ack) + the SSE wakeup stream (`/messages/stream`, via `routup.createEventStream`)
- **`adapters/socket/`** — connection room-join (keyed by identity) + the legacy `messagePending` socket emit; the legacy relay/presence handlers (and this socket wakeup) retire at decommission
- **`core/`** — `MessageService` (send/pull/ack + long-poll), `IMessageRepository` port, `IMessageWakeup` port (in-memory + redis implementations)
- **`app/modules/`** — `ConfigModule`, `DatabaseModule`, `WakeupModule`, `SweeperModule` (TTL reaper), `HTTPModule` (REST + slimmed Socket.io server)
