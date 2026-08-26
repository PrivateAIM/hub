# Changelog

## [0.15.0](https://github.com/PrivateAIM/hub/compare/v0.14.0...v0.15.0) (2026-08-26)


### ⚠ BREAKING CHANGES

* **deps:** the OAuth2 client used by the UI must register `<ui-origin>/login/callback**` as a redirect URI — note the trailing `**`. The post-login destination now rides in the callback URI's query, and Authup matches a registered redirect URI against the full canonical URL including its query string, so an exact `<ui-origin>/login/callback` registration stops matching as soon as a destination is carried. The breakage looks intermittent: a login started from the bare login page carries no `redirect` and still succeeds, so only deep-link logins fail.

### Bug Fixes

* **deps:** bump authup to beta.63 and align the toolchain ([#1851](https://github.com/PrivateAIM/hub/issues/1851)) ([80830e6](https://github.com/PrivateAIM/hub/commit/80830e651ccfb46d0d5e362857eb87dba2df9671))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.14.0 to ^0.15.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.14.0 to ^0.15.0

## [0.14.0](https://github.com/PrivateAIM/hub/compare/v0.13.3...v0.14.0) (2026-08-18)


### ⚠ BREAKING CHANGES

* **deps:** the sort vocabulary published under `meta.schema` is renamed from `sort` to `sorts`, with no alias — rapiq's describe() emits only the plural key. The URL query parameter is unchanged (`?sort=-updatedAt` still works), and `sort` remains accepted as a deprecated build-input alias, so only consumers reading `meta.schema.sort` are affected. Schema descriptions additionally gain `indexes`, `filters.caseSensitive`, `filters.indexed` and `sorts.indexed`. For npm consumers, `ListMeta` in @privateaim/client-vue renames its `sort` key to `sorts`, and `HubError.issues` in @privateaim/errors is now `ReadonlyArray<Issue>` sourced from @ebec/core rather than a mutable `Issue[]` from validup — build the array before constructing the error and pass it through the constructor options.

### Bug Fixes

* **deps:** bump authup to beta.62, rapiq to 2.2 and the ebec/hapic/validup/ilingo stack ([#1843](https://github.com/PrivateAIM/hub/issues/1843)) ([8115fb0](https://github.com/PrivateAIM/hub/commit/8115fb00e148d42bd861c858e324d4b9f32028e6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.13.3 to ^0.14.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.13.3 to ^0.14.0

## [0.13.3](https://github.com/PrivateAIM/hub/compare/v0.13.2...v0.13.3) (2026-08-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.13.2 to ^0.13.3
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.13.2 to ^0.13.3

## [0.13.2](https://github.com/PrivateAIM/hub/compare/v0.13.1...v0.13.2) (2026-08-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.13.1 to ^0.13.2
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.13.1 to ^0.13.2

## [0.13.1](https://github.com/PrivateAIM/hub/compare/v0.13.0...v0.13.1) (2026-08-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.13.0 to ^0.13.1
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.13.0 to ^0.13.1

## [0.13.0](https://github.com/PrivateAIM/hub/compare/v0.12.7...v0.13.0) (2026-07-30)


### ⚠ BREAKING CHANGES

* `AuthupClientInjectionKey` is retyped to `IAuthupClient` consumers via the contract types; `Options.isServer` is removed from `@privateaim/client-vue` (it was declared but never read); and `installSocketManager` is now gated behind a new `realtime` install option, so consumers must pass `realtime: true` to keep the socket manager. `IEntityAPI` / `IEntityAPISlim` are now constrained to `ObjectLiteral`.

### Features

* contract-first HTTP clients + a ./testing FakeClient subpath ([#1804](https://github.com/PrivateAIM/hub/issues/1804)) ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))


### Bug Fixes

* pickEntityAPI leaked the excluded keys at runtime ([a3c826d](https://github.com/PrivateAIM/hub/commit/a3c826df69bba0af1993638fea5ee62995a1a8af))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.6 to ^0.13.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.6 to ^0.13.0

## [0.12.7](https://github.com/PrivateAIM/hub/compare/v0.12.6...v0.12.7) (2026-07-29)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.5 to ^0.12.6
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.5 to ^0.12.6

## [0.12.6](https://github.com/PrivateAIM/hub/compare/v0.12.5...v0.12.6) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.4 to ^0.12.5
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.4 to ^0.12.5

## [0.12.5](https://github.com/PrivateAIM/hub/compare/v0.12.4...v0.12.5) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.3 to ^0.12.4
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.3 to ^0.12.4

## [0.12.4](https://github.com/PrivateAIM/hub/compare/v0.12.3...v0.12.4) (2026-07-24)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.2 to ^0.12.3
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.2 to ^0.12.3

## [0.12.3](https://github.com/PrivateAIM/hub/compare/v0.12.2...v0.12.3) (2026-07-23)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.1 to ^0.12.2
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.1 to ^0.12.2

## [0.12.2](https://github.com/PrivateAIM/hub/compare/v0.12.1...v0.12.2) (2026-07-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.12.0 to ^0.12.1
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.12.0 to ^0.12.1

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-03)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.6 to ^0.12.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.6 to ^0.12.0

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.12.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.5 to ^0.11.6
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.5 to ^0.11.6

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)


### Features

* message broker rewrite — Phase 0 (contracts, client, crypto) ([#1711](https://github.com/PrivateAIM/hub/issues/1711)) ([adce056](https://github.com/PrivateAIM/hub/commit/adce0564b3cf2fc236be0649920ab3779c11396c))
* message broker rewrite — Phase 1 (durable mailbox + REST API) ([#1715](https://github.com/PrivateAIM/hub/issues/1715)) ([dda1103](https://github.com/PrivateAIM/hub/commit/dda1103e52734cd0a03b4b32940e4c8ae2484565))
* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))


### Bug Fixes

* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.4 to ^0.11.5
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.4 to ^0.11.5
