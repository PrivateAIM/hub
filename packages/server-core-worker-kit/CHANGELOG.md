# Changelog

## [0.7.42](https://github.com/PrivateAIM/hub/compare/v0.7.41...v0.7.42) (2026-04-30)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.40 to ^0.8.41
    * @privateaim/kit bumped from ^0.8.40 to ^0.8.41
    * @privateaim/server-kit bumped from ^0.8.40 to ^0.8.41

## [0.7.41](https://github.com/PrivateAIM/hub/compare/v0.7.40...v0.7.41) (2026-04-29)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.39 to ^0.8.40
    * @privateaim/kit bumped from ^0.8.39 to ^0.8.40
    * @privateaim/server-kit bumped from ^0.8.39 to ^0.8.40

## [0.7.40](https://github.com/PrivateAIM/hub/compare/v0.7.39...v0.7.40) (2026-04-29)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.38 to ^0.8.39
    * @privateaim/kit bumped from ^0.8.38 to ^0.8.39
    * @privateaim/server-kit bumped from ^0.8.38 to ^0.8.39

## [0.7.39](https://github.com/PrivateAIM/hub/compare/v0.7.38...v0.7.39) (2026-04-23)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.37 to ^0.8.38
    * @privateaim/kit bumped from ^0.8.37 to ^0.8.38
    * @privateaim/server-kit bumped from ^0.8.37 to ^0.8.38

## [0.7.38](https://github.com/PrivateAIM/hub/compare/v0.7.37...v0.7.38) (2026-04-22)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.36 to ^0.8.37
    * @privateaim/kit bumped from ^0.8.36 to ^0.8.37
    * @privateaim/server-kit bumped from ^0.8.36 to ^0.8.37

## [0.7.37](https://github.com/PrivateAIM/hub/compare/v0.7.36...v0.7.37) (2026-04-21)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.35 to ^0.8.36
    * @privateaim/kit bumped from ^0.8.35 to ^0.8.36
    * @privateaim/server-kit bumped from ^0.8.35 to ^0.8.36

## [0.7.36](https://github.com/PrivateAIM/hub/compare/v0.7.35...v0.7.36) (2026-04-19)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* pass queueRouter to all callers subclasses and fix DatabaseModul… ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.34 to ^0.8.35
    * @privateaim/kit bumped from ^0.8.34 to ^0.8.35
    * @privateaim/server-kit bumped from ^0.8.34 to ^0.8.35

## [0.7.35](https://github.com/PrivateAIM/hub/compare/v0.7.34...v0.7.35) (2026-04-16)


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


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.33 to ^0.8.34
    * @privateaim/kit bumped from ^0.8.33 to ^0.8.34
    * @privateaim/server-kit bumped from ^0.8.33 to ^0.8.34

## [0.7.34](https://github.com/PrivateAIM/hub/compare/v0.7.33...v0.7.34) (2026-04-16)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.32 to ^0.8.33
    * @privateaim/kit bumped from ^0.8.32 to ^0.8.33
    * @privateaim/server-kit bumped from ^0.8.32 to ^0.8.33

## [0.7.33](https://github.com/PrivateAIM/hub/compare/v0.7.32...v0.7.33) (2026-04-16)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.31 to ^0.8.32
    * @privateaim/kit bumped from ^0.8.31 to ^0.8.32
    * @privateaim/server-kit bumped from ^0.8.31 to ^0.8.32

## [0.7.32](https://github.com/PrivateAIM/hub/compare/v0.7.31...v0.7.32) (2026-03-03)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.30 to ^0.8.31
    * @privateaim/kit bumped from ^0.8.30 to ^0.8.31
    * @privateaim/server-kit bumped from ^0.8.30 to ^0.8.31

## [0.7.31](https://github.com/PrivateAIM/hub/compare/v0.7.30...v0.7.31) (2026-03-02)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.29 to ^0.8.30
    * @privateaim/kit bumped from ^0.8.29 to ^0.8.30
    * @privateaim/server-kit bumped from ^0.8.29 to ^0.8.30

## [0.7.30](https://github.com/PrivateAIM/hub/compare/v0.7.29...v0.7.30) (2026-03-02)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.28 to ^0.8.29
    * @privateaim/kit bumped from ^0.8.28 to ^0.8.29
    * @privateaim/server-kit bumped from ^0.8.28 to ^0.8.29

## [0.7.29](https://github.com/PrivateAIM/hub/compare/v0.7.28...v0.7.29) (2026-02-26)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.27 to ^0.8.28
    * @privateaim/kit bumped from ^0.8.27 to ^0.8.28
    * @privateaim/server-kit bumped from ^0.8.27 to ^0.8.28

## [0.7.28](https://github.com/PrivateAIM/hub/compare/v0.7.27...v0.7.28) (2026-02-12)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.26 to ^0.8.27
    * @privateaim/kit bumped from ^0.8.26 to ^0.8.27
    * @privateaim/server-kit bumped from ^0.8.26 to ^0.8.27

## [0.7.27](https://github.com/PrivateAIM/hub/compare/v0.7.26...v0.7.27) (2026-02-11)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.25 to ^0.8.26
    * @privateaim/kit bumped from ^0.8.25 to ^0.8.26
    * @privateaim/server-kit bumped from ^0.8.25 to ^0.8.26

## [0.7.26](https://github.com/PrivateAIM/hub/compare/v0.7.25...v0.7.26) (2026-02-09)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/server-kit bumped from ^0.8.24 to ^0.8.25

