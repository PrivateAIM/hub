# server-telemetry

Read before changing apps/server-telemetry, the audit event pipeline or the log writer.

## Architecture

Manages log aggregation via VictoriaLogs and event tracking via TypeORM.

**Core port:** `LogStore` interface (`core/services/log-store/types.ts`) — defines `query`, `write`, `delete` operations for log storage. No TypeORM or VictoriaLogs imports.

**Adapters:**
- `VictoriaLogsLogStore` (`adapters/telemetry/victoria-logs.ts`) — implements `LogStore` via VictoriaLogs HTTP API. Includes query injection protection (`isValidLabelKey`, `escapeQueryValue`).
- `MemoryLogStore` (`adapters/telemetry/memory.ts`) — in-memory fallback for components that run before VictoriaLogs is available.
- `EventController` / `LogController` — thin HTTP controllers receiving dependencies via constructor.

**Service-specific modules:**
- `VictoriaLogsModule` — registers VictoriaLogs client + `LogStore` in container
- `ComponentsModule` — resolves `EventRepository` from the container and starts
  EventComponent + LogComponent via `RemoteWorker` (hubwire), plus the
  event cleaner; all three sit in one `IComponent[]`; `teardown()` stops them, then awaits `settled?.()` on each

**Event retention sweep:** `createEventCleanerComponent` (`app/components/event-cleaner/`,
a hubwire scheduled component: once at start, then daily at 01:00; not an
`EventCommand`, so a failing first pass is logged instead of failing boot) drops every `expiring` row whose `expiresAt` has passed. The window is
stamped at **ingest** by `EventComponentCreateHandler` from `EVENT_RETENTION_DAYS`
(default 7 days; `0` keeps rows forever) — publishers do not stamp, and an
explicit `expiresAt`, or `expiring: false`, from the publisher wins. The component owns only the
schedule: the sweep itself is `IEventRepository.deleteExpired(now, { batchSize })`,
so nothing in `app/components/` reaches for a `DataSource`.

The delete is **batched** (`EVENT_RETENTION_SWEEP_BATCH_SIZE`, 1000). Steady state
removes a trickle, but the first sweep after a retention change — or the day a full
window first matures — can match millions of rows, and the cleaner runs on every
replica. Batching selects ids then deletes by id, because `DELETE ... LIMIT` is
MySQL-only; the loop drains, and a batch that removes nothing means another
replica's sweep owns those rows, so it stops and the next tick takes the remainder.
A `batchSize` that is not a positive safe integer falls back to the default —
typeorm ignores a falsy `take`, which would silently restore the unbounded select.

Selecting **ids only** matters twice over: the row carries a `text` `data` blob
behind a deserialize transformer, and a delete-by-id does not fire
`BaseSubscriber.beforeRemove`, so the sweep does not publish one `DELETED`
domain event per expired row. Nothing in hub subscribes to the telemetry `EVENT`
channel, so that traffic was pure Redis noise.

**Special concern:** The telemetry service IS the log writer, so its own logger cannot use a `LogComponentDispatcher` (circular). The `LogComponentWriteHandler` accepts an optional `LogStore` param with `MemoryLogStore` fallback.

## Directory layout

