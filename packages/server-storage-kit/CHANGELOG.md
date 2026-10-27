# Changelog

## [0.19.2](https://github.com/PrivateAIM/hub/compare/v0.19.1...v0.19.2) (2026-10-27)


### Bug Fixes

* **deps:** bump the minorandpatch group with 10 updates ([1cfa8c3](https://github.com/PrivateAIM/hub/commit/1cfa8c3e312a7434ff5a0ef2f3f90964e4e7225b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.19.1 to ^0.19.2
    * @privateaim/server-kit bumped from ^0.19.1 to ^0.19.2
    * @privateaim/storage-kit bumped from ^0.19.1 to ^0.19.2
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.1 to ^0.19.2
    * @privateaim/server-kit bumped from ^0.19.1 to ^0.19.2
    * @privateaim/storage-kit bumped from ^0.19.1 to ^0.19.2

## [0.19.1](https://github.com/PrivateAIM/hub/compare/v0.19.0...v0.19.1) (2026-10-20)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.19.0 to ^0.19.1
    * @privateaim/server-kit bumped from ^0.19.0 to ^0.19.1
    * @privateaim/storage-kit bumped from ^0.19.0 to ^0.19.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.0 to ^0.19.1
    * @privateaim/server-kit bumped from ^0.19.0 to ^0.19.1
    * @privateaim/storage-kit bumped from ^0.19.0 to ^0.19.1

## [0.19.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.19.0) (2026-10-19)


### ⚠ BREAKING CHANGES

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

## [0.18.0](https://github.com/PrivateAIM/hub/compare/v0.14.1...v0.18.0) (2026-10-15)


### ⚠ BREAKING CHANGES

* **server-kit:** upgrade server-core-worker and server-storage before server-core. An upgraded server-core consumes only the new queues and misses events from a worker that still publishes to the topic exchange. server-kit now requires amqp-extension ^5.0.0.
* **ui:** vuecs new majors + Tailwind v4 + repo-wide validup 0.5 + authup beta.48 ([#1668](https://github.com/PrivateAIM/hub/issues/1668))

### Features

* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* clear analysis temp bucket once all nodes are idle ([#1860](https://github.com/PrivateAIM/hub/issues/1860)) ([#1939](https://github.com/PrivateAIM/hub/issues/1939)) ([5094f2e](https://github.com/PrivateAIM/hub/commit/5094f2e288a48b1970f439d6c265baf89f0f004d))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* **server-kit:** durable ordered reply queues on amqp-extension 5 ([#1947](https://github.com/PrivateAIM/hub/issues/1947)) ([ec599bf](https://github.com/PrivateAIM/hub/commit/ec599bf6331b2c1d2e146a56396373a629321891))
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
    * @privateaim/kit bumped from ^0.17.0 to ^0.18.0
    * @privateaim/server-kit bumped from ^0.17.0 to ^0.18.0
    * @privateaim/storage-kit bumped from ^0.17.0 to ^0.18.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.17.0 to ^0.18.0
    * @privateaim/server-kit bumped from ^0.17.0 to ^0.18.0
    * @privateaim/storage-kit bumped from ^0.17.0 to ^0.18.0

## [0.14.1](https://github.com/PrivateAIM/hub/compare/v0.14.0...v0.14.1) (2026-09-25)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.16.0 to ^0.17.0
    * @privateaim/server-kit bumped from ^0.16.1 to ^0.17.0
    * @privateaim/storage-kit bumped from ^0.16.0 to ^0.17.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.16.0 to ^0.17.0
    * @privateaim/server-kit bumped from ^0.16.1 to ^0.17.0
    * @privateaim/storage-kit bumped from ^0.16.0 to ^0.17.0

## [0.14.0](https://github.com/PrivateAIM/hub/compare/v0.13.4...v0.14.0) (2026-09-11)


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
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.1 to ^0.16.0
    * @privateaim/server-kit bumped from ^0.16.0 to ^0.16.1
    * @privateaim/storage-kit bumped from ^0.15.1 to ^0.16.0

## [0.13.4](https://github.com/PrivateAIM/hub/compare/v0.13.3...v0.13.4) (2026-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.15.0 to ^0.15.1
    * @privateaim/server-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.0 to ^0.15.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.15.0 to ^0.15.1
    * @privateaim/server-kit bumped from ^0.15.0 to ^0.16.0
    * @privateaim/storage-kit bumped from ^0.15.0 to ^0.15.1

## [0.13.3](https://github.com/PrivateAIM/hub/compare/v0.13.2...v0.13.3) (2026-08-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.14.0 to ^0.15.0
    * @privateaim/server-kit bumped from ^0.14.0 to ^0.15.0
    * @privateaim/storage-kit bumped from ^0.14.0 to ^0.15.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.14.0 to ^0.15.0
    * @privateaim/server-kit bumped from ^0.14.0 to ^0.15.0
    * @privateaim/storage-kit bumped from ^0.14.0 to ^0.15.0

## [0.13.2](https://github.com/PrivateAIM/hub/compare/v0.13.1...v0.13.2) (2026-08-18)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.13.3 to ^0.14.0
    * @privateaim/server-kit bumped from ^0.13.3 to ^0.14.0
    * @privateaim/storage-kit bumped from ^0.13.3 to ^0.14.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.13.3 to ^0.14.0
    * @privateaim/server-kit bumped from ^0.13.3 to ^0.14.0
    * @privateaim/storage-kit bumped from ^0.13.3 to ^0.14.0

## [0.13.1](https://github.com/PrivateAIM/hub/compare/v0.13.0...v0.13.1) (2026-08-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/server-kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/storage-kit bumped from ^0.13.2 to ^0.13.3
  * peerDependencies
    * @privateaim/kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/server-kit bumped from ^0.13.2 to ^0.13.3
    * @privateaim/storage-kit bumped from ^0.13.2 to ^0.13.3

## [0.13.0](https://github.com/PrivateAIM/hub/compare/v0.12.8...v0.13.0) (2026-08-05)


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
    * @privateaim/kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/server-kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/storage-kit bumped from ^0.13.1 to ^0.13.2
  * peerDependencies
    * @privateaim/kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/server-kit bumped from ^0.13.1 to ^0.13.2
    * @privateaim/storage-kit bumped from ^0.13.1 to ^0.13.2

## [0.12.8](https://github.com/PrivateAIM/hub/compare/v0.12.7...v0.12.8) (2026-08-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/server-kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/storage-kit bumped from ^0.13.0 to ^0.13.1
  * peerDependencies
    * @privateaim/kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/server-kit bumped from ^0.13.0 to ^0.13.1
    * @privateaim/storage-kit bumped from ^0.13.0 to ^0.13.1

## [0.12.7](https://github.com/PrivateAIM/hub/compare/v0.12.6...v0.12.7) (2026-07-30)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/server-kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/storage-kit bumped from ^0.12.7 to ^0.13.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/server-kit bumped from ^0.12.7 to ^0.13.0
    * @privateaim/storage-kit bumped from ^0.12.7 to ^0.13.0

## [0.12.6](https://github.com/PrivateAIM/hub/compare/v0.12.5...v0.12.6) (2026-07-29)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.6 to ^0.12.7
    * @privateaim/server-kit bumped from ^0.12.6 to ^0.12.7
    * @privateaim/storage-kit bumped from ^0.12.6 to ^0.12.7
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.6 to ^0.12.7
    * @privateaim/server-kit bumped from ^0.12.6 to ^0.12.7
    * @privateaim/storage-kit bumped from ^0.12.6 to ^0.12.7

## [0.12.5](https://github.com/PrivateAIM/hub/compare/v0.12.4...v0.12.5) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.5 to ^0.12.6
    * @privateaim/server-kit bumped from ^0.12.5 to ^0.12.6
    * @privateaim/storage-kit bumped from ^0.12.5 to ^0.12.6
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.5 to ^0.12.6
    * @privateaim/server-kit bumped from ^0.12.5 to ^0.12.6
    * @privateaim/storage-kit bumped from ^0.12.5 to ^0.12.6

## [0.12.4](https://github.com/PrivateAIM/hub/compare/v0.12.3...v0.12.4) (2026-07-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.4 to ^0.12.5
    * @privateaim/server-kit bumped from ^0.12.4 to ^0.12.5
    * @privateaim/storage-kit bumped from ^0.12.4 to ^0.12.5
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.4 to ^0.12.5
    * @privateaim/server-kit bumped from ^0.12.4 to ^0.12.5
    * @privateaim/storage-kit bumped from ^0.12.4 to ^0.12.5

## [0.12.3](https://github.com/PrivateAIM/hub/compare/v0.12.2...v0.12.3) (2026-07-24)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.3 to ^0.12.4
    * @privateaim/server-kit bumped from ^0.12.3 to ^0.12.4
    * @privateaim/storage-kit bumped from ^0.12.3 to ^0.12.4
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.3 to ^0.12.4
    * @privateaim/server-kit bumped from ^0.12.3 to ^0.12.4
    * @privateaim/storage-kit bumped from ^0.12.3 to ^0.12.4

## [0.12.2](https://github.com/PrivateAIM/hub/compare/v0.12.1...v0.12.2) (2026-07-23)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.2 to ^0.12.3
    * @privateaim/server-kit bumped from ^0.12.2 to ^0.12.3
    * @privateaim/storage-kit bumped from ^0.12.2 to ^0.12.3
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.2 to ^0.12.3
    * @privateaim/server-kit bumped from ^0.12.2 to ^0.12.3
    * @privateaim/storage-kit bumped from ^0.12.2 to ^0.12.3

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.12.1 to ^0.12.2
    * @privateaim/server-kit bumped from ^0.12.1 to ^0.12.2
    * @privateaim/storage-kit bumped from ^0.12.1 to ^0.12.2
  * peerDependencies
    * @privateaim/kit bumped from ^0.12.1 to ^0.12.2
    * @privateaim/server-kit bumped from ^0.12.1 to ^0.12.2
    * @privateaim/storage-kit bumped from ^0.12.1 to ^0.12.2

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.6...v0.12.0) (2026-07-03)


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
