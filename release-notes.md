:robot: I have created a release *beep* *boop*
---


<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/client-vue bumped from ^0.16.0 to ^0.16.1
    * @privateaim/client-vue-theme bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-realtime-kit bumped from ^0.10.24 to ^0.10.25
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* **client-vue-theme:** adopt aim-blue as brand blue ([5beea6f](https://github.com/PrivateAIM/hub/commit/5beea6f412296ef18686e88cc6cba36600a21e8d))
* project-anchored analyses, title-row add action and breadcrumbs ([#1825](https://github.com/PrivateAIM/hub/issues/1825)) ([61b71fa](https://github.com/PrivateAIM/hub/commit/61b71fa8a146d46aad624eb260e107e16fa176a8))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* redesign analysis & project list views ([#1821](https://github.com/PrivateAIM/hub/issues/1821)) ([c22e39e](https://github.com/PrivateAIM/hub/commit/c22e39ed392854aa7e70c8d0a62cbb844e974e63))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **client-vue-theme:** widen project tiles so an analysis row fits ([f371fbe](https://github.com/PrivateAIM/hub/commit/f371fbee85283fdee870cd0cf7df667ab8ba4f61))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* **ui:** scroll the document instead of .page-content ([923390e](https://github.com/PrivateAIM/hub/commit/923390eb767c4508c5db384b91bbf05c7aee215a))
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))
* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* master image card with progress & build_status ([#1431](https://github.com/PrivateAIM/hub/issues/1431)) ([f3b1b2d](https://github.com/PrivateAIM/hub/commit/f3b1b2d286064c1ddc8ee85b2b6b7dd8826179a3))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* node & analysis client credentials  read + write/rotate behind a core port ([#1696](https://github.com/PrivateAIM/hub/issues/1696)) ([a91ad0b](https://github.com/PrivateAIM/hub/commit/a91ad0b70763ec3b54bec7fd6298ab4a47611560))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* **server-core:** node registry credentials read route ([#1718](https://github.com/PrivateAIM/hub/issues/1718)) ([eee921f](https://github.com/PrivateAIM/hub/commit/eee921f1e139f46ed17a524ebe68f57f7df7c90a))
* submit & receive logs with loki ([#1100](https://github.com/PrivateAIM/hub/issues/1100)) ([83698d4](https://github.com/PrivateAIM/hub/commit/83698d43549cc3a34410bd01910288ba1b263201))
* support additional labels for analysis-node-logs creation ([#1388](https://github.com/PrivateAIM/hub/issues/1388)) ([5d6ffb5](https://github.com/PrivateAIM/hub/commit/5d6ffb5ac9acafc18260ef36945f73ac65fcf3ff))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **analysis:** make build & distribution check a reliable reconciliation path ([#1669](https://github.com/PrivateAIM/hub/issues/1669)) ([133704b](https://github.com/PrivateAIM/hub/commit/133704b6986e183d742dc9da899c276a0917b47e))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 17 updates ([#1774](https://github.com/PrivateAIM/hub/issues/1774)) ([d5e87e2](https://github.com/PrivateAIM/hub/commit/d5e87e229430405ca94c4ab91ae914ec482133a0))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 23 updates ([#1736](https://github.com/PrivateAIM/hub/issues/1736)) ([e3e5658](https://github.com/PrivateAIM/hub/commit/e3e5658d4d711b5afad3aef8a1491a8b1fc9cc19))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* add aggregation column nodes_approved + build_nodes_valid ([#1308](https://github.com/PrivateAIM/hub/issues/1308)) ([2ef0d57](https://github.com/PrivateAIM/hub/commit/2ef0d5701c66b6f4b45a162c7b9413efd8764d1f))
* add and aggregate execution_progress attribute ([#1277](https://github.com/PrivateAIM/hub/issues/1277)) ([1c8458d](https://github.com/PrivateAIM/hub/commit/1c8458d64bb3441807d13815add9f6b7d18584a8))
* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* analysis storage manager component + http endpoint integration ([#1401](https://github.com/PrivateAIM/hub/issues/1401)) ([3ee2e02](https://github.com/PrivateAIM/hub/commit/3ee2e025c725fdafe3359fe502bc05a1757b81f2))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))
* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* database migration capabilities ([#1437](https://github.com/PrivateAIM/hub/issues/1437)) ([ada0c8c](https://github.com/PrivateAIM/hub/commit/ada0c8c82c50d7ff999c60d7d6b8a6aea10064f0))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* explicit master image build trigger ([#1447](https://github.com/PrivateAIM/hub/issues/1447)) ([7909f52](https://github.com/PrivateAIM/hub/commit/7909f52ef32a3fc1345cea80f1e91938cdd7fe89))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* master-image-log-cleaner component ([bd5ec72](https://github.com/PrivateAIM/hub/commit/bd5ec722f5c35a3168c5ad01a12066651c1f901f))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* redesign analysis view and configuration ([#1254](https://github.com/PrivateAIM/hub/issues/1254)) ([b06fb94](https://github.com/PrivateAIM/hub/commit/b06fb945739afd1a82c1afc77ef493c318f243ac))
* refactor process-status enums ([#1410](https://github.com/PrivateAIM/hub/issues/1410)) ([cf7a594](https://github.com/PrivateAIM/hub/commit/cf7a5947c06fbf1d6afbe1412a2e8dd992023ef4))
* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))
* rename run_status to execution_status ([e039cb7](https://github.com/PrivateAIM/hub/commit/e039cb7a6c436e279053b08c8de933d126637608))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* replace robot with client entity ([#1349](https://github.com/PrivateAIM/hub/issues/1349)) ([f4025bc](https://github.com/PrivateAIM/hub/commit/f4025bcf891783f12b609892e75feeb3f1abbef3))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* **server-core:** provision a dedicated Authup client per analysis ([#1693](https://github.com/PrivateAIM/hub/issues/1693)) ([451b89c](https://github.com/PrivateAIM/hub/commit/451b89cb3f361ee63e2354ca238f3ee2f04157ac))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store actor & request with event ([#1133](https://github.com/PrivateAIM/hub/issues/1133)) ([7310c8c](https://github.com/PrivateAIM/hub/commit/7310c8c48058734510fba08413ddf5a9fcb8137c))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **analysis:** make build & distribution check a reliable reconciliation path ([#1669](https://github.com/PrivateAIM/hub/issues/1669)) ([133704b](https://github.com/PrivateAIM/hub/commit/133704b6986e183d742dc9da899c276a0917b47e))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* camelCase rename follow-ups  validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)
* cleanup core-kit package ([dd7f2b2](https://github.com/PrivateAIM/hub/commit/dd7f2b26de2e907ce08221b357a82d393ae3c285))
* **core-kit:** mark analysis-bucket-file root field as optional in validator ([b63725f](https://github.com/PrivateAIM/hub/commit/b63725f1a3bf1b544569bade944b9edd66abda7b))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group with 8 updates ([#1862](https://github.com/PrivateAIM/hub/issues/1862)) ([450bc71](https://github.com/PrivateAIM/hub/commit/450bc71ca82f0cccee979d61995cd7d371178e95))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* permit client for project & analysis-bucket-file creation ([c203c48](https://github.com/PrivateAIM/hub/commit/c203c481c80b7117542a57412b082de9f64f39c3))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))
* stop registry deletion from destroying nodes and analyses; fix registry projects sidebar ([#1786](https://github.com/PrivateAIM/hub/issues/1786)) ([1ad6338](https://github.com/PrivateAIM/hub/commit/1ad63387cc6f1f9cf59c0e33cc661f2980d1cc0d))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.10.25</summary>

## [0.10.25](https://github.com/PrivateAIM/hub/compare/v0.10.24...v0.10.25) (2026-09-11)


### Features

* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))
* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* message broker rewrite  Phase 0 (contracts, client, crypto) ([#1711](https://github.com/PrivateAIM/hub/issues/1711)) ([adce056](https://github.com/PrivateAIM/hub/commit/adce0564b3cf2fc236be0649920ab3779c11396c))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* refactor process-status enums ([#1410](https://github.com/PrivateAIM/hub/issues/1410)) ([cf7a594](https://github.com/PrivateAIM/hub/commit/cf7a5947c06fbf1d6afbe1412a2e8dd992023ef4))
* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))
* remove rsa key generation feature ([b754dfc](https://github.com/PrivateAIM/hub/commit/b754dfce9e17a28e09319e14deb0c5473c0b2ae6))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* set expire date for analysis-node run events ([5f6d3b3](https://github.com/PrivateAIM/hub/commit/5f6d3b3ed06dfb23d66042b61696f6140978a22c))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* camelCase rename follow-ups  validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump nanoid from 3.3.11 to 5.1.11 ([#1581](https://github.com/PrivateAIM/hub/issues/1581)) ([28d90f5](https://github.com/PrivateAIM/hub/commit/28d90f533edb3a730f7d3653a2902af0bd940ad1))
* **deps:** bump nanoid from 5.1.16 to 6.0.0 ([#1750](https://github.com/PrivateAIM/hub/issues/1750)) ([f98f4c3](https://github.com/PrivateAIM/hub/commit/f98f4c3aad9018f1409b59052f317094fa62647b))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1829](https://github.com/PrivateAIM/hub/issues/1829)) ([32e641f](https://github.com/PrivateAIM/hub/commit/32e641f3a15d909c9a95676690464daba154b7da))
* **deps:** bump the minorandpatch group across 1 directory with 17 updates ([#1774](https://github.com/PrivateAIM/hub/issues/1774)) ([d5e87e2](https://github.com/PrivateAIM/hub/commit/d5e87e229430405ca94c4ab91ae914ec482133a0))
* **deps:** bump the minorandpatch group across 1 directory with 23 updates ([#1736](https://github.com/PrivateAIM/hub/issues/1736)) ([e3e5658](https://github.com/PrivateAIM/hub/commit/e3e5658d4d711b5afad3aef8a1491a8b1fc9cc19))
* do not transmit nested event payload ([#1200](https://github.com/PrivateAIM/hub/issues/1200)) ([8180ddc](https://github.com/PrivateAIM/hub/commit/8180ddc6440963e32ce83769ed4c007d36b9533c))
* passing tokenCreator to authorization middleware ([2d0e15a](https://github.com/PrivateAIM/hub/commit/2d0e15a34c445a5e444c5d7ea3c4b29196f287d9))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))
* widen build_size / bucket file size to bigint ([#1631](https://github.com/PrivateAIM/hub/issues/1631)) ([24922c0](https://github.com/PrivateAIM/hub/commit/24922c03db23c917fc0e7a7e35c27ff397ae3871))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


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
    * @privateaim/messenger-kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


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
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#1036](https://github.com/PrivateAIM/hub/issues/1036)) ([e52ea50](https://github.com/PrivateAIM/hub/commit/e52ea50288486db487ce0c5f4d2cd0b027c18861))
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
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-realtime-kit bumped from ^0.10.24 to ^0.10.25
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-core-worker-kit bumped from ^0.13.4 to ^0.14.0
    * @privateaim/server-db-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-realtime-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-storage-kit bumped from ^0.13.4 to ^0.14.0
    * @privateaim/server-telemetry bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-telemetry-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-test-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **analysis:** make build & distribution check a reliable reconciliation path ([#1669](https://github.com/PrivateAIM/hub/issues/1669)) ([133704b](https://github.com/PrivateAIM/hub/commit/133704b6986e183d742dc9da899c276a0917b47e))
* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* camelCase rename follow-ups  validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 17 updates ([#1774](https://github.com/PrivateAIM/hub/issues/1774)) ([d5e87e2](https://github.com/PrivateAIM/hub/commit/d5e87e229430405ca94c4ab91ae914ec482133a0))
* **deps:** bump the minorandpatch group across 1 directory with 23 updates ([#1736](https://github.com/PrivateAIM/hub/issues/1736)) ([e3e5658](https://github.com/PrivateAIM/hub/commit/e3e5658d4d711b5afad3aef8a1491a8b1fc9cc19))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* **deps:** bump the minorandpatch group with 8 updates ([#1862](https://github.com/PrivateAIM/hub/issues/1862)) ([450bc71](https://github.com/PrivateAIM/hub/commit/450bc71ca82f0cccee979d61995cd7d371178e95))
* download proxy URL/allow-list bugs, telemetry retention consistency, tar-pack ancestor synthesis ([#1888](https://github.com/PrivateAIM/hub/issues/1888)) ([24b5c0a](https://github.com/PrivateAIM/hub/commit/24b5c0ae9baa1968c8e75931d8b215653109b965))
* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* **server-core-worker,server-storage:** create the code directory regardless of the base image user ([#1875](https://github.com/PrivateAIM/hub/issues/1875)) ([d46f8a3](https://github.com/PrivateAIM/hub/commit/d46f8a3ea8a8b27c86760c444af0f4f51afa6170))
* **server-core-worker:** reject non-file tar entries, and settle every pack failure route ([#1872](https://github.com/PrivateAIM/hub/issues/1872)) ([fe8294f](https://github.com/PrivateAIM/hub/commit/fe8294fe5b0f6b8d240522bc61963968d515e3a2))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* stop registry deletion from destroying nodes and analyses; fix registry projects sidebar ([#1786](https://github.com/PrivateAIM/hub/issues/1786)) ([1ad6338](https://github.com/PrivateAIM/hub/commit/1ad63387cc6f1f9cf59c0e33cc661f2980d1cc0d))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-core-worker-kit bumped from ^0.13.4 to ^0.14.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-telemetry-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.14.0</summary>

## [0.14.0](https://github.com/PrivateAIM/hub/compare/v0.13.4...v0.14.0) (2026-09-11)


###   BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* **client-ui:** add search to admin assignment sub-pages ([cb85128](https://github.com/PrivateAIM/hub/commit/cb851280464cf2b7f3008729861662d773552994))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* explicitly enable middlewares ([dcb95e1](https://github.com/PrivateAIM/hub/commit/dcb95e1c5750f4119977d12fb4a0a74c1a8424c8))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* **messenger:** mount default middlewares ([d7ede75](https://github.com/PrivateAIM/hub/commit/d7ede752688b73a43bb9ca99557ffb17e9594cc1))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* redesign analysis & project list views ([#1821](https://github.com/PrivateAIM/hub/issues/1821)) ([c22e39e](https://github.com/PrivateAIM/hub/commit/c22e39ed392854aa7e70c8d0a62cbb844e974e63))
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group across 1 directory with 15 updates ([#1415](https://github.com/PrivateAIM/hub/issues/1415)) ([ae2e03c](https://github.com/PrivateAIM/hub/commit/ae2e03cea61aa74820128bc22039d5f23f51466f))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1033](https://github.com/PrivateAIM/hub/issues/1033)) ([b228557](https://github.com/PrivateAIM/hub/commit/b228557eb213761ab97d2d9f8e618b86c50ab155))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* expose validup validator error ([7f81aca](https://github.com/PrivateAIM/hub/commit/7f81aca88b539c6547afa6fb0aaf645d3dbb80dd))
* logger usage in http mount error middleware ([de41d68](https://github.com/PrivateAIM/hub/commit/de41d689292eccba9ec2b324bc1e8c0d9fe0bf85))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/messenger-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-db-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-realtime-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-telemetry-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * devDependencies
    * @privateaim/messenger-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-test-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* create socket handlers for master-image(-group) ([#1321](https://github.com/PrivateAIM/hub/issues/1321)) ([f266417](https://github.com/PrivateAIM/hub/commit/f2664177c6db6ee334ab6a06ed905b6fb71e90a8))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* support client identity for messenger/realtime communication ([#1464](https://github.com/PrivateAIM/hub/issues/1464)) ([5987458](https://github.com/PrivateAIM/hub/commit/59874581dbbc1101b79dd728b5786d5350074866))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))
* unified socket server creation flow ([#1172](https://github.com/PrivateAIM/hub/issues/1172)) ([1ae9835](https://github.com/PrivateAIM/hub/commit/1ae9835fcc45897347ac4bd255cce6cbf077b284))
* use correct env name ([a4dd44d](https://github.com/PrivateAIM/hub/commit/a4dd44d5855788244518345455ba486c71861bae))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* passing tokenCreator to authorization middleware ([2d0e15a](https://github.com/PrivateAIM/hub/commit/2d0e15a34c445a5e444c5d7ea3c4b29196f287d9))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-db-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-storage-kit bumped from ^0.13.4 to ^0.14.0
    * @privateaim/server-telemetry-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.14.0</summary>

## [0.14.0](https://github.com/PrivateAIM/hub/compare/v0.13.4...v0.14.0) (2026-09-11)


###   BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* **release:** bump stale @privateaim/kit refs in server-storage-kit + server-test-kit ([#1633](https://github.com/PrivateAIM/hub/issues/1633)) ([fdf3ca5](https://github.com/PrivateAIM/hub/commit/fdf3ca5b3058bfb4d0228bd47ba4b29f2716a4aa))
* **server-storage:** stream uploads end-to-end to avoid Hash.update overflow ([#1617](https://github.com/PrivateAIM/hub/issues/1617)) ([d117ee1](https://github.com/PrivateAIM/hub/commit/d117ee1ef55f412b1e9f13933d26bd6a8fb6fe19))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Bug Fixes

* **server-http-kit:** honor cookiePrefix in the authup cookie fallback ([#1891](https://github.com/PrivateAIM/hub/issues/1891)) ([a0d37a6](https://github.com/PrivateAIM/hub/commit/a0d37a6f1a11ebc0849d75a0de7903fc4a543f93)), closes [#1890](https://github.com/PrivateAIM/hub/issues/1890)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-db-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/server-telemetry-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.0...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **telemetry-kit,server-db-kit,server-telemetry:** `EventAPI.update()` and `IEventAPI`'s `update` are removed (the route never existed and there is no EVENT_UPDATE permission). `Event['scope']` is now the closed `EventScope` union, and POST /events answers 400 outside it. `EntityEventMetadata.event` and `SubscriberPublishPayload.type` narrow to `DomainEventName`. Entity-event payloads no longer carry `select:false` columns.

### Bug Fixes

* **telemetry-kit,server-db-kit,server-telemetry:** harden the telemetry event system ([#1866](https://github.com/PrivateAIM/hub/issues/1866)) ([dd579e9](https://github.com/PrivateAIM/hub/commit/dd579e934bbdaa1408324983fe15795df1babc64))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/telemetry-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
</details>

<details><summary>0.16.0</summary>

## [0.16.0](https://github.com/PrivateAIM/hub/compare/v0.15.1...v0.16.0) (2026-09-11)


###   BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI  note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias  rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup  build the array before constructing the error and pass it through the constructor options.
* every entity field in HTTP request and response bodies, and in the rapiq query vocabulary (`fields`, `filter`, `sort`, `include`), is renamed from snake_case to camelCase, with no aliases. Telemetry log label keys `ref_type`/`ref_id` become `refType`/`refId`. Affects all `@privateaim/*` packages and the node-facing flat endpoints. Database columns are unchanged.
* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))
* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* squash unreleased migrations and add ref_type/ref_id to buckets ([#1886](https://github.com/PrivateAIM/hub/issues/1886)) ([bbad96a](https://github.com/PrivateAIM/hub/commit/bbad96ac3cf5822c466c27cab9083cbc8d9c2412))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* camelCase rename follow-ups  validator mount-key guard, entity-manager fallback, typedPages ([#1816](https://github.com/PrivateAIM/hub/issues/1816)) ([328c404](https://github.com/PrivateAIM/hub/commit/328c404d4c111296b29521bf98b33561c37fb73a)), closes [#1807](https://github.com/PrivateAIM/hub/issues/1807)
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))
* **deps:** bump authup to beta.65 and follow the FHS provisioning move ([#1882](https://github.com/PrivateAIM/hub/issues/1882)) ([0cb7565](https://github.com/PrivateAIM/hub/commit/0cb756505154ef48b604665e74231d1dcf733a6f))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* **deps:** bump the minorandpatch group with 8 updates ([#1862](https://github.com/PrivateAIM/hub/issues/1862)) ([450bc71](https://github.com/PrivateAIM/hub/commit/450bc71ca82f0cccee979d61995cd7d371178e95))
* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Code Refactoring

* camelCase entity properties, domain types & HTTP API ([#1806](https://github.com/PrivateAIM/hub/issues/1806)) ([de57704](https://github.com/PrivateAIM/hub/commit/de57704372da5578f13003e4360e92cb89f052e2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
</details>

<details><summary>0.16.1</summary>

## [0.16.1](https://github.com/PrivateAIM/hub/compare/v0.16.0...v0.16.1) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).