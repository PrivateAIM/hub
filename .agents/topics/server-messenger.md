# server-messenger

Read before changing apps/server-messenger.

## Architecture

Durable store-and-forward message broker: messages are persisted to a mailbox and
delivered by `send` / `pull` / `ack` over REST, with the socket reduced to a
payload-free wakeup signal. The legacy relay/presence surface stays alongside it for
coexistence until decommission.

**Core:** `core/entities/message/` (service, ports, `MESSAGE_SWEEP_BATCH_SIZE` = 1000) and
`core/services/wakeup/` (`AbstractMessageWakeup`, `MemoryMessageWakeup`).

**Adapters:**
- `adapters/database/` — the message mailbox entity + `migrations/{mysql,postgres}/`
- `adapters/http/controllers/message/` — REST message surface (send/pull/ack). **Not**
  an entity API: no `{ data, meta }` envelope.
- `adapters/socket/controllers/connection/` — Socket.io connection lifecycle handlers
- `adapters/socket/controllers/messaging/` — legacy relay handlers

**Service-specific modules:**
- `DatabaseModule` — `DataSource` + `MessageRepository` (adapter in `app/modules/database/repositories/message/`)
- `WakeupModule` — `RedisMessageWakeup` (`app/modules/wakeup/redis.ts`) when redis is present
  (cross-instance), else `MemoryMessageWakeup`; emits the payload-free `messagePending` into
  the recipient's local socket room
- `SweeperModule` — a hubwire scheduled component (`'* * * * *'`, `runOnStart: false`;
  `teardown()` awaits its `settled?.()` after `stop()`) deleting messages past their absolute
  `expiresAt` via batched `deleteExpired(now, { batchSize })`. The id select uses `Raw`, not
  `LessThan`: `expires_at` is a datetime column behind a `string`-typed property, and `now`
  must stay a bound `Date` — an ISO string satisfies the property type but MySQL truncates
  the trailing `Z` when casting it
- `HTTPModule` — HTTP server + Socket.io server with Authup auth middleware

## Directory layout

```
apps/server-messenger/src/
├── core/
│   ├── entities/message/
│   └── services/wakeup/
├── adapters/
│   ├── database/                  # entities/, migrations/{mysql,postgres}
│   ├── http/controllers/message/  # REST message surface
│   └── socket/controllers/        # connection/, messaging/ (legacy relay)
├── app/modules/                   # config, database (+ repositories/), wakeup, sweeper, http
└── cli/                           # citty CLI
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource`, `MessageRepository` |
| WakeupModule | `wakeup` | `config`, `redis`? | `WakeupInjectionKey` |
| SweeperModule | `sweeper` | `database` | nothing (scheduled component expiring stored messages; started in `setup`, stopped in `teardown`) |
| HTTPModule | `http` | `config`, `database`, `wakeup`, `authupClient`? | `Server`, `SocketServer` |
