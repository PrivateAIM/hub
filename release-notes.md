:robot: I have created a release *beep* *boop*
---


<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* provision `analysis_read` in Authup before upgrading (until then every node save fails), grant it to roles that view analyses, and grant cross-realm roles - including a non-`system` worker client - their analysis permissions at realm_scope `any`. Master-realm users are no longer able to read every realm's analyses by realm name alone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* require analysis_read and participation reach for analysis reads ([#1955](https://github.com/PrivateAIM/hub/issues/1955)) ([9e798d6](https://github.com/PrivateAIM/hub/commit/9e798d647fa957854bb6f22c92956a4c40aa952b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/client-vue bumped from ^0.18.0 to ^0.19.0
    * @privateaim/client-vue-theme bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* reading analysis logs needs an analysis read permission and an approved node or the grant's reach; reading a node's logs needs analysis_update or analysis_approve; deleting logs needs analysis_update through the grant, not through taking part as a node.
* these endpoints now need `analysis_read` (or an analysis write permission) and are narrowed to reach. Downloading or listing result files needs `analysis_result_read`; grant it to roles that read results.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* scope analysis buckets, files and node events to analysis reach ([#1957](https://github.com/PrivateAIM/hub/issues/1957)) ([da20dd5](https://github.com/PrivateAIM/hub/commit/da20dd5965de1d21f829965f141eb89924268848))
* scope the analysis log proxies to analysis reach ([#1958](https://github.com/PrivateAIM/hub/issues/1958)) ([26a7f79](https://github.com/PrivateAIM/hub/commit/26a7f79a6e1fe364aca6e43666ee004a537c748d))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-realtime-kit bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Code Refactoring

* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.18.1</summary>

## [0.18.1](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.18.1) (2026-10-19)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* reading analysis logs needs an analysis read permission and an approved node or the grant's reach; reading a node's logs needs analysis_update or analysis_approve; deleting logs needs analysis_update through the grant, not through taking part as a node.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).
* these endpoints now need `analysis_read` (or an analysis write permission) and are narrowed to reach. Downloading or listing result files needs `analysis_result_read`; grant it to roles that read results.
* provision `analysis_read` in Authup before upgrading (until then every node save fails), grant it to roles that view analyses, and grant cross-realm roles - including a non-`system` worker client - their analysis permissions at realm_scope `any`. Master-realm users are no longer able to read every realm's analyses by realm name alone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))
* require analysis_read and participation reach for analysis reads ([#1955](https://github.com/PrivateAIM/hub/issues/1955)) ([9e798d6](https://github.com/PrivateAIM/hub/commit/9e798d647fa957854bb6f22c92956a4c40aa952b))
* scope analysis buckets, files and node events to analysis reach ([#1957](https://github.com/PrivateAIM/hub/issues/1957)) ([da20dd5](https://github.com/PrivateAIM/hub/commit/da20dd5965de1d21f829965f141eb89924268848))
* scope the analysis log proxies to analysis reach ([#1958](https://github.com/PrivateAIM/hub/issues/1958)) ([26a7f79](https://github.com/PrivateAIM/hub/commit/26a7f79a6e1fe364aca6e43666ee004a537c748d))
* **server-core:** reconcile stuck analysis builds and distributions, judge staleness in core ([#1960](https://github.com/PrivateAIM/hub/issues/1960)) ([bb6cf17](https://github.com/PrivateAIM/hub/commit/bb6cf177d51d93905a8686edd639af1542e15c88))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))
</details>

<details><summary>0.18.1</summary>

## [0.18.1](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.18.1) (2026-10-19)
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* provision `analysis_read` in Authup before upgrading (until then every node save fails), grant it to roles that view analyses, and grant cross-realm roles - including a non-`system` worker client - their analysis permissions at realm_scope `any`. Master-realm users are no longer able to read every realm's analyses by realm name alone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))
* require analysis_read and participation reach for analysis reads ([#1955](https://github.com/PrivateAIM/hub/issues/1955)) ([9e798d6](https://github.com/PrivateAIM/hub/commit/9e798d647fa957854bb6f22c92956a4c40aa952b))
</details>

<details><summary>0.17.0</summary>

## [0.17.0](https://github.com/PrivateAIM/hub/compare/v0.16.2...v0.17.0) (2026-10-19)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* message broker rewrite  Phase 0 (contracts, client, crypto) ([#1711](https://github.com/PrivateAIM/hub/issues/1711)) ([adce056](https://github.com/PrivateAIM/hub/commit/adce0564b3cf2fc236be0649920ab3779c11396c))
* message broker rewrite  Phase 1 (durable mailbox + REST API) ([#1715](https://github.com/PrivateAIM/hub/issues/1715)) ([dda1103](https://github.com/PrivateAIM/hub/commit/dda1103e52734cd0a03b4b32940e4c8ae2484565))
* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))


### Bug Fixes

* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.16.2 to ^0.17.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.16.2 to ^0.17.0
</details>

<details><summary>0.17.0</summary>

## [0.17.0](https://github.com/PrivateAIM/hub/compare/v0.16.2...v0.17.0) (2026-10-19)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* message broker rewrite  Phase 0 (contracts, client, crypto) ([#1711](https://github.com/PrivateAIM/hub/issues/1711)) ([adce056](https://github.com/PrivateAIM/hub/commit/adce0564b3cf2fc236be0649920ab3779c11396c))
* message broker rewrite  Phase 1 (durable mailbox + REST API) ([#1715](https://github.com/PrivateAIM/hub/issues/1715)) ([dda1103](https://github.com/PrivateAIM/hub/commit/dda1103e52734cd0a03b4b32940e4c8ae2484565))
* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* support client identity for messenger/realtime communication ([#1464](https://github.com/PrivateAIM/hub/issues/1464)) ([5987458](https://github.com/PrivateAIM/hub/commit/59874581dbbc1101b79dd728b5786d5350074866))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* camelCase rename follow-ups  validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1204](https://github.com/PrivateAIM/hub/issues/1204)) ([72923d8](https://github.com/PrivateAIM/hub/commit/72923d81911880e176907e893c62241fe7f849f3))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1114](https://github.com/PrivateAIM/hub/issues/1114)) ([1b644a8](https://github.com/PrivateAIM/hub/commit/1b644a8df5200356bc91c624379917c8dd409fdc))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1246](https://github.com/PrivateAIM/hub/issues/1246)) ([bc898f9](https://github.com/PrivateAIM/hub/commit/bc898f9e40b52d6a93b815f9a07fb517219d051f))
* **deps:** bump the minorandpatch group across 1 directory with 15 updates ([#1415](https://github.com/PrivateAIM/hub/issues/1415)) ([ae2e03c](https://github.com/PrivateAIM/hub/commit/ae2e03cea61aa74820128bc22039d5f23f51466f))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1194](https://github.com/PrivateAIM/hub/issues/1194)) ([46336b8](https://github.com/PrivateAIM/hub/commit/46336b8d8f320705bf216bab81ed61d940ff2895))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 17 updates ([#1774](https://github.com/PrivateAIM/hub/issues/1774)) ([d5e87e2](https://github.com/PrivateAIM/hub/commit/d5e87e229430405ca94c4ab91ae914ec482133a0))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 21 updates ([#1505](https://github.com/PrivateAIM/hub/issues/1505)) ([2a2a177](https://github.com/PrivateAIM/hub/commit/2a2a17757aab9820aefd24c0bcaa815d810df979))
* **deps:** bump the minorandpatch group across 1 directory with 23 updates ([#1736](https://github.com/PrivateAIM/hub/issues/1736)) ([e3e5658](https://github.com/PrivateAIM/hub/commit/e3e5658d4d711b5afad3aef8a1491a8b1fc9cc19))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1091](https://github.com/PrivateAIM/hub/issues/1091)) ([5da2ab0](https://github.com/PrivateAIM/hub/commit/5da2ab0af1133b1c8408317486fb6394cdb2452e))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* **deps:** bump the minorandpatch group with 8 updates ([#1862](https://github.com/PrivateAIM/hub/issues/1862)) ([450bc71](https://github.com/PrivateAIM/hub/commit/450bc71ca82f0cccee979d61995cd7d371178e95))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* reading analysis logs needs an analysis read permission and an approved node or the grant's reach; reading a node's logs needs analysis_update or analysis_approve; deleting logs needs analysis_update through the grant, not through taking part as a node.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).
* these endpoints now need `analysis_read` (or an analysis write permission) and are narrowed to reach. Downloading or listing result files needs `analysis_result_read`; grant it to roles that read results.
* provision `analysis_read` in Authup before upgrading (until then every node save fails), grant it to roles that view analyses, and grant cross-realm roles - including a non-`system` worker client - their analysis permissions at realm_scope `any`. Master-realm users are no longer able to read every realm's analyses by realm name alone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))
* require analysis_read and participation reach for analysis reads ([#1955](https://github.com/PrivateAIM/hub/issues/1955)) ([9e798d6](https://github.com/PrivateAIM/hub/commit/9e798d647fa957854bb6f22c92956a4c40aa952b))
* scope analysis buckets, files and node events to analysis reach ([#1957](https://github.com/PrivateAIM/hub/issues/1957)) ([da20dd5](https://github.com/PrivateAIM/hub/commit/da20dd5965de1d21f829965f141eb89924268848))
* scope the analysis log proxies to analysis reach ([#1958](https://github.com/PrivateAIM/hub/issues/1958)) ([26a7f79](https://github.com/PrivateAIM/hub/commit/26a7f79a6e1fe364aca6e43666ee004a537c748d))
* **server-core:** reconcile stuck analysis builds and distributions, judge staleness in core ([#1960](https://github.com/PrivateAIM/hub/issues/1960)) ([bb6cf17](https://github.com/PrivateAIM/hub/commit/bb6cf177d51d93905a8686edd639af1542e15c88))


### Bug Fixes

* **server-core:** race-safe process-status transitions ([#1954](https://github.com/PrivateAIM/hub/issues/1954)) ([68e802b](https://github.com/PrivateAIM/hub/commit/68e802b3244c446e00bb013530032133e9555bd1))
* **server-kit:** run every entity-event handler when one fails ([bc6351f](https://github.com/PrivateAIM/hub/commit/bc6351fe3c212162281aaf564d54f45cbd19a8a8))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* reading analysis logs needs an analysis read permission and an approved node or the grant's reach; reading a node's logs needs analysis_update or analysis_approve; deleting logs needs analysis_update through the grant, not through taking part as a node.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).
* these endpoints now need `analysis_read` (or an analysis write permission) and are narrowed to reach. Downloading or listing result files needs `analysis_result_read`; grant it to roles that read results.
* provision `analysis_read` in Authup before upgrading (until then every node save fails), grant it to roles that view analyses, and grant cross-realm roles - including a non-`system` worker client - their analysis permissions at realm_scope `any`. Master-realm users are no longer able to read every realm's analyses by realm name alone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))
* require analysis_read and participation reach for analysis reads ([#1955](https://github.com/PrivateAIM/hub/issues/1955)) ([9e798d6](https://github.com/PrivateAIM/hub/commit/9e798d647fa957854bb6f22c92956a4c40aa952b))
* scope analysis buckets, files and node events to analysis reach ([#1957](https://github.com/PrivateAIM/hub/issues/1957)) ([da20dd5](https://github.com/PrivateAIM/hub/commit/da20dd5965de1d21f829965f141eb89924268848))
* scope the analysis log proxies to analysis reach ([#1958](https://github.com/PrivateAIM/hub/issues/1958)) ([26a7f79](https://github.com/PrivateAIM/hub/commit/26a7f79a6e1fe364aca6e43666ee004a537c748d))
* **server-core:** reconcile stuck analysis builds and distributions, judge staleness in core ([#1960](https://github.com/PrivateAIM/hub/issues/1960)) ([bb6cf17](https://github.com/PrivateAIM/hub/commit/bb6cf177d51d93905a8686edd639af1542e15c88))


### Bug Fixes

* **server-core:** race-safe process-status transitions ([#1954](https://github.com/PrivateAIM/hub/issues/1954)) ([68e802b](https://github.com/PrivateAIM/hub/commit/68e802b3244c446e00bb013530032133e9555bd1))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-realtime-kit bumped from ^0.18.0 to ^0.18.1
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-core-worker-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-db-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-realtime-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-test-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* **server-core:** reconcile stuck analysis builds and distributions, judge staleness in core ([#1960](https://github.com/PrivateAIM/hub/issues/1960)) ([bb6cf17](https://github.com/PrivateAIM/hub/commit/bb6cf177d51d93905a8686edd639af1542e15c88))


### Bug Fixes

* **server-core:** race-safe process-status transitions ([#1954](https://github.com/PrivateAIM/hub/issues/1954)) ([68e802b](https://github.com/PrivateAIM/hub/commit/68e802b3244c446e00bb013530032133e9555bd1))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-core-worker-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.

### Bug Fixes

* **server-core:** race-safe process-status transitions ([#1954](https://github.com/PrivateAIM/hub/issues/1954)) ([68e802b](https://github.com/PrivateAIM/hub/commit/68e802b3244c446e00bb013530032133e9555bd1))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Bug Fixes

* **server-kit:** run every entity-event handler when one fails ([bc6351f](https://github.com/PrivateAIM/hub/commit/bc6351fe3c212162281aaf564d54f45cbd19a8a8))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/messenger-kit bumped from ^0.16.2 to ^0.17.0
    * @privateaim/server-db-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-realtime-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * devDependencies
    * @privateaim/messenger-http-kit bumped from ^0.16.2 to ^0.17.0
    * @privateaim/server-test-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-db-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* **server-core:** TaskManager and its types are removed from @privateaim/server-kit; IBucketCaller methods take no metadata argument. Stop old server-core replicas before new ones serve traffic: an old replica holding the ordered storageBucketEvents slot drops replies for creates a new replica sent (recover with the storageCheck command).

### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))
* **server-core:** remove TaskManager, correlate bucket replies by their refs ([#1959](https://github.com/PrivateAIM/hub/issues/1959)) ([710729c](https://github.com/PrivateAIM/hub/commit/710729c47b57e2f43196629e17727b5eac598732))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/storage-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-db-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-telemetry-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.

### Features

* bucket uniqueness, transient worker retries, queue-only registry dispatch, dead routings and cache removal ([#1962](https://github.com/PrivateAIM/hub/issues/1962)) ([f9568e3](https://github.com/PrivateAIM/hub/commit/f9568e38374e0b56185d6b3b6d674e81edd49b6f))


### Code Refactoring

* components and message bus come from synergos ([#1965](https://github.com/PrivateAIM/hub/issues/1965)) ([dbbbbfb](https://github.com/PrivateAIM/hub/commit/dbbbbfb55bfdce82ee892cd15707b13eb88d75f9))
* migrate from synergos to hubwire 0.2 ([#1968](https://github.com/PrivateAIM/hub/issues/1968)) ([a051e5f](https://github.com/PrivateAIM/hub/commit/a051e5ffddbdc7ccae58d119a0d92d93842d6e12))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/telemetry-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* writes need grants whose realm_scope reaches the record's realm  master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))
* realtime namespaces and rate-limit exemption reach through realm_scope ([#1964](https://github.com/PrivateAIM/hub/issues/1964)) ([e42cd06](https://github.com/PrivateAIM/hub/commit/e42cd0637fad827f72a222077c9fc2c2549f093a))
* record writes reach through grant realm_scope ([#1961](https://github.com/PrivateAIM/hub/issues/1961)) ([eba3ef8](https://github.com/PrivateAIM/hub/commit/eba3ef8f25c39cebea8f8285628f88fdb0b81718))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.18.0 to ^0.19.0
    * @privateaim/server-kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.18.0 to ^0.18.1
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
</details>

<details><summary>0.19.0</summary>

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


###   BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.

### Features

* adopt authup 1.0.0-beta.70 ([#1970](https://github.com/PrivateAIM/hub/issues/1970)) ([5cdba0f](https://github.com/PrivateAIM/hub/commit/5cdba0f8c1b5762b22c3808f21a9055f4d70531a))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.18.0 to ^0.19.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).