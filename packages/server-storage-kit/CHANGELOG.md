# Changelog

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.6...v0.12.0) (2026-07-02)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* **release:** bump stale @privateaim/kit refs in server-storage-kit + server-test-kit ([#1633](https://github.com/PrivateAIM/hub/issues/1633)) ([fdf3ca5](https://github.com/PrivateAIM/hub/commit/fdf3ca5b3058bfb4d0228bd47ba4b29f2716a4aa))
* **server-storage:** stream uploads end-to-end to avoid Hash.update overflow ([#1617](https://github.com/PrivateAIM/hub/issues/1617)) ([d117ee1](https://github.com/PrivateAIM/hub/commit/d117ee1ef55f412b1e9f13933d26bd6a8fb6fe19))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.0 to ^0.12.1
    * @privateaim/server-kit bumped from ^0.12.0 to ^0.12.1
    * @privateaim/storage-kit bumped from ^0.12.0 to ^0.12.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.0 to ^0.12.1
    * @privateaim/server-kit bumped from ^0.12.0 to ^0.12.1
    * @privateaim/storage-kit bumped from ^0.12.0 to ^0.12.1

## [0.11.6](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.11.6) (2026-06-29)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.5 to ^0.12.0
    * @privateaim/server-kit bumped from ^0.11.5 to ^0.12.0
    * @privateaim/storage-kit bumped from ^0.11.5 to ^0.12.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.5 to ^0.12.0
    * @privateaim/server-kit bumped from ^0.11.5 to ^0.12.0
    * @privateaim/storage-kit bumped from ^0.11.5 to ^0.12.0

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)


### Bug Fixes

* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.4 to ^0.11.5
    * @privateaim/server-kit bumped from ^0.11.4 to ^0.11.5
    * @privateaim/storage-kit bumped from ^0.11.4 to ^0.11.5
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.4 to ^0.11.5
    * @privateaim/server-kit bumped from ^0.11.4 to ^0.11.5
    * @privateaim/storage-kit bumped from ^0.11.4 to ^0.11.5

## [0.11.4](https://github.com/PrivateAIM/hub/compare/v0.11.3...v0.11.4) (2026-06-22)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.3 to ^0.11.4
    * @privateaim/server-kit bumped from ^0.11.3 to ^0.11.4
    * @privateaim/storage-kit bumped from ^0.11.3 to ^0.11.4
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.3 to ^0.11.4
    * @privateaim/server-kit bumped from ^0.11.3 to ^0.11.4
    * @privateaim/storage-kit bumped from ^0.11.3 to ^0.11.4

## [0.11.3](https://github.com/PrivateAIM/hub/compare/v0.11.2...v0.11.3) (2026-06-16)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.2 to ^0.11.3
    * @privateaim/server-kit bumped from ^0.11.2 to ^0.11.3
    * @privateaim/storage-kit bumped from ^0.11.2 to ^0.11.3
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.2 to ^0.11.3
    * @privateaim/server-kit bumped from ^0.11.2 to ^0.11.3
    * @privateaim/storage-kit bumped from ^0.11.2 to ^0.11.3

## [0.11.2](https://github.com/PrivateAIM/hub/compare/v0.11.1...v0.11.2) (2026-06-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.1 to ^0.11.2
    * @privateaim/server-kit bumped from ^0.11.1 to ^0.11.2
    * @privateaim/storage-kit bumped from ^0.11.1 to ^0.11.2
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.1 to ^0.11.2
    * @privateaim/server-kit bumped from ^0.11.1 to ^0.11.2
    * @privateaim/storage-kit bumped from ^0.11.1 to ^0.11.2

## [0.11.1](https://github.com/PrivateAIM/hub/compare/v0.11.0...v0.11.1) (2026-06-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.11.0 to ^0.11.1
    * @privateaim/server-kit bumped from ^0.11.0 to ^0.11.1
    * @privateaim/storage-kit bumped from ^0.11.0 to ^0.11.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.11.0 to ^0.11.1
    * @privateaim/server-kit bumped from ^0.11.0 to ^0.11.1
    * @privateaim/storage-kit bumped from ^0.11.0 to ^0.11.1

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.3...v0.11.0) (2026-06-15)


### ⚠ BREAKING CHANGES

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668)) ([3b39672](https://github.com/PrivateAIM/hub/commit/3b396724ae9ac76b7f80909ec8f64d5ada2fa1c6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.3 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.3 to ^0.11.0
    * @privateaim/storage-kit bumped from ^0.10.3 to ^0.11.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.3 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.3 to ^0.11.0
    * @privateaim/storage-kit bumped from ^0.10.3 to ^0.11.0

## [0.10.3](https://github.com/PrivateAIM/hub/compare/v0.10.2...v0.10.3) (2026-06-12)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.2 to ^0.10.3
    * @privateaim/server-kit bumped from ^0.10.2 to ^0.10.3
    * @privateaim/storage-kit bumped from ^0.10.2 to ^0.10.3
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.2 to ^0.10.3
    * @privateaim/server-kit bumped from ^0.10.2 to ^0.10.3
    * @privateaim/storage-kit bumped from ^0.10.2 to ^0.10.3

## [0.10.2](https://github.com/PrivateAIM/hub/compare/v0.10.1...v0.10.2) (2026-06-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.1 to ^0.10.2
    * @privateaim/server-kit bumped from ^0.10.1 to ^0.10.2
    * @privateaim/storage-kit bumped from ^0.10.1 to ^0.10.2
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.1 to ^0.10.2
    * @privateaim/server-kit bumped from ^0.10.1 to ^0.10.2
    * @privateaim/storage-kit bumped from ^0.10.1 to ^0.10.2

## [0.10.1](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.10.1) (2026-06-02)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.10.1
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.10.1
    * @privateaim/storage-kit bumped from ^0.10.0 to ^0.10.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.10.1
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.10.1
    * @privateaim/storage-kit bumped from ^0.10.0 to ^0.10.1
