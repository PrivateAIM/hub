# Authorization

Read before changing permission checks, read scoping, record reach, socket subscribe gates, token verification or an Authup upgrade.

## Authorization catalog

HTTP and socket middleware fetch `GET /authorization` once per authenticated
request/connection with the service Authup client; `createAuthupPermissionEvaluator`
(`server-kit/src/authup/authorization.ts`, wrapping `@authup/access`'s
`createAuthorizationEvaluator`) combines it with the caller's complete introspection
grants and identity.

- Never flatten grants to permission names: that loses definition policies, junction
  policies and realm reach.
- Scope restricts what a caller can do, not who it is: `resolveAuthupPolicySubject`
  always places the identity, and places grants only for a token scoped `global` (`[]`
  otherwise, so every permission denies with 403). Identity-based checks (credential
  ownership, messenger mailbox, bucket ownership, socket rooms) still see the real
  caller. Same rule as authup#3723.
- The service credential needs `permission_read` at `ownOrNull` or wider. Fetch failures
  propagate; there is no cross-request catalog cache and no name-only fallback.
- Every authup error keeps authup's code and status (`HubError.status`): denial 403,
  dead bearer 401, throttle 429, upstream failure 502; a stale catalog is 500.

## Token verification and read scoping

`createAuthupTokenVerifier` (`server-http-kit/src/middlewares/authup/token-verifier.ts`)
passes a `creator`, so vouchly's `TokenVerifier` runs in remote mode (introspection),
with a result cache (Redis, else memory) kept until the token's `exp`. The cache
namespace (`buildAuthupTokenCacheNamespace`:
`authup:remote:<baseURL>:client:<realm>:<clientId>`) includes the introspecting client,
because authup answers `active: false` to a client without `token_introspect` reach into
the token's realm. Services share entries only when they introspect as the same client;
every verifier call site must pass `config.clientId` / `config.realm`.

