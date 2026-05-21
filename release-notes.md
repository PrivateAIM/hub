:robot: I have created a release *beep* *boop*
---


<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/client-vue bumped from ^0.8.45 to ^0.8.46
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/core-realtime-kit bumped from ^0.7.46 to ^0.7.47
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* add aggregation column nodes_approved + build_nodes_valid ([#1308](https://github.com/PrivateAIM/hub/issues/1308)) ([2ef0d57](https://github.com/PrivateAIM/hub/commit/2ef0d5701c66b6f4b45a162c7b9413efd8764d1f))
* add and aggregate execution_progress attribute ([#1277](https://github.com/PrivateAIM/hub/issues/1277)) ([1c8458d](https://github.com/PrivateAIM/hub/commit/1c8458d64bb3441807d13815add9f6b7d18584a8))
* add public_key property to node entity ([69fe08e](https://github.com/PrivateAIM/hub/commit/69fe08e4732852d4cbd977a9bcb145f7fa0cfc15))
* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* analysis storage manager component + http endpoint integration ([#1401](https://github.com/PrivateAIM/hub/issues/1401)) ([3ee2e02](https://github.com/PrivateAIM/hub/commit/3ee2e025c725fdafe3359fe502bc05a1757b81f2))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* command-arguments editor in analysis wizard ([#994](https://github.com/PrivateAIM/hub/issues/994)) ([e8e450f](https://github.com/PrivateAIM/hub/commit/e8e450f5e14e108cedf17844f258d898c44cbdcc))
* database migration capabilities ([#1437](https://github.com/PrivateAIM/hub/issues/1437)) ([ada0c8c](https://github.com/PrivateAIM/hub/commit/ada0c8c82c50d7ff999c60d7d6b8a6aea10064f0))
* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* entity, interface, subscriber, ... for analysis-node-log object ([#1004](https://github.com/PrivateAIM/hub/issues/1004)) ([5f261e3](https://github.com/PrivateAIM/hub/commit/5f261e3d7ea701644d92df3ab98c346baaefead8))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* explicit master image build trigger ([#1447](https://github.com/PrivateAIM/hub/issues/1447)) ([7909f52](https://github.com/PrivateAIM/hub/commit/7909f52ef32a3fc1345cea80f1e91938cdd7fe89))
* implement basic master image event log (db-) entity ([d2fdb7f](https://github.com/PrivateAIM/hub/commit/d2fdb7fed7bf1380e0350f74edb47738a1f81550))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* master-image-log-cleaner component ([bd5ec72](https://github.com/PrivateAIM/hub/commit/bd5ec722f5c35a3168c5ad01a12066651c1f901f))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* redesign analysis view and configuration ([#1254](https://github.com/PrivateAIM/hub/issues/1254)) ([b06fb94](https://github.com/PrivateAIM/hub/commit/b06fb945739afd1a82c1afc77ef493c318f243ac))
* refactor command precondition + change order in build_start command ([#981](https://github.com/PrivateAIM/hub/issues/981)) ([85aa834](https://github.com/PrivateAIM/hub/commit/85aa8348dd91a4394ed700d5f57f5de28f80f827))
* refactor process-status enums ([#1410](https://github.com/PrivateAIM/hub/issues/1410)) ([cf7a594](https://github.com/PrivateAIM/hub/commit/cf7a5947c06fbf1d6afbe1412a2e8dd992023ef4))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))
* rename run_status to execution_status ([e039cb7](https://github.com/PrivateAIM/hub/commit/e039cb7a6c436e279053b08c8de933d126637608))
* reorganized analysis wizard steps ([#978](https://github.com/PrivateAIM/hub/issues/978)) ([9e1913e](https://github.com/PrivateAIM/hub/commit/9e1913e2dbbd98f1fc018ed621d37b78261446eb))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* replace robot with client entity ([#1349](https://github.com/PrivateAIM/hub/issues/1349)) ([f4025bc](https://github.com/PrivateAIM/hub/commit/f4025bcf891783f12b609892e75feeb3f1abbef3))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store actor & request with event ([#1133](https://github.com/PrivateAIM/hub/issues/1133)) ([7310c8c](https://github.com/PrivateAIM/hub/commit/7310c8c48058734510fba08413ddf5a9fcb8137c))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* cleanup core-kit package ([dd7f2b2](https://github.com/PrivateAIM/hub/commit/dd7f2b26de2e907ce08221b357a82d393ae3c285))
* **core-kit:** mark analysis-bucket-file root field as optional in validator ([b63725f](https://github.com/PrivateAIM/hub/commit/b63725f1a3bf1b544569bade944b9edd66abda7b))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* permit client for project & analysis-bucket-file creation ([c203c48](https://github.com/PrivateAIM/hub/commit/c203c481c80b7117542a57412b082de9f64f39c3))
* remove step property in analysis logs ([6737e26](https://github.com/PrivateAIM/hub/commit/6737e263a6f9fb019568fc51a77af6c7ace5452a))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.7.47</summary>

## [0.7.47](https://github.com/PrivateAIM/hub/compare/v0.7.46...v0.7.47) (2026-05-21)


### Features

* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.8.45</summary>

## [0.8.45](https://github.com/PrivateAIM/hub/compare/v0.8.44...v0.8.45) (2026-05-21)
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* basic web crypto implementation (P.P. research-project) + node key-pair generation ([#912](https://github.com/PrivateAIM/hub/issues/912)) ([8cdb9d8](https://github.com/PrivateAIM/hub/commit/8cdb9d8ff140400426ccbd61f254a47fa0e3fab1))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))
* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
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


### Bug Fixes

* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump nanoid from 3.3.11 to 5.1.11 ([#1581](https://github.com/PrivateAIM/hub/issues/1581)) ([28d90f5](https://github.com/PrivateAIM/hub/commit/28d90f533edb3a730f7d3653a2902af0bd940ad1))
* do not transmit nested event payload ([#1200](https://github.com/PrivateAIM/hub/issues/1200)) ([8180ddc](https://github.com/PrivateAIM/hub/commit/8180ddc6440963e32ce83769ed4c007d36b9533c))
* passing tokenCreator to authorization middleware ([2d0e15a](https://github.com/PrivateAIM/hub/commit/2d0e15a34c445a5e444c5d7ea3c4b29196f287d9))
* widen build_size / bucket file size to bigint ([#1631](https://github.com/PrivateAIM/hub/issues/1631)) ([24922c0](https://github.com/PrivateAIM/hub/commit/24922c03db23c917fc0e7a7e35c27ff397ae3871))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))
</details>

<details><summary>0.7.47</summary>

## [0.7.47](https://github.com/PrivateAIM/hub/compare/v0.7.46...v0.7.47) (2026-05-21)


### Features

* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* support client identity for messenger/realtime communication ([#1464](https://github.com/PrivateAIM/hub/issues/1464)) ([5987458](https://github.com/PrivateAIM/hub/commit/59874581dbbc1101b79dd728b5786d5350074866))
* validate client-to-server messaging message ([a37cbc4](https://github.com/PrivateAIM/hub/commit/a37cbc4582ac66190aa4aad9a78aca58d34526f4))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1204](https://github.com/PrivateAIM/hub/issues/1204)) ([72923d8](https://github.com/PrivateAIM/hub/commit/72923d81911880e176907e893c62241fe7f849f3))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1114](https://github.com/PrivateAIM/hub/issues/1114)) ([1b644a8](https://github.com/PrivateAIM/hub/commit/1b644a8df5200356bc91c624379917c8dd409fdc))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1246](https://github.com/PrivateAIM/hub/issues/1246)) ([bc898f9](https://github.com/PrivateAIM/hub/commit/bc898f9e40b52d6a93b815f9a07fb517219d051f))
* **deps:** bump the minorandpatch group across 1 directory with 15 updates ([#1415](https://github.com/PrivateAIM/hub/issues/1415)) ([ae2e03c](https://github.com/PrivateAIM/hub/commit/ae2e03cea61aa74820128bc22039d5f23f51466f))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1194](https://github.com/PrivateAIM/hub/issues/1194)) ([46336b8](https://github.com/PrivateAIM/hub/commit/46336b8d8f320705bf216bab81ed61d940ff2895))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 21 updates ([#1505](https://github.com/PrivateAIM/hub/issues/1505)) ([2a2a177](https://github.com/PrivateAIM/hub/commit/2a2a17757aab9820aefd24c0bcaa815d810df979))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#1036](https://github.com/PrivateAIM/hub/issues/1036)) ([e52ea50](https://github.com/PrivateAIM/hub/commit/e52ea50288486db487ce0c5f4d2cd0b027c18861))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1091](https://github.com/PrivateAIM/hub/issues/1091)) ([5da2ab0](https://github.com/PrivateAIM/hub/commit/5da2ab0af1133b1c8408317486fb6394cdb2452e))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* add aggregation column nodes_approved + build_nodes_valid ([#1308](https://github.com/PrivateAIM/hub/issues/1308)) ([2ef0d57](https://github.com/PrivateAIM/hub/commit/2ef0d5701c66b6f4b45a162c7b9413efd8764d1f))
* add analysis incoming view on project page ([488303a](https://github.com/PrivateAIM/hub/commit/488303a2d3c77b1af978090ed7bc34d6d3dc6e2e))
* add and aggregate execution_progress attribute ([#1277](https://github.com/PrivateAIM/hub/issues/1277)) ([1c8458d](https://github.com/PrivateAIM/hub/commit/1c8458d64bb3441807d13815add9f6b7d18584a8))
* add log flags ref_type + ref_id & support loki distributor url reading ([e34f7bf](https://github.com/PrivateAIM/hub/commit/e34f7bf6ed24347ba46a439f5382db6b0c89a9df))
* add policy pages ([#1041](https://github.com/PrivateAIM/hub/issues/1041)) ([32e6df9](https://github.com/PrivateAIM/hub/commit/32e6df99bb202f83237a00e48e5636831ebf6ace))
* add public_key property to node entity ([69fe08e](https://github.com/PrivateAIM/hub/commit/69fe08e4732852d4cbd977a9bcb145f7fa0cfc15))
* add verison number to footer ([e5d8c86](https://github.com/PrivateAIM/hub/commit/e5d8c863ebfd6589510591bc9699def9ba5010e7))
* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* align service page views ([69ce42e](https://github.com/PrivateAIM/hub/commit/69ce42e458d97ab87eec833788f85406be224b0f))
* allow including master_image relation in master_image_event_logs endpoint ([#1058](https://github.com/PrivateAIM/hub/issues/1058)) ([f84e278](https://github.com/PrivateAIM/hub/commit/f84e278bd8169bcacaa06d5ce3ddba51649d09c5))
* allow node registry_id to be undefined ([a049c7a](https://github.com/PrivateAIM/hub/commit/a049c7ac5a69416ab643a908290e1047a5f7addb))
* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* analysis builds with local base images  ([#1304](https://github.com/PrivateAIM/hub/issues/1304)) ([44acb7e](https://github.com/PrivateAIM/hub/commit/44acb7eb3624ea4a7230ddd1bc2ce46884bf8d08))
* analysis storage manager component + http endpoint integration ([#1401](https://github.com/PrivateAIM/hub/issues/1401)) ([3ee2e02](https://github.com/PrivateAIM/hub/commit/3ee2e025c725fdafe3359fe502bc05a1757b81f2))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))
* authenticate hook for telemetry client ([2d1a04c](https://github.com/PrivateAIM/hub/commit/2d1a04cc0c74bea22b2187e592bdf761d6fc598a))
* avoid displaying uuids when meaningful ([0a4a13f](https://github.com/PrivateAIM/hub/commit/0a4a13f28a2a488eacdba78e5961d24f15c0bce2))
* basic web crypto implementation (P.P. research-project) + node key-pair generation ([#912](https://github.com/PrivateAIM/hub/issues/912)) ([8cdb9d8](https://github.com/PrivateAIM/hub/commit/8cdb9d8ff140400426ccbd61f254a47fa0e3fab1))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* check if bucket-file is a valid analysis bucket file ([#1389](https://github.com/PrivateAIM/hub/issues/1389)) ([62e33ea](https://github.com/PrivateAIM/hub/commit/62e33ea845ab1b4f46f519df4c31caa1cffecbdb))
* clean event entities in batches ([a4ea62d](https://github.com/PrivateAIM/hub/commit/a4ea62d81ffad5b0c862ce8407ce9e5360375615))
* cleanup authup aggregator handlers ([#1059](https://github.com/PrivateAIM/hub/issues/1059)) ([14682ed](https://github.com/PrivateAIM/hub/commit/14682ed4f52b7ea259d2cc8e214f4348073b9a10))
* cleanup authup aggregator handlers ([#1095](https://github.com/PrivateAIM/hub/issues/1095)) ([c313003](https://github.com/PrivateAIM/hub/commit/c3130035d3794142a91a1797529388701c70bdc5))
* cli and index entrpyoints ([045f3ba](https://github.com/PrivateAIM/hub/commit/045f3ba0bae085d0c1fc20f049193b4bbe91f40b))
* **client-ui:** add search to admin assignment sub-pages ([cb85128](https://github.com/PrivateAIM/hub/commit/cb851280464cf2b7f3008729861662d773552994))
* command-arguments editor in analysis wizard ([#994](https://github.com/PrivateAIM/hub/issues/994)) ([e8e450f](https://github.com/PrivateAIM/hub/commit/e8e450f5e14e108cedf17844f258d898c44cbdcc))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* create socket handlers for master-image(-group) ([#1321](https://github.com/PrivateAIM/hub/issues/1321)) ([f266417](https://github.com/PrivateAIM/hub/commit/f2664177c6db6ee334ab6a06ed905b6fb71e90a8))
* database migration capabilities ([#1437](https://github.com/PrivateAIM/hub/issues/1437)) ([ada0c8c](https://github.com/PrivateAIM/hub/commit/ada0c8c82c50d7ff999c60d7d6b8a6aea10064f0))
* emit updated analysis object ([b5724b0](https://github.com/PrivateAIM/hub/commit/b5724b0b51df229fed85a17f37e9f385371d4e0b))
* enable custom url for loki compactor & querier ([2c0d7da](https://github.com/PrivateAIM/hub/commit/2c0d7dab59e18a3ba4bbe645366e9576d00fe845))
* enable ecdh key pair generation ([#961](https://github.com/PrivateAIM/hub/issues/961)) ([4139e76](https://github.com/PrivateAIM/hub/commit/4139e7693247b2cbb0272efb5f70b8af975a351e))
* enable resetting image command arguments in wizard ([d080301](https://github.com/PrivateAIM/hub/commit/d080301333e161e70c22517d886d20fb038f7375))
* enable sorting {analysis,project}-node by analysis name ([6e0f243](https://github.com/PrivateAIM/hub/commit/6e0f2438282ba4561d3c3a6ebf0c5bdd1c2b85d6))
* enable sorting {analysis,project}-node by node name ([5cd32c0](https://github.com/PrivateAIM/hub/commit/5cd32c040ff7b1c16ed76c0b73f07403b2666aa2))
* encode file stream with gzip if supported ([#1201](https://github.com/PrivateAIM/hub/issues/1201)) ([dd4731d](https://github.com/PrivateAIM/hub/commit/dd4731deb1d8447b55032c09b727dc73869d46af))
* enhance debugging domain event publisher ([ae294a6](https://github.com/PrivateAIM/hub/commit/ae294a6151c830ae710b07c081cd3b4112631730))
* enhance logger abstraction ([d3fdca6](https://github.com/PrivateAIM/hub/commit/d3fdca6c1c18daffb76cc053be2420560999ce52))
* enhance logging in messenger service ([ac4304b](https://github.com/PrivateAIM/hub/commit/ac4304bc5bf1f456b48605bf21a80f584c930341))
* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* entity, interface, subscriber, ... for analysis-node-log object ([#1004](https://github.com/PrivateAIM/hub/issues/1004)) ([5f261e3](https://github.com/PrivateAIM/hub/commit/5f261e3d7ea701644d92df3ab98c346baaefead8))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* event components ([b4529ee](https://github.com/PrivateAIM/hub/commit/b4529eec406d03ac83c9843f06997c3e4abc4eff))
* explicit logger abstraction type ([3f25a77](https://github.com/PrivateAIM/hub/commit/3f25a77671304dc6102f4e35cc84b2d5ea773dcd))
* explicit master image build trigger ([#1447](https://github.com/PrivateAIM/hub/issues/1447)) ([7909f52](https://github.com/PrivateAIM/hub/commit/7909f52ef32a3fc1345cea80f1e91938cdd7fe89))
* explicitly enable middlewares ([dcb95e1](https://github.com/PrivateAIM/hub/commit/dcb95e1c5750f4119977d12fb4a0a74c1a8424c8))
* extract core types to server-kit package ([#1563](https://github.com/PrivateAIM/hub/issues/1563)) ([b754cf7](https://github.com/PrivateAIM/hub/commit/b754cf7024ad1890378ad59b1518d8e640f6ff4c))
* implement basic master image event log (db-) entity ([d2fdb7f](https://github.com/PrivateAIM/hub/commit/d2fdb7fed7bf1380e0350f74edb47738a1f81550))
* implemented node-robot service to automatically assign permissions ([5b422bd](https://github.com/PrivateAIM/hub/commit/5b422bd3c0a0edfc0695dbe60a0b49b37a661045))
* initial design adjustments ([7b0681b](https://github.com/PrivateAIM/hub/commit/7b0681b481c8c022173c7e0d72f1f573c0ed2783))
* initial hybrid cache (redis or memory) implementation ([b1cd569](https://github.com/PrivateAIM/hub/commit/b1cd569ff52d222f61d4b87abc921cb769de8264))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))
* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telemetry-kit package ([bdb9678](https://github.com/PrivateAIM/hub/commit/bdb9678f7a05bb70fcefdb632a3e9fc2eb541f97))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* initial telemetry-kit package ([92d1aea](https://github.com/PrivateAIM/hub/commit/92d1aea1e56ef88dd1d652425845666217ebe27e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* introduce safe publish method for domain-event-publisher ([cff0b35](https://github.com/PrivateAIM/hub/commit/cff0b3567ad11fb4a8ee42c58082122185c50c6c))
* list handler class with stack (fifo) processing ([0281360](https://github.com/PrivateAIM/hub/commit/0281360bc0ff1a549e3ca08510c6e6be8abfed1b))
* log rendering component(s) ([424ee0d](https://github.com/PrivateAIM/hub/commit/424ee0d003de17d02770a5b2bed6fe4a1e968773))
* master image card with progress & build_status ([#1431](https://github.com/PrivateAIM/hub/issues/1431)) ([f3b1b2d](https://github.com/PrivateAIM/hub/commit/f3b1b2d286064c1ddc8ee85b2b6b7dd8826179a3))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* master-image-log-cleaner component ([bd5ec72](https://github.com/PrivateAIM/hub/commit/bd5ec722f5c35a3168c5ad01a12066651c1f901f))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* **messenger:** mount default middlewares ([d7ede75](https://github.com/PrivateAIM/hub/commit/d7ede752688b73a43bb9ca99557ffb17e9594cc1))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrate to new http create validator syntax ([38ca70e](https://github.com/PrivateAIM/hub/commit/38ca70ee1b060a7d1bd22c87bddcdde21b6fbadc))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor redesign to analysis-nodes rendering in analysis view ([23224f5](https://github.com/PrivateAIM/hub/commit/23224f564b8749d8848c5c1f815f11dde290e9e1))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move analysis image command to master image analysis wizard step ([8058362](https://github.com/PrivateAIM/hub/commit/80583621594f50749ce4d6894d55461683ef4d84))
* move domains to database directory ([#1106](https://github.com/PrivateAIM/hub/issues/1106)) ([4aa9171](https://github.com/PrivateAIM/hub/commit/4aa9171b629da289aeb54b5ecd1573d1bbe6b881))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* only recompute necessary data in metadata component ([9ded46e](https://github.com/PrivateAIM/hub/commit/9ded46e2c6225c296b6c573c1e86b484a416b00d))
* pass telemetry url to vue plugin ([b6bbef4](https://github.com/PrivateAIM/hub/commit/b6bbef4bbe950dd21e93be6663bd0c8bf2dba937))
* policy sub pages + permission-policy assignment page ([d7a4d07](https://github.com/PrivateAIM/hub/commit/d7a4d0708d6d15f68058723ff7d8a3e8bf95382a))
* redesign analysis file upload ([#956](https://github.com/PrivateAIM/hub/issues/956)) ([2e8cb38](https://github.com/PrivateAIM/hub/commit/2e8cb38ac0c34ac8059362f2316e588e938243e2))
* redesign analysis view and configuration ([#1254](https://github.com/PrivateAIM/hub/issues/1254)) ([b06fb94](https://github.com/PrivateAIM/hub/commit/b06fb945739afd1a82c1afc77ef493c318f243ac))
* redesigned station picker ([#977](https://github.com/PrivateAIM/hub/issues/977)) ([d9b967b](https://github.com/PrivateAIM/hub/commit/d9b967b4cdb15cdcb1085e662b55600dc1073b37))
* refactor command precondition + change order in build_start command ([#981](https://github.com/PrivateAIM/hub/issues/981)) ([85aa834](https://github.com/PrivateAIM/hub/commit/85aa8348dd91a4394ed700d5f57f5de28f80f827))
* refactor domain event publisher & register amqp ([0f98ecf](https://github.com/PrivateAIM/hub/commit/0f98ecf3c24239d9050fd4a7c2e0bd6843cb3dc8))
* refactor http controller validation ([#880](https://github.com/PrivateAIM/hub/issues/880)) ([6e11074](https://github.com/PrivateAIM/hub/commit/6e110742f946d4d0e827f4beb497ba2612568b9a))
* refactor process-status enums ([#1410](https://github.com/PrivateAIM/hub/issues/1410)) ([cf7a594](https://github.com/PrivateAIM/hub/commit/cf7a5947c06fbf1d6afbe1412a2e8dd992023ef4))
* refactor registry component ([#1312](https://github.com/PrivateAIM/hub/issues/1312)) ([685bc44](https://github.com/PrivateAIM/hub/commit/685bc4447f6663361a004052e913c1a297e5d5b5))
* refactored domain entity nav component(s) ([#995](https://github.com/PrivateAIM/hub/issues/995)) ([3042767](https://github.com/PrivateAIM/hub/commit/30427675a4265f11780207795e4c97eb5ada3dca))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* reload button for analysis logs ([bcb8e61](https://github.com/PrivateAIM/hub/commit/bcb8e61e65dc77ce26bafcf26c8a004d12013fbc))
* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))
* remove analysis-node index property ([75110f4](https://github.com/PrivateAIM/hub/commit/75110f40a59237f8116245a08fdf39f03d1c7562))
* remove head navigation wrapper ([d236ce6](https://github.com/PrivateAIM/hub/commit/d236ce6246c57f061745631d9c616925ff8aef82))
* remove node-robot assignment to subscriber ([86cb7fa](https://github.com/PrivateAIM/hub/commit/86cb7fa878d8fd2b64bf937863ec9e46b4a3ded1))
* remove rsa key generation feature ([b754dfc](https://github.com/PrivateAIM/hub/commit/b754dfce9e17a28e09319e14deb0c5473c0b2ae6))
* remove uuids in admin area tables ([a62ebe7](https://github.com/PrivateAIM/hub/commit/a62ebe76214551c0f6a7f02db92afb4b0e88d037))
* rename run_status to execution_status ([e039cb7](https://github.com/PrivateAIM/hub/commit/e039cb7a6c436e279053b08c8de933d126637608))
* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))
* reogranize analysis-node-log handler logic to different stores (db & loki) ([eb2d74e](https://github.com/PrivateAIM/hub/commit/eb2d74e429cffc29f2197efb2f6e8cedb7dad666))
* reorganized analysis wizard steps ([#978](https://github.com/PrivateAIM/hub/issues/978)) ([9e1913e](https://github.com/PrivateAIM/hub/commit/9e1913e2dbbd98f1fc018ed621d37b78261446eb))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* replace loki with victorialogs ([#1346](https://github.com/PrivateAIM/hub/issues/1346)) ([ddf42ce](https://github.com/PrivateAIM/hub/commit/ddf42ced181c4e29ab55c2f5e1ebc155c44095c7))
* replace robot with client entity ([#1349](https://github.com/PrivateAIM/hub/issues/1349)) ([f4025bc](https://github.com/PrivateAIM/hub/commit/f4025bcf891783f12b609892e75feeb3f1abbef3))
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))
* restructured and optimizued anylysis building process ([e319c5f](https://github.com/PrivateAIM/hub/commit/e319c5f3bd1762866c2ef2281d1c648ff4f47173))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* **server-core:** call metadata recalculator on analysis create ([#1568](https://github.com/PrivateAIM/hub/issues/1568)) ([95bc34b](https://github.com/PrivateAIM/hub/commit/95bc34b8a2c9a3b676b66da9bf1f6007f03a4be4))
* **server-storage:** use sendStream + setResponseHeaderAttachment for bucket-file streaming ([c5cab43](https://github.com/PrivateAIM/hub/commit/c5cab437fc586b1635f64d2d8a7367651256f041))
* set expire date for analysis-node run events ([5f6d3b3](https://github.com/PrivateAIM/hub/commit/5f6d3b3ed06dfb23d66042b61696f6140978a22c))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))
* split analysis-server in builder,configurator & distributor ([ab3c46f](https://github.com/PrivateAIM/hub/commit/ab3c46f3e5e2f2983c634af4e4ff3cf6899f8dbc))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store actor & request with event ([#1133](https://github.com/PrivateAIM/hub/issues/1133)) ([7310c8c](https://github.com/PrivateAIM/hub/commit/7310c8c48058734510fba08413ddf5a9fcb8137c))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* submit & receive logs with loki ([#1100](https://github.com/PrivateAIM/hub/issues/1100)) ([83698d4](https://github.com/PrivateAIM/hub/commit/83698d43549cc3a34410bd01910288ba1b263201))
* support a wider range of identity-providers ([7c3359b](https://github.com/PrivateAIM/hub/commit/7c3359b87d8216cae03097d215e070ab5717b9c0))
* support additional labels for analysis-node-logs creation ([#1388](https://github.com/PrivateAIM/hub/issues/1388)) ([5d6ffb5](https://github.com/PrivateAIM/hub/commit/5d6ffb5ac9acafc18260ef36945f73ac65fcf3ff))
* support client identity for messenger/realtime communication ([#1464](https://github.com/PrivateAIM/hub/issues/1464)) ([5987458](https://github.com/PrivateAIM/hub/commit/59874581dbbc1101b79dd728b5786d5350074866))
* task manager/tracker ([#1293](https://github.com/PrivateAIM/hub/issues/1293)) ([a618c3c](https://github.com/PrivateAIM/hub/commit/a618c3c544e798df9ed169153ab573b593e59445))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))
* unified socket server creation flow ([#1172](https://github.com/PrivateAIM/hub/issues/1172)) ([1ae9835](https://github.com/PrivateAIM/hub/commit/1ae9835fcc45897347ac4bd255cce6cbf077b284))
* unify assign action for relational components ([775120a](https://github.com/PrivateAIM/hub/commit/775120a1b24b6f1f409fd003b4d5b23f00adde4d))
* use correct env name ([a4dd44d](https://github.com/PrivateAIM/hub/commit/a4dd44d5855788244518345455ba486c71861bae))
* use p-256 for ecdh algorithm ([ec9f241](https://github.com/PrivateAIM/hub/commit/ec9f241b693c8fca0275802aec3e5487711bba69))
* use zod for analysis-node-logs validation ([7ab535e](https://github.com/PrivateAIM/hub/commit/7ab535e86c636de153ac66d72862200e966c8904))
* validate client-to-server messaging message ([a37cbc4](https://github.com/PrivateAIM/hub/commit/a37cbc4582ac66190aa4aad9a78aca58d34526f4))


### Bug Fixes

* add missing attributes for analysis-node-log submission ([b0ddabd](https://github.com/PrivateAIM/hub/commit/b0ddabd4fd8a744ad15cac877454988958319261))
* add missing client_id in node read response(s) ([07f2eff](https://github.com/PrivateAIM/hub/commit/07f2eff1099c803672933b78d2454a787aad5b10))
* add missing css file ([2159f32](https://github.com/PrivateAIM/hub/commit/2159f32313be6b7782bf6ccd367542dac02824a2))
* add missing env reads for loki components ([fd095ae](https://github.com/PrivateAIM/hub/commit/fd095aee13f50bfdf43d7f95e4d2abd870c68dc6))
* add missing pagination to project node selection ([b9e6a4d](https://github.com/PrivateAIM/hub/commit/b9e6a4de22473521937d25a718233c08d5c369fd))
* add unique constraint for bucket_id + path ([2b6e000](https://github.com/PrivateAIM/hub/commit/2b6e0003aba99f80d4e6106b491ad918e2f19b38))
* allow filtering nodes by client_id ([65f0ad3](https://github.com/PrivateAIM/hub/commit/65f0ad30da1d6dfc42ae131db5d68b9d0bce5e3f))
* analysis update handler ([41a5b86](https://github.com/PrivateAIM/hub/commit/41a5b86438c5f56ac4fd50e4a7f40c8353006e52))
* analysis-node subscriber ([dfcf021](https://github.com/PrivateAIM/hub/commit/dfcf0210fd3e5e10375437c8fa841e74989c4d2e))
* analysis-node update operation ([ba6cc10](https://github.com/PrivateAIM/hub/commit/ba6cc10c99688ca25eecd4c06242dcea60b8281c))
* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))
* better ux for analysis wizard, when no entries are selected ([f3e562c](https://github.com/PrivateAIM/hub/commit/f3e562c47b77a341fc50bb0103fe987ffd240cd1))
* bootstrap-vue-next useModal,orchestrator,... usage ([5a929ae](https://github.com/PrivateAIM/hub/commit/5a929aed655c5ab6bd625c3d75eb3155e8512a14))
* bucket file deletion ([c96febb](https://github.com/PrivateAIM/hub/commit/c96febb91051efbc141ac14a9182e5a19dd9a28a))
* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* change analysis bucket file list without socket events ([#1196](https://github.com/PrivateAIM/hub/issues/1196)) ([369193c](https://github.com/PrivateAIM/hub/commit/369193c9d30aa36ecbc2bf0c7a5dabdc2c1ea7d6))
* change info log messages to debug ([c24d5ee](https://github.com/PrivateAIM/hub/commit/c24d5ee682fb6cc17e64b13f5a4bb58dfd0f2713))
* change order of vault registration ([a3d55f3](https://github.com/PrivateAIM/hub/commit/a3d55f3e90a419d1a92e87f9c40cc7f7adcedca1))
* change unique constraint for master_image virtual_path field ([c87fa19](https://github.com/PrivateAIM/hub/commit/c87fa19e991e1c685bac5a4321e2c7a62905473d))
* change unique constraint for master_image_group virtual_path field ([24e8667](https://github.com/PrivateAIM/hub/commit/24e866731e0fb92b11151641f64918c895b3f437))
* check if amqp connection string is defined ([f6611c8](https://github.com/PrivateAIM/hub/commit/f6611c870f5f24fb1ff7e5ca539bbcff7884093b))
* clean master image logs before synchronization ([76f1a69](https://github.com/PrivateAIM/hub/commit/76f1a6941db485b11a03519330571771f7170289))
* cleanup core-kit package ([dd7f2b2](https://github.com/PrivateAIM/hub/commit/dd7f2b26de2e907ce08221b357a82d393ae3c285))
* **client-vue:** send root as boolean from analysis-bucket-file toggler ([f323dde](https://github.com/PrivateAIM/hub/commit/f323dde52456c35d162d7ca5470502a03ec8707b))
* **core-kit:** mark analysis-bucket-file root field as optional in validator ([b63725f](https://github.com/PrivateAIM/hub/commit/b63725f1a3bf1b544569bade944b9edd66abda7b))
* create permissions on start-up ([7d9db61](https://github.com/PrivateAIM/hub/commit/7d9db6113b354fa127dba9e7d7db0d615e51e730))
* database base subscriber types ([f30c44e](https://github.com/PrivateAIM/hub/commit/f30c44eb7f891400de96104c2ea95b6d8fc5a438))
* database intitialisation of storage service ([a6e79d9](https://github.com/PrivateAIM/hub/commit/a6e79d9a4cd366942799d8483ca8f780ec8a048b))
* **deps-dev:** bump fast-uri from 3.1.0 to 3.1.2 ([#1597](https://github.com/PrivateAIM/hub/issues/1597)) ([37d1c7b](https://github.com/PrivateAIM/hub/commit/37d1c7bcabdbdd67ed55fcf8cf333343030ab1f8))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1516](https://github.com/PrivateAIM/hub/issues/1516)) ([ab74d1e](https://github.com/PrivateAIM/hub/commit/ab74d1e58db90d52e4c37477100f118eee09dc6d))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump @authup/kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#901](https://github.com/PrivateAIM/hub/issues/901)) ([00a447c](https://github.com/PrivateAIM/hub/commit/00a447ce40ab17b67b0809b41c4233e424303a7c))
* **deps:** bump amqp-extension from 4.0.0-beta.3 to 4.0.0 ([#1018](https://github.com/PrivateAIM/hub/issues/1018)) ([6f969f1](https://github.com/PrivateAIM/hub/commit/6f969f17c64f61da85799fd1193d7343d0130ac5))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump dotenv from 16.4.7 to 16.5.0 in the minorandpatch group ([#1028](https://github.com/PrivateAIM/hub/issues/1028)) ([181ae0f](https://github.com/PrivateAIM/hub/commit/181ae0f6cfab14df972f0ab4a6cfb41afe244038))
* **deps:** bump fast-xml-builder from 1.1.4 to 1.2.0 ([#1595](https://github.com/PrivateAIM/hub/issues/1595)) ([88c8221](https://github.com/PrivateAIM/hub/commit/88c8221985e1cbd74d41e0cff724433afe94b16e))
* **deps:** bump locter from 2.1.2 to 2.1.4 ([#816](https://github.com/PrivateAIM/hub/issues/816)) ([0af403a](https://github.com/PrivateAIM/hub/commit/0af403a0eef7bca9c4f316e6598607c2897a8065))
* **deps:** bump minio from 8.0.1 to 8.0.2 ([#850](https://github.com/PrivateAIM/hub/issues/850)) ([d6145a3](https://github.com/PrivateAIM/hub/commit/d6145a30f8f4c104435644416f83c0fa94dee109))
* **deps:** bump nanoid from 3.3.11 to 5.1.11 ([#1581](https://github.com/PrivateAIM/hub/issues/1581)) ([28d90f5](https://github.com/PrivateAIM/hub/commit/28d90f533edb3a730f7d3653a2902af0bd940ad1))
* **deps:** bump pg in the minorandpatch group across 1 directory ([#1373](https://github.com/PrivateAIM/hub/issues/1373)) ([19abc3c](https://github.com/PrivateAIM/hub/commit/19abc3c600ffc7d38ab763e0aec13ac4e15a7930))
* **deps:** bump socket.io from 4.8.0 to 4.8.1 ([#846](https://github.com/PrivateAIM/hub/issues/846)) ([ede8fb8](https://github.com/PrivateAIM/hub/commit/ede8fb866bcf0ac493c548ae5b70c738978b912a))
* **deps:** bump the majorprod group across 1 directory with 3 updates ([#1371](https://github.com/PrivateAIM/hub/issues/1371)) ([6cba140](https://github.com/PrivateAIM/hub/commit/6cba140f60b261f349968d294714f3b36badf084))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1204](https://github.com/PrivateAIM/hub/issues/1204)) ([72923d8](https://github.com/PrivateAIM/hub/commit/72923d81911880e176907e893c62241fe7f849f3))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1480](https://github.com/PrivateAIM/hub/issues/1480)) ([8d17ce6](https://github.com/PrivateAIM/hub/commit/8d17ce609123217d220e2e817122f24b09f42b72))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#962](https://github.com/PrivateAIM/hub/issues/962)) ([caf2001](https://github.com/PrivateAIM/hub/commit/caf2001c0e4dad30f24e4d66ce51ca8c89aba818))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1114](https://github.com/PrivateAIM/hub/issues/1114)) ([1b644a8](https://github.com/PrivateAIM/hub/commit/1b644a8df5200356bc91c624379917c8dd409fdc))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1441](https://github.com/PrivateAIM/hub/issues/1441)) ([57c0a94](https://github.com/PrivateAIM/hub/commit/57c0a94c2e93bb13493306333490fa43b92d73fc))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#973](https://github.com/PrivateAIM/hub/issues/973)) ([6c3b98e](https://github.com/PrivateAIM/hub/commit/6c3b98e665d641005d223e348ff0970b453dbf0e))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1246](https://github.com/PrivateAIM/hub/issues/1246)) ([bc898f9](https://github.com/PrivateAIM/hub/commit/bc898f9e40b52d6a93b815f9a07fb517219d051f))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1292](https://github.com/PrivateAIM/hub/issues/1292)) ([acdc7cb](https://github.com/PrivateAIM/hub/commit/acdc7cb8aa12e85818d69638c29ab79c74fbcbb6))
* **deps:** bump the minorandpatch group across 1 directory with 15 updates ([#1415](https://github.com/PrivateAIM/hub/issues/1415)) ([ae2e03c](https://github.com/PrivateAIM/hub/commit/ae2e03cea61aa74820128bc22039d5f23f51466f))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1132](https://github.com/PrivateAIM/hub/issues/1132)) ([f1d5add](https://github.com/PrivateAIM/hub/commit/f1d5adddfef56889d1c6aab8cefd4bfd6993eb2a))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1194](https://github.com/PrivateAIM/hub/issues/1194)) ([46336b8](https://github.com/PrivateAIM/hub/commit/46336b8d8f320705bf216bab81ed61d940ff2895))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1003](https://github.com/PrivateAIM/hub/issues/1003)) ([3bb511a](https://github.com/PrivateAIM/hub/commit/3bb511a285a0a5cff086a1b7ee2d5acf7e487a26))
* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1033](https://github.com/PrivateAIM/hub/issues/1033)) ([b228557](https://github.com/PrivateAIM/hub/commit/b228557eb213761ab97d2d9f8e618b86c50ab155))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 21 updates ([#1505](https://github.com/PrivateAIM/hub/issues/1505)) ([2a2a177](https://github.com/PrivateAIM/hub/commit/2a2a17757aab9820aefd24c0bcaa815d810df979))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1012](https://github.com/PrivateAIM/hub/issues/1012)) ([81c35b2](https://github.com/PrivateAIM/hub/commit/81c35b2f93816245deecd81df242604b6e096b44))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1019](https://github.com/PrivateAIM/hub/issues/1019)) ([a82d65d](https://github.com/PrivateAIM/hub/commit/a82d65da5e08edce3d97e7432c22d8a028853217))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1592](https://github.com/PrivateAIM/hub/issues/1592)) ([727fea3](https://github.com/PrivateAIM/hub/commit/727fea3427c2932883edd249a73b251685d76aa0))
* **deps:** bump the minorandpatch group across 1 directory with 31 updates ([#945](https://github.com/PrivateAIM/hub/issues/945)) ([448e9b8](https://github.com/PrivateAIM/hub/commit/448e9b86bf80f83c4aa8bb32ee0a75190a1d5cb8))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#1036](https://github.com/PrivateAIM/hub/issues/1036)) ([e52ea50](https://github.com/PrivateAIM/hub/commit/e52ea50288486db487ce0c5f4d2cd0b027c18861))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#906](https://github.com/PrivateAIM/hub/issues/906)) ([e11bc5f](https://github.com/PrivateAIM/hub/commit/e11bc5f3b565347af3180e8e29b4e3b79ace5961))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#997](https://github.com/PrivateAIM/hub/issues/997)) ([949ba29](https://github.com/PrivateAIM/hub/commit/949ba29f66ef6840b9e92b2504b26b7a7a7036e0))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1249](https://github.com/PrivateAIM/hub/issues/1249)) ([2fad46d](https://github.com/PrivateAIM/hub/commit/2fad46d04dd4201326d802e0b9365877b95d5f21))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1091](https://github.com/PrivateAIM/hub/issues/1091)) ([5da2ab0](https://github.com/PrivateAIM/hub/commit/5da2ab0af1133b1c8408317486fb6394cdb2452e))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1105](https://github.com/PrivateAIM/hub/issues/1105)) ([c4f9255](https://github.com/PrivateAIM/hub/commit/c4f9255832f6473ea1d3fc1793ff9ec2aefacf4c))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1399](https://github.com/PrivateAIM/hub/issues/1399)) ([e14f030](https://github.com/PrivateAIM/hub/commit/e14f03035b67cdb0058ac6194a312ea24bbfb038))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#985](https://github.com/PrivateAIM/hub/issues/985)) ([ad6992c](https://github.com/PrivateAIM/hub/commit/ad6992c95cc0cf79a88abb5d47f5fdd62c0d4222))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1052](https://github.com/PrivateAIM/hub/issues/1052)) ([d29805f](https://github.com/PrivateAIM/hub/commit/d29805f3b0306b97a56cdd9882ac90e5d66800a6))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#954](https://github.com/PrivateAIM/hub/issues/954)) ([aa26580](https://github.com/PrivateAIM/hub/commit/aa2658002e869c736ba7079018b198b324b927e7))
* **deps:** bump the minorandpatch group with 4 updates ([#1039](https://github.com/PrivateAIM/hub/issues/1039)) ([c2f6c6e](https://github.com/PrivateAIM/hub/commit/c2f6c6e0803044d7a024560d4e41b9e2119c415e))
* **deps:** bump the minorandpatch group with 5 updates ([#1468](https://github.com/PrivateAIM/hub/issues/1468)) ([b419d03](https://github.com/PrivateAIM/hub/commit/b419d035469c2c789298c5214afb06278388d42c))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* **deps:** bump uuid from 10.0.0 to 11.0.2 ([#852](https://github.com/PrivateAIM/hub/issues/852)) ([c15d400](https://github.com/PrivateAIM/hub/commit/c15d4000e8ec01d442f4b778c4bd58e7df271b53))
* **deps:** bump winston from 3.15.0 to 3.16.0 ([#878](https://github.com/PrivateAIM/hub/issues/878)) ([71a2fcd](https://github.com/PrivateAIM/hub/commit/71a2fcd6b507dc44543645acd9622d5d9372dd80))
* **deps:** install eslint-plugin-vue ([eff075b](https://github.com/PrivateAIM/hub/commit/eff075b275b57664408bc5560e23650ff11151d9))
* disable image command arguments if analysis is locked ([fac0d48](https://github.com/PrivateAIM/hub/commit/fac0d482c207bfba527b3e1692fd8dfefa189187))
* disable master image item if not built ([#1433](https://github.com/PrivateAIM/hub/issues/1433)) ([6389577](https://github.com/PrivateAIM/hub/commit/6389577effa4d6130527351a2a4bef06100c6d5f))
* do not throw error if permission for node-robot permission creation does not exist ([eac34b5](https://github.com/PrivateAIM/hub/commit/eac34b540b5422fc78658c4aad016fa66ed16bf0))
* do not transmit nested event payload ([#1200](https://github.com/PrivateAIM/hub/issues/1200)) ([8180ddc](https://github.com/PrivateAIM/hub/commit/8180ddc6440963e32ce83769ed4c007d36b9533c))
* docker file & entrypoint + added amqp config to telemetry service ([2ad782b](https://github.com/PrivateAIM/hub/commit/2ad782bf188ad087d4e4d720eb2812254dcc202e))
* domain entity nav usage ([54188ed](https://github.com/PrivateAIM/hub/commit/54188ed71cb55d6cb04bb82ca1638c36562d27e8))
* domain subscriber + queue event create task submission ([94c61ea](https://github.com/PrivateAIM/hub/commit/94c61ead90db550f50edbd9217fb1956230e9609))
* don't call analysis-metadata component through message broker ([f74b79b](https://github.com/PrivateAIM/hub/commit/f74b79babd1c44a1c6eb3456cc1005055f3267de))
* don't throw in registry component ([78a638b](https://github.com/PrivateAIM/hub/commit/78a638bcf17884a88e2f0df6ea0aaf0f3ea41742))
* don't use inherited name from group for image name ([0f9850d](https://github.com/PrivateAIM/hub/commit/0f9850dbab971d93b8913702c55036acac30d270))
* don't write debug level messages ([1a71201](https://github.com/PrivateAIM/hub/commit/1a71201e91ad9f94c316bcf9345b8a37a1a9cc50))
* emit node changes after http operaiton ([431a6f7](https://github.com/PrivateAIM/hub/commit/431a6f7cabd1457090b7f20508d6a2ef1e12fbb9))
* enable node.client to access account_secret of registryProject entity ([1cbe079](https://github.com/PrivateAIM/hub/commit/1cbe079386e5d32584956a65252bd36da1944ec1))
* enable self permission owner check for analysis permission ([#965](https://github.com/PrivateAIM/hub/issues/965)) ([a37f421](https://github.com/PrivateAIM/hub/commit/a37f421821b76468280d3c7b309a431aca1180ce))
* entity event publish method ([03b312e](https://github.com/PrivateAIM/hub/commit/03b312e425d3cdfcf65add5274a792b082ea22e9))
* entity subscriber & analysis-metadata component (trigger) ([#1280](https://github.com/PrivateAIM/hub/issues/1280)) ([b565e9e](https://github.com/PrivateAIM/hub/commit/b565e9e58e4eca147944214ded6aa8387afab0c0))
* entrypoint selection + refactor analysis steps ([#1428](https://github.com/PrivateAIM/hub/issues/1428)) ([d48e274](https://github.com/PrivateAIM/hub/commit/d48e2748abbf0793a0ad9dd41ff219b2ccce66ab))
* enum to string conversion ([95272f8](https://github.com/PrivateAIM/hub/commit/95272f8252f326f8112d7192975c143e68244826))
* expose validup validator error ([7f81aca](https://github.com/PrivateAIM/hub/commit/7f81aca88b539c6547afa6fb0aaf645d3dbb80dd))
* fake permisison provider for test execution ([480a322](https://github.com/PrivateAIM/hub/commit/480a322595a67efb80809fd0d8319babcf49d63f))
* guarantee that metadata component is called ([#1534](https://github.com/PrivateAIM/hub/issues/1534)) ([3a0d520](https://github.com/PrivateAIM/hub/commit/3a0d520336b47e995f7205ed8c02ef09743c8e79))
* handling entity delete handler ([8ded64f](https://github.com/PrivateAIM/hub/commit/8ded64f100e99da481190bfe0db30921721f2bbc))
* include .mjs in db migration pattern ([ab1f37a](https://github.com/PrivateAIM/hub/commit/ab1f37a859572a700a5f4d6bd7f2aee04b30751c))
* initializing event component + reading event batches ([482e9e6](https://github.com/PrivateAIM/hub/commit/482e9e65f2aba1811bec26c4fcebe4d4bc91234b))
* list handlers processing queue ([#1221](https://github.com/PrivateAIM/hub/issues/1221)) ([74df4b8](https://github.com/PrivateAIM/hub/commit/74df4b8adf78a1d912cfd87c541e060703b3889a))
* logger usage in http mount error middleware ([de41d68](https://github.com/PrivateAIM/hub/commit/de41d689292eccba9ec2b324bc1e8c0d9fe0bf85))
* logging max length message ([b5d7286](https://github.com/PrivateAIM/hub/commit/b5d72865376658df2501f78444d44906de1d5eb6))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* minor adjustment to pass error objects for logging ([d2083b3](https://github.com/PrivateAIM/hub/commit/d2083b3157b5a81e2fa771cbe0d2034517a4e97c))
* minor adjustment to set synchronization state ([a716ec7](https://github.com/PrivateAIM/hub/commit/a716ec714d1d9954e4bb7eb164aa56efed60d592))
* minor base subscriber refactoring ([5d9a0e8](https://github.com/PrivateAIM/hub/commit/5d9a0e877d64cc44eaf85c1ef402c80eb23b96b8))
* minor fix for node-robot permission creation ([ff45808](https://github.com/PrivateAIM/hub/commit/ff45808de43d93fd2c35d9cd35c8285a767becf8))
* minor ui adjustments ([894b988](https://github.com/PrivateAIM/hub/commit/894b9886ae7a04373ce7d8501816ee5ca1ff38bc))
* move http controllers ([f71c275](https://github.com/PrivateAIM/hub/commit/f71c275afadcd5d48afe76f57b2a361227b294a5))
* navigation generation ([ab863bf](https://github.com/PrivateAIM/hub/commit/ab863bf716118a10a8bcafdc60d60effb8e341db))
* negation in project-node update handler ([f685c88](https://github.com/PrivateAIM/hub/commit/f685c88599c77768d2c41049c20dba56455acaaf))
* only apply component metadata call delay for queue caller ([3617753](https://github.com/PrivateAIM/hub/commit/361775383241fda9943cfd9d83acd0e0fa597416))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* pass skipProjectApproval and skipAnalysisApproval to controllers ([9af7ecf](https://github.com/PrivateAIM/hub/commit/9af7ecf039ccb5950eb657fde55ccad525b28b10))
* passing tokenCreator to authorization middleware ([2d0e15a](https://github.com/PrivateAIM/hub/commit/2d0e15a34c445a5e444c5d7ea3c4b29196f287d9))
* permit client for project & analysis-bucket-file creation ([c203c48](https://github.com/PrivateAIM/hub/commit/c203c481c80b7117542a57412b082de9f64f39c3))
* properly init nodeClientService to node repository ([7f19abf](https://github.com/PrivateAIM/hub/commit/7f19abf6dae15605f93e2c37704287278f31c511))
* quick fix for analysis bucket file realtime updates ([0e6e2c2](https://github.com/PrivateAIM/hub/commit/0e6e2c2417eac63306981de485b2843cfdb44967))
* read handler ([2292a1b](https://github.com/PrivateAIM/hub/commit/2292a1b524fe9c31c4d99a0a667b90d8f55c891a))
* realtime updates & simplified analysis wizard file event management ([6c4521e](https://github.com/PrivateAIM/hub/commit/6c4521ea33908002c246e16bef8833f51828e07f))
* redirect to analysis setup page after creation ([a8556d3](https://github.com/PrivateAIM/hub/commit/a8556d3edb0adbad730e11c38734efd88858fe8f))
* register root-controller in server-storage & server-telemetry ([7d10825](https://github.com/PrivateAIM/hub/commit/7d108258db727c0f1303bb9cadeea92f86625589))
* remove distinct on clumn in event reader ([556354d](https://github.com/PrivateAIM/hub/commit/556354d407ab49b9466a964361a0428724773607))
* remove explicit dependency @pinia/nuxt ([0312149](https://github.com/PrivateAIM/hub/commit/031214963f2ecf6f2321a7e3046eb83e79f053ef))
* remove explicit pinia dependency ([61d8b72](https://github.com/PrivateAIM/hub/commit/61d8b723a2b178ad2cd4095a7ba8342c23b46050))
* remove fooo keyword in analysis-wizard ([#1195](https://github.com/PrivateAIM/hub/issues/1195)) ([b9834da](https://github.com/PrivateAIM/hub/commit/b9834da89bb77048bb39bd6322c805b6b400e3bb))
* remove invalid permission enum key access ([9955bce](https://github.com/PrivateAIM/hub/commit/9955bce52ba14eabbcf5918a8f22f39793e7c1b5))
* remove links to metrics & docs ([#1242](https://github.com/PrivateAIM/hub/issues/1242)) ([6872329](https://github.com/PrivateAIM/hub/commit/68723292f86c81006ce52f1a69ce58a10a71d669))
* remove ping emit ([1f78ceb](https://github.com/PrivateAIM/hub/commit/1f78ceb447746415c8ed5787affa3d3d3fad0b40))
* remove step property in analysis logs ([6737e26](https://github.com/PrivateAIM/hub/commit/6737e263a6f9fb019568fc51a77af6c7ace5452a))
* rename component setup fn to initialize ([cf124f8](https://github.com/PrivateAIM/hub/commit/cf124f88d7752150dd9fc5b2a33c20b99ae02b46))
* rename env record authupApiURL to authupURL ([de8e390](https://github.com/PrivateAIM/hub/commit/de8e390c8e0bd92bc44b700b4a344173fa6f8083))
* rendering analysis wizard modal ([9c28b0c](https://github.com/PrivateAIM/hub/commit/9c28b0c50c9ee9d27934af991fcf1765d16493d8))
* rendering events table ([4d3c04d](https://github.com/PrivateAIM/hub/commit/4d3c04dedb2a12d3aca5c22e35d9ab3b0bfa4e21))
* rendering master image events ([ff5d016](https://github.com/PrivateAIM/hub/commit/ff5d0169e44bba7713be7738848f40dd095033ad))
* reset image_command_arguments after master image change ([c904823](https://github.com/PrivateAIM/hub/commit/c904823cea8a6269259e60a29b9c1e2192aef4dd))
* response for non existent analysis-bucket(-file) ([#1057](https://github.com/PrivateAIM/hub/issues/1057)) ([ebe143e](https://github.com/PrivateAIM/hub/commit/ebe143e70e1b8e4541bf9ef280c4c92cd9eee365))
* restrict call response to direct component caller ([004d1ee](https://github.com/PrivateAIM/hub/commit/004d1ee9169dac95fd5e332b7acc0fa5528967e9))
* return missing properties in analysis-node-log create process ([3c997da](https://github.com/PrivateAIM/hub/commit/3c997dadead2b8cb472f8d8685d27766b4bbc0c7))
* **server-core-worker:** cleanup env creation/usage ([47dbe6f](https://github.com/PrivateAIM/hub/commit/47dbe6facaea7b822166e487779cf0b043879c68))
* **server-core:** align socket connect & disconnect messages ([dcbca9a](https://github.com/PrivateAIM/hub/commit/dcbca9a524a45ea1c57f3b80c53a93ea0f03d417))
* **server-core:** cleanup env creation/usage ([a54896a](https://github.com/PrivateAIM/hub/commit/a54896a2606a5bd8fa146831c0fed65a233a8dd2))
* **server-core:** register TypeORM subscribers after DataSource.initialize() ([971abfe](https://github.com/PrivateAIM/hub/commit/971abfe1ac4dc3e963d76656ea4623bb65770a01))
* **server-storage:** handle missing MinIO bucket on bucket-file deletion ([0f73303](https://github.com/PrivateAIM/hub/commit/0f733033ffbc3b479c0bc083e4583a88ebd4ec70))
* **server-storage:** improve bucket create/delete reliability ([2c07b0d](https://github.com/PrivateAIM/hub/commit/2c07b0d49ab449a26705049835bf0a26e0d65f1c))
* **server-storage:** process tar pack entries sequentially to prevent archive corruption ([#1562](https://github.com/PrivateAIM/hub/issues/1562)) ([262f6a6](https://github.com/PrivateAIM/hub/commit/262f6a6e6d3b91282ac13639ea867a02c07abc97))
* **server-storage:** stream packFile entries via pipeline ([#1618](https://github.com/PrivateAIM/hub/issues/1618)) ([8aae1a6](https://github.com/PrivateAIM/hub/commit/8aae1a65ac1531c92c44fbe276bac2f576c0b2da))
* **server-storage:** stream uploads end-to-end to avoid Hash.update overflow ([#1617](https://github.com/PrivateAIM/hub/issues/1617)) ([d117ee1](https://github.com/PrivateAIM/hub/commit/d117ee1ef55f412b1e9f13933d26bd6a8fb6fe19))
* **server-telemetry:** configure domain envent publisher ([b12f240](https://github.com/PrivateAIM/hub/commit/b12f240387e8add51233c0de685eb5a65466d708))
* set node default client to confidential ([0dd5c24](https://github.com/PrivateAIM/hub/commit/0dd5c2424d2eb0e954ee316893f4c029f69b692b))
* set progress to max 100 ([fc78d15](https://github.com/PrivateAIM/hub/commit/fc78d158cd2b5334b73575c5db02c4cc85a21ba7))
* set robot_id after creation for node ([234770a](https://github.com/PrivateAIM/hub/commit/234770a14568071707bbe14cee4ec3b65cc92b5e))
* set startup logs as debug message ([ba8895b](https://github.com/PrivateAIM/hub/commit/ba8895b9cf627cbaaf70ab5d1856e02da53854aa))
* setting compactor & querier url ([00953b2](https://github.com/PrivateAIM/hub/commit/00953b262ecd73c1ddca2704e62c927dcf799c40))
* setting top level log attributes ([f74439b](https://github.com/PrivateAIM/hub/commit/f74439ba31c6a30f3ed0e530671fea5d4321181c))
* skip git config step in github action ([7dd491b](https://github.com/PrivateAIM/hub/commit/7dd491bfbed26598bb2d64a341a12cb585ba4883))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* sorting of nodes (in admin view) ([8205c44](https://github.com/PrivateAIM/hub/commit/8205c449866f0e61f4b1a39ec3c21b41656749bd))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))
* synchronizing master image groups ([2599491](https://github.com/PrivateAIM/hub/commit/2599491bbf032a4e17b6e0cc8d9cc7785b77f157))
* time property in log validator ([3f54557](https://github.com/PrivateAIM/hub/commit/3f54557e9f444e29ec4a65a660ebfd0f7e76a909))
* transmitting logs ([bc6855c](https://github.com/PrivateAIM/hub/commit/bc6855c1dc99e0b831d94f1d6d469cdb3b78a64f))
* type cast buffer as blobPart ([98b8079](https://github.com/PrivateAIM/hub/commit/98b80792f3e401ca5796fcd7e33490f833789e62))
* update node if robot assignment had affect ([cf6f3b1](https://github.com/PrivateAIM/hub/commit/cf6f3b113b880adb59925afb953f19208022f35e))
* use alternative alias for event db query ([a07e45e](https://github.com/PrivateAIM/hub/commit/a07e45eced809ba4be8b8b356038fb88b9712a53))
* use image_command_arguments of analysis if defined ([f571e9e](https://github.com/PrivateAIM/hub/commit/f571e9e6c2263c22bd2580ba97d9158ac703df7e))
* use remove for deleting master image event logs ([3548c23](https://github.com/PrivateAIM/hub/commit/3548c239734811039bc1b6590f3313f1d11a9e7f))
* use the right validation group in update handler routes ([a56d41e](https://github.com/PrivateAIM/hub/commit/a56d41e606f1e08f40f32e6b98799bb9cc55153f))
* validation group in registry validator ([4f87227](https://github.com/PrivateAIM/hub/commit/4f87227f423e98dfa83049028849bf86324ad4a2))
* version of pinia ([207fcd4](https://github.com/PrivateAIM/hub/commit/207fcd435ba558029c4ec9b92c33993515ce7b15))
* widen build_size / bucket file size to bigint ([#1631](https://github.com/PrivateAIM/hub/issues/1631)) ([24922c0](https://github.com/PrivateAIM/hub/commit/24922c03db23c917fc0e7a7e35c27ff397ae3871))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* extract core types to server-kit package ([#1563](https://github.com/PrivateAIM/hub/issues/1563)) ([b754cf7](https://github.com/PrivateAIM/hub/commit/b754cf7024ad1890378ad59b1518d8e640f6ff4c))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* **server-core:** call metadata recalculator on analysis create ([#1568](https://github.com/PrivateAIM/hub/issues/1568)) ([95bc34b](https://github.com/PrivateAIM/hub/commit/95bc34b8a2c9a3b676b66da9bf1f6007f03a4be4))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* analysis-node subscriber ([dfcf021](https://github.com/PrivateAIM/hub/commit/dfcf0210fd3e5e10375437c8fa841e74989c4d2e))
* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* create permissions on start-up ([7d9db61](https://github.com/PrivateAIM/hub/commit/7d9db6113b354fa127dba9e7d7db0d615e51e730))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1592](https://github.com/PrivateAIM/hub/issues/1592)) ([727fea3](https://github.com/PrivateAIM/hub/commit/727fea3427c2932883edd249a73b251685d76aa0))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* enable node.client to access account_secret of registryProject entity ([1cbe079](https://github.com/PrivateAIM/hub/commit/1cbe079386e5d32584956a65252bd36da1944ec1))
* guarantee that metadata component is called ([#1534](https://github.com/PrivateAIM/hub/issues/1534)) ([3a0d520](https://github.com/PrivateAIM/hub/commit/3a0d520336b47e995f7205ed8c02ef09743c8e79))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* pass skipProjectApproval and skipAnalysisApproval to controllers ([9af7ecf](https://github.com/PrivateAIM/hub/commit/9af7ecf039ccb5950eb657fde55ccad525b28b10))
* properly init nodeClientService to node repository ([7f19abf](https://github.com/PrivateAIM/hub/commit/7f19abf6dae15605f93e2c37704287278f31c511))
* **server-core:** register TypeORM subscribers after DataSource.initialize() ([971abfe](https://github.com/PrivateAIM/hub/commit/971abfe1ac4dc3e963d76656ea4623bb65770a01))
* set progress to max 100 ([fc78d15](https://github.com/PrivateAIM/hub/commit/fc78d158cd2b5334b73575c5db02c4cc85a21ba7))
* widen build_size / bucket file size to bigint ([#1631](https://github.com/PrivateAIM/hub/issues/1631)) ([24922c0](https://github.com/PrivateAIM/hub/commit/24922c03db23c917fc0e7a7e35c27ff397ae3871))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/core-realtime-kit bumped from ^0.7.46 to ^0.7.47
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-core-worker-kit bumped from ^0.7.46 to ^0.7.47
    * @privateaim/server-db-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/server-http-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-realtime-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))


### Bug Fixes

* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-http-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-core-worker-kit bumped from ^0.7.46 to ^0.7.47
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.7.47</summary>

## [0.7.47](https://github.com/PrivateAIM/hub/compare/v0.7.46...v0.7.47) (2026-05-21)


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
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* **client-ui:** add search to admin assignment sub-pages ([cb85128](https://github.com/PrivateAIM/hub/commit/cb851280464cf2b7f3008729861662d773552994))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* explicitly enable middlewares ([dcb95e1](https://github.com/PrivateAIM/hub/commit/dcb95e1c5750f4119977d12fb4a0a74c1a8424c8))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* **messenger:** mount default middlewares ([d7ede75](https://github.com/PrivateAIM/hub/commit/d7ede752688b73a43bb9ca99557ffb17e9594cc1))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrate to new http create validator syntax ([38ca70e](https://github.com/PrivateAIM/hub/commit/38ca70ee1b060a7d1bd22c87bddcdde21b6fbadc))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* refactor http controller validation ([#880](https://github.com/PrivateAIM/hub/issues/880)) ([6e11074](https://github.com/PrivateAIM/hub/commit/6e110742f946d4d0e827f4beb497ba2612568b9a))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump @authup/kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#901](https://github.com/PrivateAIM/hub/issues/901)) ([00a447c](https://github.com/PrivateAIM/hub/commit/00a447ce40ab17b67b0809b41c4233e424303a7c))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump locter from 2.1.2 to 2.1.4 ([#816](https://github.com/PrivateAIM/hub/issues/816)) ([0af403a](https://github.com/PrivateAIM/hub/commit/0af403a0eef7bca9c4f316e6598607c2897a8065))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#973](https://github.com/PrivateAIM/hub/issues/973)) ([6c3b98e](https://github.com/PrivateAIM/hub/commit/6c3b98e665d641005d223e348ff0970b453dbf0e))
* **deps:** bump the minorandpatch group across 1 directory with 15 updates ([#1415](https://github.com/PrivateAIM/hub/issues/1415)) ([ae2e03c](https://github.com/PrivateAIM/hub/commit/ae2e03cea61aa74820128bc22039d5f23f51466f))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1033](https://github.com/PrivateAIM/hub/issues/1033)) ([b228557](https://github.com/PrivateAIM/hub/commit/b228557eb213761ab97d2d9f8e618b86c50ab155))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1019](https://github.com/PrivateAIM/hub/issues/1019)) ([a82d65d](https://github.com/PrivateAIM/hub/commit/a82d65da5e08edce3d97e7432c22d8a028853217))
* **deps:** bump the minorandpatch group across 1 directory with 31 updates ([#945](https://github.com/PrivateAIM/hub/issues/945)) ([448e9b8](https://github.com/PrivateAIM/hub/commit/448e9b86bf80f83c4aa8bb32ee0a75190a1d5cb8))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#997](https://github.com/PrivateAIM/hub/issues/997)) ([949ba29](https://github.com/PrivateAIM/hub/commit/949ba29f66ef6840b9e92b2504b26b7a7a7036e0))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* expose validup validator error ([7f81aca](https://github.com/PrivateAIM/hub/commit/7f81aca88b539c6547afa6fb0aaf645d3dbb80dd))
* fake permisison provider for test execution ([480a322](https://github.com/PrivateAIM/hub/commit/480a322595a67efb80809fd0d8319babcf49d63f))
* logger usage in http mount error middleware ([de41d68](https://github.com/PrivateAIM/hub/commit/de41d689292eccba9ec2b324bc1e8c0d9fe0bf85))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* database migration capabilities ([#1437](https://github.com/PrivateAIM/hub/issues/1437)) ([ada0c8c](https://github.com/PrivateAIM/hub/commit/ada0c8c82c50d7ff999c60d7d6b8a6aea10064f0))
* enable custom url for loki compactor & querier ([2c0d7da](https://github.com/PrivateAIM/hub/commit/2c0d7dab59e18a3ba4bbe645366e9576d00fe845))
* enhance debugging domain event publisher ([ae294a6](https://github.com/PrivateAIM/hub/commit/ae294a6151c830ae710b07c081cd3b4112631730))
* enhance logger abstraction ([d3fdca6](https://github.com/PrivateAIM/hub/commit/d3fdca6c1c18daffb76cc053be2420560999ce52))
* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* event components ([b4529ee](https://github.com/PrivateAIM/hub/commit/b4529eec406d03ac83c9843f06997c3e4abc4eff))
* explicit logger abstraction type ([3f25a77](https://github.com/PrivateAIM/hub/commit/3f25a77671304dc6102f4e35cc84b2d5ea773dcd))
* extract core types to server-kit package ([#1563](https://github.com/PrivateAIM/hub/issues/1563)) ([b754cf7](https://github.com/PrivateAIM/hub/commit/b754cf7024ad1890378ad59b1518d8e640f6ff4c))
* initial hybrid cache (redis or memory) implementation ([b1cd569](https://github.com/PrivateAIM/hub/commit/b1cd569ff52d222f61d4b87abc921cb769de8264))
* introduce safe publish method for domain-event-publisher ([cff0b35](https://github.com/PrivateAIM/hub/commit/cff0b3567ad11fb4a8ee42c58082122185c50c6c))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* only recompute necessary data in metadata component ([9ded46e](https://github.com/PrivateAIM/hub/commit/9ded46e2c6225c296b6c573c1e86b484a416b00d))
* refactor domain event publisher & register amqp ([0f98ecf](https://github.com/PrivateAIM/hub/commit/0f98ecf3c24239d9050fd4a7c2e0bd6843cb3dc8))
* refactor http controller validation ([#880](https://github.com/PrivateAIM/hub/issues/880)) ([6e11074](https://github.com/PrivateAIM/hub/commit/6e110742f946d4d0e827f4beb497ba2612568b9a))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store actor & request with event ([#1133](https://github.com/PrivateAIM/hub/issues/1133)) ([7310c8c](https://github.com/PrivateAIM/hub/commit/7310c8c48058734510fba08413ddf5a9fcb8137c))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* submit & receive logs with loki ([#1100](https://github.com/PrivateAIM/hub/issues/1100)) ([83698d4](https://github.com/PrivateAIM/hub/commit/83698d43549cc3a34410bd01910288ba1b263201))
* task manager/tracker ([#1293](https://github.com/PrivateAIM/hub/issues/1293)) ([a618c3c](https://github.com/PrivateAIM/hub/commit/a618c3c544e798df9ed169153ab573b593e59445))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* change info log messages to debug ([c24d5ee](https://github.com/PrivateAIM/hub/commit/c24d5ee682fb6cc17e64b13f5a4bb58dfd0f2713))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump amqp-extension from 4.0.0-beta.3 to 4.0.0 ([#1018](https://github.com/PrivateAIM/hub/issues/1018)) ([6f969f1](https://github.com/PrivateAIM/hub/commit/6f969f17c64f61da85799fd1193d7343d0130ac5))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1033](https://github.com/PrivateAIM/hub/issues/1033)) ([b228557](https://github.com/PrivateAIM/hub/commit/b228557eb213761ab97d2d9f8e618b86c50ab155))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 21 updates ([#1505](https://github.com/PrivateAIM/hub/issues/1505)) ([2a2a177](https://github.com/PrivateAIM/hub/commit/2a2a17757aab9820aefd24c0bcaa815d810df979))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1019](https://github.com/PrivateAIM/hub/issues/1019)) ([a82d65d](https://github.com/PrivateAIM/hub/commit/a82d65da5e08edce3d97e7432c22d8a028853217))
* **deps:** bump the minorandpatch group across 1 directory with 31 updates ([#945](https://github.com/PrivateAIM/hub/issues/945)) ([448e9b8](https://github.com/PrivateAIM/hub/commit/448e9b86bf80f83c4aa8bb32ee0a75190a1d5cb8))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#906](https://github.com/PrivateAIM/hub/issues/906)) ([e11bc5f](https://github.com/PrivateAIM/hub/commit/e11bc5f3b565347af3180e8e29b4e3b79ace5961))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#997](https://github.com/PrivateAIM/hub/issues/997)) ([949ba29](https://github.com/PrivateAIM/hub/commit/949ba29f66ef6840b9e92b2504b26b7a7a7036e0))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1105](https://github.com/PrivateAIM/hub/issues/1105)) ([c4f9255](https://github.com/PrivateAIM/hub/commit/c4f9255832f6473ea1d3fc1793ff9ec2aefacf4c))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* **deps:** bump the minorandpatch group with 6 updates ([#1449](https://github.com/PrivateAIM/hub/issues/1449)) ([042a8f5](https://github.com/PrivateAIM/hub/commit/042a8f5444a826d4a2c450c3186e876c41cb5a2b))
* **deps:** bump winston from 3.15.0 to 3.16.0 ([#878](https://github.com/PrivateAIM/hub/issues/878)) ([71a2fcd](https://github.com/PrivateAIM/hub/commit/71a2fcd6b507dc44543645acd9622d5d9372dd80))
* docker file & entrypoint + added amqp config to telemetry service ([2ad782b](https://github.com/PrivateAIM/hub/commit/2ad782bf188ad087d4e4d720eb2812254dcc202e))
* domain subscriber + queue event create task submission ([94c61ea](https://github.com/PrivateAIM/hub/commit/94c61ead90db550f50edbd9217fb1956230e9609))
* don't throw in registry component ([78a638b](https://github.com/PrivateAIM/hub/commit/78a638bcf17884a88e2f0df6ea0aaf0f3ea41742))
* entity event publish method ([03b312e](https://github.com/PrivateAIM/hub/commit/03b312e425d3cdfcf65add5274a792b082ea22e9))
* initializing event component + reading event batches ([482e9e6](https://github.com/PrivateAIM/hub/commit/482e9e65f2aba1811bec26c4fcebe4d4bc91234b))
* logger usage in http mount error middleware ([de41d68](https://github.com/PrivateAIM/hub/commit/de41d689292eccba9ec2b324bc1e8c0d9fe0bf85))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* rename component setup fn to initialize ([cf124f8](https://github.com/PrivateAIM/hub/commit/cf124f88d7752150dd9fc5b2a33c20b99ae02b46))
* restrict call response to direct component caller ([004d1ee](https://github.com/PrivateAIM/hub/commit/004d1ee9169dac95fd5e332b7acc0fa5528967e9))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))


### Bug Fixes

* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/messenger-kit bumped from ^0.7.46 to ^0.7.47
    * @privateaim/server-http-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-realtime-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* create socket handlers for master-image(-group) ([#1321](https://github.com/PrivateAIM/hub/issues/1321)) ([f266417](https://github.com/PrivateAIM/hub/commit/f2664177c6db6ee334ab6a06ed905b6fb71e90a8))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))
* replace robot- with client-authentication/authorization ([#1445](https://github.com/PrivateAIM/hub/issues/1445)) ([f55dc66](https://github.com/PrivateAIM/hub/commit/f55dc668df66f6efa7a0bb2285c91b1d5f2ae9ef))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))
* support client identity for messenger/realtime communication ([#1464](https://github.com/PrivateAIM/hub/issues/1464)) ([5987458](https://github.com/PrivateAIM/hub/commit/59874581dbbc1101b79dd728b5786d5350074866))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* unified socket server creation flow ([#1172](https://github.com/PrivateAIM/hub/issues/1172)) ([1ae9835](https://github.com/PrivateAIM/hub/commit/1ae9835fcc45897347ac4bd255cce6cbf077b284))
* use correct env name ([a4dd44d](https://github.com/PrivateAIM/hub/commit/a4dd44d5855788244518345455ba486c71861bae))


### Bug Fixes

* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump @authup/** packages to 1.0.0-beta.31 ([#1510](https://github.com/PrivateAIM/hub/issues/1510)) ([62feb46](https://github.com/PrivateAIM/hub/commit/62feb46e9e555bbd3e2896ec8426c7a3d146cc61))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump @authup/kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#901](https://github.com/PrivateAIM/hub/issues/901)) ([00a447c](https://github.com/PrivateAIM/hub/commit/00a447ce40ab17b67b0809b41c4233e424303a7c))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump socket.io from 4.8.0 to 4.8.1 ([#846](https://github.com/PrivateAIM/hub/issues/846)) ([ede8fb8](https://github.com/PrivateAIM/hub/commit/ede8fb866bcf0ac493c548ae5b70c738978b912a))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1019](https://github.com/PrivateAIM/hub/issues/1019)) ([a82d65d](https://github.com/PrivateAIM/hub/commit/a82d65da5e08edce3d97e7432c22d8a028853217))
* passing tokenCreator to authorization middleware ([2d0e15a](https://github.com/PrivateAIM/hub/commit/2d0e15a34c445a5e444c5d7ea3c4b29196f287d9))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* extract core types to server-kit package ([#1563](https://github.com/PrivateAIM/hub/issues/1563)) ([b754cf7](https://github.com/PrivateAIM/hub/commit/b754cf7024ad1890378ad59b1518d8e640f6ff4c))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* **server-storage:** use sendStream + setResponseHeaderAttachment for bucket-file streaming ([c5cab43](https://github.com/PrivateAIM/hub/commit/c5cab437fc586b1635f64d2d8a7367651256f041))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1592](https://github.com/PrivateAIM/hub/issues/1592)) ([727fea3](https://github.com/PrivateAIM/hub/commit/727fea3427c2932883edd249a73b251685d76aa0))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* register root-controller in server-storage & server-telemetry ([7d10825](https://github.com/PrivateAIM/hub/commit/7d108258db727c0f1303bb9cadeea92f86625589))
* **server-storage:** handle missing MinIO bucket on bucket-file deletion ([0f73303](https://github.com/PrivateAIM/hub/commit/0f733033ffbc3b479c0bc083e4583a88ebd4ec70))
* **server-storage:** improve bucket create/delete reliability ([2c07b0d](https://github.com/PrivateAIM/hub/commit/2c07b0d49ab449a26705049835bf0a26e0d65f1c))
* **server-storage:** process tar pack entries sequentially to prevent archive corruption ([#1562](https://github.com/PrivateAIM/hub/issues/1562)) ([262f6a6](https://github.com/PrivateAIM/hub/commit/262f6a6e6d3b91282ac13639ea867a02c07abc97))
* **server-storage:** stream packFile entries via pipeline ([#1618](https://github.com/PrivateAIM/hub/issues/1618)) ([8aae1a6](https://github.com/PrivateAIM/hub/commit/8aae1a65ac1531c92c44fbe276bac2f576c0b2da))
* **server-storage:** stream uploads end-to-end to avoid Hash.update overflow ([#1617](https://github.com/PrivateAIM/hub/issues/1617)) ([d117ee1](https://github.com/PrivateAIM/hub/commit/d117ee1ef55f412b1e9f13933d26bd6a8fb6fe19))
* widen build_size / bucket file size to bigint ([#1631](https://github.com/PrivateAIM/hub/issues/1631)) ([24922c0](https://github.com/PrivateAIM/hub/commit/24922c03db23c917fc0e7a7e35c27ff397ae3871))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-db-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/server-http-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/storage-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.11.0</summary>

## [0.11.0](https://github.com/PrivateAIM/hub/compare/v0.10.0...v0.11.0) (2026-05-21)


###   BREAKING CHANGES

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624))
* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607))

### Features

* extract core types to server-kit package ([#1563](https://github.com/PrivateAIM/hub/issues/1563)) ([b754cf7](https://github.com/PrivateAIM/hub/commit/b754cf7024ad1890378ad59b1518d8e640f6ff4c))
* migrate to routup v5 with web API handlers ([#1587](https://github.com/PrivateAIM/hub/issues/1587)) ([01c5881](https://github.com/PrivateAIM/hub/commit/01c5881294c4a2768b4842b0ab3ce9bc1345f732))
* typed controller signatures, validators in kit packages, swagger via @trapi/cli ([#1590](https://github.com/PrivateAIM/hub/issues/1590)) ([74a35c8](https://github.com/PrivateAIM/hub/commit/74a35c8bed92036a00b581868589c40a192278aa))


### Bug Fixes

* **build:** add rootDir to service tsconfig.build.json files ([9128c63](https://github.com/PrivateAIM/hub/commit/9128c633160849e9ca20fcd165b64be80a004b64))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* bump authup to v1.0.0-beta.36 ([76fb047](https://github.com/PrivateAIM/hub/commit/76fb047dfd551e4e3eddb23986693a19e68f8d3c))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.34 ([ab6e812](https://github.com/PrivateAIM/hub/commit/ab6e81246850e6378e364afaf036d4b4155b1673))
* **deps:** bump [@authup](https://github.com/authup) packages to 1.0.0-beta.35 and align admin pages ([a2d742e](https://github.com/PrivateAIM/hub/commit/a2d742e33638ddc577e44bfffcf85b2698579527))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1626](https://github.com/PrivateAIM/hub/issues/1626)) ([73580a8](https://github.com/PrivateAIM/hub/commit/73580a804599727c9436652f08d5689e7063f9d5))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1589](https://github.com/PrivateAIM/hub/issues/1589)) ([3358afc](https://github.com/PrivateAIM/hub/commit/3358afc590f01884ac0f6c3faaa6ef9423e47422))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1592](https://github.com/PrivateAIM/hub/issues/1592)) ([727fea3](https://github.com/PrivateAIM/hub/commit/727fea3427c2932883edd249a73b251685d76aa0))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1552](https://github.com/PrivateAIM/hub/issues/1552)) ([577f530](https://github.com/PrivateAIM/hub/commit/577f5305c6358470e5bf9d26faeb1d2f3b64a3dd))
* migration path + build-/distribution-status aggregation ([#1529](https://github.com/PrivateAIM/hub/issues/1529)) ([6ad6c1d](https://github.com/PrivateAIM/hub/commit/6ad6c1d11d6e9dd3be154b234a1bfae8fc906ff1))
* pass queueRouter to all callers subclasses and fix DatabaseModul& ([#1541](https://github.com/PrivateAIM/hub/issues/1541)) ([558f1da](https://github.com/PrivateAIM/hub/commit/558f1dafab2da1a82a5919ed47bf4c5620404971))
* register root-controller in server-storage & server-telemetry ([7d10825](https://github.com/PrivateAIM/hub/commit/7d108258db727c0f1303bb9cadeea92f86625589))


### Miscellaneous Chores

* **deps:** bump routup and plugins to v6 ([#1624](https://github.com/PrivateAIM/hub/issues/1624)) ([e49dbd2](https://github.com/PrivateAIM/hub/commit/e49dbd22963e12232def70254eb93ff291422fc0))


### Code Refactoring

* **errors:** introduce @privateaim/errors + sweep @ebec/http ([#1607](https://github.com/PrivateAIM/hub/issues/1607)) ([954e06f](https://github.com/PrivateAIM/hub/commit/954e06fbf8facb49f897b32be84bb93c51a85622))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-db-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/server-http-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-telemetry-kit bumped from ^0.8.45 to ^0.8.46
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/server-kit bumped from ^0.10.0 to ^0.11.0
    * @privateaim/telemetry-kit bumped from ^0.8.45 to ^0.8.46
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
</details>

<details><summary>0.8.46</summary>

## [0.8.46](https://github.com/PrivateAIM/hub/compare/v0.8.45...v0.8.46) (2026-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.10.0 to ^0.11.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).