```
apps/server-telemetry/src/
├── core/                          # Domain logic
│   └── services/
│       └── log-store/
│           └── types.ts           # LogStore port interface (query, write, delete)
├── adapters/                      # External system implementations
│   ├── database/
│   │   ├── entities/event.ts      # EventEntity TypeORM definition
│   │   ├── subscribers/event.ts   # EventSubscriber (no @EventSubscriber decorator)
│   │   └── migrations/            # postgres/ and mysql/
│   ├── http/
│   │   └── controllers/
│   │       ├── event/             # EventController (DataSource-based CRUD)
│   │       └── log/               # LogController (LogStore-based operations)
│   └── telemetry/
│       ├── victoria-logs.ts       # VictoriaLogsLogStore (with query injection protection)
│       └── memory.ts              # MemoryLogStore (fallback for components)
├── app/                           # Orchestration & DI wiring
│   ├── builder.ts                 # ServerTelemetryApplicationBuilder
│   ├── factory.ts                 # createApplication()
│   ├── modules/
│   │   ├── config/                # ConfigModule (env, paths)
│   │   ├── database/              # DatabaseModule (DataSource, subscribers)
│   │   ├── http/                  # HTTPModule (router, controllers, server)
│   │   ├── victoria-logs/         # VictoriaLogsModule (client + LogStore)
│   │   └── components/            # ComponentsModule (starts event + log consumers, event cleaner)
│   └── components/                # hubwire components: event, log consumers; event-cleaner (scheduled)
├── cli/                           # CLI entry point (citty)
└── constants.ts
```

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource` |
| VictoriaLogsModule | `victoriaLogs` | `config` | `VictoriaLogsClient`, `LogStore` |
| ComponentsModule | `components` | `database`, `victoriaLogs` | nothing (starts event + log consumers and the event-cleaner scheduled component, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `victoriaLogs` | `Server`, `Router` |

## Telemetry event hardening (#1745, back-port of authup's event-log improvements)

Telemetry event hardening (#1745, back-port of authup's event-log improvements) — Implemented. authup's security event log was designed from hub's telemetry event system and fixed a number of weaknesses while porting; this adopts them back. Nine of the ten checklist items landed; item 10 (`AsyncLocalStorage` request context) was evaluated and **declined**. Breaking for npm consumers of `@privateaim/telemetry-kit`, `@privateaim/server-kit` and `@privateaim/server-db-kit`. What is not obvious from the diff:

- **The audit log was leaking Harbor robot credentials, by two independent routes, and neither is the route the issue named.** Item 9 asked whether `dataPrevious` is re-broadcast: it is **not** — hub's redis and socket handlers build explicit literals (`{ type, event, data }` / `{ data, meta }`) and never spread the publish context, unlike authup, whose `content` IS the realtime wire payload. The exposure is on the **sibling** key `data`. `BaseSubscriber` published `event.entity` verbatim, and `registryProject.accountSecret` is `select: false`, which makes it **present in `data`** (the incoming save payload) and **absent from `dataPrevious`** (loaded from the database without `select:false` columns) — so it always compares as changed and was *always* emitted. `RegistryProjectComponentLinkHandler` mints a robot secret and saves it on every project link, so the socket emit reached the `/resources` rooms (joinable with `REGISTRY_PROJECT_MANAGE`, while the HTTP read of that field demands `REGISTRY_MANAGE`), and the telemetry diff persisted it to an `events` row **every `EVENT_READ` holder in any realm can list** — `EventService.getMany` applies no realm scoping. Closed at the source: `BaseSubscriber` now strips every `select: false` column, derived from entity metadata so the `select: false` someone already wrote stays the single declaration. The `@privateaim/kit` denylist (`/(password|secret|hash|token|credential)/i`, ported verbatim from authup) plus a fail-closed `sanitizeEventData` shape guard on the validator's `data` mount are the second layer, covering the HTTP `POST /events` path a metadata strip cannot reach. Consequence for `packages/client-vue`: `FRegistryProject` cannot read the rotated secret off the socket payload and re-reads it over HTTP, which actually enforces `REGISTRY_MANAGE`. **Rotate any Harbor robot account created or rotated on an affected version.**

- **A client could suppress its own audit record, and the IPv6 item was only the visible third of it.** `requestIpAddress` was `varchar(15)` + `zod.ipv4()`; the value is `getRequestIP(event, { trustProxy: true })`, i.e. the leftmost `X-Forwarded-For` entry **verbatim and fully client-controlled**. A validator that THROWS does not drop the field — `EventComponentCreateHandler` catches, emits `creationFailed` and discards **the whole row**. So any IPv6 client behind the documented nginx erased every event it triggered, and `X-Forwarded-For: junk` did it deliberately. The same shape held for three more client-controlled strings whose bounds also threw: a >512-char crawler user agent, a >256-char path, a >64-char actor name. Fixed as one rule — **degrade the field, never the record**: the IP widens to `varchar(45)` with `union([ipv4, ipv6]).catch(null)`, and `requestPath` / `requestUserAgent` / `actorName` truncate instead of rejecting. Producer-controlled vocabulary (`scope`, `name`, `refType`, `requestMethod`, `actorType`) deliberately keeps throwing. The `::1 → 127.0.0.1` rewrite is gone — it fabricated an IPv4 origin for a genuine IPv6 loopback client. `trustProxy: true` still lets a client **forge** a recorded origin; that needs a hop count or trusted-CIDR list and is filed separately.

- **Retention moved from three producers to the single ingest point**, which is what made one env var enough. `EVENT_RETENTION_DAYS` (server-telemetry only, default 7, `0` = keep forever) is stamped by `EventComponentCreateHandler`; `EntityEventHandler` and both master-image aggregators do not stamp, so **no TTL is threaded through three services' configs** — `EntityEventHandlerContext` is untouched. An explicit `expiresAt`, or `expiring: false`, from the publisher still wins. The stamp sets `expiring` whenever an expiry exists at all: `expiring` is the sweep predicate, so a publisher-supplied `expiresAt` with no `expiring` would fall back to the column default `false` and produce a row the cleaner can never delete. Deliberately **no** key for the cleaner cron (a cron string is a parse-failure surface; `expiresAt` already defines retention), no enable flags (omitting the message bus already disables publishing), and no authup-style retention/entity-retention split (hub has no security-event family). Side effect to know: master-image builder/synchronizer events go from 24h to the shared 7 days, and docken's `onBuilding` fires on Dockerfile step **start and end**, so a 20-step image is ~40 rows per build.

- **`serialize(null)` returns the STRING `'null'`**, so the bare `{ to: serialize, from: deserialize }` transformer wrote literal `null` / `undefined` **text** into five nullable columns across three services — an omitted property included, since typeorm still runs `to()` for it. `deserialize` round-trips it, so the application never saw the damage, but `IS NULL` matched **zero** of four rows in a repro. One shared `serializedTextTransformer` in `server-db-kit` replaces all five sites (filling the existing slot beside `dateToISOStringTransformer`, not a new abstraction). `from()` coalesces to `null`, which is what makes a data backfill unnecessary. Two things must not be "simplified": `to({})` stays `'{}'` (the entity bridge writes exactly that, so test the VALUE for null/undefined, never truthiness), and `serialize` is **not** `JSON.stringify` — it passes a raw string through unquoted, which messenger's base64 payload depends on. One wire-visible consequence: a column written with the property OMITTED held `'undefined'`, hydrated to `undefined` and had its key **dropped** from the JSON response; it now hydrates to `null` and the key appears.

- **Only `scope` gained an enum, and `name` / `refType` deliberately did not** — a divergence from authup, which enums `name`. Both hub vocabularies already exist as enums their producers read from (`DomainEventName` for the bridge, `MasterImageBuilderEvent` / `MasterImageSynchronizerEvent` for the aggregators), and `name` is **scope-relative**: a Layer-0 kit cannot import the Layer-2 worker kit, and a hub-side `EventName` would just duplicate two existing member sets. `refType`'s vocabulary is the union of three sibling kits' `DomainType` and every one of the 15 producers already passes a member — authup leaves its own `refType` free-form for the same reason despite owning `EventRefType`. The real gap was that the existing safety was thrown away at two `string` declarations, now narrowed: `EntityEventMetadata.event` and `SubscriberPublishPayload.type`. Type-level only — the columns stay `varchar(64)`, so **no DDL**.

- **`updated_at` is kept, on purpose.** The mutable surface was the harm, not the column: `EventAPI.update()` POSTed to a route that does not exist, and `IEventAPI extends IEntityAPI` **mandated** that dead method. Narrowing to `IEntityAPISlim` and deleting the method is the whole append-only fix. Dropping the column would cost two migrations, a second breaking type change, a `schema.ts` edit (or `schema-entity-parity.spec.ts` fails), a UI sort key and four test reads — for zero behavioural gain, since there is no reachable UPDATE path at all (`IEventService` has no `update`, no route, no `EVENT_UPDATE` permission, and `EventValidator` mounts no `id`, so `save()` can only INSERT).

- **The validator now matches the frozen column widths**, which is invisible to CI in both directions: the sqlite leg ignores `varchar` length, and the pg/mysql legs build their schema with `dataSource.synchronize()` **from the entity**, so nothing anywhere pinned the numbers. `scope`/`name`/`refType` were validated at 128 against `varchar(64)`; `expiresAt` was unbounded against `varchar(28)`; `expiring` accepted `null` against a NOT NULL column.

- **Index set: 14 → 6, and the primary read filter was the unindexed one.** Ten single-column indexes (`name`, `ref_type`, `expiring`, every `request_*`, every `actor_*`) backed keys **no client can address** — `eventSchema` allows filtering on scope/name/refType/refId/realmId/createdAt/updatedAt only — so they were pure write cost on a write-mostly table. The two queries that actually run had no index: the admin list (`realm_id` ordered by `created_at`) and the sweep (`expiring` + `expires_at <`). `name` and `ref_type` survive as leftmost columns of the retained composites. One migration per dialect, name covering every change it makes. Index names were derived by reproducing typeorm's `DefaultNamingStrategy.indexName()` (`sha1('events_' + sorted_columns).slice(0,26)`) and **validated against three frozen names** before use; the round-trip was run against real MySQL 9 and PostgreSQL and the resulting schema inspected in both.

- **Item 10 (`AsyncLocalStorage`) declined, and the real defect was elsewhere.** Hub's `SaveOptions.data → queryRunner.data` threading is less elegant than authup's ALS, not broken: non-HTTP writes already carry no actor, which is the same "system" result ALS produces when `getStore()` is empty. Adopting it means new middleware and context files per service, a `BaseSubscriber` rewrite, and unpicking `{ data: actor.metadata }` from ~32 call sites across three services — to change nothing observable. What the evaluation *did* find: `server-storage`'s `buildActorContext` never populated `metadata` at all, so **every bucket audit row had no actor, IP, path or method**, while `bucket/service.ts` dutifully passed `{ data: actor.metadata }` = `{ data: undefined }`. Fixed by copying the twelve-line block from server-core, plus the missing options on the bucket-file delete. `RequestRepositoryAdapter` — the class item 10 proposed simplifying — turned out to have **zero call sites** and be a stale duplicate of that same builder; deleted.

Two incidental fixes ride along, both pre-existing and both invisible to every gate: `EventRepositoryAdapter.findMany` ran an unconditional `qb.groupBy('ev.id')` on an entity with **no relations and no `relations` allow-list**, forcing `getManyAndCount()` down a `COUNT(DISTINCT)` path for nothing; and the admin events search was wedging the table permanently — `FSearch` emits a rapiq **expression** while the page passes a **record** bag, and `FEvents.load` spread the two into one object, producing `eq(operator,'contains')` and a 400, with no `finally` to clear `busy`. The same expression/record merge flaw exists in `createList` and therefore on four other pages; those recover because their `load()` has a `finally`, and they are left alone here.

Not addressed, filed separately: `EventService.getMany` / `getOne` apply **no realm scoping** (`create` and `delete` both call `isRealmResourceWritable`), so one `EVENT_READ` grant reads every realm's audit trail — real, confirmed, and a different item; `trustProxy: true` lets a client forge a recorded origin; and `ComponentCaller` returns on the specific-key handler before reaching the `'*'` lookup, so the catch-all mounted by the master-image synchronizer aggregator is shadowed and `EXECUTION_FINISHED` emits no telemetry event at all.
