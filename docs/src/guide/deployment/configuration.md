# Configuration

All Hub services are configured via environment variables, managed by `envix` through each service's `ConfigModule`.

## Common Variables

These variables are shared across all services:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP server port (default varies by service) |
| `AUTHUP_URL` | Yes | Authup identity provider URL |
| `REDIS_URL` | No | Redis connection URL (for pub/sub and caching) |
| `AMQP_URL` | No | RabbitMQ connection URL |
| `COOKIE_PREFIX` | No | Namespace prefixed onto the `access_token` cookie the authup middleware falls back to when a request carries no `Authorization` header (e.g. a bucket/file stream download). See [Frontend Variables](#frontend-variables-client-ui) — must match client-ui's `COOKIE_PREFIX`. |

## Message delivery (RabbitMQ)

When `AMQP_URL` is set, commands to the worker, storage and telemetry services
(build, distribute, bucket create, …) travel over durable RabbitMQ queues.

- **A failed or interrupted command is retried, up to 5 attempts.** A handler
  error, or a redelivery after a consumer died mid-command (crash, lost
  connection, consumer timeout), re-publishes the command with exponential
  backoff (1s, 2s, 4s, 8s). An exhausted command is dropped with an error log
  line naming its type and id. Before this, a redelivered command was dropped
  silently after its first attempt.
- **The worker retries only failures that can go away on their own.** A
  connection error, a 5xx/429 from the core or storage API, GitHub or the
  registry, or an unreachable or failing docker daemon is retried as above, and
  the analysis keeps its `started` status meanwhile. Anything else — a broken
  Dockerfile step, a 4xx, a missing registry — fails the build, distribution or
  check right away, as before. A retryable failure that persists through the 5th
  attempt is reported as failed, not dropped. Only a worker that dies on every
  attempt leaves a build or distribution `started`; server-core fails it once it
  is 15 minutes stale (see below). An error docker reports inside a build or push
  stream (e.g. a registry 503 during push) counts as permanent.
- **Harbor registry commands go through the `registryCommands` queue** (project
  link/relink/unlink, registry setup/cleanup/delete, webhook processing). They
  used to run inside server-core's request first and reach the queue only if that
  call threw. They are now only queued, so they get the same retries, and a
  Harbor outage no longer fails the request that triggered them. A node's robot
  account and registry credentials therefore appear shortly after the node is
  created rather than with the response. Without a message bus, server-core
  still runs them in-process.
- **Set RabbitMQ's `consumer_timeout` above your longest analysis or master-image
  build.** A command is acknowledged only once its handler finishes. If a build
  outlasts the timeout (RabbitMQ default: 30 minutes), the broker closes the
  channel and redelivers the command. A replica still running it ignores the copy,
  but a redelivery that lands on another worker replica starts a second build.
- Worker and storage outcome events (started, progress, finished, failed) go
  through one durable queue per kind (`analysisBuilderEvents`,
  `analysisDistributorEvents`, `masterImageBuilderEvents`,
  `masterImageSynchronizerEvents`, `storageBucketEvents`,
  `storageBucketFileEvents`). Each queue is a RabbitMQ *single active consumer*
  queue: one server-core replica applies its events in publish order, and another
  takes over if that replica goes away. Events published while server-core is
  down wait in the queue instead of being lost. A late `started`/`progress`
  event no longer moves a finished or failed process back to `started`.
- **Upgrade the worker and storage services before server-core.** An upgraded
  worker publishes its events to these queues, where they wait for the upgraded
  server-core. An upgraded server-core consumes only the queues, so it would miss
  events from a worker that still publishes the old way.
- **Upgrading server-core across the `TaskManager` removal: stop the old
  replicas before new ones serve traffic.** An old server-core links a storage
  bucket only to a create *it* issued, and it can keep the `storageBucketEvents`
  consumer slot until it disconnects. A bucket created by a new replica while an
  old one holds that slot stays unlinked, and the analysis has no bucket. If old
  and new replicas did overlap, run the storage check
  (`POST /analyses/:id/command` with `{ "command": "storageCheck" }`) for every
  analysis created during the overlap. Old replies are fine in the other
  direction: a new server-core links every bucket created by an old one.
- **Before upgrading again after a rollback, delete these six queues.** They are
  durable, so a rollback leaves them on the broker, and the older version
  neither reads nor removes them. The next upgrade would apply whatever they
  still hold: a stale `started`/`progress` event is ignored, but a stale
  `finished`/`failed` event would overwrite the current status.
- **Stuck builds and distributions are recovered by server-core.** It re-checks
  every build/distribution that has been `starting`/`started` without an update
  for 15 minutes, every 5 minutes, and marks it `failed` if the image is not
  there. Running workers send a heartbeat every 5 minutes, so a long build is not
  affected (a step that sends no progress for 2 hours is treated as hung and
  stops the heartbeat). A hung step only makes the process stale: with a single
  worker replica the re-check queues behind the hung run, so it is recovered
  only by restarting the worker, running a second worker replica, or RabbitMQ's
  `consumer_timeout` ending the hung delivery. **Upgrade the workers before server-core.** An old
  worker sends no heartbeat and still decides staleness on its own: with a new
  server-core, the automatic re-check can reach an idle old worker replica,
  which then reports a healthy build or push with one step longer than 15
  minutes as `failed`. A new worker with an old server-core is safe: it reports
  a stuck process as still running, so it stays stuck until server-core is
  upgraded too.
- **Analysis buckets are deduplicated on upgrade.** server-core now allows one
  analysis bucket per analysis and type, and server-storage one bucket per
  `(refType, refId, name)`. Their migrations clean up duplicates a repeated or
  concurrent bucket create may have left: server-core keeps the oldest link per
  analysis and type and deletes the newer ones (with their file rows), and
  server-storage clears `refType`/`refId` on every newer duplicate bucket. No
  storage bucket or file is deleted; a bucket whose link was dropped stays in
  server-storage as a ref-less orphan, which an operator can delete with
  `DELETE /buckets/:id`. A repeated bucket create command now answers with the
  existing bucket instead of creating another. `POST /buckets` no longer accepts
  a `refId` (400): only the service owning the referenced resource sets it, over
  the bus.
- A lost broker connection is retried every 5 seconds (it was 60).
- Failure events carry the error's `name`, `message` and `code` instead of `{}`.

## Authup upgrade to beta.68

Upgrade the Authup server and all Hub services together. Hub now requires Authup
`1.0.0-beta.68` and reads `GET /authorization` using the service's own
`CLIENT_ID` / `CLIENT_SECRET` credentials. Grant that client `permission_read`
with `realmScope: "ownOrNull"` for a single realm, or `"any"` when serving multiple
realms. The default `"own"` grant cannot read global policy definitions. The
built-in `system` client already has the required access.

Each authenticated HTTP request and socket connection fetches one catalog and
combines it with the caller's introspected grants. All permission checks within
that request/connection reuse the local evaluator. Catalog errors fail the
request; there is no fallback to permission names. Catalogs are not cached across
requests. Existing token-introspection caching and socket-session lifetimes still
apply, so changes to grants are visible when those are refreshed.

Scope restricts what a caller can do, not who it is. Grants are only evaluated
for tokens carrying the `global` scope; a token issued without it (e.g. a custom
login client registered without `global`) still authenticates and keeps its
identity, but is evaluated with **no grants**, so every permission check denies
with 403. Policies that read the identity still see the real caller, and paths
that authorize by identity rather than by permission — a node or analysis client
reading its own credentials, the messenger mailbox, bucket ownership, realm
socket rooms — still honour such a token. Authup applies the same rule since
authup#3723.
client-ui requests `global openid`, and Authup's client-credentials and password
grants always issue `global`.

This preserves policy trees and grant realm scopes at the evaluator boundary.
Existing endpoints that only perform a permission pre-check still perform a
pre-check: this upgrade does not add row-policy checks or collection filtering to
those endpoints. Restricting every entity read/write by resource attributes is a
separate service-level change.

The frontend kit uses a single `POST /authorization/check` batch for UI gates and
refreshes it at the policy expiry returned by Authup. Hub navigation follows those
refreshes. Browser users do not need `permission_read` merely to render menus.

Authup's beta.67 upgrade also applies its folders/event-aggregate migration and
pins database timestamps to UTC. Follow the
[Authup upgrade notes](https://github.com/authup/authup/releases/tag/v1.0.0-beta.67)
for existing databases that used local time. Beta.68 quotes newly serialized
strings; Hub's text transformer reads both these and legacy unquoted messenger
payloads, so no Hub data migration is needed.

## server-messenger authenticates against Authup

**Breaking.** server-messenger now verifies every REST request and socket
connection against Authup, like the other services. Before, its REST surface
never registered an Authup client and attached one fixed master-realm user to
**every** request: no token was needed, and every caller read and acknowledged
the same mailbox. Treat any message stored by an affected version as exposed.

What an operator must do:

- Grant the messenger's service client (`CLIENT_ID`, default `system`)
  `permission_read`, with the same `realmScope` guidance as in
  [Authup upgrade to beta.68](#authup-upgrade-to-beta-68) — every authenticated
  request reads the authorization catalog. The built-in `system` client already
  has it.
- Make sure `AUTHUP_URL`, `CLIENT_ID` and `CLIENT_SECRET` are set for the
  messenger. Every Hub service now fails closed without Authup: no identity is
  attached, so every authenticated route answers 401 and every socket
  connection is refused. The previous no-Authup fallback (a fixed master-realm
  user, plus a `dryRun` mode that granted every permission) is removed.
- Callers (nodes) must send a bearer token on every request, including the
  `GET /messages/stream` SSE stream.

## Malformed bearer tokens no longer authenticate

**Security fix, no operator action required in Hub.** Authup up to
`1.0.0-beta.69` falls back to the token in the introspection request's own
`Authorization` header when the submitted `token` fails its validator (shorter
than 16 or longer than 2048 characters). Hub's token verifier sends that header
with the service's **own** credentials, so a malformed bearer — `Bearer x`, an
oversized string, or a garbage `access_token` cookie — was introspected as the
Hub service client (`active`, `global` scope, its grants) and every Hub service
acted on it as that client.

Every Hub service now refuses a credential that is not structurally a compact
JWS within those bounds **before** introspecting it, answering 401 (sockets:
connection refused). The fallback itself is fixed upstream in authup#3724;
upgrading Authup to the first release after `1.0.0-beta.69` closes the upstream
half, until then the Hub-side guard is what stops it. Any
token-verifier cache (Redis `token:*` keys) may hold entries for such strings —
flush it once after upgrading.

## Attaching nodes to a project requires `project_update`

**Breaking for some roles.** Adding a node to a project (`POST /project-nodes`)
and removing one (`DELETE /project-nodes/:id`) both require `project_update`.
Previously, adding required `project_create` **and** `project_update`. Holding
only `project_create` now creates a project but cannot attach nodes to it; grant
`project_update` to every role that creates projects with nodes.

## Writing analysis buckets and files requires `analysis_update`

**Breaking for some roles.** Analysis buckets and their files are authorized
against the analysis's realm, not the caller's:

- Creating, updating or deleting an analysis bucket, and adding, updating or
  deleting a **code** file, require `analysis_update` in the analysis's realm
  (or the master realm). Grant it to every role that uploads analysis code.
- Code files are frozen once the analysis configuration is locked: a write
  answers 400, and so does deleting the code bucket.
- An analysis has at most one bucket per type, and a storage bucket backs at
  most one analysis bucket (a second one answers 409).
- Uploads made directly to server-storage are checked when server-core
  registers them: a code file must come from the analysis's realm while
  unlocked, a result or temp file from the realm of an approved analysis node
  or from the analysis's own client. A rejected upload is not registered. A
  rejected **code** upload is also deleted from storage (an unregistered code
  object would break every later build), so server-storage must consume the
  `storageBucketFileTasks` queue (it does from this release on); a rejected
  result or temp upload stays in storage, so a misjudged uploader never costs
  result data. This check is realm-level only, and master-realm uploads through
  storage are rejected too; upload through a node or the owner realm.
- Storage still lets an uploader delete its own object, even a code file of a
  locked analysis. server-core logs such a deletion as an error; it cannot
  prevent it.
- A **result** or **temp** file may be added by the master realm, by the realm
  of a node whose analysis participation is approved, or by the analysis's own
  client. Only a code file can be
  the root file.
- Result files are updated and deleted by the analysis realm with
  `analysis_update`; temp files by the master realm only.

## Reading nodes, master images, registries, registry projects and events requires `*_read`

**Breaking for every deployment.** Listing or reading these entities now needs a
read grant. Five permission names are new — `node_read`, `master_image_read`,
`master_image_group_read`, `registry_read`, `registry_project_read` — and the
existing `event_read` is now realm-scoped.

**Which permissions allow a read.** Each read accepts its read name **or** any of
the entity's write/manage names, since holding a write implies read:

| Entity | Accepted permissions |
|---|---|
| nodes | `node_read`, `node_create`, `node_update`, `node_delete` |
| master images | `master_image_read`, `master_image_manage` |
| master image groups | `master_image_group_read`, `master_image_group_manage` |
| registries | `registry_read`, `registry_manage` |
| registry projects | `registry_project_read`, `registry_project_manage`, `registry_manage` |
| events (server-telemetry) | `event_read`, `event_delete` |

A caller holding none of them gets **403** — deliberately, with no fallback. The
same table also gates:

- **Realtime** — subscribing to node, master-image and master-image-group updates.
- **Includes** — a relation requested via `include` needs the related entity's
  permissions: `/nodes?include=registry` and `/registry-projects?include=registry`
  need a registry one, `/nodes?include=registryProject` a registry-project one.

**Which rows a read returns.**

- **Nodes, master images, master image groups and registries** are global
  catalogs: the grant is a capability gate only, and every row stays readable
  across realms.
- **Registry projects and events** are narrowed by the grant's `realm_scope`:
  `own` returns the caller's realm, `ownOrNull` adds realm-less rows, `any`
  returns all. A grant carrying a policy Hub cannot turn into a query falls back
  to the caller's own realm.
- **A node client** reads its own registry project without any grant, on both
  `GET /registry-projects` (narrowed to that one project) and
  `GET /registry-projects/:id`. A read grant it is given applies as for any
  other caller.
- **Record reads** (`GET /<entity>/:id`) apply the same scope, so a row out of
  reach answers 404 exactly like a missing one. A malformed id
  (`GET /events/not-a-uuid`, `filter[id]=not-a-uuid`) answers 400.

An audit event belongs to the realm of the row it records (a project event to the
project's realm). Rows without a single `realmId` column — master images and
groups, registries, and the project-node and analysis-node junctions (which
carry one realm per side) — produce realm-less events, visible to `ownOrNull`
and `any` grants only. **Events stored
before this release carry no realm**, so an `own` grant does not see them;
`ownOrNull` does (and with it every realm's old events).

**Before upgrading:**

1. **Add the new names to your Authup provisioning first.** The built-in
   `admin` role (`*`) only picks up permissions that exist when provisioning runs.
2. Grant `node_read`, `master_image_read` and `master_image_group_read` to
   every role that creates or edits projects or views analyses — project creation
   lists nodes and master images.
3. Grant `registry_read` to roles that manage a node's registry connection
   (`node_update`) — the node's Registry tab lists `/registries` to pick one.
4. Make sure the worker's service client (`system`) has `node_read`,
   `registry_read` and `master_image_read`; `*` covers them once they are
   provisioned.

**After upgrading:** nothing to do for node clients. server-core re-grants each
existing node's client its permissions (`analysis_update`, `analysis_read`, `node_read`) in the
background — once at start, then hourly — so node-side services (pod
orchestration, the storage service, the message broker) keep reading `/nodes`.
Each pass removes any other permission a node client was granted by hand, as
node saves always have. A node whose client cannot be updated is logged as an
error and retried on the next pass. If `node_read` is not provisioned in Authup,
every node is logged as failed until it is, and the next pass after provisioning
grants it without a restart; creating a node fails meanwhile, instead of
yielding a client that gets 403 later.

**Known gaps:**

- Registry projects joined through `include=registryProject` are not narrowed to
  the caller's realm reach.
- Nested includes are not gated: `/project-nodes?include=node.registryProject`
  or `/analysis-nodes?include=node.registry` return the nested rows without the
  read permissions above, and `/nodes?include=registryProject.registry` checks
  only the first segment. Secret fields stay excluded.
- Includes within the project/analysis family (`include=node`,
  `include=masterImage`) are not gated yet.
- The registry-project realtime room still broadcasts every realm's projects to
  a subscriber holding `registry_manage` or `registry_project_manage`.

## Reading analyses requires `analysis_read` and reach

**Breaking for every deployment.** `GET /analyses`, `GET /analysis-nodes`,
`GET /analysis-node-events`, `GET /analysis-buckets` and
`GET /analysis-bucket-files` (list and record) now need a grant and return
only rows of the analyses the caller reaches.

**Which permissions allow a read.** `analysis_read`, or any analysis write or
lifecycle permission: `analysis_create`, `analysis_update`, `analysis_delete`,
`analysis_approve`, `analysis_execution_start`, `analysis_execution_stop`.
Holding none of them answers **403**. `analysis_result_read` alone no longer
lists analyses; pair it with `analysis_read`.

**Which analyses a read returns.**

- **Users** see what their grant's `realm_scope` covers, **plus** every analysis
  in which a node of their realm takes part (pending or rejected approval
  included):
  - `any`: every analysis. The built-in `admin` role and the `system` client
    hold their grants at `any`.
  - `own` / `ownOrNull`: analyses of their own realm. Analyses always carry a
    realm, so the two behave the same here.
- **The master realm is no longer special.** A master-realm user whose grants
  are `own` sees only master's own analyses. Give cross-realm roles their
  analysis grants at `realm_scope: any`.
- **A node's client** sees exactly the analyses its node takes part in, and an
  **analysis' client** only its own analysis. Neither gains anything from its
  realm or from its grants' realm scope. New analysis clients are given
  `analysis_read`; clients of analyses created before the upgrade are not.
- **A grant carrying a policy** narrows every one of these reads by that
  policy, evaluated against the analysis the row belongs to.
- `GET /analysis-nodes` and `GET /analysis-node-events` return every row of a
  reachable analysis, so nodes see each other's approval and execution status.
- **Buckets and their files depend on the bucket type:**
  - `CODE`: everyone who reaches the analysis, including a node realm whose
    approval is still pending (it needs the code to review it).
  - `TEMP`: the reach of the grant, plus realms and node clients whose node is
    **approved**.
  - `RESULT`: as `TEMP` for the bucket itself. Its **files** additionally need
    `analysis_result_read`, whose own `realm_scope` can only narrow that reach
    further, never widen it. Without it, result files are left out of
    listings (not refused) and a result file answers 404.
- A record out of reach answers **404**, like a missing one.
- **Logs** (`/analysis-logs`, `/analysis-node-logs`) used to need only a login,
  because server-core reads and deletes them with its own credentials:
  - **Analysis logs** are read with the read permissions above, by the reach
    of the grant plus realms and node clients whose node is **approved**.
  - **A node's logs** are read with `analysis_update` or `analysis_approve`, by
    the reach of the grant (every node), or by that node itself (its realm's
    users or its client) once approved. A node does not see other nodes' logs.
  - **Deleting** either needs `analysis_update` through the reach of the grant;
    taking part as a node never allows it.
  - A malformed `analysisId`/`nodeId` answers **400**.
  - `POST /analysis-node-logs` is unchanged.

**Before upgrading:**

1. **Add `analysis_read` to your Authup provisioning.** The built-in `admin`
   role (`*`) only picks up permissions that exist when provisioning runs.
   Until it exists, every node save fails (creating or editing a node, and
   assigning its registry), and every existing node client is logged as
   failed on each hourly re-sync.
2. Grant `analysis_read` to roles that view analyses without changing them,
   and `analysis_result_read` to roles that download results.
3. Grant the analysis permissions of every role that must see other realms'
   analyses at `realm_scope: any`.
4. Make sure the worker's service client (`CLIENT_ID`, default `system`) holds
   `analysis_read` at `realm_scope: any`; otherwise builds and distributions of
   other realms' analyses fail with 404. `system` is covered by `*` once the
   name is provisioned.

**After upgrading:** node clients need nothing. server-core grants each node's
client `analysis_read` in the background, once at start and then hourly.

## Authup upgrade to beta.69

Hub now requires Authup `1.0.0-beta.69`, a security release. Read the
[Authup upgrade guide](https://authup.org/guide/deployment/upgrading#security-hardening-that-changes-behaviour)
before upgrading. Hub needs no code or data changes; these points concern the
Authup deployment Hub runs against:

- **Tokens are bound to their realm.** On a Redis-backed Authup, drop the
  `oauth2_token_claims*` keys once after upgrading, or tokens verified before the
  upgrade keep bypassing the new check until they expire.
- **Client reads are realm-gated.** Hub's service client creates and reads the
  per-node and per-analysis Authup clients in the realm of that node or analysis. A Hub client
  whose `client_*` grants are `own` or `ownOrNull` no longer sees clients in
  other realms; grant `any` (the built-in `system` client already has it).
- **HTTP Basic names resolve in the route realm or the master realm.** Hub's
  Harbor webhook authenticates with the registry client's **id**, which resolves
  globally, so it is unaffected.
- **Rate limiting is two-stage.** Behind one NAT address (a clinic or office
  network) raise `rateLimitAnonymousMax`, and pin Authup's `trustProxy` to the
  hop count of your proxy.
- **Some users sign in once more.** Token cookies are now written `SameSite=Lax`,
  and `Secure` on https. Behind a TLS-terminating proxy, forward
  `X-Forwarded-Proto` (the [reverse proxy](./reverse-proxy.md) example already
  does) so server-side cookie writes in client-ui get `Secure` too.

## Database Variables

Used by `server-core`, `server-storage`, `server-telemetry`, and `server-messenger`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_TYPE` | Yes | `mysql`, `postgres`, or `better-sqlite3` |
| `DB_HOST` | Yes* | Database hostname |
| `DB_PORT` | Yes* | Database port |
| `DB_USERNAME` | Yes* | Database username |
| `DB_PASSWORD` | Yes* | Database password |
| `DB_DATABASE` | Yes | Database name (or `:memory:` for SQLite) |

*Not required for SQLite.

### SQLite has no upgrade path

Migrations only run for `mysql` and `postgres`. On SQLite the schema is built from
the entity classes by `synchronize()`, and only when no schema exists yet — so an
**existing** SQLite database is never migrated or altered on upgrade.

Schema changes therefore break a persistent SQLite deployment. The rename of the
`analysis` table to `analyses` is one such change: a SQLite database created before
it keeps the old table, and queries against the new name fail.

Use SQLite only for tests and throwaway/in-memory (`:memory:`) instances. For any
database you intend to keep, use MySQL or PostgreSQL. To carry an existing SQLite
database across a schema change, export its data and re-import it into a freshly
created database.

### Timestamps are stamped and read in UTC

On MySQL and PostgreSQL every Hub service pins its database sessions to UTC
(`time_zone` on MySQL, `TimeZone` on PostgreSQL), reads the zone-less
`created_at` / `updated_at` columns back as UTC, and binds `Date` parameters in
UTC — whatever timezone the database server or the host running Hub is set to.
The same pin applies to the `migration` CLI. There is nothing to configure, and
`DB_PIN_TIMEZONE` is not needed. A database and host already running in UTC (the
container image sets no `TZ`) see no change.

Before, the database stamped these columns in its session timezone, the driver
read them in the process timezone, and the messenger's expiry sweep compared
its `expires_at` column against a `Date` bound in the process timezone, so the
three only agreed when every clock ran in UTC.

**If the database itself ran in local time**, rows it stamped before this
upgrade hold local wall-clock values and now read as UTC, shifted by that offset.
Rows written afterwards are correct. Check the database's zone before upgrading:

```sql
-- PostgreSQL
SHOW timezone;
-- MySQL
SELECT @@global.time_zone, @@system_time_zone;
```

If it is not UTC and the historical values matter, convert them **while no Hub
service is writing**: stop every replica of the old version, run the conversion,
then start the new version. Do not convert after the new version has started, or
during a rolling upgrade where old and new replicas write side by side: the
statements cannot tell a legacy local-time row from a correct UTC one, so they
would shift the correct rows too. Convert each table and column once, with the
zone the database used:

```sql
-- PostgreSQL
UPDATE events SET created_at = (created_at AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'UTC';
-- MySQL (needs the server's time zone tables loaded)
UPDATE events SET created_at = CONVERT_TZ(created_at, 'Europe/Berlin', '+00:00');
```

A database setting that contradicts the pin stops the boot with an error naming
it: a MySQL `timezone` other than UTC, a MySQL `dateStrings` or `typeCast`, or a
PostgreSQL `TimeZone` other than UTC in the driver's startup `options` (e.g. via
`DB_DRIVER_EXTRA`). Remove it — half a pin would shift values instead of fixing
them. A MySQL replication setup is refused the same way for now, since its
per-connection session cannot be pinned yet.

### Replicas and boot-time migrations

Each service applies pending migrations when it starts. On MySQL and PostgreSQL
it now does so while holding a database lock named after the service
(`server-core:migration`, `server-storage:migration`, …), so replicas that start
at the same time apply the chain once: one runs it, the others wait and then
find nothing pending. The `migration run` / `migration revert` CLI commands take
the same lock, so a migration job and a booting replica cannot overlap either.
server-core's Harbor registry setup (`HARBOR_URL`) is serialized the same way.

A replica that cannot get the lock within 60 seconds fails its boot instead of
migrating unlocked; the orchestrator restarts it, and by then the chain has been
applied. Each lock holds one pooled connection while the migration runs on
another, so the connection pool needs at least two connections.

## Storage Variables (server-storage)

| Variable | Required | Description |
|----------|----------|-------------|
| `MINIO_ENDPOINT` | Yes | MinIO/S3 endpoint URL |
| `MINIO_ACCESS_KEY` | Yes | S3 access key |
| `MINIO_SECRET_KEY` | Yes | S3 secret key |
| `MINIO_USE_SSL` | No | Enable SSL for MinIO connection |
| `MINIO_PORT` | No | MinIO port |

## Telemetry Variables (server-telemetry)

| Variable | Required | Description |
|----------|----------|-------------|
| `VICTORIA_LOGS_URL` | Yes | VictoriaLogs endpoint URL |
| `EVENT_RETENTION_DAYS` | No | Days an audit/event row is kept before the daily sweep removes it (default `7`; `0` = keep forever) |

## Frontend Variables (client-ui)

The full list lives in the [frontend reference](../../reference/frontend/index.md#environment-variables).
Two of them are deployment decisions rather than service addresses, and go together:

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_PUBLIC_COOKIE_DOMAIN` | No | `Domain` attribute for the UI's session cookies. **Leave empty.** |
| `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` | No | Namespace prefixed onto every session cookie name. Set this **whenever `NUXT_PUBLIC_COOKIE_DOMAIN` is widened**, so Authup's own hosted pages can't collide with the UI's cookies on that domain. |

Setting a prefix is only safe once the backend agrees on it: `server-core`,
`server-storage`, `server-telemetry` and `server-messenger` each fall back to
reading the `access_token` cookie (for requests that can't carry an
`Authorization` header — a stream download is a top-level navigation) when the
identity middleware finds nothing else. That fallback needs the **same**
prefix, via each service's own `COOKIE_PREFIX` env var (see
[Common Variables](#common-variables)) — set it to the exact same value as
`NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` / `COOKIE_PREFIX`, verbatim (no separator
is inserted automatically on either side).

### Where Authup is served matters

The UI and Authup's own hosted pages persist their sessions under the **same cookie
names**. If both can see each other's cookies, they hydrate, rotate and revoke each
other's tokens, and the user is logged out on the next page reload.

Empty (host-only) cookies are correct in every layout. Setting a `Domain` delivers the
cookies to every subdomain of that value — including Authup's host, if it sits below
it — in which case also set `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` to keep the two cookie
sets apart. Serving Authup on a path of the UI's own origin no longer needs either
variable as of Authup `1.0.0-beta.64` ([authup#3495](https://github.com/authup/authup/issues/3495)):
the consoles scope their own cookies to that sub-path automatically.

The layout matrix and the upgrade caveat are documented under
[Session cookies](../../reference/frontend/index.md#session-cookies).
