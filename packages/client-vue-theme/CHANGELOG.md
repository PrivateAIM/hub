# Changelog

## [0.13.3](https://github.com/PrivateAIM/hub/compare/v0.13.2...v0.13.3) (2026-08-13)


### Features

* **client-vue-theme:** adopt aim-blue as brand blue ([5beea6f](https://github.com/PrivateAIM/hub/commit/5beea6f412296ef18686e88cc6cba36600a21e8d))
* project-anchored analyses, title-row add action and breadcrumbs ([#1825](https://github.com/PrivateAIM/hub/issues/1825)) ([61b71fa](https://github.com/PrivateAIM/hub/commit/61b71fa8a146d46aad624eb260e107e16fa176a8))
* redesign analysis & project list views ([#1821](https://github.com/PrivateAIM/hub/issues/1821)) ([c22e39e](https://github.com/PrivateAIM/hub/commit/c22e39ed392854aa7e70c8d0a62cbb844e974e63))


### Bug Fixes

* **client-vue-theme:** widen project tiles so an analysis row fits ([f371fbe](https://github.com/PrivateAIM/hub/commit/f371fbee85283fdee870cd0cf7df667ab8ba4f61))

## [0.13.2](https://github.com/PrivateAIM/hub/compare/v0.13.1...v0.13.2) (2026-08-05)

## [0.13.1](https://github.com/PrivateAIM/hub/compare/v0.13.0...v0.13.1) (2026-08-05)


### Bug Fixes

* **deps:** bump authup to beta.59, rapiq to beta.16 and the vuecs packages ([9e53ad1](https://github.com/PrivateAIM/hub/commit/9e53ad11fe49dc3dc6ad827998dc02ef26304378))
* **deps:** bump ilingo, validup, trapi and authup to their latest versions ([9461ec8](https://github.com/PrivateAIM/hub/commit/9461ec8f7024c6bfdb4a26baef2fc7491eb00680))

## [0.13.0](https://github.com/PrivateAIM/hub/compare/v0.12.7...v0.13.0) (2026-07-30)


### ⚠ BREAKING CHANGES

* entity record endpoints return { data, meta } instead of the bare record, so consumers must unwrap data; old clients against a new server break. The kit response types are renamed with no deprecated aliases: SingleResourceResponse -> EntityRecordResponse, CollectionResourceResponse -> EntityCollectionResponse, DomainAPI -> IEntityAPI, DomainAPISlim -> IEntityAPISlim.

### Features

* record data/meta envelope, meta.schema discovery and dependency bump ([#1801](https://github.com/PrivateAIM/hub/issues/1801)) ([a509e93](https://github.com/PrivateAIM/hub/commit/a509e932c7f650b58ce237a13993026cb102121c)), closes [#1793](https://github.com/PrivateAIM/hub/issues/1793) [#1794](https://github.com/PrivateAIM/hub/issues/1794)

## [0.12.7](https://github.com/PrivateAIM/hub/compare/v0.12.6...v0.12.7) (2026-07-29)

## [0.12.6](https://github.com/PrivateAIM/hub/compare/v0.12.5...v0.12.6) (2026-07-26)

## [0.12.5](https://github.com/PrivateAIM/hub/compare/v0.12.4...v0.12.5) (2026-07-26)

## [0.12.4](https://github.com/PrivateAIM/hub/compare/v0.12.3...v0.12.4) (2026-07-24)


### Bug Fixes

* **server-core:** field projections + bump rapiq beta.9 / authup beta.56 (restore json columns) ([#1780](https://github.com/PrivateAIM/hub/issues/1780)) ([0765653](https://github.com/PrivateAIM/hub/commit/07656537a16d55a9b1e9158f378cde40e97cde99))

## [0.12.3](https://github.com/PrivateAIM/hub/compare/v0.12.2...v0.12.3) (2026-07-23)

## [0.12.2](https://github.com/PrivateAIM/hub/compare/v0.12.1...v0.12.2) (2026-07-13)


### Bug Fixes

* **deps:** bump [@authup](https://github.com/authup) packages to v1.0.0-beta.52 ([#1746](https://github.com/PrivateAIM/hub/issues/1746)) ([6e18df7](https://github.com/PrivateAIM/hub/commit/6e18df7c3c5b3626d75e24b781248e890f7e278c))

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-03)

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.12.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)

## [0.11.4](https://github.com/PrivateAIM/hub/compare/v0.11.3...v0.11.4) (2026-06-22)

## [0.11.3](https://github.com/PrivateAIM/hub/compare/v0.11.2...v0.11.3) (2026-06-16)

## [0.11.2](https://github.com/PrivateAIM/hub/compare/v0.11.1...v0.11.2) (2026-06-15)

## [0.11.1](https://github.com/PrivateAIM/hub/compare/v0.11.0...v0.11.1) (2026-06-15)


### Bug Fixes

* **ui:** scroll the document instead of .page-content ([923390e](https://github.com/PrivateAIM/hub/commit/923390eb767c4508c5db384b91bbf05c7aee215a))

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-06-15)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))
