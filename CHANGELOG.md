# Changelog

## [0.8.27](https://github.com/PrivateAIM/hub/compare/v0.8.26...v0.8.27) (2026-02-12)


### Features

* refactor process-status enums ([#1410](https://github.com/PrivateAIM/hub/issues/1410)) ([cf7a594](https://github.com/PrivateAIM/hub/commit/cf7a5947c06fbf1d6afbe1412a2e8dd992023ef4))

## [0.8.26](https://github.com/PrivateAIM/hub/compare/v0.8.25...v0.8.26) (2026-02-11)


### Bug Fixes

* allow filtering nodes by client_id ([65f0ad3](https://github.com/PrivateAIM/hub/commit/65f0ad30da1d6dfc42ae131db5d68b9d0bce5e3f))
* permit client for project & analysis-bucket-file creation ([c203c48](https://github.com/PrivateAIM/hub/commit/c203c481c80b7117542a57412b082de9f64f39c3))
* set node default client to confidential ([0dd5c24](https://github.com/PrivateAIM/hub/commit/0dd5c2424d2eb0e954ee316893f4c029f69b692b))

## [0.8.25](https://github.com/PrivateAIM/hub/compare/v0.8.24...v0.8.25) (2026-02-09)

## [0.8.24](https://github.com/PrivateAIM/hub/compare/v0.8.23...v0.8.24) (2026-02-09)


### Features

* analysis storage manager component + http endpoint integration ([#1401](https://github.com/PrivateAIM/hub/issues/1401)) ([3ee2e02](https://github.com/PrivateAIM/hub/commit/3ee2e025c725fdafe3359fe502bc05a1757b81f2))


### Bug Fixes

* add missing client_id in node read response(s) ([07f2eff](https://github.com/PrivateAIM/hub/commit/07f2eff1099c803672933b78d2454a787aad5b10))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1399](https://github.com/PrivateAIM/hub/issues/1399)) ([e14f030](https://github.com/PrivateAIM/hub/commit/e14f03035b67cdb0058ac6194a312ea24bbfb038))
* time property in log validator ([3f54557](https://github.com/PrivateAIM/hub/commit/3f54557e9f444e29ec4a65a660ebfd0f7e76a909))

## [0.8.23](https://github.com/PrivateAIM/hub/compare/v0.8.22...v0.8.23) (2026-02-02)


### Features

* check if bucket-file is a valid analysis bucket file ([#1389](https://github.com/PrivateAIM/hub/issues/1389)) ([62e33ea](https://github.com/PrivateAIM/hub/commit/62e33ea845ab1b4f46f519df4c31caa1cffecbdb))
* support additional labels for analysis-node-logs creation ([#1388](https://github.com/PrivateAIM/hub/issues/1388)) ([5d6ffb5](https://github.com/PrivateAIM/hub/commit/5d6ffb5ac9acafc18260ef36945f73ac65fcf3ff))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* don't throw in registry component ([78a638b](https://github.com/PrivateAIM/hub/commit/78a638bcf17884a88e2f0df6ea0aaf0f3ea41742))
* initializing event component + reading event batches ([482e9e6](https://github.com/PrivateAIM/hub/commit/482e9e65f2aba1811bec26c4fcebe4d4bc91234b))

## [0.8.22](https://github.com/PrivateAIM/hub/compare/v0.8.21...v0.8.22) (2026-01-27)


### Features

* add aggregation column nodes_approved + build_nodes_valid ([#1308](https://github.com/PrivateAIM/hub/issues/1308)) ([2ef0d57](https://github.com/PrivateAIM/hub/commit/2ef0d5701c66b6f4b45a162c7b9413efd8764d1f))
* add and aggregate execution_progress attribute ([#1277](https://github.com/PrivateAIM/hub/issues/1277)) ([1c8458d](https://github.com/PrivateAIM/hub/commit/1c8458d64bb3441807d13815add9f6b7d18584a8))
* analysis builds with local base images  ([#1304](https://github.com/PrivateAIM/hub/issues/1304)) ([44acb7e](https://github.com/PrivateAIM/hub/commit/44acb7eb3624ea4a7230ddd1bc2ce46884bf8d08))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* component caller(s) implementation ([#1295](https://github.com/PrivateAIM/hub/issues/1295)) ([3b21fe1](https://github.com/PrivateAIM/hub/commit/3b21fe1b2cf3d47332722578cff67359442d84eb))
* create socket handlers for master-image(-group) ([#1321](https://github.com/PrivateAIM/hub/issues/1321)) ([f266417](https://github.com/PrivateAIM/hub/commit/f2664177c6db6ee334ab6a06ed905b6fb71e90a8))
* master-image component(s) ([#1300](https://github.com/PrivateAIM/hub/issues/1300)) ([94cd580](https://github.com/PrivateAIM/hub/commit/94cd58057082ba9c48dae52346bfe5a8cabb28d8))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* only recompute necessary data in metadata component ([9ded46e](https://github.com/PrivateAIM/hub/commit/9ded46e2c6225c296b6c573c1e86b484a416b00d))
* refactor registry component ([#1312](https://github.com/PrivateAIM/hub/issues/1312)) ([685bc44](https://github.com/PrivateAIM/hub/commit/685bc4447f6663361a004052e913c1a297e5d5b5))
* remove node-robot assignment to subscriber ([86cb7fa](https://github.com/PrivateAIM/hub/commit/86cb7fa878d8fd2b64bf937863ec9e46b4a3ded1))
* rename run_status to execution_status ([e039cb7](https://github.com/PrivateAIM/hub/commit/e039cb7a6c436e279053b08c8de933d126637608))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* replace loki with victorialogs ([#1346](https://github.com/PrivateAIM/hub/issues/1346)) ([ddf42ce](https://github.com/PrivateAIM/hub/commit/ddf42ced181c4e29ab55c2f5e1ebc155c44095c7))
* replace robot with client entity ([#1349](https://github.com/PrivateAIM/hub/issues/1349)) ([f4025bc](https://github.com/PrivateAIM/hub/commit/f4025bcf891783f12b609892e75feeb3f1abbef3))
* restructured and optimizued anylysis building process ([e319c5f](https://github.com/PrivateAIM/hub/commit/e319c5f3bd1762866c2ef2281d1c648ff4f47173))
* split analysis-server in builder,configurator & distributor ([ab3c46f](https://github.com/PrivateAIM/hub/commit/ab3c46f3e5e2f2983c634af4e4ff3cf6899f8dbc))
* storage components + component/handler refactoring ([#1289](https://github.com/PrivateAIM/hub/issues/1289)) ([c22db47](https://github.com/PrivateAIM/hub/commit/c22db471bb2a7e71f33a299926f38fde551efc39))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))
* task manager/tracker ([#1293](https://github.com/PrivateAIM/hub/issues/1293)) ([a618c3c](https://github.com/PrivateAIM/hub/commit/a618c3c544e798df9ed169153ab573b593e59445))


### Bug Fixes

* change order of vault registration ([a3d55f3](https://github.com/PrivateAIM/hub/commit/a3d55f3e90a419d1a92e87f9c40cc7f7adcedca1))
* **deps:** bump pg in the minorandpatch group across 1 directory ([#1373](https://github.com/PrivateAIM/hub/issues/1373)) ([19abc3c](https://github.com/PrivateAIM/hub/commit/19abc3c600ffc7d38ab763e0aec13ac4e15a7930))
* **deps:** bump the majorprod group across 1 directory with 3 updates ([#1371](https://github.com/PrivateAIM/hub/issues/1371)) ([6cba140](https://github.com/PrivateAIM/hub/commit/6cba140f60b261f349968d294714f3b36badf084))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1292](https://github.com/PrivateAIM/hub/issues/1292)) ([acdc7cb](https://github.com/PrivateAIM/hub/commit/acdc7cb8aa12e85818d69638c29ab79c74fbcbb6))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* **deps:** install eslint-plugin-vue ([eff075b](https://github.com/PrivateAIM/hub/commit/eff075b275b57664408bc5560e23650ff11151d9))
* disable image command arguments if analysis is locked ([fac0d48](https://github.com/PrivateAIM/hub/commit/fac0d482c207bfba527b3e1692fd8dfefa189187))
* entity subscriber & analysis-metadata component (trigger) ([#1280](https://github.com/PrivateAIM/hub/issues/1280)) ([b565e9e](https://github.com/PrivateAIM/hub/commit/b565e9e58e4eca147944214ded6aa8387afab0c0))
* only apply component metadata call delay for queue caller ([3617753](https://github.com/PrivateAIM/hub/commit/361775383241fda9943cfd9d83acd0e0fa597416))
* restrict call response to direct component caller ([004d1ee](https://github.com/PrivateAIM/hub/commit/004d1ee9169dac95fd5e332b7acc0fa5528967e9))
* update node if robot assignment had affect ([cf6f3b1](https://github.com/PrivateAIM/hub/commit/cf6f3b113b880adb59925afb953f19208022f35e))

## [0.8.21](https://github.com/PrivateAIM/hub/compare/v0.8.20...v0.8.21) (2025-11-04)


### Features

* clean event entities in batches ([a4ea62d](https://github.com/PrivateAIM/hub/commit/a4ea62d81ffad5b0c862ce8407ce9e5360375615))
* redesign analysis view and configuration ([#1254](https://github.com/PrivateAIM/hub/issues/1254)) ([b06fb94](https://github.com/PrivateAIM/hub/commit/b06fb945739afd1a82c1afc77ef493c318f243ac))


### Bug Fixes

* remove distinct on clumn in event reader ([556354d](https://github.com/PrivateAIM/hub/commit/556354d407ab49b9466a964361a0428724773607))

## [0.8.20](https://github.com/PrivateAIM/hub/compare/v0.8.19...v0.8.20) (2025-10-29)


### Features

* analysis aggregated configuration columns  ([#1267](https://github.com/PrivateAIM/hub/issues/1267)) ([e60c460](https://github.com/PrivateAIM/hub/commit/e60c460c1f701f8b73450e7c618d00de27f8462a))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1246](https://github.com/PrivateAIM/hub/issues/1246)) ([bc898f9](https://github.com/PrivateAIM/hub/commit/bc898f9e40b52d6a93b815f9a07fb517219d051f))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1249](https://github.com/PrivateAIM/hub/issues/1249)) ([2fad46d](https://github.com/PrivateAIM/hub/commit/2fad46d04dd4201326d802e0b9365877b95d5f21))
* remove links to metrics & docs ([#1242](https://github.com/PrivateAIM/hub/issues/1242)) ([6872329](https://github.com/PrivateAIM/hub/commit/68723292f86c81006ce52f1a69ce58a10a71d669))
* rename component setup fn to initialize ([cf124f8](https://github.com/PrivateAIM/hub/commit/cf124f88d7752150dd9fc5b2a33c20b99ae02b46))

## [0.8.19](https://github.com/PrivateAIM/hub/compare/v0.8.18...v0.8.19) (2025-09-24)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1204](https://github.com/PrivateAIM/hub/issues/1204)) ([72923d8](https://github.com/PrivateAIM/hub/commit/72923d81911880e176907e893c62241fe7f849f3))
* list handlers processing queue ([#1221](https://github.com/PrivateAIM/hub/issues/1221)) ([74df4b8](https://github.com/PrivateAIM/hub/commit/74df4b8adf78a1d912cfd87c541e060703b3889a))

## [0.8.18](https://github.com/PrivateAIM/hub/compare/v0.8.17...v0.8.18) (2025-09-16)


### Features

* encode file stream with gzip if supported ([#1201](https://github.com/PrivateAIM/hub/issues/1201)) ([dd4731d](https://github.com/PrivateAIM/hub/commit/dd4731deb1d8447b55032c09b727dc73869d46af))
* list handler class with stack (fifo) processing ([0281360](https://github.com/PrivateAIM/hub/commit/0281360bc0ff1a549e3ca08510c6e6be8abfed1b))
* reload button for analysis logs ([bcb8e61](https://github.com/PrivateAIM/hub/commit/bcb8e61e65dc77ce26bafcf26c8a004d12013fbc))
* set expire date for analysis-node run events ([5f6d3b3](https://github.com/PrivateAIM/hub/commit/5f6d3b3ed06dfb23d66042b61696f6140978a22c))
* use correct env name ([a4dd44d](https://github.com/PrivateAIM/hub/commit/a4dd44d5855788244518345455ba486c71861bae))


### Bug Fixes

* bootstrap-vue-next useModal,orchestrator,... usage ([5a929ae](https://github.com/PrivateAIM/hub/commit/5a929aed655c5ab6bd625c3d75eb3155e8512a14))
* bucket file deletion ([c96febb](https://github.com/PrivateAIM/hub/commit/c96febb91051efbc141ac14a9182e5a19dd9a28a))
* change analysis bucket file list without socket events ([#1196](https://github.com/PrivateAIM/hub/issues/1196)) ([369193c](https://github.com/PrivateAIM/hub/commit/369193c9d30aa36ecbc2bf0c7a5dabdc2c1ea7d6))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1194](https://github.com/PrivateAIM/hub/issues/1194)) ([46336b8](https://github.com/PrivateAIM/hub/commit/46336b8d8f320705bf216bab81ed61d940ff2895))
* do not transmit nested event payload ([#1200](https://github.com/PrivateAIM/hub/issues/1200)) ([8180ddc](https://github.com/PrivateAIM/hub/commit/8180ddc6440963e32ce83769ed4c007d36b9533c))
* enum to string conversion ([95272f8](https://github.com/PrivateAIM/hub/commit/95272f8252f326f8112d7192975c143e68244826))
* expose validup validator error ([7f81aca](https://github.com/PrivateAIM/hub/commit/7f81aca88b539c6547afa6fb0aaf645d3dbb80dd))
* minor adjustment to pass error objects for logging ([d2083b3](https://github.com/PrivateAIM/hub/commit/d2083b3157b5a81e2fa771cbe0d2034517a4e97c))
* remove fooo keyword in analysis-wizard ([#1195](https://github.com/PrivateAIM/hub/issues/1195)) ([b9834da](https://github.com/PrivateAIM/hub/commit/b9834da89bb77048bb39bd6322c805b6b400e3bb))
* rendering analysis wizard modal ([9c28b0c](https://github.com/PrivateAIM/hub/commit/9c28b0c50c9ee9d27934af991fcf1765d16493d8))
* rendering master image events ([ff5d016](https://github.com/PrivateAIM/hub/commit/ff5d0169e44bba7713be7738848f40dd095033ad))
* setting top level log attributes ([f74439b](https://github.com/PrivateAIM/hub/commit/f74439ba31c6a30f3ed0e530671fea5d4321181c))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)


### Features

* add log flags ref_type + ref_id & support loki distributor url reading ([e34f7bf](https://github.com/PrivateAIM/hub/commit/e34f7bf6ed24347ba46a439f5382db6b0c89a9df))
* enhance debugging domain event publisher ([ae294a6](https://github.com/PrivateAIM/hub/commit/ae294a6151c830ae710b07c081cd3b4112631730))
* enhance logger abstraction ([d3fdca6](https://github.com/PrivateAIM/hub/commit/d3fdca6c1c18daffb76cc053be2420560999ce52))
* explicit logger abstraction type ([3f25a77](https://github.com/PrivateAIM/hub/commit/3f25a77671304dc6102f4e35cc84b2d5ea773dcd))
* refactor domain event publisher & register amqp ([0f98ecf](https://github.com/PrivateAIM/hub/commit/0f98ecf3c24239d9050fd4a7c2e0bd6843cb3dc8))
* remove analysis-node index property ([75110f4](https://github.com/PrivateAIM/hub/commit/75110f40a59237f8116245a08fdf39f03d1c7562))
* track socket engine errors ([39771e4](https://github.com/PrivateAIM/hub/commit/39771e4c7d1eb2f14d2dad968b293d3bd513397c))
* unified socket server creation flow ([#1172](https://github.com/PrivateAIM/hub/issues/1172)) ([1ae9835](https://github.com/PrivateAIM/hub/commit/1ae9835fcc45897347ac4bd255cce6cbf077b284))
* use zod for analysis-node-logs validation ([7ab535e](https://github.com/PrivateAIM/hub/commit/7ab535e86c636de153ac66d72862200e966c8904))


### Bug Fixes

* add missing attributes for analysis-node-log submission ([b0ddabd](https://github.com/PrivateAIM/hub/commit/b0ddabd4fd8a744ad15cac877454988958319261))
* change info log messages to debug ([c24d5ee](https://github.com/PrivateAIM/hub/commit/c24d5ee682fb6cc17e64b13f5a4bb58dfd0f2713))
* check if amqp connection string is defined ([f6611c8](https://github.com/PrivateAIM/hub/commit/f6611c870f5f24fb1ff7e5ca539bbcff7884093b))
* database base subscriber types ([f30c44e](https://github.com/PrivateAIM/hub/commit/f30c44eb7f891400de96104c2ea95b6d8fc5a438))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))
* entity event publish method ([03b312e](https://github.com/PrivateAIM/hub/commit/03b312e425d3cdfcf65add5274a792b082ea22e9))
* logger usage in http mount error middleware ([de41d68](https://github.com/PrivateAIM/hub/commit/de41d689292eccba9ec2b324bc1e8c0d9fe0bf85))
* logging max length message ([b5d7286](https://github.com/PrivateAIM/hub/commit/b5d72865376658df2501f78444d44906de1d5eb6))
* **server-core-worker:** cleanup env creation/usage ([47dbe6f](https://github.com/PrivateAIM/hub/commit/47dbe6facaea7b822166e487779cf0b043879c68))
* **server-core:** align socket connect & disconnect messages ([dcbca9a](https://github.com/PrivateAIM/hub/commit/dcbca9a524a45ea1c57f3b80c53a93ea0f03d417))
* **server-core:** cleanup env creation/usage ([a54896a](https://github.com/PrivateAIM/hub/commit/a54896a2606a5bd8fa146831c0fed65a233a8dd2))
* **server-telemetry:** configure domain envent publisher ([b12f240](https://github.com/PrivateAIM/hub/commit/b12f240387e8add51233c0de685eb5a65466d708))
* set startup logs as debug message ([ba8895b](https://github.com/PrivateAIM/hub/commit/ba8895b9cf627cbaaf70ab5d1856e02da53854aa))
* setting compactor & querier url ([00953b2](https://github.com/PrivateAIM/hub/commit/00953b262ecd73c1ddca2704e62c927dcf799c40))
* use alternative alias for event db query ([a07e45e](https://github.com/PrivateAIM/hub/commit/a07e45eced809ba4be8b8b356038fb88b9712a53))

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* authenticate hook for telemetry client ([2d1a04c](https://github.com/PrivateAIM/hub/commit/2d1a04cc0c74bea22b2187e592bdf761d6fc598a))
* cli and index entrpyoints ([045f3ba](https://github.com/PrivateAIM/hub/commit/045f3ba0bae085d0c1fc20f049193b4bbe91f40b))
* event components ([b4529ee](https://github.com/PrivateAIM/hub/commit/b4529eec406d03ac83c9843f06997c3e4abc4eff))
* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telemetry-kit package ([bdb9678](https://github.com/PrivateAIM/hub/commit/bdb9678f7a05bb70fcefdb632a3e9fc2eb541f97))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* initial telemetry-kit package ([92d1aea](https://github.com/PrivateAIM/hub/commit/92d1aea1e56ef88dd1d652425845666217ebe27e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* log rendering component(s) ([424ee0d](https://github.com/PrivateAIM/hub/commit/424ee0d003de17d02770a5b2bed6fe4a1e968773))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* pass telemetry url to vue plugin ([b6bbef4](https://github.com/PrivateAIM/hub/commit/b6bbef4bbe950dd21e93be6663bd0c8bf2dba937))
* remove rsa key generation feature ([b754dfc](https://github.com/PrivateAIM/hub/commit/b754dfce9e17a28e09319e14deb0c5473c0b2ae6))
* rename server-analysis-manager to server-core-worker service ([#1166](https://github.com/PrivateAIM/hub/issues/1166)) ([fd5aa52](https://github.com/PrivateAIM/hub/commit/fd5aa52083d77c4083017b4447043818ea18a200))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))
* store actor & request with event ([#1133](https://github.com/PrivateAIM/hub/issues/1133)) ([7310c8c](https://github.com/PrivateAIM/hub/commit/7310c8c48058734510fba08413ddf5a9fcb8137c))


### Bug Fixes

* cleanup core-kit package ([dd7f2b2](https://github.com/PrivateAIM/hub/commit/dd7f2b26de2e907ce08221b357a82d393ae3c285))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1132](https://github.com/PrivateAIM/hub/issues/1132)) ([f1d5add](https://github.com/PrivateAIM/hub/commit/f1d5adddfef56889d1c6aab8cefd4bfd6993eb2a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))
* docker file & entrypoint + added amqp config to telemetry service ([2ad782b](https://github.com/PrivateAIM/hub/commit/2ad782bf188ad087d4e4d720eb2812254dcc202e))
* domain subscriber + queue event create task submission ([94c61ea](https://github.com/PrivateAIM/hub/commit/94c61ead90db550f50edbd9217fb1956230e9609))
* don't write debug level messages ([1a71201](https://github.com/PrivateAIM/hub/commit/1a71201e91ad9f94c316bcf9345b8a37a1a9cc50))
* rendering events table ([4d3c04d](https://github.com/PrivateAIM/hub/commit/4d3c04dedb2a12d3aca5c22e35d9ab3b0bfa4e21))
* transmitting logs ([bc6855c](https://github.com/PrivateAIM/hub/commit/bc6855c1dc99e0b831d94f1d6d469cdb3b78a64f))
* type cast buffer as blobPart ([98b8079](https://github.com/PrivateAIM/hub/commit/98b80792f3e401ca5796fcd7e33490f833789e62))

## [0.8.15](https://github.com/PrivateAIM/hub/compare/v0.8.14...v0.8.15) (2025-07-30)


### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* explicitly enable middlewares ([dcb95e1](https://github.com/PrivateAIM/hub/commit/dcb95e1c5750f4119977d12fb4a0a74c1a8424c8))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))


### Bug Fixes

* add unique constraint for bucket_id + path ([2b6e000](https://github.com/PrivateAIM/hub/commit/2b6e0003aba99f80d4e6106b491ad918e2f19b38))
* return missing properties in analysis-node-log create process ([3c997da](https://github.com/PrivateAIM/hub/commit/3c997dadead2b8cb472f8d8685d27766b4bbc0c7))

## [0.8.14](https://github.com/PrivateAIM/hub/compare/v0.8.13...v0.8.14) (2025-07-10)


### Features

* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))
* cleanup authup aggregator handlers ([#1095](https://github.com/PrivateAIM/hub/issues/1095)) ([c313003](https://github.com/PrivateAIM/hub/commit/c3130035d3794142a91a1797529388701c70bdc5))
* enable custom url for loki compactor & querier ([2c0d7da](https://github.com/PrivateAIM/hub/commit/2c0d7dab59e18a3ba4bbe645366e9576d00fe845))
* **messenger:** mount default middlewares ([d7ede75](https://github.com/PrivateAIM/hub/commit/d7ede752688b73a43bb9ca99557ffb17e9594cc1))
* move domains to database directory ([#1106](https://github.com/PrivateAIM/hub/issues/1106)) ([4aa9171](https://github.com/PrivateAIM/hub/commit/4aa9171b629da289aeb54b5ecd1573d1bbe6b881))
* remodel analysis-node-logs ([#1092](https://github.com/PrivateAIM/hub/issues/1092)) ([4fc553d](https://github.com/PrivateAIM/hub/commit/4fc553d62fa7496b464b39d78a3942e492046eac))
* reogranize analysis-node-log handler logic to different stores (db & loki) ([eb2d74e](https://github.com/PrivateAIM/hub/commit/eb2d74e429cffc29f2197efb2f6e8cedb7dad666))
* submit & receive logs with loki ([#1100](https://github.com/PrivateAIM/hub/issues/1100)) ([83698d4](https://github.com/PrivateAIM/hub/commit/83698d43549cc3a34410bd01910288ba1b263201))


### Bug Fixes

* add missing env reads for loki components ([fd095ae](https://github.com/PrivateAIM/hub/commit/fd095aee13f50bfdf43d7f95e4d2abd870c68dc6))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1114](https://github.com/PrivateAIM/hub/issues/1114)) ([1b644a8](https://github.com/PrivateAIM/hub/commit/1b644a8df5200356bc91c624379917c8dd409fdc))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1091](https://github.com/PrivateAIM/hub/issues/1091)) ([5da2ab0](https://github.com/PrivateAIM/hub/commit/5da2ab0af1133b1c8408317486fb6394cdb2452e))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1105](https://github.com/PrivateAIM/hub/issues/1105)) ([c4f9255](https://github.com/PrivateAIM/hub/commit/c4f9255832f6473ea1d3fc1793ff9ec2aefacf4c))

## [0.8.13](https://github.com/PrivateAIM/hub/compare/v0.8.12...v0.8.13) (2025-05-05)


### Features

* allow including master_image relation in master_image_event_logs endpoint ([#1058](https://github.com/PrivateAIM/hub/issues/1058)) ([f84e278](https://github.com/PrivateAIM/hub/commit/f84e278bd8169bcacaa06d5ce3ddba51649d09c5))
* cleanup authup aggregator handlers ([#1059](https://github.com/PrivateAIM/hub/issues/1059)) ([14682ed](https://github.com/PrivateAIM/hub/commit/14682ed4f52b7ea259d2cc8e214f4348073b9a10))
* support a wider range of identity-providers ([7c3359b](https://github.com/PrivateAIM/hub/commit/7c3359b87d8216cae03097d215e070ab5717b9c0))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1052](https://github.com/PrivateAIM/hub/issues/1052)) ([d29805f](https://github.com/PrivateAIM/hub/commit/d29805f3b0306b97a56cdd9882ac90e5d66800a6))
* quick fix for analysis bucket file realtime updates ([0e6e2c2](https://github.com/PrivateAIM/hub/commit/0e6e2c2417eac63306981de485b2843cfdb44967))
* remove invalid permission enum key access ([9955bce](https://github.com/PrivateAIM/hub/commit/9955bce52ba14eabbcf5918a8f22f39793e7c1b5))
* response for non existent analysis-bucket(-file) ([#1057](https://github.com/PrivateAIM/hub/issues/1057)) ([ebe143e](https://github.com/PrivateAIM/hub/commit/ebe143e70e1b8e4541bf9ef280c4c92cd9eee365))

## [0.8.12](https://github.com/PrivateAIM/hub/compare/v0.8.11...v0.8.12) (2025-04-25)


### Features

* add verison number to footer ([e5d8c86](https://github.com/PrivateAIM/hub/commit/e5d8c863ebfd6589510591bc9699def9ba5010e7))
* initial design adjustments ([7b0681b](https://github.com/PrivateAIM/hub/commit/7b0681b481c8c022173c7e0d72f1f573c0ed2783))


### Bug Fixes

* add missing css file ([2159f32](https://github.com/PrivateAIM/hub/commit/2159f32313be6b7782bf6ccd367542dac02824a2))
* handling entity delete handler ([8ded64f](https://github.com/PrivateAIM/hub/commit/8ded64f100e99da481190bfe0db30921721f2bbc))

## [0.8.11](https://github.com/PrivateAIM/hub/compare/v0.8.10...v0.8.11) (2025-04-24)


### Features

* add policy pages ([#1041](https://github.com/PrivateAIM/hub/issues/1041)) ([32e6df9](https://github.com/PrivateAIM/hub/commit/32e6df99bb202f83237a00e48e5636831ebf6ace))
* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))


### Bug Fixes

* **deps:** bump the minorandpatch group with 4 updates ([#1039](https://github.com/PrivateAIM/hub/issues/1039)) ([c2f6c6e](https://github.com/PrivateAIM/hub/commit/c2f6c6e0803044d7a024560d4e41b9e2119c415e))
* realtime updates & simplified analysis wizard file event management ([6c4521e](https://github.com/PrivateAIM/hub/commit/6c4521ea33908002c246e16bef8833f51828e07f))

## [0.8.10](https://github.com/PrivateAIM/hub/compare/v0.8.9...v0.8.10) (2025-04-23)


### Features

* introduce safe publish method for domain-event-publisher ([cff0b35](https://github.com/PrivateAIM/hub/commit/cff0b3567ad11fb4a8ee42c58082122185c50c6c))


### Bug Fixes

* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#1036](https://github.com/PrivateAIM/hub/issues/1036)) ([e52ea50](https://github.com/PrivateAIM/hub/commit/e52ea50288486db487ce0c5f4d2cd0b027c18861))
* redirect to analysis setup page after creation ([a8556d3](https://github.com/PrivateAIM/hub/commit/a8556d3edb0adbad730e11c38734efd88858fe8f))
* use remove for deleting master image event logs ([3548c23](https://github.com/PrivateAIM/hub/commit/3548c239734811039bc1b6590f3313f1d11a9e7f))

## [0.8.9](https://github.com/PrivateAIM/hub/compare/v0.8.8...v0.8.9) (2025-04-17)


### Features

* master-image-log-cleaner component ([bd5ec72](https://github.com/PrivateAIM/hub/commit/bd5ec722f5c35a3168c5ad01a12066651c1f901f))
* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1033](https://github.com/PrivateAIM/hub/issues/1033)) ([b228557](https://github.com/PrivateAIM/hub/commit/b228557eb213761ab97d2d9f8e618b86c50ab155))
* remove ping emit ([1f78ceb](https://github.com/PrivateAIM/hub/commit/1f78ceb447746415c8ed5787affa3d3d3fad0b40))

## [0.8.8](https://github.com/PrivateAIM/hub/compare/v0.8.7...v0.8.8) (2025-04-15)


### Features

* align service page views ([69ce42e](https://github.com/PrivateAIM/hub/commit/69ce42e458d97ab87eec833788f85406be224b0f))
* enhance logging in messenger service ([ac4304b](https://github.com/PrivateAIM/hub/commit/ac4304bc5bf1f456b48605bf21a80f584c930341))
* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* minor redesign to analysis-nodes rendering in analysis view ([23224f5](https://github.com/PrivateAIM/hub/commit/23224f564b8749d8848c5c1f815f11dde290e9e1))
* remove head navigation wrapper ([d236ce6](https://github.com/PrivateAIM/hub/commit/d236ce6246c57f061745631d9c616925ff8aef82))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))


### Bug Fixes

* **deps:** bump amqp-extension from 4.0.0-beta.3 to 4.0.0 ([#1018](https://github.com/PrivateAIM/hub/issues/1018)) ([6f969f1](https://github.com/PrivateAIM/hub/commit/6f969f17c64f61da85799fd1193d7343d0130ac5))
* **deps:** bump dotenv from 16.4.7 to 16.5.0 in the minorandpatch group ([#1028](https://github.com/PrivateAIM/hub/issues/1028)) ([181ae0f](https://github.com/PrivateAIM/hub/commit/181ae0f6cfab14df972f0ab4a6cfb41afe244038))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1012](https://github.com/PrivateAIM/hub/issues/1012)) ([81c35b2](https://github.com/PrivateAIM/hub/commit/81c35b2f93816245deecd81df242604b6e096b44))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#1019](https://github.com/PrivateAIM/hub/issues/1019)) ([a82d65d](https://github.com/PrivateAIM/hub/commit/a82d65da5e08edce3d97e7432c22d8a028853217))
* navigation generation ([ab863bf](https://github.com/PrivateAIM/hub/commit/ab863bf716118a10a8bcafdc60d60effb8e341db))
* negation in project-node update handler ([f685c88](https://github.com/PrivateAIM/hub/commit/f685c88599c77768d2c41049c20dba56455acaaf))
* rename env record authupApiURL to authupURL ([de8e390](https://github.com/PrivateAIM/hub/commit/de8e390c8e0bd92bc44b700b4a344173fa6f8083))
* use the right validation group in update handler routes ([a56d41e](https://github.com/PrivateAIM/hub/commit/a56d41e606f1e08f40f32e6b98799bb9cc55153f))
* validation group in registry validator ([4f87227](https://github.com/PrivateAIM/hub/commit/4f87227f423e98dfa83049028849bf86324ad4a2))

## [0.8.7](https://github.com/PrivateAIM/hub/compare/v0.8.6...v0.8.7) (2025-03-12)


### Features

* entity, interface, subscriber, ... for analysis-node-log object ([#1004](https://github.com/PrivateAIM/hub/issues/1004)) ([5f261e3](https://github.com/PrivateAIM/hub/commit/5f261e3d7ea701644d92df3ab98c346baaefead8))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 2 updates ([#1003](https://github.com/PrivateAIM/hub/issues/1003)) ([3bb511a](https://github.com/PrivateAIM/hub/commit/3bb511a285a0a5cff086a1b7ee2d5acf7e487a26))
* remove step property in analysis logs ([6737e26](https://github.com/PrivateAIM/hub/commit/6737e263a6f9fb019568fc51a77af6c7ace5452a))
* skip git config step in github action ([7dd491b](https://github.com/PrivateAIM/hub/commit/7dd491bfbed26598bb2d64a341a12cb585ba4883))

## [0.8.6](https://github.com/PrivateAIM/hub/compare/v0.8.5...v0.8.6) (2025-03-04)


### Features

* add analysis incoming view on project page ([488303a](https://github.com/PrivateAIM/hub/commit/488303a2d3c77b1af978090ed7bc34d6d3dc6e2e))
* avoid displaying uuids when meaningful ([0a4a13f](https://github.com/PrivateAIM/hub/commit/0a4a13f28a2a488eacdba78e5961d24f15c0bce2))
* command-arguments editor in analysis wizard ([#994](https://github.com/PrivateAIM/hub/issues/994)) ([e8e450f](https://github.com/PrivateAIM/hub/commit/e8e450f5e14e108cedf17844f258d898c44cbdcc))
* emit updated analysis object ([b5724b0](https://github.com/PrivateAIM/hub/commit/b5724b0b51df229fed85a17f37e9f385371d4e0b))
* enable resetting image command arguments in wizard ([d080301](https://github.com/PrivateAIM/hub/commit/d080301333e161e70c22517d886d20fb038f7375))
* enable sorting {analysis,project}-node by analysis name ([6e0f243](https://github.com/PrivateAIM/hub/commit/6e0f2438282ba4561d3c3a6ebf0c5bdd1c2b85d6))
* enable sorting {analysis,project}-node by node name ([5cd32c0](https://github.com/PrivateAIM/hub/commit/5cd32c040ff7b1c16ed76c0b73f07403b2666aa2))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* move analysis image command to master image analysis wizard step ([8058362](https://github.com/PrivateAIM/hub/commit/80583621594f50749ce4d6894d55461683ef4d84))
* redesigned station picker ([#977](https://github.com/PrivateAIM/hub/issues/977)) ([d9b967b](https://github.com/PrivateAIM/hub/commit/d9b967b4cdb15cdcb1085e662b55600dc1073b37))
* refactor command precondition + change order in build_start command ([#981](https://github.com/PrivateAIM/hub/issues/981)) ([85aa834](https://github.com/PrivateAIM/hub/commit/85aa8348dd91a4394ed700d5f57f5de28f80f827))
* refactored domain entity nav component(s) ([#995](https://github.com/PrivateAIM/hub/issues/995)) ([3042767](https://github.com/PrivateAIM/hub/commit/30427675a4265f11780207795e4c97eb5ada3dca))
* remove uuids in admin area tables ([a62ebe7](https://github.com/PrivateAIM/hub/commit/a62ebe76214551c0f6a7f02db92afb4b0e88d037))
* reorganized analysis wizard steps ([#978](https://github.com/PrivateAIM/hub/issues/978)) ([9e1913e](https://github.com/PrivateAIM/hub/commit/9e1913e2dbbd98f1fc018ed621d37b78261446eb))
* unify assign action for relational components ([775120a](https://github.com/PrivateAIM/hub/commit/775120a1b24b6f1f409fd003b4d5b23f00adde4d))
* use p-256 for ecdh algorithm ([ec9f241](https://github.com/PrivateAIM/hub/commit/ec9f241b693c8fca0275802aec3e5487711bba69))
* validate client-to-server messaging message ([a37cbc4](https://github.com/PrivateAIM/hub/commit/a37cbc4582ac66190aa4aad9a78aca58d34526f4))


### Bug Fixes

* add missing pagination to project node selection ([b9e6a4d](https://github.com/PrivateAIM/hub/commit/b9e6a4de22473521937d25a718233c08d5c369fd))
* analysis update handler ([41a5b86](https://github.com/PrivateAIM/hub/commit/41a5b86438c5f56ac4fd50e4a7f40c8353006e52))
* better ux for analysis wizard, when no entries are selected ([f3e562c](https://github.com/PrivateAIM/hub/commit/f3e562c47b77a341fc50bb0103fe987ffd240cd1))
* change unique constraint for master_image virtual_path field ([c87fa19](https://github.com/PrivateAIM/hub/commit/c87fa19e991e1c685bac5a4321e2c7a62905473d))
* change unique constraint for master_image_group virtual_path field ([24e8667](https://github.com/PrivateAIM/hub/commit/24e866731e0fb92b11151641f64918c895b3f437))
* clean master image logs before synchronization ([76f1a69](https://github.com/PrivateAIM/hub/commit/76f1a6941db485b11a03519330571771f7170289))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#973](https://github.com/PrivateAIM/hub/issues/973)) ([6c3b98e](https://github.com/PrivateAIM/hub/commit/6c3b98e665d641005d223e348ff0970b453dbf0e))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#997](https://github.com/PrivateAIM/hub/issues/997)) ([949ba29](https://github.com/PrivateAIM/hub/commit/949ba29f66ef6840b9e92b2504b26b7a7a7036e0))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#985](https://github.com/PrivateAIM/hub/issues/985)) ([ad6992c](https://github.com/PrivateAIM/hub/commit/ad6992c95cc0cf79a88abb5d47f5fdd62c0d4222))
* domain entity nav usage ([54188ed](https://github.com/PrivateAIM/hub/commit/54188ed71cb55d6cb04bb82ca1638c36562d27e8))
* don't use inherited name from group for image name ([0f9850d](https://github.com/PrivateAIM/hub/commit/0f9850dbab971d93b8913702c55036acac30d270))
* minor ui adjustments ([894b988](https://github.com/PrivateAIM/hub/commit/894b9886ae7a04373ce7d8501816ee5ca1ff38bc))
* read handler ([2292a1b](https://github.com/PrivateAIM/hub/commit/2292a1b524fe9c31c4d99a0a667b90d8f55c891a))
* remove explicit dependency @pinia/nuxt ([0312149](https://github.com/PrivateAIM/hub/commit/031214963f2ecf6f2321a7e3046eb83e79f053ef))
* remove explicit pinia dependency ([61d8b72](https://github.com/PrivateAIM/hub/commit/61d8b723a2b178ad2cd4095a7ba8342c23b46050))
* reset image_command_arguments after master image change ([c904823](https://github.com/PrivateAIM/hub/commit/c904823cea8a6269259e60a29b9c1e2192aef4dd))
* sorting of nodes (in admin view) ([8205c44](https://github.com/PrivateAIM/hub/commit/8205c449866f0e61f4b1a39ec3c21b41656749bd))
* synchronizing master image groups ([2599491](https://github.com/PrivateAIM/hub/commit/2599491bbf032a4e17b6e0cc8d9cc7785b77f157))
* use image_command_arguments of analysis if defined ([f571e9e](https://github.com/PrivateAIM/hub/commit/f571e9e6c2263c22bd2580ba97d9158ac703df7e))

## [0.8.5](https://github.com/PrivateAIM/hub/compare/v0.8.4...v0.8.5) (2025-01-22)


### Features

* add public_key property to node entity ([69fe08e](https://github.com/PrivateAIM/hub/commit/69fe08e4732852d4cbd977a9bcb145f7fa0cfc15))
* allow node registry_id to be undefined ([a049c7a](https://github.com/PrivateAIM/hub/commit/a049c7ac5a69416ab643a908290e1047a5f7addb))
* basic web crypto implementation (P.P. research-project) + node key-pair generation ([#912](https://github.com/PrivateAIM/hub/issues/912)) ([8cdb9d8](https://github.com/PrivateAIM/hub/commit/8cdb9d8ff140400426ccbd61f254a47fa0e3fab1))
* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* enable ecdh key pair generation ([#961](https://github.com/PrivateAIM/hub/issues/961)) ([4139e76](https://github.com/PrivateAIM/hub/commit/4139e7693247b2cbb0272efb5f70b8af975a351e))
* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* implement basic master image event log (db-) entity ([d2fdb7f](https://github.com/PrivateAIM/hub/commit/d2fdb7fed7bf1380e0350f74edb47738a1f81550))
* implemented node-robot service to automatically assign permissions ([5b422bd](https://github.com/PrivateAIM/hub/commit/5b422bd3c0a0edfc0695dbe60a0b49b37a661045))
* initial hybrid cache (redis or memory) implementation ([b1cd569](https://github.com/PrivateAIM/hub/commit/b1cd569ff52d222f61d4b87abc921cb769de8264))
* migrate to new http create validator syntax ([38ca70e](https://github.com/PrivateAIM/hub/commit/38ca70ee1b060a7d1bd22c87bddcdde21b6fbadc))
* redesign analysis file upload ([#956](https://github.com/PrivateAIM/hub/issues/956)) ([2e8cb38](https://github.com/PrivateAIM/hub/commit/2e8cb38ac0c34ac8059362f2316e588e938243e2))
* refactor http controller validation ([#880](https://github.com/PrivateAIM/hub/issues/880)) ([6e11074](https://github.com/PrivateAIM/hub/commit/6e110742f946d4d0e827f4beb497ba2612568b9a))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))


### Bug Fixes

* analysis-node update operation ([ba6cc10](https://github.com/PrivateAIM/hub/commit/ba6cc10c99688ca25eecd4c06242dcea60b8281c))
* database intitialisation of storage service ([a6e79d9](https://github.com/PrivateAIM/hub/commit/a6e79d9a4cd366942799d8483ca8f780ec8a048b))
* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump @authup/kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#901](https://github.com/PrivateAIM/hub/issues/901)) ([00a447c](https://github.com/PrivateAIM/hub/commit/00a447ce40ab17b67b0809b41c4233e424303a7c))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump minio from 8.0.1 to 8.0.2 ([#850](https://github.com/PrivateAIM/hub/issues/850)) ([d6145a3](https://github.com/PrivateAIM/hub/commit/d6145a30f8f4c104435644416f83c0fa94dee109))
* **deps:** bump socket.io from 4.8.0 to 4.8.1 ([#846](https://github.com/PrivateAIM/hub/issues/846)) ([ede8fb8](https://github.com/PrivateAIM/hub/commit/ede8fb866bcf0ac493c548ae5b70c738978b912a))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#962](https://github.com/PrivateAIM/hub/issues/962)) ([caf2001](https://github.com/PrivateAIM/hub/commit/caf2001c0e4dad30f24e4d66ce51ca8c89aba818))
* **deps:** bump the minorandpatch group across 1 directory with 31 updates ([#945](https://github.com/PrivateAIM/hub/issues/945)) ([448e9b8](https://github.com/PrivateAIM/hub/commit/448e9b86bf80f83c4aa8bb32ee0a75190a1d5cb8))
* **deps:** bump the minorandpatch group across 1 directory with 4 updates ([#906](https://github.com/PrivateAIM/hub/issues/906)) ([e11bc5f](https://github.com/PrivateAIM/hub/commit/e11bc5f3b565347af3180e8e29b4e3b79ace5961))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#954](https://github.com/PrivateAIM/hub/issues/954)) ([aa26580](https://github.com/PrivateAIM/hub/commit/aa2658002e869c736ba7079018b198b324b927e7))
* **deps:** bump uuid from 10.0.0 to 11.0.2 ([#852](https://github.com/PrivateAIM/hub/issues/852)) ([c15d400](https://github.com/PrivateAIM/hub/commit/c15d4000e8ec01d442f4b778c4bd58e7df271b53))
* **deps:** bump winston from 3.15.0 to 3.16.0 ([#878](https://github.com/PrivateAIM/hub/issues/878)) ([71a2fcd](https://github.com/PrivateAIM/hub/commit/71a2fcd6b507dc44543645acd9622d5d9372dd80))
* do not throw error if permission for node-robot permission creation does not exist ([eac34b5](https://github.com/PrivateAIM/hub/commit/eac34b540b5422fc78658c4aad016fa66ed16bf0))
* emit node changes after http operaiton ([431a6f7](https://github.com/PrivateAIM/hub/commit/431a6f7cabd1457090b7f20508d6a2ef1e12fbb9))
* enable self permission owner check for analysis permission ([#965](https://github.com/PrivateAIM/hub/issues/965)) ([a37f421](https://github.com/PrivateAIM/hub/commit/a37f421821b76468280d3c7b309a431aca1180ce))
* fake permisison provider for test execution ([480a322](https://github.com/PrivateAIM/hub/commit/480a322595a67efb80809fd0d8319babcf49d63f))
* minor adjustment to set synchronization state ([a716ec7](https://github.com/PrivateAIM/hub/commit/a716ec714d1d9954e4bb7eb164aa56efed60d592))
* minor fix for node-robot permission creation ([ff45808](https://github.com/PrivateAIM/hub/commit/ff45808de43d93fd2c35d9cd35c8285a767becf8))
* move http controllers ([f71c275](https://github.com/PrivateAIM/hub/commit/f71c275afadcd5d48afe76f57b2a361227b294a5))
* set robot_id after creation for node ([234770a](https://github.com/PrivateAIM/hub/commit/234770a14568071707bbe14cee4ec3b65cc92b5e))
* version of pinia ([207fcd4](https://github.com/PrivateAIM/hub/commit/207fcd435ba558029c4ec9b92c33993515ce7b15))

## [0.8.4](https://github.com/PrivateAIM/hub/compare/v0.8.3...v0.8.4) (2024-10-24)


### Features

* bump authup & implement async policy & permission evaluation ([#807](https://github.com/PrivateAIM/hub/issues/807)) ([d065562](https://github.com/PrivateAIM/hub/commit/d065562585076e26553ad5a39f4a5789f7e18f24))
* bump authup & vuecs packages + refactored navigation ([c4db8d5](https://github.com/PrivateAIM/hub/commit/c4db8d51588b3d701815e2ba2f9b80e594f3663f))
* delete project-node relation on analysis-node deletion (if possible) ([#794](https://github.com/PrivateAIM/hub/issues/794)) ([0e953e3](https://github.com/PrivateAIM/hub/commit/0e953e39bdd16329ebd3026395262ba3dd6631bb))
* enforce uniqueness for project name attribute ([#793](https://github.com/PrivateAIM/hub/issues/793)) ([0681249](https://github.com/PrivateAIM/hub/commit/0681249654e601c7cc4eec39a76ce8c2600ef7e9))
* handle permission-/policy-error in error middleware ([4b4fae4](https://github.com/PrivateAIM/hub/commit/4b4fae4fd048ddf9509af3d611a201484b0d4eaf))
* initial implementation of database-integrity service ([077fdd3](https://github.com/PrivateAIM/hub/commit/077fdd3aa5e29b285655289ff70c1c85f7d8219c))
* use authup nuxt module instead of manual plugin configuration ([8a87d4f](https://github.com/PrivateAIM/hub/commit/8a87d4f9b572266ded328067a9d18af76d5e76dc))


### Bug Fixes

* building and scanning master image command arguments ([95041ea](https://github.com/PrivateAIM/hub/commit/95041ea8a037171080cdb2e9e0f5024baf53080b))
* bump nuxt + vue & defining enum based component properties ([bdb65d2](https://github.com/PrivateAIM/hub/commit/bdb65d26fc95f7b61f3a7319d9e903ad316e315c))
* condition for exposing error via middleware ([e7a5fee](https://github.com/PrivateAIM/hub/commit/e7a5feec09eec7f63c91e13781b4abc19cb787f6))
* **deps:** bump locter from 2.1.1 to 2.1.2 ([#795](https://github.com/PrivateAIM/hub/issues/795)) ([fdb8cba](https://github.com/PrivateAIM/hub/commit/fdb8cba0c5a991a57ed9a26a324b9f2fed6caf5c))
* **deps:** bump locter from 2.1.2 to 2.1.4 ([#816](https://github.com/PrivateAIM/hub/issues/816)) ([0af403a](https://github.com/PrivateAIM/hub/commit/0af403a0eef7bca9c4f316e6598607c2897a8065))
* **deps:** bump socket.io from 4.7.5 to 4.8.0 ([#800](https://github.com/PrivateAIM/hub/issues/800)) ([2f05947](https://github.com/PrivateAIM/hub/commit/2f05947e33a9e6a97cd7a49853e49e171004dfd3))
* **deps:** bump typeorm-extension from 3.6.1 to 3.6.2 ([#810](https://github.com/PrivateAIM/hub/issues/810)) ([c9af9ae](https://github.com/PrivateAIM/hub/commit/c9af9aea537c4a51aae13f1059c1565180045a83))
* make analysis wizard step clickable ([#792](https://github.com/PrivateAIM/hub/issues/792)) ([3372b8a](https://github.com/PrivateAIM/hub/commit/3372b8ad509c3bca59fc56726b2e2bb7376cbfc0))
* remove Readable response type for bucket controllers ([f8a9fe0](https://github.com/PrivateAIM/hub/commit/f8a9fe0b8e274677cc3e0afee248103dcef8aebf))
* **storage:** allow filtering by bucket_id ([d53f24e](https://github.com/PrivateAIM/hub/commit/d53f24ec4ccdf7bcf42b47f87160d91d211ce943))

## [0.8.3](https://github.com/PrivateAIM/hub/compare/v0.8.2...v0.8.3) (2024-09-19)


### Features

* add additional created_at/updated_at of child relations ([7db1a89](https://github.com/PrivateAIM/hub/commit/7db1a89aca1098e2fc716e6a626afaf816153422))
* align node robot view to default robot view ([#762](https://github.com/PrivateAIM/hub/issues/762)) ([54c5d92](https://github.com/PrivateAIM/hub/commit/54c5d9262797f8bb42aaf12fd887300d6f2a2df0))
* permit node authority to update run_status if permission is granted ([06d1ba7](https://github.com/PrivateAIM/hub/commit/06d1ba787040fc86226bd1ca3d34271a6487ad1a))
* redesigned nav (-pills) and stretched admin nodes/services view ([fad6da2](https://github.com/PrivateAIM/hub/commit/fad6da2de2aac07fe10bcbefc37ea091078383b5))
* refactored analysis-node status variants ([a28a5a0](https://github.com/PrivateAIM/hub/commit/a28a5a0ed24496d246f837ba987e508727c04549))
* replaced finishing status with running status ([4c68b89](https://github.com/PrivateAIM/hub/commit/4c68b89b05ac2f8fd25ca580be6162303359558b))


### Bug Fixes

* **deps:** bump @routup/basic from 1.4.0 to 1.4.1 ([#752](https://github.com/PrivateAIM/hub/issues/752)) ([c190870](https://github.com/PrivateAIM/hub/commit/c1908702123c9d6d471d3f62543e91f5f645154d))
* **deps:** bump @routup/decorators from 3.4.0 to 3.4.1 ([#751](https://github.com/PrivateAIM/hub/issues/751)) ([89de8dc](https://github.com/PrivateAIM/hub/commit/89de8dc84d72f3322317df613ae06419b4909b72))
* **deps:** bump @routup/swagger from 2.4.0 to 2.4.1 ([#756](https://github.com/PrivateAIM/hub/issues/756)) ([91a19cd](https://github.com/PrivateAIM/hub/commit/91a19cdd32536ca9cbad23170e685a868431b094))
* **deps:** bump pg from 8.12.0 to 8.13.0 ([#753](https://github.com/PrivateAIM/hub/issues/753)) ([9f6e01e](https://github.com/PrivateAIM/hub/commit/9f6e01e9e85c86364d65be7afb66710595ada868))
* **deps:** bump routup from 4.0.0 to 4.0.1 ([#754](https://github.com/PrivateAIM/hub/issues/754)) ([beaf196](https://github.com/PrivateAIM/hub/commit/beaf196efdcab56695622a164b88eb4024848703))
* don't show analysis wizard if analysis is locked ([791c698](https://github.com/PrivateAIM/hub/commit/791c6987a00d1950ca581c126b8e32bbc4afc823))

## [0.8.2](https://github.com/PrivateAIM/hub/compare/v0.8.1...v0.8.2) (2024-08-28)


### Features

* intiital chart templates with minimal configuration ([#661](https://github.com/PrivateAIM/hub/issues/661)) ([f793577](https://github.com/PrivateAIM/hub/commit/f7935774e777cb60ffa81de3ae1ed1ac81b27507))


### Bug Fixes

* avoid infinite redirects in client ui ([47a2554](https://github.com/PrivateAIM/hub/commit/47a2554e7c53d01c7aee54d3c5c527aee25ce3e4))
* code inspection/download button ([#684](https://github.com/PrivateAIM/hub/issues/684)) ([4a987a5](https://github.com/PrivateAIM/hub/commit/4a987a5ed88c734e6ee58d311303052d88119bb1))
* **deps:** bump locter from 2.1.0 to 2.1.1 ([#685](https://github.com/PrivateAIM/hub/issues/685)) ([e5e0860](https://github.com/PrivateAIM/hub/commit/e5e086024d7a9157c1833aa656bcc91a0574e4a9))
* downgrade to nuxt v3.12.4 ([4222d38](https://github.com/PrivateAIM/hub/commit/4222d3874339e725e646ab789f12b264ec2d1704))
* master-image-picker - switching between groups ([#687](https://github.com/PrivateAIM/hub/issues/687)) ([e14df50](https://github.com/PrivateAIM/hub/commit/e14df508d6c366f30ae5257e3b95915d67c35d9d))
* remove root path of excluded paths ([4745b8e](https://github.com/PrivateAIM/hub/commit/4745b8eecc55165b79d438fcd880ccf9d80853f4))
* service robot view in admin area ([f9072b9](https://github.com/PrivateAIM/hub/commit/f9072b9e1c2c0ae932a0d74dd8e897a593742225))
* temporary fix for routing issue ([a6764c2](https://github.com/PrivateAIM/hub/commit/a6764c2862ff10490d8cf7284c14bf37aab22e8c))

## [0.8.1](https://github.com/PrivateAIM/hub/compare/v0.8.0...v0.8.1) (2024-08-19)


### Features

* add authup policy aggregator ([adb2235](https://github.com/PrivateAIM/hub/commit/adb22356c177dea09a7e722786f92e13f57481bd))
* add description column to analysis entity ([438297b](https://github.com/PrivateAIM/hub/commit/438297beacbb264d3a8034f5a4a79fef7dff1d33))
* add error log formatting ([976c4cd](https://github.com/PrivateAIM/hub/commit/976c4cdf0648368b3164ba97a36cac13f99c203e))
* add memory-cache & track master images synchronization progress ([bd43978](https://github.com/PrivateAIM/hub/commit/bd439781941e1130f812a30e721227e2893670ea))
* add project form description field ([66f2aff](https://github.com/PrivateAIM/hub/commit/66f2affa8bae402618d75fad3225ed0e49bf970a))
* adjust analysis details view ([d80ac5c](https://github.com/PrivateAIM/hub/commit/d80ac5c41c1faf77290d7d986d785d8deabcbdff))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* allow specifying cookie domain ([fb52746](https://github.com/PrivateAIM/hub/commit/fb527465b2842ba8b2d8856c66775cc7a0b879aa))
* emit correct error event + adjusted directory path for building master images ([16dc3b1](https://github.com/PrivateAIM/hub/commit/16dc3b17de2444f45beab7b1d037eac971bdd2b0))
* enable recheck in analysis-wizard if storage bucket is not yet available ([cc88e5f](https://github.com/PrivateAIM/hub/commit/cc88e5f5f43cee3e3baf6aadbc6843027af89d5c))
* extended and modified project columns (nodes, robot_id, user_id, description) ([#642](https://github.com/PrivateAIM/hub/issues/642)) ([afe9491](https://github.com/PrivateAIM/hub/commit/afe9491c84f98193fe5158fe2c51ec06a247921f))
* initial refactoring of analysis incoming view ([10425af](https://github.com/PrivateAIM/hub/commit/10425af18fcaedf9569876590bd7f4fc1fcf2a92))
* initial refactoring of projects incoming view ([c524618](https://github.com/PrivateAIM/hub/commit/c5246185847c3f8d83d9ac22cfecd62f7351392b))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* prettify project details view ([a788ba8](https://github.com/PrivateAIM/hub/commit/a788ba8868d86d4987a48ac141527d04d5fa289a))
* public & private service URLs for client-ui ([d5c2d41](https://github.com/PrivateAIM/hub/commit/d5c2d41b83a57d9acb14f0649988e11a55d7b726))
* refactored analyses & projects list view ([#639](https://github.com/PrivateAIM/hub/issues/639)) ([ee7a6e7](https://github.com/PrivateAIM/hub/commit/ee7a6e7a1f5d3d12c0726d543337c728d4fb0138))
* set nocache options for docker build ([bff52ad](https://github.com/PrivateAIM/hub/commit/bff52ada573cd1ecd8efff722f1164d842dfe145))


### Bug Fixes

* add missing rethrow statement ([d73935a](https://github.com/PrivateAIM/hub/commit/d73935aedbf347e6cf280a49cb1b2986c43cad8d))
* add transaction logs between parties ([514d722](https://github.com/PrivateAIM/hub/commit/514d722172807db9e68bbc19508391d3251dc565))
* always run db schema synchronization ([b3ba492](https://github.com/PrivateAIM/hub/commit/b3ba4926bc69af70fa94f4004d8c64b40101f116))
* analysis-manager aggregator handler ([8fe18e4](https://github.com/PrivateAIM/hub/commit/8fe18e46d29586cd75f0cf936108b4edc9411392))
* analysis-permisison permission_id field validation ([051ab7e](https://github.com/PrivateAIM/hub/commit/051ab7e2b5b8d10672d66d94635b233eb85d48b3))
* apply schema check again ([7e820e6](https://github.com/PrivateAIM/hub/commit/7e820e665e91c8a61b2684c4d47474cacac1a11a))
* bump nuxt to v3.12.3 and fix corrseponding issues ([312420b](https://github.com/PrivateAIM/hub/commit/312420bce1620b032cb4e752011058dd21a1dcbd))
* change order when blocking master image sync process ([8e9efc1](https://github.com/PrivateAIM/hub/commit/8e9efc1c707ea3582fe802a8e1073b0c496d5acb))
* **deps:** bump express-validator from 7.1.0 to 7.2.0 ([#654](https://github.com/PrivateAIM/hub/issues/654)) ([1b1d70e](https://github.com/PrivateAIM/hub/commit/1b1d70e759c94d05fc1ae7098f308275735ce971))
* **deps:** bump mysql2 from 3.10.2 to 3.11.0 ([#610](https://github.com/PrivateAIM/hub/issues/610)) ([3786b07](https://github.com/PrivateAIM/hub/commit/3786b079bc2d65cdf87b982e4d937cb283f78aad))
* **deps:** bump tar from 7.4.0 to 7.4.3 ([#606](https://github.com/PrivateAIM/hub/issues/606)) ([78a32e7](https://github.com/PrivateAIM/hub/commit/78a32e70480db136c997a050217547e976bdae65))
* **deps:** bump typeorm-extension from 3.5.1 to 3.6.0 ([#619](https://github.com/PrivateAIM/hub/issues/619)) ([7af46a3](https://github.com/PrivateAIM/hub/commit/7af46a317755cb8e1d5c26779d5d9157964ba51d))
* **deps:** bump typeorm-extension from 3.6.0 to 3.6.1 ([#652](https://github.com/PrivateAIM/hub/issues/652)) ([c862af7](https://github.com/PrivateAIM/hub/commit/c862af75dec7d42e3da9c50761e7ab61225a1c8f))
* **deps:** bump winston from 3.13.0 to 3.13.1 ([#563](https://github.com/PrivateAIM/hub/issues/563)) ([0fe28d4](https://github.com/PrivateAIM/hub/commit/0fe28d4d1179924cc13afe0e24b5095b9b4a2fd7))
* **deps:** bump winston from 3.13.1 to 3.14.1 ([#647](https://github.com/PrivateAIM/hub/issues/647)) ([768e839](https://github.com/PrivateAIM/hub/commit/768e83904ca74d343c43a173f040b1ed6ebf9c82))
* **deps:** downgrade eslint to v8.x ([6d3a24d](https://github.com/PrivateAIM/hub/commit/6d3a24d3dfbdfe46bc2ba4609b21c40046d70992))
* disable no-cache option ([cbf0cf2](https://github.com/PrivateAIM/hub/commit/cbf0cf2ece1e932b0fc946606bc2bb1e2988b31f))
* do not process requeued message multiple times ([077495b](https://github.com/PrivateAIM/hub/commit/077495b69ca7f9c3dd497b2f5db15f05534b4f92))
* enhance logging for registry component ([b1a8bb3](https://github.com/PrivateAIM/hub/commit/b1a8bb3b80aa4d00398a3624677d4401f701b134))
* harbor reigstry robot permission assignment ([2a0a8f7](https://github.com/PrivateAIM/hub/commit/2a0a8f75df581d7cbbf3654456f3211efa654b19))
* master images synchronization process ([604a375](https://github.com/PrivateAIM/hub/commit/604a375b525e73d17c208731dd7256ea30412d57))
* minor cleanup in project item card view ([d16fea6](https://github.com/PrivateAIM/hub/commit/d16fea6c9822912b68009e39f885d924bdb87477))
* naming in project read handlers ([fb03369](https://github.com/PrivateAIM/hub/commit/fb0336995dfe5482762b6f6a019b25106722cd89))
* project list in analysis basic form ([27e7f72](https://github.com/PrivateAIM/hub/commit/27e7f72c10f4a5284ab04cde09a1c68f7b64d7a3))
* reenable db check in start command ([c83f34f](https://github.com/PrivateAIM/hub/commit/c83f34f101b225356b515da23948d56a36107585))
* set project description column to varchar ([dea15b0](https://github.com/PrivateAIM/hub/commit/dea15b027a02153f6300690be9d0d8ba8fab3add))
* set volume mount to correct container ([d227f70](https://github.com/PrivateAIM/hub/commit/d227f705af9c9c3b7f5e1531212d82abb060a554))
* show error message on realm creation ([c41942c](https://github.com/PrivateAIM/hub/commit/c41942c135a63590334c9661dcc16bb57ecc97b9))
* temporarily disable registry project manage restriction ([8f8d8dd](https://github.com/PrivateAIM/hub/commit/8f8d8dd88ea917cf3b967232107487170bcdbaf9))
* use non default export for {analysis,project}-node command & status ([ad74cf6](https://github.com/PrivateAIM/hub/commit/ad74cf625143e4f81d45d6894b86e47c725ad52c))


### Reverts

* "chore: set mysql version to v8" ([078d334](https://github.com/PrivateAIM/hub/commit/078d334f10bc63646185a0371adf13b072719006))
* "fix: set project description column to varchar" ([705454c](https://github.com/PrivateAIM/hub/commit/705454cc51d3fd943cbcb32b9c4eff64758ae7aa))

## [0.8.0](https://github.com/PrivateAIM/hub/compare/v0.7.0...v0.8.0) (2024-07-02)


### Features

* add missing analysis-permission validation steps ([30cba38](https://github.com/PrivateAIM/hub/commit/30cba3846cd7579b9482b7cd8f622d4cb39f5529))
* add missing policies fetch for analysis-permission get-many handler ([62fc56c](https://github.com/PrivateAIM/hub/commit/62fc56c324aaf0cee10b59045d987d544cbf61df))
* add token hook options to authup client constructor ([bbe5e32](https://github.com/PrivateAIM/hub/commit/bbe5e3263230fe1a0b0b0ef18b0e47f7b196a204))
* enhance logging for bucket(-file) streaming ([c94bd52](https://github.com/PrivateAIM/hub/commit/c94bd522d6a3fbbc47639a2d2a591549de6018ba))
* expose all middlewares ([4681e3f](https://github.com/PrivateAIM/hub/commit/4681e3f5b4ce030e3651c00854d3db9c941e336f))
* simplified and adjusted permission usage across codespace ([1839f5e](https://github.com/PrivateAIM/hub/commit/1839f5eb768f120e268e57e0a496fef5eb0eca41))


### Bug Fixes

* adjusted flow to streaming bucket-files ([67e06c1](https://github.com/PrivateAIM/hub/commit/67e06c1c160ef2571696638d2d1befaff27a2498))
* analysis-permission test-suite ([5604d85](https://github.com/PrivateAIM/hub/commit/5604d8599a634c5f6e84040f58a5ccb29f3c2431))
* **deps:** bump @hapic/harbor from 2.3.3 to 2.3.4 ([#537](https://github.com/PrivateAIM/hub/issues/537)) ([f8f805f](https://github.com/PrivateAIM/hub/commit/f8f805f2a7c30168dc503671f9927bf9689858ec))
* **deps:** bump @hapic/vault from 2.3.3 to 2.3.4 ([#538](https://github.com/PrivateAIM/hub/issues/538)) ([ed2c1fd](https://github.com/PrivateAIM/hub/commit/ed2c1fd0a18482bbc05b5f6f0e9f43bb667abc91))
* **deps:** bump @routup/basic from 1.3.2 to 1.4.0 ([#523](https://github.com/PrivateAIM/hub/issues/523)) ([409a594](https://github.com/PrivateAIM/hub/commit/409a59460fbce2934ba489e7fde579063e2fc6d4))
* **deps:** bump @routup/decorators from 3.3.2 to 3.4.0 ([#531](https://github.com/PrivateAIM/hub/issues/531)) ([295f692](https://github.com/PrivateAIM/hub/commit/295f6926b8492aa58856ec2e0ea469e9b19388d3))
* **deps:** bump @routup/prometheus from 2.3.0 to 2.4.0 ([#525](https://github.com/PrivateAIM/hub/issues/525)) ([b98e5f1](https://github.com/PrivateAIM/hub/commit/b98e5f1020f2363c5074f98408e4786cdde24e0d))
* **deps:** bump @routup/swagger from 2.3.6 to 2.4.0 ([#530](https://github.com/PrivateAIM/hub/issues/530)) ([cef8d2c](https://github.com/PrivateAIM/hub/commit/cef8d2c2de5d29c0cc7cf84abf8ef980b05c5fe9))
* **deps:** bump authup to v1.0.0.beta-19 ([3410786](https://github.com/PrivateAIM/hub/commit/34107860d7f810cea7b2024b0f303cd70d32a5fe))
* **deps:** bump mysql2 from 3.10.0 to 3.10.1 ([#461](https://github.com/PrivateAIM/hub/issues/461)) ([f415417](https://github.com/PrivateAIM/hub/commit/f4154174a7049dea2624b99988ea013790167142))
* **deps:** bump mysql2 from 3.10.1 to 3.10.2 ([#529](https://github.com/PrivateAIM/hub/issues/529)) ([1c73408](https://github.com/PrivateAIM/hub/commit/1c73408e5ca2ca1107a985628a7b421d28ff41ce))
* **deps:** bump routup from 3.3.0 to 4.0.0 ([#536](https://github.com/PrivateAIM/hub/issues/536)) ([551048f](https://github.com/PrivateAIM/hub/commit/551048f9ec1dca1bf9d326c6ef2f65303b20d1c9))
* **deps:** bump routup to v4.x ([787bb7c](https://github.com/PrivateAIM/hub/commit/787bb7cb6951f32fed29ac77467dcdec76683672))
* log error on bucket-file streaming ([c89e83a](https://github.com/PrivateAIM/hub/commit/c89e83a957892f248993bdc1532c8bacec4909f8))
* minor logging adjustments for streaming bucket(-file)s ([76f4c18](https://github.com/PrivateAIM/hub/commit/76f4c1857536ce4e8ebda3e4958040ef3e0c418c))
* query prop access in entity-manager ([a87f8fe](https://github.com/PrivateAIM/hub/commit/a87f8fec1f0882962e84ad315d0ab297c5d24392))
* read analysis-permission read handler ([b1794b1](https://github.com/PrivateAIM/hub/commit/b1794b1934f14932772576ab484f68a2cae31c4c))
* streaming bucket files for analysis builind operation ([205b93e](https://github.com/PrivateAIM/hub/commit/205b93e4c8d61ad6db1faef1738a80aa9230fc93))

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* add node type- & online-attribute ([c92a00e](https://github.com/PrivateAIM/hub/commit/c92a00ecce27b57b1ad7834ebe826bce94f3c48b))
* add ui package to docker-compose ([75f6bfc](https://github.com/PrivateAIM/hub/commit/75f6bfc56eeb8b58c8f120209583d81d03605a95))
* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* allow referencing custom robot account to node ([a3277a2](https://github.com/PrivateAIM/hub/commit/a3277a2aa7a8ae2cc44db27afd29694a630d5a89))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* auto approval for aggregator nodes ([94b4f30](https://github.com/PrivateAIM/hub/commit/94b4f30464ef48ab34411c3d38eced4845d367a7))
* better analysis buckets naming strategy ([afc3bbd](https://github.com/PrivateAIM/hub/commit/afc3bbd67c90dd40009091a1fd87a2ab0f01703d))
* better restrictions for linking files to an analysis ([45a6d8a](https://github.com/PrivateAIM/hub/commit/45a6d8a8b9699dbf6c5a418dec91a3cfb8b1e3e0))
* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bucket-file stream route handler & updated test suite ([9b4cfa0](https://github.com/PrivateAIM/hub/commit/9b4cfa006a830f070b16991ef5730394f7fe19cc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* don't tar pack single bucket-file ([e0d3c17](https://github.com/PrivateAIM/hub/commit/e0d3c17e56eab4225e590cde17d85ccd70663c24))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* enable possibility to unlock analysis configuration ([#245](https://github.com/PrivateAIM/hub/issues/245)) ([1053362](https://github.com/PrivateAIM/hub/commit/105336254714a1e64d340eb66c10ec1681890559))
* enhance configure and socket-server creation ([05e69dd](https://github.com/PrivateAIM/hub/commit/05e69dd7a5eb67ee4c72f66836750e91715250d4))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* http server and implement health endpoint ([acab9a7](https://github.com/PrivateAIM/hub/commit/acab9a72ef46524a6bc4d20c5c03dea6c55abcfd))
* identify bucket by id or name via http controller endpoint ([45d03c0](https://github.com/PrivateAIM/hub/commit/45d03c0ea3352ece4d24f708d7d83a1e140e7199))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* implemented health check endpoint for realtime-service ([64c0d12](https://github.com/PrivateAIM/hub/commit/64c0d1224e66407246d9bf8c7db8e603a00723d3))
* initial analysis-permission implementation ([#502](https://github.com/PrivateAIM/hub/issues/502)) ([63cfdbe](https://github.com/PrivateAIM/hub/commit/63cfdbe4c97302dd37b9e2ce22da2592ffb8edbd))
* initial cleanup of realtime service ([d167ed4](https://github.com/PrivateAIM/hub/commit/d167ed4b5fea1038fe4112b662a26ca7a19a564d))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial implementation of server-realtime-kit package ([#380](https://github.com/PrivateAIM/hub/issues/380)) ([3963b66](https://github.com/PrivateAIM/hub/commit/3963b66d27dcb857041eefed824297f35a32d1b6))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial test setup ([#117](https://github.com/PrivateAIM/hub/issues/117)) ([d90c326](https://github.com/PrivateAIM/hub/commit/d90c326248c2a87a2b3dbd423232ad22321f824d))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* initial version of analysis service ([f420cd1](https://github.com/PrivateAIM/hub/commit/f420cd185441ed2e9e4ef8e12992add68a90dd4f))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* integrated vault client in server-storage package ([c82c4e8](https://github.com/PrivateAIM/hub/commit/c82c4e8c1cb99d19091fd8baf0326438d46ae9f8))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* lock analysis-node creation after analyis is locked ([e353a27](https://github.com/PrivateAIM/hub/commit/e353a275daaba1f1972c6cd724bb04f1d85d4af5))
* log analysis buckets configuration/destroying-process ([537d650](https://github.com/PrivateAIM/hub/commit/537d65081dee96b3a37cf413a481a6d9447806ba))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minio client management (env, singleton, ...) ([#115](https://github.com/PrivateAIM/hub/issues/115)) ([f9689b8](https://github.com/PrivateAIM/hub/commit/f9689b8bcff2cc9570830d817903bcae222521d2))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactor controllers (validations, fields, ...) ([e798174](https://github.com/PrivateAIM/hub/commit/e798174146eb5ccfdd13ce2026fe616e09f09300))
* refactor service singleton management ([#131](https://github.com/PrivateAIM/hub/issues/131)) ([7b9195f](https://github.com/PrivateAIM/hub/commit/7b9195fe0c5eca7a3dfcd356edac55b47ba15278))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove permission & role presets ([ea679aa](https://github.com/PrivateAIM/hub/commit/ea679aad29bdf773fc445af66637b518287a96f1))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* renamed database subscribers ([88405cc](https://github.com/PrivateAIM/hub/commit/88405cceca74218a6485abff0e2fae0b8429e3a1))
* restrict analyis-node management after an analysis has been locked ([#244](https://github.com/PrivateAIM/hub/issues/244)) ([11cc582](https://github.com/PrivateAIM/hub/commit/11cc5824e677368aecac6afe00493886b7a3182b))
* restrict update/delete operator by bucket(-file) owner ([07ec40a](https://github.com/PrivateAIM/hub/commit/07ec40ae24cfa68184e865c006e9745b973cf34c))
* run tests in parallel ([#506](https://github.com/PrivateAIM/hub/issues/506)) ([5739ce4](https://github.com/PrivateAIM/hub/commit/5739ce4133693ced649b1412dfd6f535a6a0e1fa))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* service health endpoint & docker health check ([aa4ef27](https://github.com/PrivateAIM/hub/commit/aa4ef27a0ec56373204f2cc0c3eccf5011519883))
* setup default harbor service on startup if defined ([#170](https://github.com/PrivateAIM/hub/issues/170)) ([e9d9d68](https://github.com/PrivateAIM/hub/commit/e9d9d688548fa1b6fa0e68f8ce024b497335a6b9))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* simplified test suite class + http client for server-storage tests ([94a9537](https://github.com/PrivateAIM/hub/commit/94a953774617e196d86af6f5b781bf862fa991b2))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* sync master-images on start up ([#169](https://github.com/PrivateAIM/hub/issues/169)) ([a4a916e](https://github.com/PrivateAIM/hub/commit/a4a916ece8e1022d8c2db3bb3de6b0a6d7df37da))
* tar use new onReadEntry in favor of deprecated onentry fn ([9294bc0](https://github.com/PrivateAIM/hub/commit/9294bc01db06c194a112e6ac51df4defc94363f7))
* trigger analysis action in controller instead of subscriber ([026c56a](https://github.com/PrivateAIM/hub/commit/026c56acf6950b473dfe3e5b777c70b659e5b0a9))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* updated bootstrap-vue-next & adjusted usage ([ca76f9f](https://github.com/PrivateAIM/hub/commit/ca76f9f41a250aa23717ccbb55127bbd092c032b))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))
* use http-client for test-suites ([#508](https://github.com/PrivateAIM/hub/issues/508)) ([83fb96b](https://github.com/PrivateAIM/hub/commit/83fb96bbec6cddc5b8030048a60c5a80153a0d0a))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* add node robot_id field as default field ([8d198fc](https://github.com/PrivateAIM/hub/commit/8d198fca8fc9357b8308a2b2363b6b86b6935523))
* adjust rabbitmq version in docker-compose ([1b3ccc8](https://github.com/PrivateAIM/hub/commit/1b3ccc836352a8a3fddf081be0b1fee076b8e28e))
* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* aggregators & remove router + extractor handlers ([d58ee95](https://github.com/PrivateAIM/hub/commit/d58ee957064cd1e447533234a6665117ccb67ec9))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis imports in server-api package ([44d05a3](https://github.com/PrivateAIM/hub/commit/44d05a3b85b7ef0938db0192cffaeee0ba5b7f05))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* api routes analysis-bucket-file api client ([d0a9e73](https://github.com/PrivateAIM/hub/commit/d0a9e73271acb7d4b403500097a5cc3e3a30b599))
* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* bucket client stream fn usage ([57cc2b0](https://github.com/PrivateAIM/hub/commit/57cc2b09a3086d40e22c8bbac9ad26f75615d0f1))
* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* change action order of analysis subscriber ([9fbd6fe](https://github.com/PrivateAIM/hub/commit/9fbd6fe72dccdc75b44b542115f170c799beb22b))
* cleanup analysis controller ([1554ba8](https://github.com/PrivateAIM/hub/commit/1554ba812fa4e809cc9668346ab945e26f784ada))
* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* controller validation and buisness logic & adjusted test cases ([4b0041c](https://github.com/PrivateAIM/hub/commit/4b0041c34d33dc1190617e203056e1c966799ef7))
* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump [@socket](https://github.com/socket).io/redis-adapter from 8.2.1 to 8.3.0 ([#180](https://github.com/PrivateAIM/hub/issues/180)) ([665d86f](https://github.com/PrivateAIM/hub/commit/665d86fa563af1a28a15c4d77c19dee5c6843aa6))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.1 to 1.0.0-beta.3 ([#55](https://github.com/PrivateAIM/hub/issues/55)) ([beb30d2](https://github.com/PrivateAIM/hub/commit/beb30d2ab76139a473ff7245ee7e078e73cd1d57))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump @hapic/vault from 2.3.2 to 2.3.3 ([#213](https://github.com/PrivateAIM/hub/issues/213)) ([94565fc](https://github.com/PrivateAIM/hub/commit/94565fcbd5026ed84cc3c255f1c2ae900c1312cd))
* **deps:** bump @routup/swagger from 2.3.3 to 2.3.4 ([#63](https://github.com/PrivateAIM/hub/issues/63)) ([b5fc00a](https://github.com/PrivateAIM/hub/commit/b5fc00a81f5d1228b12c0443104af6a3a4ab135f))
* **deps:** bump @routup/swagger from 2.3.4 to 2.3.5 ([#95](https://github.com/PrivateAIM/hub/issues/95)) ([7b38e6f](https://github.com/PrivateAIM/hub/commit/7b38e6f64510a2b3c919ee72791f34c6d180e6f7))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 1.3.0 to 2.0.2 ([#42](https://github.com/PrivateAIM/hub/issues/42)) ([9543c57](https://github.com/PrivateAIM/hub/commit/9543c570801787b22b21b3ddfe97f7d3707c86ae))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump minio from 7.1.3 to 8.0.0 ([#338](https://github.com/PrivateAIM/hub/issues/338)) ([f0916a3](https://github.com/PrivateAIM/hub/commit/f0916a3557a4226358e1f2436a70fed1b8f27b29))
* **deps:** bump minio from 8.0.0 to 8.0.1 ([#478](https://github.com/PrivateAIM/hub/issues/478)) ([4df786b](https://github.com/PrivateAIM/hub/commit/4df786b10b385504e0ee1a384699541fcb0954b5))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#225](https://github.com/PrivateAIM/hub/issues/225)) ([75ab55e](https://github.com/PrivateAIM/hub/commit/75ab55ef6df1492378c1f80bdc385011deb6c4b4))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#234](https://github.com/PrivateAIM/hub/issues/234)) ([f7da9c9](https://github.com/PrivateAIM/hub/commit/f7da9c98cb2c73a00d588c99d72008d8c97c7719))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump reflect-metadata from 0.2.1 to 0.2.2 ([#217](https://github.com/PrivateAIM/hub/issues/217)) ([66e557d](https://github.com/PrivateAIM/hub/commit/66e557d914c2a50f014c5060fb153f211b2700d6))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump socket.io from 4.7.3 to 4.7.4 ([#12](https://github.com/PrivateAIM/hub/issues/12)) ([51ae449](https://github.com/PrivateAIM/hub/commit/51ae449c91f69b42e5b4962da7185ab992ea5989))
* **deps:** bump socket.io from 4.7.4 to 4.7.5 ([#183](https://github.com/PrivateAIM/hub/issues/183)) ([7424606](https://github.com/PrivateAIM/hub/commit/74246064f95283eb3f14536d0833e3e1a5da4677))
* **deps:** bump tar from 6.2.0 to 6.2.1 ([#203](https://github.com/PrivateAIM/hub/issues/203)) ([3299460](https://github.com/PrivateAIM/hub/commit/3299460e5a20e2f91094fb24437895d996cfa215))
* **deps:** bump tar from 7.0.1 to 7.1.0 ([#343](https://github.com/PrivateAIM/hub/issues/343)) ([002a7a7](https://github.com/PrivateAIM/hub/commit/002a7a70fc85f0794739a51e9980a64ba8b73946))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))
* **deps:** bump tar from 7.2.0 to 7.4.0 ([#471](https://github.com/PrivateAIM/hub/issues/471)) ([c2ca2e6](https://github.com/PrivateAIM/hub/commit/c2ca2e6877d5230efeba311d4b4de8e97bbadadf))
* **deps:** bump tar to v7 ([68e4120](https://github.com/PrivateAIM/hub/commit/68e41201e834b25b878c666a27e93b8bc811cb23))
* **deps:** bump typeorm from 0.3.19 to 0.3.20 ([#36](https://github.com/PrivateAIM/hub/issues/36)) ([e94d079](https://github.com/PrivateAIM/hub/commit/e94d0793a236178370eb423585182e939577d9e1))
* **deps:** bump typeorm-extension from 3.3.0 to 3.4.0 ([#58](https://github.com/PrivateAIM/hub/issues/58)) ([f3917cb](https://github.com/PrivateAIM/hub/commit/f3917cbd2f81b96e0afe2b35c278e6c47d8ee628))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* **deps:** bump zod from 3.22.4 to 3.23.4 ([#318](https://github.com/PrivateAIM/hub/issues/318)) ([d8ac5c9](https://github.com/PrivateAIM/hub/commit/d8ac5c9d51a8a6f603534f755fea0c27e7004cc7))
* **deps:** bump zod from 3.23.4 to 3.23.5 ([#331](https://github.com/PrivateAIM/hub/issues/331)) ([105eb98](https://github.com/PrivateAIM/hub/commit/105eb98011e434e21cdf10330ed4a25949c17809))
* **deps:** bump zod from 3.23.5 to 3.23.7 ([#354](https://github.com/PrivateAIM/hub/issues/354)) ([19400b6](https://github.com/PrivateAIM/hub/commit/19400b6866b4616a5f450be471e37bbe85c0a05c))
* don't require node to be associated to a registry ([d62c3df](https://github.com/PrivateAIM/hub/commit/d62c3dfb2fc7749e4ec7d25085f671da6b92674a))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* env file creation in Dockerfile ([3d488f4](https://github.com/PrivateAIM/hub/commit/3d488f4457ac5c5ea3a3c0f4918785e271ffdd59))
* env variable naming ([6cb361a](https://github.com/PrivateAIM/hub/commit/6cb361a039d8cc708b91753a39ad613f38e45bfa))
* http node read handler ([19c41b7](https://github.com/PrivateAIM/hub/commit/19c41b7184460b4bf9c30652fa0944fb4431deea))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* log when command execution pipeline fails ([333c641](https://github.com/PrivateAIM/hub/commit/333c6410ea78437164384ec213e967a0219dcfd8))
* middlewares in realtime service & connection handlers ([7e6b04d](https://github.com/PrivateAIM/hub/commit/7e6b04d3825fe5a2ff785da7c93ca0034b80af0b))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor environment variable naming issues ([0418c1a](https://github.com/PrivateAIM/hub/commit/0418c1ac69d40f79300f4be1f7b96b31bdf41460))
* minor fix in auth middleware ([f6dc1cd](https://github.com/PrivateAIM/hub/commit/f6dc1cd7bcff4cf01aa8c8adda0a8391da29c3b3))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* node robot create util ([97c08ba](https://github.com/PrivateAIM/hub/commit/97c08ba3ac3a22df60081796dffebcf881d62340))
* only mount swagger middleware in production/development ([d3707e3](https://github.com/PrivateAIM/hub/commit/d3707e3ecd51fdab070553d90c111fdc1d7aa6c0))
* only throw error on bucket creation if status code is not equal to 404/409 ([66fbbf4](https://github.com/PrivateAIM/hub/commit/66fbbf4fdf3de4e2cfccf4f1db8cb314993bfc1b))
* package references in test suites ([fe6deed](https://github.com/PrivateAIM/hub/commit/fe6deed703a55891df43f2fa86092d3aa38c6a0e))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))
* pick random registry for analysis if none is defined ([b519a32](https://github.com/PrivateAIM/hub/commit/b519a321d6999e8764a5211ca6b22d26de72b27c))
* project-node read endpoint ([6c46153](https://github.com/PrivateAIM/hub/commit/6c46153114eec1f6aaa9e9fd1dae0bc69519ef89))
* query result return type comparision ([4da80b9](https://github.com/PrivateAIM/hub/commit/4da80b9e599d77e406921d865cf97e45748409a1))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* reenable authup robot aggregator ([a684e57](https://github.com/PrivateAIM/hub/commit/a684e5764bb6e483211968a63b655b09070dacb1))
* remaining server-api build errors ([96b0fd0](https://github.com/PrivateAIM/hub/commit/96b0fd0aba3b95526fa9c4c1f18a327ef76f251e))
* remove loggig in error middleware ([375a379](https://github.com/PrivateAIM/hub/commit/375a379e783c7e4eaf0aff67c1612d71d4dcb712))
* remove logging error in console ([006560a](https://github.com/PrivateAIM/hub/commit/006560a59eb8e2203751b0b0e287c171b9afd176))
* remove migration files ([c390c21](https://github.com/PrivateAIM/hub/commit/c390c2170ff1db65a467caa2bc4f370253cf46b8))
* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* remove registry project check for pushing analysis container to registry ([3135e08](https://github.com/PrivateAIM/hub/commit/3135e08c625a0b23284b7ca4678a3bd20be5d759))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* restriction for analysis-node collection endpoint ([73412f9](https://github.com/PrivateAIM/hub/commit/73412f95d1b13ccacf45bfa4e99dcdcc1ea4dfef))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))
* separate redis instance for publishing events ([bf95ef3](https://github.com/PrivateAIM/hub/commit/bf95ef36901e5bc2d6167b540fd6440a3db10a1b))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))
* spelling in container-pack fn ([bb8df2b](https://github.com/PrivateAIM/hub/commit/bb8df2bd205dde0eb031b3ee96bf9097e25faef9))
* **storage:** add missing logger configuration + enhanced db queries ([5fd1515](https://github.com/PrivateAIM/hub/commit/5fd15156cb6aaae254a2710bb832a58ce789c20d))
* **storage:** use primary key as minio bucket name + persist minio storage in docker-compose ([cfc4cbb](https://github.com/PrivateAIM/hub/commit/cfc4cbbb3df1cfe1a6c56cae7fc1efffd44971d9))
* test domain utils ([8634408](https://github.com/PrivateAIM/hub/commit/8634408f2141cefd6e466331b3a841afdf8abca9))
* transform service ids to lower case ([484ebb6](https://github.com/PrivateAIM/hub/commit/484ebb650f9e2ab0efc38771332a84bd4c578988))
* typings of supertest in test-suite ([d50e7a7](https://github.com/PrivateAIM/hub/commit/d50e7a75722ee8fc9813f038109f6f7f131c14ba))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))
* use build analysis bucket file name for streaming files ([93e6af1](https://github.com/PrivateAIM/hub/commit/93e6af19ce3b041fecf1ed73b33db771a2043751))
* use correct env variable for core client initialization ([6880afd](https://github.com/PrivateAIM/hub/commit/6880afda0d415156f2b35e13deda805442fffb94))

## [0.6.0](https://github.com/PrivateAIM/hub/compare/root-v0.5.0...root-v0.6.0) (2024-06-25)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* tar use new onReadEntry in favor of deprecated onentry fn ([9294bc0](https://github.com/PrivateAIM/hub/commit/9294bc01db06c194a112e6ac51df4defc94363f7))


### Bug Fixes

* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* api routes analysis-bucket-file api client ([d0a9e73](https://github.com/PrivateAIM/hub/commit/d0a9e73271acb7d4b403500097a5cc3e3a30b599))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump minio from 8.0.0 to 8.0.1 ([#478](https://github.com/PrivateAIM/hub/issues/478)) ([4df786b](https://github.com/PrivateAIM/hub/commit/4df786b10b385504e0ee1a384699541fcb0954b5))
* **deps:** bump tar from 7.2.0 to 7.4.0 ([#471](https://github.com/PrivateAIM/hub/issues/471)) ([c2ca2e6](https://github.com/PrivateAIM/hub/commit/c2ca2e6877d5230efeba311d4b4de8e97bbadadf))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* http node read handler ([19c41b7](https://github.com/PrivateAIM/hub/commit/19c41b7184460b4bf9c30652fa0944fb4431deea))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* project-node read endpoint ([6c46153](https://github.com/PrivateAIM/hub/commit/6c46153114eec1f6aaa9e9fd1dae0bc69519ef89))
* reenable authup robot aggregator ([a684e57](https://github.com/PrivateAIM/hub/commit/a684e5764bb6e483211968a63b655b09070dacb1))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* restriction for analysis-node collection endpoint ([73412f9](https://github.com/PrivateAIM/hub/commit/73412f95d1b13ccacf45bfa4e99dcdcc1ea4dfef))
* **storage:** add missing logger configuration + enhanced db queries ([5fd1515](https://github.com/PrivateAIM/hub/commit/5fd15156cb6aaae254a2710bb832a58ce789c20d))
* **storage:** use primary key as minio bucket name + persist minio storage in docker-compose ([cfc4cbb](https://github.com/PrivateAIM/hub/commit/cfc4cbbb3df1cfe1a6c56cae7fc1efffd44971d9))

## [0.5.0](https://github.com/PrivateAIM/hub/compare/root-v0.4.0...root-v0.5.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial implementation of server-realtime-kit package ([#380](https://github.com/PrivateAIM/hub/issues/380)) ([3963b66](https://github.com/PrivateAIM/hub/commit/3963b66d27dcb857041eefed824297f35a32d1b6))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))
* minor fix in auth middleware ([f6dc1cd](https://github.com/PrivateAIM/hub/commit/f6dc1cd7bcff4cf01aa8c8adda0a8391da29c3b3))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/root-v0.4.0...root-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial implementation of server-realtime-kit package ([#380](https://github.com/PrivateAIM/hub/issues/380)) ([3963b66](https://github.com/PrivateAIM/hub/commit/3963b66d27dcb857041eefed824297f35a32d1b6))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))
* minor fix in auth middleware ([f6dc1cd](https://github.com/PrivateAIM/hub/commit/f6dc1cd7bcff4cf01aa8c8adda0a8391da29c3b3))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/root-v0.3.0...root-v0.4.0) (2024-05-15)


### Features

* add node type- & online-attribute ([c92a00e](https://github.com/PrivateAIM/hub/commit/c92a00ecce27b57b1ad7834ebe826bce94f3c48b))
* add ui package to docker-compose ([75f6bfc](https://github.com/PrivateAIM/hub/commit/75f6bfc56eeb8b58c8f120209583d81d03605a95))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* allow referencing custom robot account to node ([a3277a2](https://github.com/PrivateAIM/hub/commit/a3277a2aa7a8ae2cc44db27afd29694a630d5a89))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* auto approval for aggregator nodes ([94b4f30](https://github.com/PrivateAIM/hub/commit/94b4f30464ef48ab34411c3d38eced4845d367a7))
* better analysis buckets naming strategy ([afc3bbd](https://github.com/PrivateAIM/hub/commit/afc3bbd67c90dd40009091a1fd87a2ab0f01703d))
* better restrictions for linking files to an analysis ([45a6d8a](https://github.com/PrivateAIM/hub/commit/45a6d8a8b9699dbf6c5a418dec91a3cfb8b1e3e0))
* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bucket-file stream route handler & updated test suite ([9b4cfa0](https://github.com/PrivateAIM/hub/commit/9b4cfa006a830f070b16991ef5730394f7fe19cc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* don't tar pack single bucket-file ([e0d3c17](https://github.com/PrivateAIM/hub/commit/e0d3c17e56eab4225e590cde17d85ccd70663c24))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* enable possibility to unlock analysis configuration ([#245](https://github.com/PrivateAIM/hub/issues/245)) ([1053362](https://github.com/PrivateAIM/hub/commit/105336254714a1e64d340eb66c10ec1681890559))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* http server and implement health endpoint ([acab9a7](https://github.com/PrivateAIM/hub/commit/acab9a72ef46524a6bc4d20c5c03dea6c55abcfd))
* identify bucket by id or name via http controller endpoint ([45d03c0](https://github.com/PrivateAIM/hub/commit/45d03c0ea3352ece4d24f708d7d83a1e140e7199))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* implemented health check endpoint for realtime-service ([64c0d12](https://github.com/PrivateAIM/hub/commit/64c0d1224e66407246d9bf8c7db8e603a00723d3))
* initial cleanup of realtime service ([d167ed4](https://github.com/PrivateAIM/hub/commit/d167ed4b5fea1038fe4112b662a26ca7a19a564d))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial test setup ([#117](https://github.com/PrivateAIM/hub/issues/117)) ([d90c326](https://github.com/PrivateAIM/hub/commit/d90c326248c2a87a2b3dbd423232ad22321f824d))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* initial version of analysis service ([f420cd1](https://github.com/PrivateAIM/hub/commit/f420cd185441ed2e9e4ef8e12992add68a90dd4f))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* integrated vault client in server-storage package ([c82c4e8](https://github.com/PrivateAIM/hub/commit/c82c4e8c1cb99d19091fd8baf0326438d46ae9f8))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* lock analysis-node creation after analyis is locked ([e353a27](https://github.com/PrivateAIM/hub/commit/e353a275daaba1f1972c6cd724bb04f1d85d4af5))
* log analysis buckets configuration/destroying-process ([537d650](https://github.com/PrivateAIM/hub/commit/537d65081dee96b3a37cf413a481a6d9447806ba))
* minio client management (env, singleton, ...) ([#115](https://github.com/PrivateAIM/hub/issues/115)) ([f9689b8](https://github.com/PrivateAIM/hub/commit/f9689b8bcff2cc9570830d817903bcae222521d2))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactor controllers (validations, fields, ...) ([e798174](https://github.com/PrivateAIM/hub/commit/e798174146eb5ccfdd13ce2026fe616e09f09300))
* refactor service singleton management ([#131](https://github.com/PrivateAIM/hub/issues/131)) ([7b9195f](https://github.com/PrivateAIM/hub/commit/7b9195fe0c5eca7a3dfcd356edac55b47ba15278))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove permission & role presets ([ea679aa](https://github.com/PrivateAIM/hub/commit/ea679aad29bdf773fc445af66637b518287a96f1))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* renamed database subscribers ([88405cc](https://github.com/PrivateAIM/hub/commit/88405cceca74218a6485abff0e2fae0b8429e3a1))
* restrict analyis-node management after an analysis has been locked ([#244](https://github.com/PrivateAIM/hub/issues/244)) ([11cc582](https://github.com/PrivateAIM/hub/commit/11cc5824e677368aecac6afe00493886b7a3182b))
* restrict update/delete operator by bucket(-file) owner ([07ec40a](https://github.com/PrivateAIM/hub/commit/07ec40ae24cfa68184e865c006e9745b973cf34c))
* service health endpoint & docker health check ([aa4ef27](https://github.com/PrivateAIM/hub/commit/aa4ef27a0ec56373204f2cc0c3eccf5011519883))
* setup default harbor service on startup if defined ([#170](https://github.com/PrivateAIM/hub/issues/170)) ([e9d9d68](https://github.com/PrivateAIM/hub/commit/e9d9d688548fa1b6fa0e68f8ce024b497335a6b9))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* sync master-images on start up ([#169](https://github.com/PrivateAIM/hub/issues/169)) ([a4a916e](https://github.com/PrivateAIM/hub/commit/a4a916ece8e1022d8c2db3bb3de6b0a6d7df37da))
* trigger analysis action in controller instead of subscriber ([026c56a](https://github.com/PrivateAIM/hub/commit/026c56acf6950b473dfe3e5b777c70b659e5b0a9))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* updated bootstrap-vue-next & adjusted usage ([ca76f9f](https://github.com/PrivateAIM/hub/commit/ca76f9f41a250aa23717ccbb55127bbd092c032b))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* add node robot_id field as default field ([8d198fc](https://github.com/PrivateAIM/hub/commit/8d198fca8fc9357b8308a2b2363b6b86b6935523))
* adjust rabbitmq version in docker-compose ([1b3ccc8](https://github.com/PrivateAIM/hub/commit/1b3ccc836352a8a3fddf081be0b1fee076b8e28e))
* aggregators & remove router + extractor handlers ([d58ee95](https://github.com/PrivateAIM/hub/commit/d58ee957064cd1e447533234a6665117ccb67ec9))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis imports in server-api package ([44d05a3](https://github.com/PrivateAIM/hub/commit/44d05a3b85b7ef0938db0192cffaeee0ba5b7f05))
* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* bucket client stream fn usage ([57cc2b0](https://github.com/PrivateAIM/hub/commit/57cc2b09a3086d40e22c8bbac9ad26f75615d0f1))
* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* change action order of analysis subscriber ([9fbd6fe](https://github.com/PrivateAIM/hub/commit/9fbd6fe72dccdc75b44b542115f170c799beb22b))
* cleanup analysis controller ([1554ba8](https://github.com/PrivateAIM/hub/commit/1554ba812fa4e809cc9668346ab945e26f784ada))
* controller validation and buisness logic & adjusted test cases ([4b0041c](https://github.com/PrivateAIM/hub/commit/4b0041c34d33dc1190617e203056e1c966799ef7))
* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump [@socket](https://github.com/socket).io/redis-adapter from 8.2.1 to 8.3.0 ([#180](https://github.com/PrivateAIM/hub/issues/180)) ([665d86f](https://github.com/PrivateAIM/hub/commit/665d86fa563af1a28a15c4d77c19dee5c6843aa6))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.1 to 1.0.0-beta.3 ([#55](https://github.com/PrivateAIM/hub/issues/55)) ([beb30d2](https://github.com/PrivateAIM/hub/commit/beb30d2ab76139a473ff7245ee7e078e73cd1d57))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump @hapic/vault from 2.3.2 to 2.3.3 ([#213](https://github.com/PrivateAIM/hub/issues/213)) ([94565fc](https://github.com/PrivateAIM/hub/commit/94565fcbd5026ed84cc3c255f1c2ae900c1312cd))
* **deps:** bump @routup/swagger from 2.3.3 to 2.3.4 ([#63](https://github.com/PrivateAIM/hub/issues/63)) ([b5fc00a](https://github.com/PrivateAIM/hub/commit/b5fc00a81f5d1228b12c0443104af6a3a4ab135f))
* **deps:** bump @routup/swagger from 2.3.4 to 2.3.5 ([#95](https://github.com/PrivateAIM/hub/issues/95)) ([7b38e6f](https://github.com/PrivateAIM/hub/commit/7b38e6f64510a2b3c919ee72791f34c6d180e6f7))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 1.3.0 to 2.0.2 ([#42](https://github.com/PrivateAIM/hub/issues/42)) ([9543c57](https://github.com/PrivateAIM/hub/commit/9543c570801787b22b21b3ddfe97f7d3707c86ae))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump minio from 7.1.3 to 8.0.0 ([#338](https://github.com/PrivateAIM/hub/issues/338)) ([f0916a3](https://github.com/PrivateAIM/hub/commit/f0916a3557a4226358e1f2436a70fed1b8f27b29))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#225](https://github.com/PrivateAIM/hub/issues/225)) ([75ab55e](https://github.com/PrivateAIM/hub/commit/75ab55ef6df1492378c1f80bdc385011deb6c4b4))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#234](https://github.com/PrivateAIM/hub/issues/234)) ([f7da9c9](https://github.com/PrivateAIM/hub/commit/f7da9c98cb2c73a00d588c99d72008d8c97c7719))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump reflect-metadata from 0.2.1 to 0.2.2 ([#217](https://github.com/PrivateAIM/hub/issues/217)) ([66e557d](https://github.com/PrivateAIM/hub/commit/66e557d914c2a50f014c5060fb153f211b2700d6))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump socket.io from 4.7.3 to 4.7.4 ([#12](https://github.com/PrivateAIM/hub/issues/12)) ([51ae449](https://github.com/PrivateAIM/hub/commit/51ae449c91f69b42e5b4962da7185ab992ea5989))
* **deps:** bump socket.io from 4.7.4 to 4.7.5 ([#183](https://github.com/PrivateAIM/hub/issues/183)) ([7424606](https://github.com/PrivateAIM/hub/commit/74246064f95283eb3f14536d0833e3e1a5da4677))
* **deps:** bump tar from 6.2.0 to 6.2.1 ([#203](https://github.com/PrivateAIM/hub/issues/203)) ([3299460](https://github.com/PrivateAIM/hub/commit/3299460e5a20e2f91094fb24437895d996cfa215))
* **deps:** bump tar from 7.0.1 to 7.1.0 ([#343](https://github.com/PrivateAIM/hub/issues/343)) ([002a7a7](https://github.com/PrivateAIM/hub/commit/002a7a70fc85f0794739a51e9980a64ba8b73946))
* **deps:** bump tar to v7 ([68e4120](https://github.com/PrivateAIM/hub/commit/68e41201e834b25b878c666a27e93b8bc811cb23))
* **deps:** bump typeorm from 0.3.19 to 0.3.20 ([#36](https://github.com/PrivateAIM/hub/issues/36)) ([e94d079](https://github.com/PrivateAIM/hub/commit/e94d0793a236178370eb423585182e939577d9e1))
* **deps:** bump typeorm-extension from 3.3.0 to 3.4.0 ([#58](https://github.com/PrivateAIM/hub/issues/58)) ([f3917cb](https://github.com/PrivateAIM/hub/commit/f3917cbd2f81b96e0afe2b35c278e6c47d8ee628))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* **deps:** bump zod from 3.22.4 to 3.23.4 ([#318](https://github.com/PrivateAIM/hub/issues/318)) ([d8ac5c9](https://github.com/PrivateAIM/hub/commit/d8ac5c9d51a8a6f603534f755fea0c27e7004cc7))
* **deps:** bump zod from 3.23.4 to 3.23.5 ([#331](https://github.com/PrivateAIM/hub/issues/331)) ([105eb98](https://github.com/PrivateAIM/hub/commit/105eb98011e434e21cdf10330ed4a25949c17809))
* **deps:** bump zod from 3.23.5 to 3.23.7 ([#354](https://github.com/PrivateAIM/hub/issues/354)) ([19400b6](https://github.com/PrivateAIM/hub/commit/19400b6866b4616a5f450be471e37bbe85c0a05c))
* don't require node to be associated to a registry ([d62c3df](https://github.com/PrivateAIM/hub/commit/d62c3dfb2fc7749e4ec7d25085f671da6b92674a))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* env variable naming ([6cb361a](https://github.com/PrivateAIM/hub/commit/6cb361a039d8cc708b91753a39ad613f38e45bfa))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* log when command execution pipeline fails ([333c641](https://github.com/PrivateAIM/hub/commit/333c6410ea78437164384ec213e967a0219dcfd8))
* middlewares in realtime service & connection handlers ([7e6b04d](https://github.com/PrivateAIM/hub/commit/7e6b04d3825fe5a2ff785da7c93ca0034b80af0b))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor environment variable naming issues ([0418c1a](https://github.com/PrivateAIM/hub/commit/0418c1ac69d40f79300f4be1f7b96b31bdf41460))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* node robot create util ([97c08ba](https://github.com/PrivateAIM/hub/commit/97c08ba3ac3a22df60081796dffebcf881d62340))
* only mount swagger middleware in production/development ([d3707e3](https://github.com/PrivateAIM/hub/commit/d3707e3ecd51fdab070553d90c111fdc1d7aa6c0))
* only throw error on bucket creation if status code is not equal to 404/409 ([66fbbf4](https://github.com/PrivateAIM/hub/commit/66fbbf4fdf3de4e2cfccf4f1db8cb314993bfc1b))
* package references in test suites ([fe6deed](https://github.com/PrivateAIM/hub/commit/fe6deed703a55891df43f2fa86092d3aa38c6a0e))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))
* pick random registry for analysis if none is defined ([b519a32](https://github.com/PrivateAIM/hub/commit/b519a321d6999e8764a5211ca6b22d26de72b27c))
* query result return type comparision ([4da80b9](https://github.com/PrivateAIM/hub/commit/4da80b9e599d77e406921d865cf97e45748409a1))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* remaining server-api build errors ([96b0fd0](https://github.com/PrivateAIM/hub/commit/96b0fd0aba3b95526fa9c4c1f18a327ef76f251e))
* remove loggig in error middleware ([375a379](https://github.com/PrivateAIM/hub/commit/375a379e783c7e4eaf0aff67c1612d71d4dcb712))
* remove logging error in console ([006560a](https://github.com/PrivateAIM/hub/commit/006560a59eb8e2203751b0b0e287c171b9afd176))
* remove migration files ([c390c21](https://github.com/PrivateAIM/hub/commit/c390c2170ff1db65a467caa2bc4f370253cf46b8))
* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* remove registry project check for pushing analysis container to registry ([3135e08](https://github.com/PrivateAIM/hub/commit/3135e08c625a0b23284b7ca4678a3bd20be5d759))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))
* separate redis instance for publishing events ([bf95ef3](https://github.com/PrivateAIM/hub/commit/bf95ef36901e5bc2d6167b540fd6440a3db10a1b))
* spelling in container-pack fn ([bb8df2b](https://github.com/PrivateAIM/hub/commit/bb8df2bd205dde0eb031b3ee96bf9097e25faef9))
* test domain utils ([8634408](https://github.com/PrivateAIM/hub/commit/8634408f2141cefd6e466331b3a841afdf8abca9))
* transform service ids to lower case ([484ebb6](https://github.com/PrivateAIM/hub/commit/484ebb650f9e2ab0efc38771332a84bd4c578988))
* typings of supertest in test-suite ([d50e7a7](https://github.com/PrivateAIM/hub/commit/d50e7a75722ee8fc9813f038109f6f7f131c14ba))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))
* use build analysis bucket file name for streaming files ([93e6af1](https://github.com/PrivateAIM/hub/commit/93e6af19ce3b041fecf1ed73b33db771a2043751))
* use correct env variable for core client initialization ([6880afd](https://github.com/PrivateAIM/hub/commit/6880afda0d415156f2b35e13deda805442fffb94))
