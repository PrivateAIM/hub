# Authorization

Read before changing permission checks, read scoping, record reach, socket subscribe gates, token verification or an Authup upgrade.

## Authorization catalog

HTTP and socket middleware use the service Authup client to fetch `GET /authorization`
once per authenticated request/connection, then `createAuthupPermissionEvaluator`
(`server-kit/src/authup/authorization.ts`) combines it with the caller's complete
introspection grants and identity. Do not flatten grants to permission names: that
loses definition policies, junction policies and realm reach. Scope restricts what a
caller can do, not who it is: `resolveAuthupPolicySubject` always places the identity and
places its grants only for a token scoped `global` (`[]` otherwise), so the binding policy
denies every permission (403) while identity-reading policies — and hub's identity-based
checks (credential ownership, the messenger mailbox, bucket ownership, socket rooms) — still
see the real caller. Authup applies the same rule since authup#3723 (`useRequestPolicyGrants`).
The credential needs
`permission_read` at `ownOrNull` or wider. Fetch failures propagate; no cross-request
catalog cache or name-only fallback is installed. The catalog read leaves socket
connection lifetimes unchanged; token-verifier caching is described under
[Token verification](#token-verification-and-read-scoping).

## Token verification and read scoping

Every service builds its verifier with `createAuthupTokenVerifier`
(`server-http-kit/src/middlewares/authup/token-verifier.ts`). It passes a `creator`, so
authup's vouchly-based `TokenVerifier` runs in remote mode (introspection), with a result
cache (Redis, else memory) kept until the token's `exp`. Its namespace
(`buildAuthupTokenCacheNamespace`) adds the service's Authup client and realm to authup's
default `authup:remote:<baseURL>`, because authup answers `active: false` to a client that
may not introspect a token: a result is valid only for the client that asked. Services on one
Redis share results only when they introspect as the same client.

- **Keep `IntrospectableTokenVerifier`.** In remote mode vouchly forwards every non-empty
  string to introspection, compact or not. Only an Authup server ≥ beta.70 (authup#3724)
  answers a malformed token `active: false`. An unguarded verifier against a beta.69 server
  accepts `not-a-token` as the `system` client (verified). Hub requires a beta.70+ server, so
  the guard is defence in depth: it covers a deployment that upgraded hub before Authup, and
  spares the mint and the introspection round-trip for a token that cannot be valid.
- **No `AUTHUP_URL`, no `TokenVerifier`.** beta.70's constructor derives the introspection
  endpoint eagerly and throws without a base URL, so `createAuthupTokenVerifier` returns an
  `UnconfiguredTokenVerifier` (refuses every token) instead. Without this, a service booted
  without Authup would crash instead of answering 401.
- A failed introspection request (Authup down, 5xx, 429, refused service credential) surfaces from vouchly as `invalid_token`; `IntrospectableTokenVerifier` rethrows it as `upstream_error` → 502, so client hooks do not drop a session over an outage. A judged token (inactive, expired) stays 401.

The evaluator enforces the data a call supplies. A service using only `preEvaluate`
still has only a pre-gate.

Reads that need scoping go through `scopeReadQuery` (`server-kit/src/core/query/scope.ts`):

- It pre-evaluates a one-of of the entity's read and write names; holding none is a 403.
- It then lowers `compile()` into the query. A `post` verdict narrows to the actor's own
  realm; `compile: false` skips this step, leaving a capability gate only (the global
  catalogs).
- Record reads reuse the scoped query with `eq('id', id)`, so a row out of reach is a 404,
  the same as a missing one.

The Vue store handles batch verdict fetching and expiry; `store.permissionRevision` must
be watched by custom async navigation resolvers.

## Authup beta.68 upgrade

All `@authup/*` packages now require beta.68; related Vue/Vuecs floors and rapiq
2.4 are aligned. HTTP and socket authorization read one `GET /authorization`
catalog per request/connection with the service credential and preserve complete
introspection grants through `createAuthorizationEvaluator`. See
[Authorization catalog](#authorization-catalog) and
[deployment configuration](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-68)
for credential requirements and the boundary between pre-checks and row policies.
Policy-free introspection does not make `compile()` a no-op in this wiring;
collection filtering is still separate work.

## Authup beta.69 upgrade

All `@authup/*` packages now require beta.69 (a security release: realm-bound
tokens, two-stage rate limiting, realm-gated client reads, Basic names resolved in
the route/master realm). No hub code change was needed: hub builds no
`IdentityPermissionBindingPolicyEvaluator` of its own, the authup aggregators
read only `id`/`name` off bus payloads (which now drop `select: false` columns),
and the Harbor webhook authenticates with a client **id**, which still resolves
globally. Operator-facing consequences are in
[deployment configuration](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-69).

## Authup beta.70 upgrade

All `@authup/*` packages now require beta.70, and hub requires an Authup server
≥ 1.0.0-beta.70. Operator consequences are in
[deployment configuration](../../docs/src/guide/deployment/configuration.md#authup-upgrade-to-beta-70).
What is not obvious from the diff:

- **Record reach comes from `@authup/access`.** `packages/server-kit/src/core/authorization/`
  is deleted (`assertRecordReach`, `reachesRecord`, `hasUnboundedReach`,
  `holdsPermission`, `isPermissionDenial`, `buildRecordPolicyData`, `RecordReach`),
  with no shims. Callers use `evaluateRecord` / `evaluateRecordOneOf` /
  `reachesRecord` / `reachesRecordOneOf` / `evaluateRecordUpdate` /
  `hasUnboundedReach`, passing `actor.permissionEvaluator`. **authup's plain
  variants treat an array of names as ALL-of**: every hub one-of moved to the
  `*OneOf` variant, and `AnalysisNodeService.delete` now has a spec pinning it
  (negative-controlled). Stored-plus-merged update checks use
  `evaluateRecordUpdate`. Never build a `realmMatch` key by hand; the helpers
  refuse one.
- **The record realm is required and read raw.** `realm: undefined` throws a
  plain `Error` (500) instead of reading as a global row, so a projection that
  drops `realmId` fails loudly rather than neutral-passing every grant's
  `realm_scope`. `?? null` survives only where a global target is meant
  (registry-project create, bucket/event creates by a realm-less actor).
- **Attributes are passed, never synthesized.** The row goes under
  `data.attributes` where hub has one; there is no `attributes: {}`
  default, so a grant whose attribute policy needs a row stays pending
  and denies where none is given (the socket room gate) — fail-closed.
- **Only authup's `PermissionError` is a denial.** The predicates swallow
  `isPermissionError` only, which is all the production evaluator throws. The
  server-test-kit actor fakes (`createDenyAllActor`, `createScopedActor`) and
  server-core's `createPermissionActor` therefore throw authup's
  `PermissionError` too — a spec of an **evaluator** denial asserts
  `toThrow(PermissionError)`; `PermissionDeniedError` is only what hub code
  throws itself. The old fakes masked two registry-credential specs that
  passed only because a hub error leaked through a predicate. `hasUnboundedReach`
  does not catch: `compile()` returns `deny` for an unheld name, never throws.
- **Token verification runs through vouchly** (remote mode — hub always passes a
  `creator`). Cache exports renamed (`MemoryTokenCache` / `RedisTokenCache` /
  `ITokenCache`); old `token:*` Redis entries are not read again. The result
  cache is namespaced **per introspecting client**
  (`buildAuthupTokenCacheNamespace`, server-http-kit:
  `authup:remote:<baseURL>:client:<realm>:<clientId>`), because authup answers
  `active: false` to a client without `token_introspect` reach into the token's
  realm — authup's default namespace ignores the client, so two services with
  different clients on one Redis would have served each other's positive
  results. All six verifier call sites pass `config.clientId` / `config.realm`.
- **A verifier with no `AUTHUP_URL` must not crash boot.** beta.70's
  `TokenVerifier` constructor dereferences `baseURL`; `createAuthupTokenVerifier`
  therefore returns an `UnconfiguredTokenVerifier` (refuses every token, 401) and is
  typed `ITokenVerifier`.
- **An Authup outage answers 502, never 401.** vouchly reports every failed
  introspection request (unreachable, 5xx, 429, hub's own credential refused,
  failed mint) as `introspection_failed`, which authup's adapter maps onto
  `invalid_token` — a 401 that makes every authup client hook (client-ui, the
  worker) drop or re-mint its session although the token was never judged.
  `IntrospectableTokenVerifier` rethrows it as `HubError({ code:
  'upstream_error', status: 502 })` (reading `vouchly`'s error, now a declared
  server-http-kit dependency); an inactive/expired token keeps its 401. Covered
  by server-http-kit's `token-verifier.spec.ts` against a real HTTP stub
  (negative-controlled). The result cache is injectable (`cache`) for specs.
- **`registry_manage` is evaluated per secret-bearing registry project** (by
  its realm and row), not just pre-gated: otherwise an `own` grant reveals
  `accountSecret` of every realm the caller can read. A sparse fieldset that dropped `realmId` re-reads it.
- `ClientAuthenticationHookOptions.baseURL` (ignored since beta.70) is not
  passed by `AuthupHookModule` or the test apps.

## Authup `IPermissionEvaluator` alignment (completed plan removed; residual work in the roadmap)

Authup `IPermissionEvaluator` alignment (completed plan removed; residual work in the [roadmap](../plans/000-roadmap.md)) — Core migration complete (#1932/#1940/#1941/#1970). Catalog/registry-project/event reads, shared actor construction, identity cleanup and authup/access record reach shipped; analysis-family HTTP reach also shipped with the analysis reach work below. Remaining storage/realtime participation work is open, with deferred findings individually revalidated. `compile()` is not inert: authup beta.66–69 deliver per-grant `realm_scope` + policies through introspection and `GET /authorization`.

**Phase 1 (`feat!`) — hub's permission port is authup's.** Removed with **no** deprecated aliases: `IPermissionChecker`, `ActorContext.permissionChecker` (→ `permissionEvaluator: IPermissionEvaluator`), `RequestPermissionChecker` (deleted — the env stores the evaluator itself), `useRequestPermissionChecker` (→ `useRequestPermissionEvaluator`), `RequestEnv.permissionChecker` / `SocketData.permissionChecker` (→ `permissionEvaluator`), `FakePermissionChecker` (→ `FakePermissionEvaluator`, re-exported from `@authup/server-test-kit`; actor factories return `FakeActorContext`), `AbstractEntityService.isActorMasterRealmMember`, and the `dryRun` / `fakeAbilities` / `createFakeTokenVerificationData` / `FakePermissionProvider` fallback. `tokenVerifier` is now required by the HTTP middleware. Method names follow authup: `preEvaluate` / `evaluate` / `preEvaluateOneOf` / `evaluateOneOf`.

**Fixes on the same branch**, each its own commit:
- **Status codes.** Every authup error keeps authup's code and status (`HubError.status`): permission denials answer **403** (were 400 with issues, 500 without), dead bearers **401** (were 500), throttles 429, upstream failures 502. A stale catalog stays 500. analysis-node update answers 403, not 400, for missing rights.
- **Scope gate.** Scope restricts what a caller can do, never who it is: `resolveAuthupPolicySubject` always places the identity and passes the grants only for a `global` token (hub had passed them unconditionally). Authup adopted the same rule in authup#3723.
- **Malformed bearers.** authup ≤ beta.69 introspected a token outside its 16–2048 bounds as the caller's own `Authorization` header — hub's service credentials — so `Bearer x` acted as the `system` client. `createAuthupTokenVerifier` refuses any non-compact-JWS token before introspection (header, cookie and socket alike). Fixed upstream in authup#3724, released in beta.70 — server side only: the beta.70 verifier (vouchly) still forwards any non-empty string to introspection, so hub keeps the guard as defence in depth (a hub upgraded before its Authup server, and no mint/round-trip for a token that cannot be valid).
- **server-messenger never wired Authup**: every request was one fake master-realm user sharing one mailbox. It now authenticates and fails closed without Authup; its service client needs `permission_read`.
- **Authorization holes that predate the branch.** A `select:false` secret requested through a relation (`include=registry&fields[registry]=+accountSecret`, also via nodes / project-nodes / analysis-nodes) is **not returned through a relation** for any caller: the entity schemas keep such fields root-only (`createRootOnlyFieldsGate` in `core/query/fields.ts`, rapiq's `fields.validate` hook, as authup gates `client.secret`); a spec derives every `select:false` column from the entity metadata and asserts its schema gates it; `GET /analyses/:id/client` is realm-checked and evaluates ANALYSIS_UPDATE against the analysis. The analysis(-node) log proxies' authorization moved out of this PR and landed with the analysis log proxies (item 31).
- **Log filters.** `collectRootFilterValues` lives once, guarded, in `@privateaim/server-kit`: a `not(…)`/`or(…)` filter on `DELETE /logs` must never delete the **inverse** selection; a repeated field — raw or after the label prefix strip — answers 400 instead of last-wins.
- **project-node.** Attaching (create) and detaching (delete) a node both require `PROJECT_UPDATE` — it changes the project's composition, so `PROJECT_CREATE` alone does not suffice. Roles that create projects with nodes need `PROJECT_UPDATE`. The try/catch permission predicates read only a permission denial as "not authorized" and rethrow anything else.
- **Tests.** Each suite gets its own database (`<DB_DATABASE>_<suite>`), created once in global setup — the shared `app` database raced on `CREATE DATABASE`. `createRestrictedAccessToken` mints a user holding exactly the given global permissions.

## Read authorization on catalogs, registry projects and events

Read authorization on catalogs, registry projects and events (#1940) — Implemented. New `NODE_READ`, `MASTER_IMAGE_READ`, `MASTER_IMAGE_GROUP_READ`, `REGISTRY_READ`, `REGISTRY_PROJECT_READ`; `EVENT_READ` is now realm-scoped. server-core's suite now provisions 24 names. Operator steps are in [deployment configuration](../../docs/src/guide/deployment/configuration.md#reading-nodes-master-images-registries-registry-projects-and-events-requires-read). What is not obvious from the diff:

- **Each read is a one-of over the entity's read and write/manage names, and holding none is a hard 403** (`[NODE_READ, NODE_CREATE, NODE_UPDATE, NODE_DELETE]`, `[REGISTRY_READ, REGISTRY_MANAGE]`, `[EVENT_READ, EVENT_DELETE]`, …). Holding a write implies read. There is no self-service fallback, by decision.
- **`scopeReadQuery(query, actor, { names, compile? })` (`@privateaim/server-kit`) pre-evaluates the one-of, then lowers `compile()` into the query**: `allow` → unchanged, `conditional` → AND-appended condition, `deny` → `inArray('id', [])`, `post` → `eq('realmId', actor.realm.id)`. Narrowing `post` to the own realm is a deliberate simplification of authup's per-row evaluation. The global catalogs (node, master-image(-group), registry) pass `compile: false` — a capability gate only, so nodes stay readable across realms; registry-project and event compile.
- **`scopeReadQuery` forwards `realmAttributeName` to `compile()` only when a caller sets it**, as authup does. Naming a realm column makes authup refuse to lower grant policies, so every lowerable grant policy would degrade to `post` — whose realm-only narrowing ignores the policy and can return rows inside the realm that the policy excludes.
- **Record reads go through the same scoped query** (`findMany(appendQueryConditions(scoped, eq('id', id)))`), so list and record cannot disagree and an out-of-reach row answers 404 like a missing one. `appendQueryConditions` was lifted into server-kit; each service's `core/query` re-exports it.
- **Includes are capability-gated** (`preEvaluateRelationReads`, server-core `core/query/relations.ts`): `/nodes?include=registry|registryProject` and `/registry-projects?include=registry` require the related entity's read one-of. Still open: joined rows of a realm-scoped target (`registryProject`) are NOT narrowed by reach, and includes inside the analysis/project family (`node`, `masterImage`) stay ungated.
- **Socket subscribe gates match the HTTP read one-of** for node and master-image(-group). Master images had no subscribe gate at all, and their unsubscribe left the NODE room. Still open: the registry-project room broadcasts every realm.
- **`REGISTRY_MANAGE` is in the registry-project read one-of**, because it already governs the row's secret, `/nodes/:id/registry/credentials` and the registry admin UI.
- **A node client's read grant wins over its own-project fallback.** Registry-project reads pre-gate first; only on a permission denial is a node's client narrowed to `id = node.registryProjectId`, list and record alike — so it keeps reading its own registry project without a grant.
- **Node clients get `NODE_READ` from a background component**, `createNodeClientComponent` (`app/components/node-client/`, authup's `{ start, stop, status }` component shape): `ComponentsModule` starts it fire-and-forget, and it re-runs `NodeClientService.assignPermissions` for each node with a client once at start and then hourly, under the `server-core:node-client-sync` lock — so a permission provisioned in Authup after boot also arrives without a restart. The node subscriber alone re-syncs only on node create or on a node save that changes a field (typeorm skips `afterUpdate` for a no-op save), so existing clients would otherwise 403 on `/nodes`. A failing node is logged and skipped; the component never blocks or fails boot. `assignPermissions` now THROWS on a permission missing from Authup (it does not warn and skip), so node creation fails loudly instead of yielding a client that 403s later.
- **`EntityEventHandler` stamps the audited row's `realmId` (`ctx.data.realmId`) on every event**, because realm scoping needs it: without it every bus-ingested audit event was realm-less, so an `own` grant would have seen none and `ownOrNull` all of them. Master-image(-group) events stay realm-less, and so do events stored before this change.
- **A malformed id answers 400 on every dialect** (`GET /events/abc`, `filter[id]=abc`): `sanitizeError` maps rapiq's `AdapterError` `KEY_VALUE_INVALID` (the typeorm adapter refuses a non-uuid operand on a uuid column) and postgres `22P02` to `BadRequestError`, ported from authup. Neither surfaces as 500.
- **`FakeEntityRepository.findMany` applies `query.filters`** via `@rapiq/adapter-memory` and records `findManyCalls`, so unit specs assert the scope's effect, not just that it was called.

## Permission cleanup

Permission cleanup (#1941) — Implemented. Breaking for npm consumers of server-kit, server-http-kit and server-realtime-kit.

- **One `buildActorContext`, in `@privateaim/server-http-kit`.** The four per-service copies are deleted. telemetry and messenger previously built no audit `metadata` (their audit rows had no actor, IP, path or method) and server-core dropped `identity.realmId`; every service now gets the full shape.
- **The `'robot'` identity type is gone** from `ActorContext`, `RequestIdentity` and `SocketIdentity` — authup identities are only `user` or `client`. The persisted `robot*` columns and the messenger-kit wire vocabulary (`MessagePartyKind.ROBOT`, the legacy `ROBOT_CONNECTION*` event names) are kept: they are a contract with external clients, removed with the legacy relay when the message broker rewrite decommissions it. server-messenger's dead `ROBOT_CONNECTIONS` handlers are deleted (no client emits them).
- **The rate limiter exempts master-realm clients** — hub's own service clients such as the worker's `system`. The previous exemption named `'robot'` and never matched, so the worker was capped at 1000 req/min.
- **Socket subscribe denials answer 403** (`PermissionDeniedError`) instead of 401, and any other failure answers `InternalError` instead of posing as a denial (`adapters/socket/error.ts`). client-vue still ignores subscribe errors.
- **Authorization lives in core.** telemetry's log endpoints go through a core `LogService`; server-core's analysis client permissions through `AnalysisClientPermissionService` behind an `IClientPermissionStore` port (the Authup adapter stays in `app/modules/database/`).
- **`FProjectForm` hides the node picker without `project_update`**, which attaching nodes requires since #1932.
- **`packages/errors` is registered with release-please** (it was published but never bumped). Note the linked-versions plugin is inert under `include-component-in-tag: false`, so its version only follows the group if it gets a bump-worthy commit each release (see [conventions.md](../conventions.md#release-process)).

## Analysis read reach

Analysis read reach (#1955) — Implemented. New `ANALYSIS_READ`; `GET /analyses` and `GET /analysis-nodes` (list and record) pre-gate a one-of over it and every analysis write/lifecycle name, then narrow by reach. `AnalysisReachService` (`core/services/analysis-reach/`) builds ONE rapiq condition used for lists and records alike: the grant's `compile()` verdict (`allow` → none, `deny` → nothing, `post` → own realm) OR'd, for users only, with `inArray(<analysisId>, ids)` of the analyses the realm's nodes take part in (`IAnalysisNodeRepository.findAnalysisIds`, served by the `(node_realm_id, analysis_id)` index). The ids are collected first rather than joined as a subquery (deviation from the plan's D7) so lists, records and the in-memory fakes share one path; the ceiling is a realm taking part in many thousands of analyses. **No master-realm bypass**: a master user with `own` grants sees only master's analyses; the built-in `admin` role and `system` client hold `any` (verified on beta.69). Node and analysis clients reach by binding only (node → its node's analyses, analysis client → its analysis), ignoring realm and grant scope; the binding only counts when the node/analysis is in the client's own realm, because `node.clientId` is writable by node managers and not unique (a cross-realm claim must not rebind another realm's or the `system` client — making `clientId` server-only + unique is a follow-up). Node clients get `ANALYSIS_READ` from the node-client sync; new analysis clients get it as a default (no backfill for existing ones). (3a compiled `/analysis-nodes` against its own `analysisRealmId` and failed closed on `post`; superseded by item 30.) client-ui's analysis route/nav gates admit `ANALYSIS_READ`. Writes on analysis/analysis-node moved to `realm_scope` in item 32. Operator steps in [deployment configuration](../../docs/src/guide/deployment/configuration.md#reading-analyses-requires-analysis-read-and-reach).

## Analysis family reach

Analysis family reach (#1957) — Implemented. `/analysis-node-events`, `/analysis-buckets` and `/analysis-bucket-files` (list + record) go through the same `AnalysisReachService` as step 3a, and `/analysis-nodes` was moved onto the new mechanism. **The grant is always compiled against the analysis itself (no `realmAttributeName`) and re-rooted onto the row's `analysis` relation** with `prefixConditionFields` (`core/query/prefix.ts`), which rapiq's typeorm adapter turns into a filter-only join — so grant policies now apply to every family table (this replaced 3a's fail-closed `post` on `/analysis-nodes`). Per bucket type (`buildAnalysisBucketTypeReach`): CODE for every participant; TEMP/RESULT only through an APPROVED node (`resolve(..., { approvedOnly: true })` → `findAnalysisIds({ ..., approvalStatus })`); RESULT **files** additionally reach by `ANALYSIS_RESULT_READ`'s own grant (`names` option) and are dropped, not refused, without it — bucket-file rows carry no type, so they filter through `analysisBucket.type`. A bucket file's `realmId` is the uploader's, never the owner's, which is why nothing here filters on a family table's own realm column. Node-storage-service (a node client without `analysis_result_read`) lists RESULT/TEMP *buckets* to upload — that is why the result gate sits on files only. The storage aggregator builds its own `AnalysisReachService` (the service requires one; an optional reach would silently mean an unscoped read). RESULT files are reached by the approved-participant `analysis_read` reach AND'd with the result-read grant's own reach, so a wider result read can never surface an analysis `/analyses` hides (it would leak via `include=analysis`). Every family read now joins `analysis`, and typeorm's paged DISTINCT-ids query then needs the root id selected: `applyQuery` adds `<alias>.id` to any sparse fieldset that omits it (so `?fields=x` responses also carry `id`) — without it `?fields=path` answered 500 on both dialects. client-vue's `FAnalysisTypeBucket` shows the missing-bucket notice + storage-check retry only to `analysis_update` holders; an empty RESULT/TEMP lookup is normal for a not-yet-approved participant.

## Analysis log proxies

Analysis log proxies (#1958; supersedes #1938's realm-only rules) — Implemented. server-core forwards `GET`/`DELETE /analysis-logs` and `/analysis-node-logs` to telemetry under its **own** credentials, so a login alone must not suffice; `AnalysisLogAccessService` (`core/services/analysis-log-access/`) now gates them through `AnalysisReachService`. Analysis logs: the analysis read one-of, reached by the grant or by an **approved** node. Analysis-node logs: `ANALYSIS_UPDATE` or `ANALYSIS_APPROVE`; the grant's reach covers every node, otherwise only that node itself (a user of the node's realm, or the node's client bound in its own realm) through an APPROVED row — a node never reads another node's logs. Deleting either: `ANALYSIS_UPDATE` through the grant only — the new `grantOnly` reach option drops participation and gives a bound client nothing (D3: deletes are the owner side's). Out of reach → 404, missing capability → 403 (checked before any node lookup, so an unknown node id is not distinguishable), malformed id → 400. `POST /analysis-node-logs` keeps its node-realm check until step 3e. client-vue's `FAnalysisLogs`/`FAnalysisNodeLogs` treat a refusal as "no logs" and stop auto-refreshing (the manager renders a panel per node, most now out of a node user's reach). Socket-room participation is deferred to the realtime work.

## Record writes reach through grant `realm_scope`

Record writes reach through grant `realm_scope` (#1961) — Implemented. Hub's master-realm-by-name bypass (`isRealmResourceWritable`/`isRealmResourceReadable`, deleted from `@privateaim/kit`; `isRequestIdentityMasterRealmMember`, deleted from server-http-kit) is gone from every write in server-core, server-storage and server-telemetry. The record checks evaluate with a `realmMatch` key set from the record's realm, and `hasUnboundedReach` = `compile()` verdict `allow` (replaces "master"/"system"); since the beta.70 upgrade these helpers are `@authup/access`'s, not hub's (see that section). **The `realmMatch` key is what applies `realm_scope`** — verified on a real Authup beta.69; `apps/server-core/test/unit/authorization/record-reach.spec.ts` pins the `realmMatch` matrix per scope plus the capability pre-gate a `none` grant still passes (negative-controlled). Also verified once, not pinned: `attributes` alone apply NO reach (every pre-3e `attributes: entity` evaluate was reach-free) and the context field `realmId` is the permission's binding realm, not the resource's. Out of reach → 403; updates evaluate stored AND merged row (authup `evaluateUpdate` parity). Analysis commands now need `ANALYSIS_EXECUTION_START` for build/distribution start and `ANALYSIS_UPDATE` for every other command — `ANALYSIS_UPDATE` does not cover a start; the mapping is `getAnalysisCommandPermissionName` (core-kit), shared by the service and client-vue's `FAnalysisCommand` / `FAnalysisWizardLockModal`. Node clients drop `ANALYSIS_UPDATE` and hold `ANALYSIS_READ`, `NODE_READ` and the new `ANALYSIS_NODE_LOG_CREATE` at `realm_scope: none` — their own node is authorized by binding (execution status, own logs); analysis-client permissions are created at `none` too. `createScopedActor` (server-test-kit) enforces realmMatch with authup's `realmScopeMatches`; the older actor factories allow everything, so realm denials need it. Operator steps in [deployment configuration](../../docs/src/guide/deployment/configuration.md#writes-take-their-realm-reach-from-realm-scope). `node.clientId` is server-assigned only (dropped from `NodeValidator`) and unique (`1788800000000-MakeNodeClientIdUnique`, both dialects; duplicates keep the client on the earliest node, the rest are detached and get a fresh client on their next save) — before, a node manager could point a node at any client and the node-client sync rewrote that client's permissions. The edges (socket namespaces, rate-limit exemption, client-vue namespace choice, client-ui realms page) follow in PR B.

## Realtime + rate limiter reach through `realm_scope`

Realtime + rate limiter reach through `realm_scope` — Implemented. No `REALM_MASTER_NAME` check is left outside tests and server-test-kit's container tagging. server-core sockets (`adapters/socket/reach.ts`): `assertSocketNamespaceReach` admits the own realm namespace, and the global or a foreign realm namespace only with `hasUnboundedReach` over the hub permissions — any-of (`compile()` treats several names as a disjunction), deliberately loose because each room re-checks. `assertSocketSubscribeReach` is the per-room gate: in a realm namespace a record check over `names` with the namespace realm (`evaluateRecordOneOf` since beta.70), in the global one `hasUnboundedReach(names)` for **the room's own names**. Without it, an `any` grant of one family (say `node_read`) plus a capability of another would open that other family's every-realm rooms. Two pre-existing bugs fixed: the namespace pattern had **no capture group**, so every connection counted as global and realm namespaces never admitted a non-master user; and client-vue's entity socket returned an empty `realmId` ref as-is, so lists connected to the global namespace. Both dead realtime for every non-master user, silently. client-vue picks the namespace with `resolveEntitySocketRealmId`: the global one for the realm-less catalogs whose events are published only there (master images, master-image groups, registries, registry projects — reachable with an unbounded grant only, the same audience as the old master-realm rule), else the requested realm, else the management realm. client-ui offers "set management realm" on every realm row. Rate limiter (server-http-kit): a **client** whose grant of **every** `PermissionName` has unbounded reach is not throttled — checked one name per `compile()` call, since one call with all names is any-of and a single `any`-scoped `node_read` would exempt a client; users always are. Node and analysis clients (grants at `realm_scope: none`) cannot join rooms even in their own realm namespace. `createMasterRealmActor` / `createNonMasterRealmActor` are gone (identical to `createAllowAllActor`). The follow-up of moving the record-reach helpers into an authup kit is done: they ship in `@authup/access` since beta.70.
