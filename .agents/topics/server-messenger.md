# server-messenger

Read before changing apps/server-messenger.

## Architecture

Durable store-and-forward message broker. It is **not** a
database-less Socket.io relay: messages are persisted to a mailbox and delivered by
`send` / `pull` / `ack` over REST, with the socket reduced to a payload-free wakeup
signal. The legacy relay/presence surface is kept alongside it for coexistence until
decommission.

**Adapters:**
- `adapters/database/entities/` — the message mailbox entity (+ `migrations/{mysql,postgres}/`)
- `adapters/http/controllers/message/` — REST message surface (send/pull/ack). **Not**
  an entity API: no `{ data, meta }` envelope.
- `adapters/socket/controllers/connection/` — Socket.io connection lifecycle handlers
- `adapters/socket/controllers/messaging/` — legacy relay handlers
- `adapters/socket/register.ts` — controller registration helper

**Service-specific modules:**
- `DatabaseModule` — `DataSource` + `MessageRepository`
- `WakeupModule` — redis pub/sub when redis is present (cross-instance), else an
  in-process fallback; emits the payload-free `messagePending` into the recipient's
  local socket room
- `SweeperModule` — a hubwire scheduled component (`'* * * * *'`, `runOnStart: false`; `teardown()` awaits its `settled?.()` after `stop()`) deleting messages past their absolute `expiresAt`,
  via the same batched `deleteExpired(now, { batchSize })` shape as the telemetry
  event sweep (`MESSAGE_SWEEP_BATCH_SIZE`, 1000). The id select uses `Raw`, not
  `LessThan`: `expires_at` is a datetime column behind a `string`-typed property,
  and `now` must stay a bound `Date` — an ISO string satisfies the property type
  but MySQL truncates the trailing `Z` when casting it
- `HTTPModule` — HTTP server + Socket.io server with Authup auth middleware

## Directory layout

```
apps/server-messenger/src/
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/              # Message mailbox entity
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   ├── controllers/message/   # REST message surface (send/pull/ack, no envelope)
│   │   └── request/helpers/       # Request helpers
│   └── socket/
│       ├── controllers/
│       │   ├── connection/        # Socket.io connection handlers
│       │   └── messaging/         # Legacy relay handlers (kept until plan 013 phase 5)
│       ├── register.ts            # Socket controller registration
│       └── types.ts               # Socket adapter types
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerMessengerApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   └── modules/
│       ├── config/                # ConfigModule (env, paths)
│       ├── database/              # DatabaseModule (DataSource, MessageRepository)
│       │   └── repositories/message/
│       ├── wakeup/                # WakeupModule (redis pub/sub -> `messagePending`)
│       ├── sweeper/               # SweeperModule (scheduled component expiring stored messages)
│       └── http/                  # HTTPModule (HTTP server + Socket.io server)
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | none | `DataSource`, `MessageRepository` |
| WakeupModule | `wakeup` | `config`, `redis`? | `WakeupInjectionKey` |
| SweeperModule | `sweeper` | `database` | nothing (scheduled component expiring stored messages; started in `setup`, stopped in `teardown`) |
| HTTPModule | `http` | `config`, `database`, `wakeup` | `Server`, `SocketServer` |

server-messenger is **not** a database-less relay:
the durable mailbox (#1715) gives it a `DataSource` + `MessageRepository`,
a `SweeperModule` that expires stored messages, and a `WakeupModule` backing the
payload-free `messagePending` notification (redis pub/sub + socket emit).
