# Changelog

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.1...v0.20.0) (2026-10-30)


### ⚠ BREAKING CHANGES

* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))

## [0.19.1](https://github.com/PrivateAIM/hub/compare/v0.19.0...v0.19.1) (2026-10-27)

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.1...v0.19.0) (2026-10-20)


### ⚠ BREAKING CHANGES

* every Hub service requires Authup. Without an Authup client, authenticated routes answer 401 and socket connections are refused; the fake master-realm identity and the dryRun / fakeAbilities options of @privateaim/server-http-kit and @privateaim/server-realtime-kit are removed. server-messenger's service client (CLIENT_ID) needs permission_read, since every request reads the authorization catalog, and callers must send a bearer token.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias — rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup — build the array before constructing the error and pass it through the constructor options.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* align hub with authup's permission evaluator and close authorization gaps ([#1932](https://github.com/PrivateAIM/hub/issues/1932)) ([ec2d560](https://github.com/PrivateAIM/hub/commit/ec2d56054e96c470ba1495fd90441c7f8d837636))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))

## [0.18.1](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.18.1) (2026-10-19)

## [0.18.0](https://github.com/PrivateAIM/hub/compare/v0.8.42...v0.18.0) (2026-10-15)


### ⚠ BREAKING CHANGES

* every Hub service requires Authup. Without an Authup client, authenticated routes answer 401 and socket connections are refused; the fake master-realm identity and the dryRun / fakeAbilities options of @privateaim/server-http-kit and @privateaim/server-realtime-kit are removed. server-messenger's service client (CLIENT_ID) needs permission_read, since every request reads the authorization catalog, and callers must send a bearer token.
* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias — rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup — build the array before constructing the error and pass it through the constructor options.
* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* align hub with authup's permission evaluator and close authorization gaps ([#1932](https://github.com/PrivateAIM/hub/issues/1932)) ([ec2d560](https://github.com/PrivateAIM/hub/commit/ec2d56054e96c470ba1495fd90441c7f8d837636))
* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1653](https://github.com/PrivateAIM/hub/issues/1653)) ([db03012](https://github.com/PrivateAIM/hub/commit/db030128f7d4b766f2202a3afe70ae9bc7f09c5a))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))
