# Changelog

## [0.8.25](https://github.com/PrivateAIM/hub/compare/v0.8.24...v0.8.25) (2026-02-09)

## [0.8.24](https://github.com/PrivateAIM/hub/compare/v0.8.23...v0.8.24) (2026-02-09)

## [0.8.23](https://github.com/PrivateAIM/hub/compare/v0.8.22...v0.8.23) (2026-02-02)

## [0.8.22](https://github.com/PrivateAIM/hub/compare/v0.8.21...v0.8.22) (2026-01-27)


### Features

* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))

## [0.8.21](https://github.com/PrivateAIM/hub/compare/v0.8.20...v0.8.21) (2025-11-04)

## [0.8.20](https://github.com/PrivateAIM/hub/compare/v0.8.19...v0.8.20) (2025-10-29)


### Features

* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))

## [0.8.19](https://github.com/PrivateAIM/hub/compare/v0.8.18...v0.8.19) (2025-09-24)

## [0.8.18](https://github.com/PrivateAIM/hub/compare/v0.8.17...v0.8.18) (2025-09-16)


### Features

* set expire date for analysis-node run events ([5f6d3b3](https://github.com/PrivateAIM/hub/commit/5f6d3b3ed06dfb23d66042b61696f6140978a22c))


### Bug Fixes

* do not transmit nested event payload ([#1200](https://github.com/PrivateAIM/hub/issues/1200)) ([8180ddc](https://github.com/PrivateAIM/hub/commit/8180ddc6440963e32ce83769ed4c007d36b9533c))

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* remove rsa key generation feature ([b754dfc](https://github.com/PrivateAIM/hub/commit/b754dfce9e17a28e09319e14deb0c5473c0b2ae6))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))

## [0.8.15](https://github.com/PrivateAIM/hub/compare/v0.8.14...v0.8.15) (2025-07-30)


### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))

## [0.8.14](https://github.com/PrivateAIM/hub/compare/v0.8.13...v0.8.14) (2025-07-10)


### Features

* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))

## [0.8.13](https://github.com/PrivateAIM/hub/compare/v0.8.12...v0.8.13) (2025-05-05)

## [0.8.12](https://github.com/PrivateAIM/hub/compare/v0.8.11...v0.8.12) (2025-04-25)

## [0.8.11](https://github.com/PrivateAIM/hub/compare/v0.8.10...v0.8.11) (2025-04-24)


### Features

* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))

## [0.8.10](https://github.com/PrivateAIM/hub/compare/v0.8.9...v0.8.10) (2025-04-23)


### Bug Fixes

* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))

## [0.8.9](https://github.com/PrivateAIM/hub/compare/v0.8.8...v0.8.9) (2025-04-17)


### Features

* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))

## [0.8.8](https://github.com/PrivateAIM/hub/compare/v0.8.7...v0.8.8) (2025-04-15)


### Features

* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))

## [0.8.7](https://github.com/PrivateAIM/hub/compare/v0.8.6...v0.8.7) (2025-03-12)

## [0.8.6](https://github.com/PrivateAIM/hub/compare/v0.8.5...v0.8.6) (2025-03-04)

## [0.8.5](https://github.com/PrivateAIM/hub/compare/v0.8.4...v0.8.5) (2025-01-22)


### Features

* basic web crypto implementation (P.P. research-project) + node key-pair generation ([#912](https://github.com/PrivateAIM/hub/issues/912)) ([8cdb9d8](https://github.com/PrivateAIM/hub/commit/8cdb9d8ff140400426ccbd61f254a47fa0e3fab1))


### Bug Fixes

* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))

## [0.8.4](https://github.com/PrivateAIM/hub/compare/v0.8.3...v0.8.4) (2024-10-24)


### Features

* bump authup & implement async policy & permission evaluation ([#807](https://github.com/PrivateAIM/hub/issues/807)) ([d065562](https://github.com/PrivateAIM/hub/commit/d065562585076e26553ad5a39f4a5789f7e18f24))
* bump authup & vuecs packages + refactored navigation ([c4db8d5](https://github.com/PrivateAIM/hub/commit/c4db8d51588b3d701815e2ba2f9b80e594f3663f))

## [0.8.3](https://github.com/PrivateAIM/hub/compare/v0.8.2...v0.8.3) (2024-09-19)

## [0.8.2](https://github.com/PrivateAIM/hub/compare/v0.8.1...v0.8.2) (2024-08-28)

## [0.8.1](https://github.com/PrivateAIM/hub/compare/v0.8.0...v0.8.1) (2024-08-19)

## [0.8.0](https://github.com/PrivateAIM/hub/compare/v0.7.0...v0.8.0) (2024-07-02)


### Features

* add missing analysis-permission validation steps ([30cba38](https://github.com/PrivateAIM/hub/commit/30cba3846cd7579b9482b7cd8f622d4cb39f5529))
* simplified and adjusted permission usage across codespace ([1839f5e](https://github.com/PrivateAIM/hub/commit/1839f5eb768f120e268e57e0a496fef5eb0eca41))


### Bug Fixes

* **deps:** bump authup to v1.0.0.beta-19 ([3410786](https://github.com/PrivateAIM/hub/commit/34107860d7f810cea7b2024b0f303cd70d32a5fe))

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))

## [0.6.0](https://github.com/PrivateAIM/hub/compare/kit-v0.5.0...kit-v0.6.0) (2024-06-25)


### Features

* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))

## [0.5.0](https://github.com/PrivateAIM/hub/compare/kit-v0.4.0...kit-v0.5.0) (2024-06-12)


### Miscellaneous Chores

* **kit:** Synchronize main versions

## [0.4.0](https://github.com/PrivateAIM/hub/compare/kit-v0.4.0...kit-v0.4.0) (2024-06-12)


### Features

* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
