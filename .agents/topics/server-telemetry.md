# server-telemetry

Read before changing apps/server-telemetry, the audit event pipeline or the log writer.

## Architecture

Log aggregation via VictoriaLogs, audit events via TypeORM.

- **Core port:** `LogStore` (`core/services/log-store/types.ts`: `query`, `write`, `delete`), free of TypeORM and VictoriaLogs imports.
- **Adapters:** `VictoriaLogsLogStore` (`adapters/telemetry/victoria-logs.ts`, query-injection guards `isValidLabelKey` / `escapeQueryValue`); `MemoryLogStore` (`adapters/telemetry/memory.ts`, fallback); thin `EventController` / `LogController`.
- **`ComponentsModule`** keeps the event and log consumers (each a hubwire `RemoteWorker`) and the event cleaner in one `IComponent[]`; `teardown()` stops each, then awaits `settled?.()` on each.
- **The service is its own log writer**, so its logger cannot use a `LogComponentDispatcher` (circular). `LogComponentWriteHandler` takes an optional `LogStore` and falls back to `MemoryLogStore`.

**Event retention sweep.** `createEventCleanerComponent` (`app/components/event-cleaner/`) is a hubwire scheduled component (a pass at start, then `'0 1 * * *'`), so a failing pass is logged and never fails boot. It owns only the schedule; the sweep is `IEventRepository.deleteExpired(now, { batchSize })`, so `app/components/` never touches a `DataSource`.

- Retention is stamped at **ingest** by `EventComponentCreateHandler` from `EVENT_RETENTION_DAYS` (default 7, `0` keeps rows forever). Publishers do not stamp; an explicit `expiresAt` or `expiring: false` from the publisher wins.
- `expiring` is the sweep predicate, so the stamp sets it whenever an expiry exists, and clears it when no expiry can be stamped. A row with `expiresAt` but `expiring: false` (the column default), or `expiring: true` without `expiresAt`, is never swept.
- The delete is batched (`EVENT_RETENTION_SWEEP_BATCH_SIZE` = 1000, a constant): select ids, then delete by id, because `DELETE ... LIMIT` is MySQL-only. A batch that removes nothing means another replica owns those rows; the loop stops and the next tick takes the rest. A `batchSize` that is not a positive safe integer falls back to the default, since typeorm ignores a falsy `take` and would restore the unbounded select.
- Select **ids only**: the row's `data` blob sits behind a deserialize transformer, and delete-by-id does not fire `BaseSubscriber.beforeRemove`, so the sweep publishes no `DELETED` event per row.

## Directory layout

```
apps/server-telemetry/src/
├── core/services/log-store/types.ts  # LogStore port
├── adapters/
│   ├── database/                     # EventEntity, EventSubscriber (no decorator), migrations/{postgres,mysql}
│   ├── http/controllers/{event,log}/ # EventController, LogController
│   └── telemetry/                    # victoria-logs.ts, memory.ts
├── app/
│   ├── builder.ts, factory.ts
│   ├── modules/{config,database,http,victoria-logs,components}/
│   └── components/                   # event, log consumers; event-cleaner (scheduled)
├── cli/
└── constants.ts
```

The event repository adapter lives in `app/modules/database/repositories/event/`.

## Module inventory

| Module | Name | Dependencies | Registers |
|--------|------|-------------|-----------|
| ConfigModule | `config` | none | `ConfigInjectionKey` (typed env) |
| DatabaseModule | `database` | `entityEvent`? | `DataSource` |
| VictoriaLogsModule | `victoriaLogs` | `config` | `VictoriaLogsClient`, `LogStore` |
| ComponentsModule | `components` | `config`, `database`, `victoriaLogs`, `messageBus` | nothing (starts event + log consumers and the event-cleaner scheduled component, stops them on teardown) |
| HTTPModule | `http` | `config`, `database`, `victoriaLogs` | `Server`, `Router` |

## Telemetry event hardening (#1745, back-port of authup's event-log improvements)

- **Secrets never reach an event.** `BaseSubscriber` (`server-db-kit`) strips every `select: false` column from published payloads, derived from entity metadata. A `select: false` column is present in `data` (the save payload) but absent from `dataPrevious` (loaded without it), so it always diffs as changed; without the strip it reaches the socket rooms and the `events` table. Second layer: `sanitizeEventData` and `EVENT_DATA_SECRET_KEY_REGEX` (`/(password|secret|hash|token|credential)/i`) in `@privateaim/telemetry-kit`'s event validator, which both write paths (HTTP `EventService.create` and the bus handler) run. Consequence: `FRegistryProject` re-reads a rotated secret over HTTP, never off the socket payload.
- **Degrade the field, never the record.** A throwing validator makes `EventComponentCreateHandler` emit `creationFailed` and drop the whole row, so a client-controlled value must not throw: `requestIpAddress` (leftmost `X-Forwarded-For`, via `getRequestIP(event, { trustProxy: true })`) is `union([ipv4, ipv6]).catch(null)` on `varchar(45)`; `requestPath` / `requestUserAgent` / `actorName` truncate. Producer-controlled vocabulary (`scope`, `name`, `refType`, `requestMethod`, `actorType`) keeps throwing. Never rewrite `::1` to an IPv4 address. Open: `trustProxy: true` lets a client forge the recorded origin.
- **Validator bounds must match the column widths.** No CI leg checks them: sqlite ignores `varchar` length and the pg/mysql suites `synchronize()` from the entity.
- **Retention lives only at ingest** (see Architecture), so no TTL is threaded through the producers' configs. Deliberately no cron-string env key (a parse-failure surface; `expiresAt` already defines retention), no enable flag (omitting the message bus disables publishing) and no retention split by event family.
- **`serializedTextTransformer`** (`server-db-kit`) is the only transformer for serialized `text` columns. A bare `{ to: serialize, from: deserialize }` writes the strings `'null'` / `'undefined'`, which `IS NULL` never matches. Do not "simplify" it: `to({})` stays `'{}'` (test null/undefined, never truthiness), and `serialize` is not `JSON.stringify` (it passes a raw string through unquoted; messenger's base64 payload depends on that).
- **Only `scope` is an enum (`EventScope`).** `name` is scope-relative and its vocabularies already exist as producer enums (`DomainEventName`, `MasterImageBuilderEvent` / `MasterImageSynchronizerEvent`) in kits a Layer-0 kit cannot import; `refType` is the union of three kits' `DomainType`. The type safety sits on `EntityEventMetadata.event` and `SubscriberPublishPayload.type`.
- **Events are append-only; `updated_at` is kept.** `IEventAPI` extends `IEntityAPISlim` (no `update`), and there is no update service method, route or permission. Dropping the column would cost migrations, a breaking type change and a schema edit for no behavioural gain.
- **Indexes back the query surface and the sweep only**: `(name, scope)`, `(refType, refId)`, `(realmId, createdAt)`, `(expiring, expiresAt)` plus single-column indexes. Do not index columns no client can filter on; the table is write-mostly.
- **Declined: `AsyncLocalStorage` request context.** `SaveOptions.data → queryRunner.data` threading already yields the same "system" result for non-HTTP writes; ALS would mean new middleware per service, a `BaseSubscriber` rewrite and ~32 call-site changes for nothing observable. Every write path must pass `{ data: actor.metadata }`, built by the shared `buildActorContext`.
