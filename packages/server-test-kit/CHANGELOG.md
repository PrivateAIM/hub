# Changelog

## [0.13.3](https://github.com/PrivateAIM/hub/compare/v0.13.2...v0.13.3) (2026-08-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/server-kit bumped from ^0.13.2 to ^0.13.3
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/server-kit bumped from ^0.13.2 to ^0.13.3

## [0.13.2](https://github.com/PrivateAIM/hub/compare/v0.13.1...v0.13.2) (2026-08-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/server-kit bumped from ^0.13.1 to ^0.13.2
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/server-kit bumped from ^0.13.1 to ^0.13.2

## [0.13.1](https://github.com/PrivateAIM/hub/compare/v0.13.0...v0.13.1) (2026-08-05)


### Bug Fixes

* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/server-kit bumped from ^0.13.0 to ^0.13.1
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/server-kit bumped from ^0.13.0 to ^0.13.1

## [0.13.0](https://github.com/PrivateAIM/hub/compare/v0.12.7...v0.13.0) (2026-07-30)


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


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/server-kit bumped from ^0.12.7 to ^0.13.0
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/server-kit bumped from ^0.12.7 to ^0.13.0

## [0.12.7](https://github.com/PrivateAIM/hub/compare/v0.12.6...v0.12.7) (2026-07-29)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.6 to ^0.12.7
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.6 to ^0.12.7

## [0.12.6](https://github.com/PrivateAIM/hub/compare/v0.12.5...v0.12.6) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.5 to ^0.12.6
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.5 to ^0.12.6

## [0.12.5](https://github.com/PrivateAIM/hub/compare/v0.12.4...v0.12.5) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.4 to ^0.12.5
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.4 to ^0.12.5

## [0.12.4](https://github.com/PrivateAIM/hub/compare/v0.12.3...v0.12.4) (2026-07-24)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 17 updates ([#1774](https://github.com/PrivateAIM/hub/issues/1774)) ([d5e87e2](https://github.com/PrivateAIM/hub/commit/d5e87e229430405ca94c4ab91ae914ec482133a0))
* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.3 to ^0.12.4
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.3 to ^0.12.4

## [0.12.3](https://github.com/PrivateAIM/hub/compare/v0.12.2...v0.12.3) (2026-07-23)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.2 to ^0.12.3
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.2 to ^0.12.3

## [0.12.2](https://github.com/PrivateAIM/hub/compare/v0.12.1...v0.12.2) (2026-07-13)


### Bug Fixes

* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.1 to ^0.12.2
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.1 to ^0.12.2

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-03)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.12.0 to ^0.12.1
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.12.0 to ^0.12.1

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.12.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.5 to ^0.12.0
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.5 to ^0.12.0

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)


### Bug Fixes

* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.4 to ^0.11.5
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.4 to ^0.11.5

## [0.11.4](https://github.com/PrivateAIM/hub/compare/v0.11.3...v0.11.4) (2026-06-22)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.3 to ^0.11.4
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.3 to ^0.11.4

## [0.11.3](https://github.com/PrivateAIM/hub/compare/v0.11.2...v0.11.3) (2026-06-16)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.2 to ^0.11.3
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.2 to ^0.11.3

## [0.11.2](https://github.com/PrivateAIM/hub/compare/v0.11.1...v0.11.2) (2026-06-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.1 to ^0.11.2
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.1 to ^0.11.2

## [0.11.1](https://github.com/PrivateAIM/hub/compare/v0.11.0...v0.11.1) (2026-06-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.11.0 to ^0.11.1
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.11.0 to ^0.11.1

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.3...v0.11.0) (2026-06-15)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.10.3 to ^0.11.0
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.10.3 to ^0.11.0

## [0.10.3](https://github.com/PrivateAIM/hub/compare/v0.10.2...v0.10.3) (2026-06-12)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.10.2 to ^0.10.3
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.10.2 to ^0.10.3

## [0.10.2](https://github.com/PrivateAIM/hub/compare/v0.10.1...v0.10.2) (2026-06-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.10.1 to ^0.10.2
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.10.1 to ^0.10.2

## [0.10.1](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.10.1) (2026-06-02)


### Features

* **analysis:** auto-generate url-friendly name and add display_name ([#1656](https://github.com/PrivateAIM/hub/issues/1656)) ([2d56b10](https://github.com/PrivateAIM/hub/commit/2d56b10f56c590a92f4f8f20a170269ea54d6619))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.10.1
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.10.1