## [0.7.25](https://github.com/PrivateAIM/hub/compare/v0.7.24...v0.7.25) (2026-02-09)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/server-kit bumped from ^0.8.23 to ^0.8.24

## [0.7.24](https://github.com/PrivateAIM/hub/compare/v0.7.23...v0.7.24) (2026-02-02)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/server-kit bumped from ^0.8.22 to ^0.8.23

## [0.7.23](https://github.com/PrivateAIM/hub/compare/v0.7.22...v0.7.23) (2026-01-27)


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


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/server-kit bumped from ^0.8.21 to ^0.8.22

## [0.7.22](https://github.com/PrivateAIM/hub/compare/v0.7.21...v0.7.22) (2025-11-04)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/server-kit bumped from ^0.8.20 to ^0.8.21

## [0.7.21](https://github.com/PrivateAIM/hub/compare/v0.7.20...v0.7.21) (2025-10-29)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/server-kit bumped from ^0.8.19 to ^0.8.20

## [0.7.20](https://github.com/PrivateAIM/hub/compare/v0.7.19...v0.7.20) (2025-09-24)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/server-kit bumped from ^0.8.18 to ^0.8.19

## [0.7.19](https://github.com/PrivateAIM/hub/compare/v0.7.18...v0.7.19) (2025-09-16)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/server-kit bumped from ^0.8.17 to ^0.8.18

## [0.7.18](https://github.com/PrivateAIM/hub/compare/v0.7.17...v0.7.18) (2025-09-01)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-kit bumped from ^0.8.16 to ^0.8.17

## [0.7.17](https://github.com/PrivateAIM/hub/compare/v0.7.16...v0.7.17) (2025-08-26)


### Features

* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/server-kit bumped from ^0.8.15 to ^0.8.16

## [0.7.16](https://github.com/PrivateAIM/hub/compare/v0.7.15...v0.7.16) (2025-07-30)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/server-kit bumped from ^0.8.14 to ^0.8.15

## [0.7.15](https://github.com/PrivateAIM/hub/compare/v0.7.14...v0.7.15) (2025-07-10)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/server-kit bumped from ^0.8.13 to ^0.8.14

## [0.7.14](https://github.com/PrivateAIM/hub/compare/v0.7.13...v0.7.14) (2025-05-05)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/server-kit bumped from ^0.8.12 to ^0.8.13

## [0.7.13](https://github.com/PrivateAIM/hub/compare/v0.7.12...v0.7.13) (2025-04-25)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/server-kit bumped from ^0.8.11 to ^0.8.12

## [0.7.12](https://github.com/PrivateAIM/hub/compare/v0.7.11...v0.7.12) (2025-04-24)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/server-kit bumped from ^0.8.10 to ^0.8.11

## [0.7.11](https://github.com/PrivateAIM/hub/compare/v0.7.10...v0.7.11) (2025-04-23)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/server-kit bumped from ^0.8.9 to ^0.8.10

## [0.7.10](https://github.com/PrivateAIM/hub/compare/v0.7.9...v0.7.10) (2025-04-17)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/server-kit bumped from ^0.8.8 to ^0.8.9

## [0.7.9](https://github.com/PrivateAIM/hub/compare/v0.7.8...v0.7.9) (2025-04-15)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/server-kit bumped from ^0.8.7 to ^0.8.8

## [0.7.8](https://github.com/PrivateAIM/hub/compare/v0.7.7...v0.7.8) (2025-03-12)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/server-kit bumped from ^0.8.6 to ^0.8.7

## [0.7.7](https://github.com/PrivateAIM/hub/compare/v0.7.6...v0.7.7) (2025-03-04)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/server-kit bumped from ^0.8.5 to ^0.8.6

## [0.7.6](https://github.com/PrivateAIM/hub/compare/v0.7.5...v0.7.6) (2025-01-22)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/server-kit bumped from ^0.8.4 to ^0.8.5

## [0.7.5](https://github.com/PrivateAIM/hub/compare/v0.7.4...v0.7.5) (2024-10-24)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/server-kit bumped from ^0.8.3 to ^0.8.4

## [0.7.4](https://github.com/PrivateAIM/hub/compare/v0.7.3...v0.7.4) (2024-09-19)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/server-kit bumped from ^0.8.2 to ^0.8.3

## [0.7.3](https://github.com/PrivateAIM/hub/compare/v0.7.2...v0.7.3) (2024-08-28)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/server-kit bumped from ^0.8.1 to ^0.8.2

## [0.7.2](https://github.com/PrivateAIM/hub/compare/v0.7.1...v0.7.2) (2024-08-19)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/server-kit bumped from ^0.8.0 to ^0.8.1

## [0.7.1](https://github.com/PrivateAIM/hub/compare/v0.7.0...v0.7.1) (2024-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/server-kit bumped from ^0.7.0 to ^0.8.0

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0

## [0.6.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-kit-v0.5.0...server-analysis-manager-kit-v0.6.0) (2024-06-25)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/server-kit bumped from ^0.5.0 to ^0.6.0

## [0.5.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-kit-v0.4.0...server-analysis-manager-kit-v0.5.0) (2024-06-12)


### Miscellaneous Chores

* **server-analysis-manager-kit:** Synchronize main versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-kit bumped from ^0.4.0 to ^0.5.0

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-kit-v0.4.0...server-analysis-manager-kit-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
