# Changelog

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


### ⚠ BREAKING CHANGES

* assertRecordReach, reachesRecord, hasUnboundedReach, holdsPermission, isPermissionDenial, buildRecordPolicyData and RecordReach are removed from @privateaim/server-kit. The server-test-kit actor fakes deny with authup's PermissionError instead of PermissionDeniedError.
* the kit *Caller classes are renamed to *Dispatcher and their call* methods to dispatch* (e.g. AnalysisBuilderComponentCaller.callExecute -> AnalysisBuilderComponentDispatcher.dispatchExecute, BucketFileTaskCaller -> BucketFileTaskDispatcher, LogComponentCaller.callWrite -> LogComponentDispatcher.dispatchWrite), with no aliases. They extend hubwire's RemoteDispatcher: their options no longer take hooks and the inherited call() is dispatch(). server-kit removes createDispatchCallerLogHooks and renames createWorkerCallerLogHooks to createRemoteWorkerLogHooks. Consumers of the kits need hubwire installed instead of synergos.
* hub caller subclasses (BucketComponentCaller, LogComponentCaller, AnalysisBuilderComponentCaller, ...) require `messageBus`; server-kit, server-core-worker-kit, server-storage-kit and server-telemetry-kit depend on synergos instead of ergos.
* createMasterRealmActor and createNonMasterRealmActor are removed from @privateaim/server-test-kit (use createAllowAllActor / createScopedActor). hasUnboundedReach and assertRecordReach take Pick<ActorContext, 'permissionEvaluator'>. Master-realm clients without unbounded grants are no longer exempt from rate limiting or admitted to foreign realm namespaces.
* server-kit no longer exports Cache, CacheModule, CacheInjectionKey, CACHE_MODULE_NAME, buildCacheKey, CacheAdapter, MemoryCacheAdapter, RedisCacheAdapter, CacheSetOptions, CacheClearOptions or CacheKeyBuildOptions, and BaseApplicationBuilder.withCache() is gone.
* writes need grants whose realm_scope reaches the record's realm — master-realm users with `own` grants write only in the master realm. analysis_node_log_create must be provisioned in Authup before upgrading. Analysis commands need analysis_execution_start or analysis_update. node.clientId can no longer be set over the API.
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

## [0.18.0](https://github.com/PrivateAIM/hub/compare/v0.17.0...v0.18.0) (2026-10-15)


### ⚠ BREAKING CHANGES

* **server-kit:** upgrade server-core-worker and server-storage before server-core. An upgraded server-core consumes only the new queues and misses events from a worker that still publishes to the topic exchange. server-kit now requires amqp-extension ^5.0.0.
* the analysis field buildNodesValid is renamed to distributionNodesValid. Approving an analysis node before its analysis is built answers 400.
* reading nodes, master images, master image groups, registries and registry projects requires the new *_read permissions, and event_read is now realm-scoped. Provision the names in Authup before upgrading, grant them to user roles, and grant node_read to existing node clients. See docs/src/guide/deployment/configuration.md.
* every Hub service requires Authup. Without an Authup client, authenticated routes answer 401 and socket connections are refused; the fake master-realm identity and the dryRun / fakeAbilities options of @privateaim/server-http-kit and @privateaim/server-realtime-kit are removed. server-messenger's service client (CLIENT_ID) needs permission_read, since every request reads the authorization catalog, and callers must send a bearer token.

### Features