- **Keep `IntrospectableTokenVerifier`'s non-compact-JWS guard.** vouchly forwards any
  non-empty string to introspection, and an Authup server below beta.70 (authup#3724)
  introspects a malformed token as hub's own credential, i.e. the `system` client. Hub
  requires a beta.70+ server, so the guard is defence in depth (hub upgraded before
  Authup) and saves a round-trip. It covers header, cookie and socket alike.
- **No `AUTHUP_URL` → `UnconfiguredTokenVerifier`** (refuses every token, 401).
  beta.70's `TokenVerifier` constructor throws without a base URL, so constructing it
  directly crashes boot.
- **An Authup outage answers 502, never 401.** vouchly reports any failed introspection
  request (unreachable, 5xx, 429, refused service credential, failed mint) as
  `invalid_token`; `IntrospectableTokenVerifier` rethrows it as `upstream_error` (502),
  so client hooks do not drop a session over an outage. A judged token (inactive,
  expired) stays 401.

The evaluator enforces only the data a call supplies: a service using only
`preEvaluate` has only a pre-gate.

`scopeReadQuery(query, actor, { names, compile?, realmAttributeName? })`
(`server-kit/src/core/query/scope.ts`):

- Pre-evaluates a one-of of the entity's read and write/manage names; holding none is
  403. Holding a write implies read; there is no self-service fallback, by decision.
- Lowers `compile()`: `allow` → unchanged, `conditional` → AND-appended, `deny` →
  `inArray('id', [])`, `post` → `eq('realmId', actor.realm.id)` (nothing without a
  realm). `post` narrowing by realm only ignores the unlowerable policy, a deliberate
  simplification of authup's per-row evaluation.
- `compile: false` leaves a capability gate only (the global catalogs: node,
  master-image(-group), registry).
- Forward `realmAttributeName` only when a caller sets it: naming a realm column makes
  authup refuse to lower grant policies, degrading every lowerable policy to `post`.
- Record reads reuse the scoped query (`appendQueryConditions(scoped, eq('id', id))`),
  so list and record cannot disagree and an out-of-reach row is a 404, like a missing one.

Client side: the Vue store batches verdict fetching and expiry; custom async navigation
resolvers must watch `store.permissionRevision`.

## Authup beta.68 upgrade

Authorization reads the `GET /authorization` catalog and preserves complete introspection
grants (see [Authorization catalog](#authorization-catalog)); `compile()` is not a no-op
under this wiring. Credential requirements:
[deployment configuration](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-68).

## Authup beta.69 upgrade

Required no hub code change; operator consequences are in
[deployment configuration](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-69).
The Harbor webhook authenticates with a client **id**, which resolves globally; the
authup aggregators read only `id`/`name` off bus payloads.

## Authup beta.70 upgrade

Hub requires an Authup server ≥ 1.0.0-beta.70
([operator notes](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-70)).

- **Record reach comes from `@authup/access`**: `evaluateRecord` /
  `evaluateRecordOneOf` / `reachesRecord` / `reachesRecordOneOf` /
  `evaluateRecordUpdate` / `hasUnboundedReach`, passing `actor.permissionEvaluator`.
  Hub has no copies.
- **The plain variants treat an array of names as ALL-of.** Use `*OneOf` for "any of
  these". Never build a `realmMatch` key by hand; the helpers refuse one.
- **The record realm is required and read raw.** `realm: undefined` throws (500), so a
  projection that drops `realmId` fails loudly instead of passing every grant's
  `realm_scope`. Use `?? null` only where a global target is meant (registry-project
  create, bucket/event creates by a realm-less actor).
- **Attributes are passed, never synthesized**: the row goes in as
  `data: { attributes: row }`. Without a row, a grant's attribute policy stays pending
  and denies (the socket room gate passes none), fail-closed.
- **Updates use `evaluateRecordUpdate({ current, next })`**, evaluating stored and
  merged row; snapshot `current` before `repository.merge()`, which mutates the entity.
- **Only authup's `PermissionError` is a denial.** The predicates swallow
  `isPermissionError` only. Test fakes (`createDenyAllActor`, `createScopedActor`,
  server-core's `createPermissionActor`) throw it too; a fake throwing hub's
  `PermissionDeniedError` would propagate where production returns `false`.
  `PermissionDeniedError` is what hub code throws itself.
- `hasUnboundedReach` does not catch: `compile()` returns `deny` for an unheld name.
- **`registry_manage` is evaluated per secret-bearing registry project** (its realm and
  row), not just pre-gated; otherwise an `own` grant reveals `accountSecret` across every
  readable realm. A sparse fieldset that dropped `realmId` re-reads it.
- `ClientAuthenticationHookOptions.baseURL` is ignored by beta.70 and not passed.

## Authup `IPermissionEvaluator` alignment (completed plan removed; residual work in the roadmap)

Hub's permission port is authup's `IPermissionEvaluator` (`ActorContext.permissionEvaluator`,
`useRequestPermissionEvaluator`, `FakePermissionEvaluator` from `@authup/server-test-kit`);
`compile()` is live, since introspection and `GET /authorization` carry per-grant
`realm_scope` and policies (#1932/#1940/#1941/#1970). Residual storage/realtime work is in
the [roadmap](../plans/000-roadmap.md).

- `tokenVerifier` is required by the HTTP middleware; there is no `dryRun`/fake-identity
  fallback.
- server-messenger authenticates against Authup and fails closed without it.
- **`select: false` secrets are root-only.** A relation fieldset
  (`include=registry&fields[registry]=+accountSecret`) bypasses `select: false` and the
  owning service's gate, so schemas gate such fields with `createRootOnlyFieldsGate`
  (`core/query/fields.ts`).
- **`collectRootFilterValues`** (`@privateaim/server-kit`) is the one guarded reader of
  log filters: a `not(…)`/`or(…)` on `DELETE /logs` must never select the inverse, and a
  repeated field (raw or after the label-prefix strip) answers 400.
- **project-node create and delete require `PROJECT_UPDATE`**; `PROJECT_CREATE` alone does
  not suffice.
- Permission predicates read only a permission denial as "not authorized" and rethrow
  anything else.

## Read authorization on catalogs, registry projects and events

Each read is a `scopeReadQuery` one-of (`[NODE_READ, NODE_CREATE, NODE_UPDATE,
NODE_DELETE]`, `[REGISTRY_READ, REGISTRY_MANAGE]`, `[EVENT_READ, EVENT_DELETE]`, …);
registry-project and event compile, the global catalogs do not (#1940). Operator steps:
[deployment configuration](../../docs/src/guide/deployment/configuration.md#reading-nodes-master-images-registries-registry-projects-and-events-requires-read).

- **Includes are capability-gated** (`preEvaluateRelationReads`, server-core
  `core/query/relations.ts`): `/nodes?include=registry|registryProject` and
  `/registry-projects?include=registry` need the related read one-of. Open: joined
  `registryProject` rows are not narrowed by reach; analysis/project family includes
  (`node`, `masterImage`) are ungated; the registry-project socket room broadcasts every
  realm.
- **Socket subscribe gates match the HTTP read one-of** for node and master-image(-group).
- **`REGISTRY_MANAGE` is in the registry-project read one-of**: it already governs the
  secret, `/nodes/:id/registry/credentials` and the registry admin UI.
- **A node client's read grant wins over its own-project fallback**: only on a permission
  denial is a node's client narrowed to `id = node.registryProjectId`.
- **Node-client permission sync is a scheduled component** (`createNodeClientComponent`,
  `app/components/node-client/`): at start, then hourly (`0 * * * *`), under the
  `server-core:node-client-sync` lock (a renamed lock is a different mutex). The node
  subscriber alone misses no-op saves (typeorm skips `afterUpdate`), so existing clients
  would 403. A failing node is logged and skipped; boot never blocks.
  `NodeClientService.assignPermissions` throws on a permission missing from Authup.
- **`EntityEventHandler` stamps the audited row's `realmId` on every event**; realm
  scoping of events depends on it. Master-image(-group) events are realm-less.
- **A malformed id answers 400 on every dialect**: `sanitizeError` maps rapiq's
  `AdapterError` `KEY_VALUE_INVALID` and postgres `22P02` to `BadRequestError`.
- `FakeEntityRepository.findMany` applies `query.filters` (`@rapiq/adapter-memory`), so
  specs can assert the scope's effect.

## Permission cleanup

(#1941)

- **One `buildActorContext`, in `@privateaim/server-http-kit`**; no per-service copies.
- **Identities are only `user` or `client`.** The persisted `robot*` columns and
  messenger-kit's `MessagePartyKind.ROBOT` / legacy `ROBOT_CONNECTION*` names stay: they
  are a contract with external clients, removed with the legacy relay.
- **Socket subscribe failures** (`adapters/socket/error.ts`): a permission denial
  answers `PermissionDeniedError` (403), anything else `InternalError`. client-vue ignores
  subscribe errors.
- **Authorization lives in core**: telemetry's log endpoints via `LogService`,
  server-core's analysis client permissions via `AnalysisClientPermissionService` behind
  `IClientPermissionStore` (Authup adapter in `app/modules/database/`).
- `FProjectForm` hides the node picker without `project_update`.

## Analysis read reach

`GET /analyses` and `/analysis-nodes` pre-gate a one-of over `ANALYSIS_READ` and every
analysis write/lifecycle name, then narrow by `AnalysisReachService`
(`core/services/analysis-reach/`), one condition for lists and records (#1955). Operator
steps: [deployment configuration](../../docs/src/guide/deployment/configuration.md#reading-analyses-requires-analysis-read-and-reach).

- Reach = the grant's `compile()` verdict OR'd, for users only, with
  `inArray(<analysisId>, ids)` of the analyses the user's realm's nodes take part in
  (`IAnalysisNodeRepository.findAnalysisIds`). Ids are collected first rather than joined
  as a subquery, so lists, records and the in-memory fakes share one path; ceiling: a
  realm in many thousands of analyses.
- **No master-realm bypass**: a master user with `own` grants sees only master's analyses;
  the built-in `admin` role and `system` client hold `any`.
- Node and analysis clients reach by binding only, and the binding counts only when the
  node/analysis is in the client's own realm.
- Node clients get `ANALYSIS_READ` from the node-client sync; new analysis clients get it
  as a default (existing ones are not backfilled).

## Analysis family reach

`/analysis-nodes`, `/analysis-node-events`, `/analysis-buckets` and
`/analysis-bucket-files` go through `AnalysisReachService` (#1957).

- **The grant is compiled against the analysis (no `realmAttributeName`) and re-rooted
  onto the row's `analysis` relation** with `prefixConditionFields`
  (`core/query/prefix.ts`). Never filter on a family table's own realm column: a bucket
  file's `realmId` is the uploader's, not the owner's.
- Per bucket type (`buildAnalysisBucketTypeReach`): CODE for every participant; TEMP/RESULT
  only through an APPROVED node. RESULT **files** additionally need
  `ANALYSIS_RESULT_READ`'s reach AND'd with the approved-participant reach (so a wider
  result read never surfaces an analysis `/analyses` hides, e.g. via `include=analysis`),
  and are dropped, not refused, without it. The gate sits on files only because
  node-storage-service lists RESULT/TEMP *buckets* to upload.
- The storage aggregator builds its own `AnalysisReachService`; reach is required, since an
  optional one would silently mean an unscoped read.
- **`applyQuery` adds `<alias>.id` to a sparse fieldset that omits it**
  (`app/modules/database/repositories/query.ts`): typeorm's paged DISTINCT-ids query over
  a join needs it, else 500.
- client-vue's `FAnalysisTypeBucket` shows the missing-bucket notice and retry only to
  `analysis_update` holders; an empty RESULT/TEMP lookup is normal before approval.

## Analysis log proxies

server-core forwards the analysis log endpoints to telemetry under its **own** credentials,
so `AnalysisLogAccessService` (`core/services/analysis-log-access/`) is the only gate
(#1958).

- **Analysis logs** (read): the analysis read one-of, reached by the grant or by an
  approved node.
- **Analysis-node logs** (read): `ANALYSIS_UPDATE` or `ANALYSIS_APPROVE`; the grant's reach
  covers every node, otherwise only that node itself (its realm's users or its bound
  client) through an APPROVED row. A node never reads another node's logs.
- **Delete** either: `ANALYSIS_UPDATE` through the grant only (`grantOnly` reach option,
  no participation, nothing for a bound client).
- **Write** an analysis-node log: the node's own client, or `ANALYSIS_NODE_LOG_CREATE`
  reaching the node's realm.
- Out of reach → 404; missing capability → 403, checked before any node lookup so an
  unknown node id is indistinguishable; malformed id → 400.
- client-vue's `FAnalysisLogs` / `FAnalysisNodeLogs` treat a refusal as "no logs" and stop
  auto-refreshing.

## Record writes reach through grant `realm_scope`

There is no master-realm-by-name bypass; record writes in server-core, server-storage and
server-telemetry use the `@authup/access` record helpers (#1961). Operator steps:
[deployment configuration](../../docs/src/guide/deployment/configuration.md#writes-take-their-realm-reach-from-realm-scope).

- **The `realmMatch` key (built by the helpers from the record's realm) is what applies
  `realm_scope`.** `attributes` alone apply no reach, and the context field `realmId` is
  the permission's binding realm, not the resource's. Out of reach → 403.
- "Reaches every realm" is `hasUnboundedReach` (compiled verdict `allow`).
- Analysis commands: `ANALYSIS_EXECUTION_START` for build/distribution start,
  `ANALYSIS_UPDATE` for every other command (it does not cover a start). The mapping is
  `getAnalysisCommandPermissionName` (core-kit), shared with client-vue's
  `FAnalysisCommand` / `FAnalysisWizardLockModal`.
- Node clients hold `ANALYSIS_READ`, `NODE_READ` and `ANALYSIS_NODE_LOG_CREATE` at
  `realm_scope: none`, not `ANALYSIS_UPDATE`; their own node is authorized by binding.
  Analysis-client permissions are created at `none` too.
- **`node.clientId` is server-assigned and unique** (not in `NodeValidator`;
  `1788800000000-MakeNodeClientIdUnique`): a writable clientId lets a node manager point a
  node at any client, whose permissions the node-client sync would then rewrite.
- Realm denials in specs need `createScopedActor` (enforces `realmMatch` via authup's
  `realmScopeMatches`); the other actor factories allow everything.

## Realtime + rate limiter reach through `realm_scope`

No `REALM_MASTER_NAME` check exists outside tests. Operator notes:
[deployment configuration](../../docs/src/guide/deployment/configuration.md#realtime-and-rate-limiting-follow-realm-scope).

- **Namespace gate** (`assertSocketNamespaceReach`, server-core `adapters/socket/reach.ts`):
  the own realm namespace, or the global/a foreign one only with `hasUnboundedReach` over
  all hub permissions. That is any-of (several names compile as a disjunction),
  deliberately loose because each room re-checks.
- **Room gate** (`assertSocketSubscribeReach`): in a realm namespace
  `evaluateRecordOneOf` over the room's names with the namespace realm; in the global one
  `hasUnboundedReach` over **the room's own names**. Using the namespace-wide check here
  would let an `any` grant of one family open another family's every-realm rooms.
- `SOCKET_NAMESPACE_PATTERN` must keep its capture group; without it every connection
  counts as global and realtime dies silently for non-master users.
- client-vue picks the namespace with `resolveEntitySocketRealmId`: global for the
  realm-less catalogs whose events are published only there (master images and groups,
  registries, registry projects), else the requested realm, else the management realm.
  An empty realm id must not fall through to the global namespace.
- Node and analysis clients (grants at `none`) cannot join rooms, even in their own realm
  namespace.
- **Rate limiter** (`server-http-kit/src/middlewares/rate-limit.ts`): a **client** is not
  throttled only if every `PermissionName` has unbounded reach, checked one name per
  `compile()` call (one call with all names is any-of, so a single `any`-scoped
  `node_read` would exempt it). Users are always throttled.
