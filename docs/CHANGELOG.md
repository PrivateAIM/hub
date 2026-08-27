# Changelog

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