* adopt typeorm-extension 4.2.0 (UTC timestamps, boot migration locks) ([#1934](https://github.com/PrivateAIM/hub/issues/1934)) ([eddee85](https://github.com/PrivateAIM/hub/commit/eddee85bb9a63ca96a39d557823a57fefa1fbee5))
* align hub with authup's permission evaluator and close authorization gaps ([#1932](https://github.com/PrivateAIM/hub/issues/1932)) ([ec2d560](https://github.com/PrivateAIM/hub/commit/ec2d56054e96c470ba1495fd90441c7f8d837636))
* clear analysis temp bucket once all nodes are idle ([#1860](https://github.com/PrivateAIM/hub/issues/1860)) ([#1939](https://github.com/PrivateAIM/hub/issues/1939)) ([5094f2e](https://github.com/PrivateAIM/hub/commit/5094f2e288a48b1970f439d6c265baf89f0f004d))
* **deps:** bump authup to v1.0.0-beta.69 ([#1923](https://github.com/PrivateAIM/hub/issues/1923)) ([09f55fa](https://github.com/PrivateAIM/hub/commit/09f55fa3ee0c01285ce16472aecbddfcd9738afe))
* require read permissions for catalogs, registry projects and events ([#1940](https://github.com/PrivateAIM/hub/issues/1940)) ([476cb60](https://github.com/PrivateAIM/hub/commit/476cb60c14eb84a4731cd902404827637195e873))
* **server-kit:** durable ordered reply queues on amqp-extension 5 ([#1947](https://github.com/PrivateAIM/hub/issues/1947)) ([ec599bf](https://github.com/PrivateAIM/hub/commit/ec599bf6331b2c1d2e146a56396373a629321891))


### Bug Fixes

* gate distribution, not the build, on node approval ([#1946](https://github.com/PrivateAIM/hub/issues/1946)) ([67ca4a9](https://github.com/PrivateAIM/hub/commit/67ca4a979896e2c97a101a3b54264e83e73c9c52))
* release prep, squash unreleased migrations, boot-time node-client permission sync, non-retrying log writes ([#1948](https://github.com/PrivateAIM/hub/issues/1948)) ([d4e94d9](https://github.com/PrivateAIM/hub/commit/d4e94d9999e2d96842abaf319dd0adad9b4787f5))
* **server-core:** authorize analysis bucket and bucket-file writes ([#1944](https://github.com/PrivateAIM/hub/issues/1944)) ([8fce9bb](https://github.com/PrivateAIM/hub/commit/8fce9bb5f1e3ecc2d97f58cf1a1fb9f063e8f094))
* **server-kit,server-core,server-core-worker:** bounded command retries and awaited result events (plan 018, phase 1) ([#1935](https://github.com/PrivateAIM/hub/issues/1935)) ([54c4174](https://github.com/PrivateAIM/hub/commit/54c417400910c67a3bbddcbadcf24516814a14ab))


### Performance Improvements

* lookup and foreign key indexes, plus fixes found in the index audit ([#1945](https://github.com/PrivateAIM/hub/issues/1945)) ([cf8af59](https://github.com/PrivateAIM/hub/commit/cf8af594aab41a08afc5cf4d6eb1e11ffb9ea731))

## [0.17.0](https://github.com/PrivateAIM/hub/compare/v0.16.1...v0.17.0) (2026-09-25)


### ⚠ BREAKING CHANGES

* **auth:** Hub requires Authup beta.68. Restricted service clients need permission_read with ownOrNull or wider realm reach; the built-in system client already has this access.

### Features

* **auth:** upgrade Authup to beta.68 and use its authorization catalog ([#1903](https://github.com/PrivateAIM/hub/issues/1903)) ([f7e0baa](https://github.com/PrivateAIM/hub/commit/f7e0baa3848f586fd642fe4622574a771b5bafaa))

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.0...v0.16.0) (2026-09-11)


### ⚠ BREAKING CHANGES

* the telemetry event query surface narrowed - filters createdAt/updatedAt are gone (dateToISOStringTransformer never applies to WHERE binds, so they matched wrong rows silently) and sorts allow only createdAt, with createdAt DESC as the new schema default; the analysis filter description is gone (unindexable text column). Multi-key sorts of individually advertised keys decode to the schema's sort default (or no ordering) unless a composite backs them, documented in api.md. En route this fixes masterImage sort handling: the derived allow-list had silently dropped the UI's virtualPath sort, and masterImageGroup rejected every sort key.
* **telemetry-kit,server-db-kit,server-telemetry:** `EventAPI.update()` and `IEventAPI`'s `update` are removed (the route never existed and there is no EVENT_UPDATE permission). `Event['scope']` is now the closed `EventScope` union, and POST /events answers 400 outside it. `EntityEventMetadata.event` and `SubscriberPublishPayload.type` narrow to `DomainEventName`. Entity-event payloads no longer carry `select:false` columns.

### Features

* back every queryable key with a real index and gate schema drift ([#1873](https://github.com/PrivateAIM/hub/issues/1873)) ([cdf83ce](https://github.com/PrivateAIM/hub/commit/cdf83ce24f4c58a247ae461cb80905261a409754))
* **client-vue,client-ui:** hand server-rendered data to the client instead of fetching it twice ([#1870](https://github.com/PrivateAIM/hub/issues/1870)) ([d71b19c](https://github.com/PrivateAIM/hub/commit/d71b19c173d94fa369b40eec9861456f4edc531e))


### Bug Fixes

* connect every new node to a registry, and let node admins manage that connection ([#1859](https://github.com/PrivateAIM/hub/issues/1859)) ([0be5ce6](https://github.com/PrivateAIM/hub/commit/0be5ce63f7a3a50d70ef3d23351ae4409d47b87b))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump the minorandpatch group with 8 updates ([#1862](https://github.com/PrivateAIM/hub/issues/1862)) ([450bc71](https://github.com/PrivateAIM/hub/commit/450bc71ca82f0cccee979d61995cd7d371178e95))
* **telemetry-kit,server-db-kit,server-telemetry:** harden the telemetry event system ([#1866](https://github.com/PrivateAIM/hub/issues/1866)) ([dd579e9](https://github.com/PrivateAIM/hub/commit/dd579e934bbdaa1408324983fe15795df1babc64))

## [0.15.0](https://github.com/PrivateAIM/hub/compare/v0.14.0...v0.15.0) (2026-08-26)


### ⚠ BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI — note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.

### Bug Fixes

* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **server-telemetry,server-messenger:** batch the expiry sweeps behind the repository ports ([#1848](https://github.com/PrivateAIM/hub/issues/1848)) ([a205843](https://github.com/PrivateAIM/hub/commit/a205843e6fa797e051682fe617a7e54046f36206))

## [0.14.0](https://github.com/PrivateAIM/hub/compare/v0.13.3...v0.14.0) (2026-08-18)


### ⚠ BREAKING CHANGES

* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias — rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup — build the array before constructing the error and pass it through the constructor options.

### Bug Fixes

* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1829](https://github.com/PrivateAIM/hub/issues/1829)) ([32e641f](https://github.com/PrivateAIM/hub/commit/32e641f3a15d909c9a95676690464daba154b7da))

## [0.13.3](https://github.com/PrivateAIM/hub/compare/v0.13.2...v0.13.3) (2026-08-13)


### Features

* **client-ui:** carry the session realm into the account console link ([669acc9](https://github.com/PrivateAIM/hub/commit/669acc93d81f52f6842fc5bb8d2697cdd9cbbe32))
* **client-vue-theme:** adopt aim-blue as brand blue ([5beea6f](https://github.com/PrivateAIM/hub/commit/5beea6f412296ef18686e88cc6cba36600a21e8d))
* project-anchored analyses, title-row add action and breadcrumbs ([#1825](https://github.com/PrivateAIM/hub/issues/1825)) ([61b71fa](https://github.com/PrivateAIM/hub/commit/61b71fa8a146d46aad624eb260e107e16fa176a8))

## [0.13.2](https://github.com/PrivateAIM/hub/compare/v0.13.1...v0.13.2) (2026-08-05)


### Features

* **client-ui:** replace the settings area with the Authup account console ([bf38d28](https://github.com/PrivateAIM/hub/commit/bf38d282bc1ee184f6a43728449680df4d032374))


### Bug Fixes

* camelCase rename follow-ups — validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)

## [0.13.1](https://github.com/PrivateAIM/hub/compare/v0.13.0...v0.13.1) (2026-08-05)


### Bug Fixes

* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))


### Performance Improvements

* **client-ui:** ship only the icons the UI renders ([#1812](https://github.com/PrivateAIM/hub/issues/1812)) ([6a6ea00](https://github.com/PrivateAIM/hub/commit/6a6ea00216b23be0f029a35e1de6eb0170dd6c87)), closes [#1811](https://github.com/PrivateAIM/hub/issues/1811)

## [0.13.0](https://github.com/PrivateAIM/hub/compare/v0.12.6...v0.13.0) (2026-07-30)


### ⚠ BREAKING CHANGES

* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.

### Features

* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)


### Bug Fixes

* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))

## [0.12.6](https://github.com/PrivateAIM/hub/compare/v0.12.5...v0.12.6) (2026-07-29)

## [0.12.5](https://github.com/PrivateAIM/hub/compare/v0.12.4...v0.12.5) (2026-07-26)


### Bug Fixes

* stop registry deletion from destroying nodes and analyses; fix registry projects sidebar ([#1786](https://github.com/PrivateAIM/hub/issues/1786)) ([1ad6338](https://github.com/PrivateAIM/hub/commit/1ad63387cc6f1f9cf59c0e33cc661f2980d1cc0d))

## [0.12.4](https://github.com/PrivateAIM/hub/compare/v0.12.3...v0.12.4) (2026-07-26)


### Bug Fixes

* stop registry deletion from destroying nodes and analyses; fix registry projects sidebar ([#1786](https://github.com/PrivateAIM/hub/issues/1786)) ([1ad6338](https://github.com/PrivateAIM/hub/commit/1ad63387cc6f1f9cf59c0e33cc661f2980d1cc0d))

## [0.12.3](https://github.com/PrivateAIM/hub/compare/v0.12.2...v0.12.3) (2026-07-24)

## [0.12.2](https://github.com/PrivateAIM/hub/compare/v0.12.1...v0.12.2) (2026-07-23)

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-13)

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.6...v0.12.0) (2026-07-03)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* **client-ui:** OAuth2 authorization-code login flow with network background ([#1725](https://github.com/PrivateAIM/hub/issues/1725)) ([a3a857b](https://github.com/PrivateAIM/hub/commit/a3a857bb2c3cf8588d4fb0fc5787c4b70e21e584))
* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))
* **server-core:** auto-assign approved project nodes on analysis creation ([#1661](https://github.com/PrivateAIM/hub/issues/1661)) ([a435889](https://github.com/PrivateAIM/hub/commit/a43588987abf022e16777dd3fac15390bdebb973))
* **server-core:** node registry credentials read route ([#1718](https://github.com/PrivateAIM/hub/issues/1718)) ([eee921f](https://github.com/PrivateAIM/hub/commit/eee921f1e139f46ed17a524ebe68f57f7df7c90a))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **analysis:** make build & distribution check a reliable reconciliation path ([#1669](https://github.com/PrivateAIM/hub/issues/1669)) ([133704b](https://github.com/PrivateAIM/hub/commit/133704b6986e183d742dc9da899c276a0917b47e))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))

## [0.11.6](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.11.6) (2026-06-29)


### Features

* **client-ui:** OAuth2 authorization-code login flow with network background ([#1725](https://github.com/PrivateAIM/hub/issues/1725)) ([a3a857b](https://github.com/PrivateAIM/hub/commit/a3a857bb2c3cf8588d4fb0fc5787c4b70e21e584))

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)


### Features

* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))
* **server-core:** node registry credentials read route ([#1718](https://github.com/PrivateAIM/hub/issues/1718)) ([eee921f](https://github.com/PrivateAIM/hub/commit/eee921f1e139f46ed17a524ebe68f57f7df7c90a))

## [0.11.4](https://github.com/PrivateAIM/hub/compare/v0.11.3...v0.11.4) (2026-06-22)

## [0.11.3](https://github.com/PrivateAIM/hub/compare/v0.11.2...v0.11.3) (2026-06-16)

## [0.11.2](https://github.com/PrivateAIM/hub/compare/v0.11.1...v0.11.2) (2026-06-15)

## [0.11.1](https://github.com/PrivateAIM/hub/compare/v0.11.0...v0.11.1) (2026-06-15)

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.3...v0.11.0) (2026-06-15)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))

## [0.10.3](https://github.com/PrivateAIM/hub/compare/v0.10.2...v0.10.3) (2026-06-12)

## [0.10.2](https://github.com/PrivateAIM/hub/compare/v0.10.1...v0.10.2) (2026-06-11)


### Bug Fixes

* **analysis:** make build & distribution check a reliable reconciliation path ([#1669](https://github.com/PrivateAIM/hub/issues/1669)) ([133704b](https://github.com/PrivateAIM/hub/commit/133704b6986e183d742dc9da899c276a0917b47e))

## [0.10.1](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.10.1) (2026-06-02)


### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* **server-core:** auto-assign approved project nodes on analysis creation ([#1661](https://github.com/PrivateAIM/hub/issues/1661)) ([a435889](https://github.com/PrivateAIM/hub/commit/a43588987abf022e16777dd3fac15390bdebb973))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))

## [0.8.44](https://github.com/PrivateAIM/hub/compare/v0.8.43...v0.8.44) (2026-05-21)

## [0.8.43](https://github.com/PrivateAIM/hub/compare/v0.8.42...v0.8.43) (2026-05-20)

## [0.8.42](https://github.com/PrivateAIM/hub/compare/v0.8.41...v0.8.42) (2026-05-11)

## [0.8.41](https://github.com/PrivateAIM/hub/compare/v0.8.40...v0.8.41) (2026-05-10)

## [0.8.40](https://github.com/PrivateAIM/hub/compare/v0.8.39...v0.8.40) (2026-05-10)

## [0.8.39](https://github.com/PrivateAIM/hub/compare/v0.8.38...v0.8.39) (2026-04-29)

## [0.8.38](https://github.com/PrivateAIM/hub/compare/v0.8.37...v0.8.38) (2026-04-29)

## 0.8.37 (2026-04-23)
