# Changelog

## [0.8.25](https://github.com/PrivateAIM/hub/compare/v0.8.24...v0.8.25) (2026-02-09)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/core-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/telemetry-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/core-http-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/core-realtime-kit bumped from ^0.7.25 to ^0.7.26
    * @privateaim/storage-kit bumped from ^0.8.24 to ^0.8.25
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/core-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/core-http-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/storage-kit bumped from ^0.8.24 to ^0.8.25
    * @privateaim/telemetry-kit bumped from ^0.8.24 to ^0.8.25

## [0.8.24](https://github.com/PrivateAIM/hub/compare/v0.8.23...v0.8.24) (2026-02-09)


### Features

* analysis storage manager component + http endpoint integration ([#1401](https://github.com/PrivateAIM/hub/issues/1401)) ([3ee2e02](https://github.com/PrivateAIM/hub/commit/3ee2e025c725fdafe3359fe502bc05a1757b81f2))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1399](https://github.com/PrivateAIM/hub/issues/1399)) ([e14f030](https://github.com/PrivateAIM/hub/commit/e14f03035b67cdb0058ac6194a312ea24bbfb038))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/core-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/telemetry-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/core-http-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/core-realtime-kit bumped from ^0.7.24 to ^0.7.25
    * @privateaim/storage-kit bumped from ^0.8.23 to ^0.8.24
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/core-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/core-http-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/storage-kit bumped from ^0.8.23 to ^0.8.24
    * @privateaim/telemetry-kit bumped from ^0.8.23 to ^0.8.24

## [0.8.23](https://github.com/PrivateAIM/hub/compare/v0.8.22...v0.8.23) (2026-02-02)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1392](https://github.com/PrivateAIM/hub/issues/1392)) ([23060bf](https://github.com/PrivateAIM/hub/commit/23060bfce24100d17d4d83c7ee45ed6d85073c6b))
* initializing event component + reading event batches ([482e9e6](https://github.com/PrivateAIM/hub/commit/482e9e65f2aba1811bec26c4fcebe4d4bc91234b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/core-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/telemetry-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/core-http-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/core-realtime-kit bumped from ^0.7.23 to ^0.7.24
    * @privateaim/storage-kit bumped from ^0.8.22 to ^0.8.23
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/core-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/core-http-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/storage-kit bumped from ^0.8.22 to ^0.8.23
    * @privateaim/telemetry-kit bumped from ^0.8.22 to ^0.8.23

## [0.8.22](https://github.com/PrivateAIM/hub/compare/v0.8.21...v0.8.22) (2026-01-27)


### Features

* add aggregation column nodes_approved + build_nodes_valid ([#1308](https://github.com/PrivateAIM/hub/issues/1308)) ([2ef0d57](https://github.com/PrivateAIM/hub/commit/2ef0d5701c66b6f4b45a162c7b9413efd8764d1f))
* analysis-distributor  ([#1285](https://github.com/PrivateAIM/hub/issues/1285)) ([5da60be](https://github.com/PrivateAIM/hub/commit/5da60be91c4ae27ea16369b5d7e3d09782118826))
* bucket-file aggregation with analysis-bucket-file management ([#1324](https://github.com/PrivateAIM/hub/issues/1324)) ([00d5aa8](https://github.com/PrivateAIM/hub/commit/00d5aa8bc16a66d7a761ef60b2b4ec27983e5c9a))
* build/push progress analysis & master images ([#1345](https://github.com/PrivateAIM/hub/issues/1345)) ([ca9919f](https://github.com/PrivateAIM/hub/commit/ca9919f92e05a4f407dc8bb849c971068522e53e))
* check handlers for analysis building and distribution ([#1318](https://github.com/PrivateAIM/hub/issues/1318)) ([a43ba20](https://github.com/PrivateAIM/hub/commit/a43ba203223ee5ffc00e63c3ff1d8829970590b2))
* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))
* rename run_status to execution_status ([e039cb7](https://github.com/PrivateAIM/hub/commit/e039cb7a6c436e279053b08c8de933d126637608))
* replace AnalysisXXXStatus with ProcessStatus ([#1276](https://github.com/PrivateAIM/hub/issues/1276)) ([f4826cf](https://github.com/PrivateAIM/hub/commit/f4826cf0938d0171565a1aae880c5d724fbc107b))
* replace loki with victorialogs ([#1346](https://github.com/PrivateAIM/hub/issues/1346)) ([ddf42ce](https://github.com/PrivateAIM/hub/commit/ddf42ced181c4e29ab55c2f5e1ebc155c44095c7))
* replace robot with client entity ([#1349](https://github.com/PrivateAIM/hub/issues/1349)) ([f4025bc](https://github.com/PrivateAIM/hub/commit/f4025bcf891783f12b609892e75feeb3f1abbef3))
* store analysis build hash, size & os ([#1374](https://github.com/PrivateAIM/hub/issues/1374)) ([6110ba6](https://github.com/PrivateAIM/hub/commit/6110ba6c94b3321c1477173c35afdea8b04ad33d))


### Bug Fixes

* change order of vault registration ([a3d55f3](https://github.com/PrivateAIM/hub/commit/a3d55f3e90a419d1a92e87f9c40cc7f7adcedca1))
* **deps:** bump the minorandpatch group across 1 directory with 12 updates ([#1343](https://github.com/PrivateAIM/hub/issues/1343)) ([015daa8](https://github.com/PrivateAIM/hub/commit/015daa8d7403b906eeb175d7ab83dd9df665dc6a))
* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1292](https://github.com/PrivateAIM/hub/issues/1292)) ([acdc7cb](https://github.com/PrivateAIM/hub/commit/acdc7cb8aa12e85818d69638c29ab79c74fbcbb6))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1329](https://github.com/PrivateAIM/hub/issues/1329)) ([7b394da](https://github.com/PrivateAIM/hub/commit/7b394da159d8e52cc37fe489832307a234f3ddb0))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1331](https://github.com/PrivateAIM/hub/issues/1331)) ([2802bc3](https://github.com/PrivateAIM/hub/commit/2802bc319b84453f8bb351ba1723d9a58bba9830))
* disable image command arguments if analysis is locked ([fac0d48](https://github.com/PrivateAIM/hub/commit/fac0d482c207bfba527b3e1692fd8dfefa189187))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/core-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/telemetry-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/core-http-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/core-realtime-kit bumped from ^0.7.22 to ^0.7.23
    * @privateaim/storage-kit bumped from ^0.8.21 to ^0.8.22
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/core-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/core-http-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/storage-kit bumped from ^0.8.21 to ^0.8.22
    * @privateaim/telemetry-kit bumped from ^0.8.21 to ^0.8.22

## [0.8.21](https://github.com/PrivateAIM/hub/compare/v0.8.20...v0.8.21) (2025-11-04)


### Features

* redesign analysis view and configuration ([#1254](https://github.com/PrivateAIM/hub/issues/1254)) ([b06fb94](https://github.com/PrivateAIM/hub/commit/b06fb945739afd1a82c1afc77ef493c318f243ac))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/core-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/telemetry-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/core-http-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/core-realtime-kit bumped from ^0.7.21 to ^0.7.22
    * @privateaim/storage-kit bumped from ^0.8.20 to ^0.8.21
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/storage-kit bumped from ^0.8.20 to ^0.8.21
    * @privateaim/telemetry-kit bumped from ^0.8.20 to ^0.8.21

## [0.8.20](https://github.com/PrivateAIM/hub/compare/v0.8.19...v0.8.20) (2025-10-29)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 13 updates ([#1246](https://github.com/PrivateAIM/hub/issues/1246)) ([bc898f9](https://github.com/PrivateAIM/hub/commit/bc898f9e40b52d6a93b815f9a07fb517219d051f))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1231](https://github.com/PrivateAIM/hub/issues/1231)) ([dddccd3](https://github.com/PrivateAIM/hub/commit/dddccd358e8caa9512bd8945dd8f1efc7155b20e))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1249](https://github.com/PrivateAIM/hub/issues/1249)) ([2fad46d](https://github.com/PrivateAIM/hub/commit/2fad46d04dd4201326d802e0b9365877b95d5f21))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/core-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/telemetry-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/core-http-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/core-realtime-kit bumped from ^0.7.20 to ^0.7.21
    * @privateaim/storage-kit bumped from ^0.8.19 to ^0.8.20
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/storage-kit bumped from ^0.8.19 to ^0.8.20
    * @privateaim/telemetry-kit bumped from ^0.8.19 to ^0.8.20

## [0.8.19](https://github.com/PrivateAIM/hub/compare/v0.8.18...v0.8.19) (2025-09-24)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#1204](https://github.com/PrivateAIM/hub/issues/1204)) ([72923d8](https://github.com/PrivateAIM/hub/commit/72923d81911880e176907e893c62241fe7f849f3))
* list handlers processing queue ([#1221](https://github.com/PrivateAIM/hub/issues/1221)) ([74df4b8](https://github.com/PrivateAIM/hub/commit/74df4b8adf78a1d912cfd87c541e060703b3889a))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/core-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/telemetry-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/core-http-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/core-realtime-kit bumped from ^0.7.19 to ^0.7.20
    * @privateaim/storage-kit bumped from ^0.8.18 to ^0.8.19
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/storage-kit bumped from ^0.8.18 to ^0.8.19
    * @privateaim/telemetry-kit bumped from ^0.8.18 to ^0.8.19

## [0.8.18](https://github.com/PrivateAIM/hub/compare/v0.8.17...v0.8.18) (2025-09-16)


### Features

* list handler class with stack (fifo) processing ([0281360](https://github.com/PrivateAIM/hub/commit/0281360bc0ff1a549e3ca08510c6e6be8abfed1b))
* reload button for analysis logs ([bcb8e61](https://github.com/PrivateAIM/hub/commit/bcb8e61e65dc77ce26bafcf26c8a004d12013fbc))


### Bug Fixes

* bootstrap-vue-next useModal,orchestrator,... usage ([5a929ae](https://github.com/PrivateAIM/hub/commit/5a929aed655c5ab6bd625c3d75eb3155e8512a14))
* bucket file deletion ([c96febb](https://github.com/PrivateAIM/hub/commit/c96febb91051efbc141ac14a9182e5a19dd9a28a))
* change analysis bucket file list without socket events ([#1196](https://github.com/PrivateAIM/hub/issues/1196)) ([369193c](https://github.com/PrivateAIM/hub/commit/369193c9d30aa36ecbc2bf0c7a5dabdc2c1ea7d6))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1194](https://github.com/PrivateAIM/hub/issues/1194)) ([46336b8](https://github.com/PrivateAIM/hub/commit/46336b8d8f320705bf216bab81ed61d940ff2895))
* remove fooo keyword in analysis-wizard ([#1195](https://github.com/PrivateAIM/hub/issues/1195)) ([b9834da](https://github.com/PrivateAIM/hub/commit/b9834da89bb77048bb39bd6322c805b6b400e3bb))
* rendering analysis wizard modal ([9c28b0c](https://github.com/PrivateAIM/hub/commit/9c28b0c50c9ee9d27934af991fcf1765d16493d8))
* rendering master image events ([ff5d016](https://github.com/PrivateAIM/hub/commit/ff5d0169e44bba7713be7738848f40dd095033ad))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/core-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/telemetry-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/core-http-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/core-realtime-kit bumped from ^0.7.18 to ^0.7.19
    * @privateaim/storage-kit bumped from ^0.8.17 to ^0.8.18
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/storage-kit bumped from ^0.8.17 to ^0.8.18
    * @privateaim/telemetry-kit bumped from ^0.8.17 to ^0.8.18

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)


### Bug Fixes

* add missing attributes for analysis-node-log submission ([b0ddabd](https://github.com/PrivateAIM/hub/commit/b0ddabd4fd8a744ad15cac877454988958319261))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/core-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/telemetry-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/core-http-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/core-realtime-kit bumped from ^0.7.17 to ^0.7.18
    * @privateaim/storage-kit bumped from ^0.8.16 to ^0.8.17
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/storage-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/telemetry-kit bumped from ^0.8.16 to ^0.8.17

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* log rendering component(s) ([424ee0d](https://github.com/PrivateAIM/hub/commit/424ee0d003de17d02770a5b2bed6fe4a1e968773))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* remove rsa key generation feature ([b754dfc](https://github.com/PrivateAIM/hub/commit/b754dfce9e17a28e09319e14deb0c5473c0b2ae6))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 16 updates ([#1132](https://github.com/PrivateAIM/hub/issues/1132)) ([f1d5add](https://github.com/PrivateAIM/hub/commit/f1d5adddfef56889d1c6aab8cefd4bfd6993eb2a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))
* docker file & entrypoint + added amqp config to telemetry service ([2ad782b](https://github.com/PrivateAIM/hub/commit/2ad782bf188ad087d4e4d720eb2812254dcc202e))
* domain subscriber + queue event create task submission ([94c61ea](https://github.com/PrivateAIM/hub/commit/94c61ead90db550f50edbd9217fb1956230e9609))
* rendering events table ([4d3c04d](https://github.com/PrivateAIM/hub/commit/4d3c04dedb2a12d3aca5c22e35d9ab3b0bfa4e21))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/core-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/telemetry-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/core-http-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/core-realtime-kit bumped from ^0.7.16 to ^0.7.17
    * @privateaim/storage-kit bumped from ^0.8.15 to ^0.8.16
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/storage-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/telemetry-kit bumped from ^0.8.15 to ^0.8.16

## [0.8.15](https://github.com/PrivateAIM/hub/compare/v0.8.14...v0.8.15) (2025-07-30)


### Features

* align analysis-logs & initital log render view ([5fd2365](https://github.com/PrivateAIM/hub/commit/5fd236552dd8489d7ab00bf6f59751824ce554fd))
* event (re-) modelling ([#1125](https://github.com/PrivateAIM/hub/issues/1125)) ([621f704](https://github.com/PrivateAIM/hub/commit/621f7041794d0bf6d530445a9c3e7c9b66a373ba))
* migrated to authup v1.0.0-beta.27 ([f96db78](https://github.com/PrivateAIM/hub/commit/f96db782a5b74e3aa8ab1ada270af770f3c92631))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/core-http-kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/storage-kit bumped from ^0.8.14 to ^0.8.15
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.14 to ^0.8.15
    * @privateaim/storage-kit bumped from ^0.8.14 to ^0.8.15

## [0.8.14](https://github.com/PrivateAIM/hub/compare/v0.8.13...v0.8.14) (2025-07-10)


### Features

* analysis-node-event entity, subscriber & client ([#1096](https://github.com/PrivateAIM/hub/issues/1096)) ([6351376](https://github.com/PrivateAIM/hub/commit/635137696684b181962055dff5afa66b80567e26))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1114](https://github.com/PrivateAIM/hub/issues/1114)) ([1b644a8](https://github.com/PrivateAIM/hub/commit/1b644a8df5200356bc91c624379917c8dd409fdc))
* **deps:** bump the minorandpatch group across 1 directory with 19 updates ([#1099](https://github.com/PrivateAIM/hub/issues/1099)) ([30b0ab6](https://github.com/PrivateAIM/hub/commit/30b0ab6b748b287380eb84ac0c8aae4ee22e0be7))
* **deps:** bump the minorandpatch group across 1 directory with 24 updates ([#1084](https://github.com/PrivateAIM/hub/issues/1084)) ([92a3f43](https://github.com/PrivateAIM/hub/commit/92a3f43eb47795a7fff756939a036f2e771bd3cd))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1091](https://github.com/PrivateAIM/hub/issues/1091)) ([5da2ab0](https://github.com/PrivateAIM/hub/commit/5da2ab0af1133b1c8408317486fb6394cdb2452e))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#1105](https://github.com/PrivateAIM/hub/issues/1105)) ([c4f9255](https://github.com/PrivateAIM/hub/commit/c4f9255832f6473ea1d3fc1793ff9ec2aefacf4c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/core-http-kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/storage-kit bumped from ^0.8.13 to ^0.8.14
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.13 to ^0.8.14
    * @privateaim/storage-kit bumped from ^0.8.13 to ^0.8.14

## [0.8.13](https://github.com/PrivateAIM/hub/compare/v0.8.12...v0.8.13) (2025-05-05)


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#1052](https://github.com/PrivateAIM/hub/issues/1052)) ([d29805f](https://github.com/PrivateAIM/hub/commit/d29805f3b0306b97a56cdd9882ac90e5d66800a6))
* quick fix for analysis bucket file realtime updates ([0e6e2c2](https://github.com/PrivateAIM/hub/commit/0e6e2c2417eac63306981de485b2843cfdb44967))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/core-http-kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/storage-kit bumped from ^0.8.12 to ^0.8.13
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.12 to ^0.8.13
    * @privateaim/storage-kit bumped from ^0.8.12 to ^0.8.13

## [0.8.12](https://github.com/PrivateAIM/hub/compare/v0.8.11...v0.8.12) (2025-04-25)


### Features

* initial design adjustments ([7b0681b](https://github.com/PrivateAIM/hub/commit/7b0681b481c8c022173c7e0d72f1f573c0ed2783))


### Bug Fixes

* handling entity delete handler ([8ded64f](https://github.com/PrivateAIM/hub/commit/8ded64f100e99da481190bfe0db30921721f2bbc))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/core-http-kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/storage-kit bumped from ^0.8.11 to ^0.8.12
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.11 to ^0.8.12
    * @privateaim/storage-kit bumped from ^0.8.11 to ^0.8.12

## [0.8.11](https://github.com/PrivateAIM/hub/compare/v0.8.10...v0.8.11) (2025-04-24)


### Features

* initial permission assignment ui component ([#1027](https://github.com/PrivateAIM/hub/issues/1027)) ([6ec6a87](https://github.com/PrivateAIM/hub/commit/6ec6a876b368f6cb373976a1d126f9119bed429e))


### Bug Fixes

* **deps:** bump the minorandpatch group with 4 updates ([#1039](https://github.com/PrivateAIM/hub/issues/1039)) ([c2f6c6e](https://github.com/PrivateAIM/hub/commit/c2f6c6e0803044d7a024560d4e41b9e2119c415e))
* realtime updates & simplified analysis wizard file event management ([6c4521e](https://github.com/PrivateAIM/hub/commit/6c4521ea33908002c246e16bef8833f51828e07f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/core-http-kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/storage-kit bumped from ^0.8.10 to ^0.8.11
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.10 to ^0.8.11
    * @privateaim/storage-kit bumped from ^0.8.10 to ^0.8.11

## [0.8.10](https://github.com/PrivateAIM/hub/compare/v0.8.9...v0.8.10) (2025-04-23)


### Bug Fixes

* better typing for slot props ([58d514b](https://github.com/PrivateAIM/hub/commit/58d514b96d759eab9356431876cd15d9ed592f4f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/core-http-kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/storage-kit bumped from ^0.8.9 to ^0.8.10
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.9 to ^0.8.10
    * @privateaim/storage-kit bumped from ^0.8.9 to ^0.8.10

## [0.8.9](https://github.com/PrivateAIM/hub/compare/v0.8.8...v0.8.9) (2025-04-17)


### Features

* restructure domain event handling ([2ad7318](https://github.com/PrivateAIM/hub/commit/2ad7318930bd342d571105982fc92996443326fa))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/core-http-kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/storage-kit bumped from ^0.8.8 to ^0.8.9
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.8 to ^0.8.9
    * @privateaim/storage-kit bumped from ^0.8.8 to ^0.8.9

## [0.8.8](https://github.com/PrivateAIM/hub/compare/v0.8.7...v0.8.8) (2025-04-15)


### Features

* migrated to authup v1.0.0-beta.25 ([a5f6b65](https://github.com/PrivateAIM/hub/commit/a5f6b65499ee3a8c4b4bbdcda47979fa73ee5c48))
* minor redesign to analysis-nodes rendering in analysis view ([23224f5](https://github.com/PrivateAIM/hub/commit/23224f564b8749d8848c5c1f815f11dde290e9e1))
* reusable client authentication hook ([0a608cd](https://github.com/PrivateAIM/hub/commit/0a608cd94984314166c15fa11684e022b5ceb53e))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/core-http-kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/storage-kit bumped from ^0.8.7 to ^0.8.8
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.7 to ^0.8.8
    * @privateaim/storage-kit bumped from ^0.8.7 to ^0.8.8

## [0.8.7](https://github.com/PrivateAIM/hub/compare/v0.8.6...v0.8.7) (2025-03-12)


### Bug Fixes

* remove step property in analysis logs ([6737e26](https://github.com/PrivateAIM/hub/commit/6737e263a6f9fb019568fc51a77af6c7ace5452a))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/core-http-kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/storage-kit bumped from ^0.8.6 to ^0.8.7
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.6 to ^0.8.7
    * @privateaim/storage-kit bumped from ^0.8.6 to ^0.8.7

## [0.8.6](https://github.com/PrivateAIM/hub/compare/v0.8.5...v0.8.6) (2025-03-04)


### Features

* add analysis incoming view on project page ([488303a](https://github.com/PrivateAIM/hub/commit/488303a2d3c77b1af978090ed7bc34d6d3dc6e2e))
* avoid displaying uuids when meaningful ([0a4a13f](https://github.com/PrivateAIM/hub/commit/0a4a13f28a2a488eacdba78e5961d24f15c0bce2))
* command-arguments editor in analysis wizard ([#994](https://github.com/PrivateAIM/hub/issues/994)) ([e8e450f](https://github.com/PrivateAIM/hub/commit/e8e450f5e14e108cedf17844f258d898c44cbdcc))
* emit updated analysis object ([b5724b0](https://github.com/PrivateAIM/hub/commit/b5724b0b51df229fed85a17f37e9f385371d4e0b))
* enable resetting image command arguments in wizard ([d080301](https://github.com/PrivateAIM/hub/commit/d080301333e161e70c22517d886d20fb038f7375))
* enable sorting {analysis,project}-node by node name ([5cd32c0](https://github.com/PrivateAIM/hub/commit/5cd32c040ff7b1c16ed76c0b73f07403b2666aa2))
* master-images command arguments extension ([#991](https://github.com/PrivateAIM/hub/issues/991)) ([7b8d860](https://github.com/PrivateAIM/hub/commit/7b8d86086af5afcc450833f8b07301346ce32a80))
* move analysis image command to master image analysis wizard step ([8058362](https://github.com/PrivateAIM/hub/commit/80583621594f50749ce4d6894d55461683ef4d84))
* redesigned station picker ([#977](https://github.com/PrivateAIM/hub/issues/977)) ([d9b967b](https://github.com/PrivateAIM/hub/commit/d9b967b4cdb15cdcb1085e662b55600dc1073b37))
* refactor command precondition + change order in build_start command ([#981](https://github.com/PrivateAIM/hub/issues/981)) ([85aa834](https://github.com/PrivateAIM/hub/commit/85aa8348dd91a4394ed700d5f57f5de28f80f827))
* reorganized analysis wizard steps ([#978](https://github.com/PrivateAIM/hub/issues/978)) ([9e1913e](https://github.com/PrivateAIM/hub/commit/9e1913e2dbbd98f1fc018ed621d37b78261446eb))
* unify assign action for relational components ([775120a](https://github.com/PrivateAIM/hub/commit/775120a1b24b6f1f409fd003b4d5b23f00adde4d))
* use p-256 for ecdh algorithm ([ec9f241](https://github.com/PrivateAIM/hub/commit/ec9f241b693c8fca0275802aec3e5487711bba69))


### Bug Fixes

* add missing pagination to project node selection ([b9e6a4d](https://github.com/PrivateAIM/hub/commit/b9e6a4de22473521937d25a718233c08d5c369fd))
* analysis update handler ([41a5b86](https://github.com/PrivateAIM/hub/commit/41a5b86438c5f56ac4fd50e4a7f40c8353006e52))
* better ux for analysis wizard, when no entries are selected ([f3e562c](https://github.com/PrivateAIM/hub/commit/f3e562c47b77a341fc50bb0103fe987ffd240cd1))
* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#973](https://github.com/PrivateAIM/hub/issues/973)) ([6c3b98e](https://github.com/PrivateAIM/hub/commit/6c3b98e665d641005d223e348ff0970b453dbf0e))
* **deps:** bump the minorandpatch group across 1 directory with 8 updates ([#985](https://github.com/PrivateAIM/hub/issues/985)) ([ad6992c](https://github.com/PrivateAIM/hub/commit/ad6992c95cc0cf79a88abb5d47f5fdd62c0d4222))
* minor ui adjustments ([894b988](https://github.com/PrivateAIM/hub/commit/894b9886ae7a04373ce7d8501816ee5ca1ff38bc))
* reset image_command_arguments after master image change ([c904823](https://github.com/PrivateAIM/hub/commit/c904823cea8a6269259e60a29b9c1e2192aef4dd))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/core-http-kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/storage-kit bumped from ^0.8.5 to ^0.8.6
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.5 to ^0.8.6
    * @privateaim/storage-kit bumped from ^0.8.5 to ^0.8.6

## [0.8.5](https://github.com/PrivateAIM/hub/compare/v0.8.4...v0.8.5) (2025-01-22)


### Features

* add public_key property to node entity ([69fe08e](https://github.com/PrivateAIM/hub/commit/69fe08e4732852d4cbd977a9bcb145f7fa0cfc15))
* allow node registry_id to be undefined ([a049c7a](https://github.com/PrivateAIM/hub/commit/a049c7ac5a69416ab643a908290e1047a5f7addb))
* basic web crypto implementation (P.P. research-project) + node key-pair generation ([#912](https://github.com/PrivateAIM/hub/issues/912)) ([8cdb9d8](https://github.com/PrivateAIM/hub/commit/8cdb9d8ff140400426ccbd61f254a47fa0e3fab1))
* bump authup dependencies & adjusted code base ([90f7131](https://github.com/PrivateAIM/hub/commit/90f7131723e4e00dad04cb5ababa3e3f232e9c24))
* enable ecdh key pair generation ([#961](https://github.com/PrivateAIM/hub/issues/961)) ([4139e76](https://github.com/PrivateAIM/hub/commit/4139e7693247b2cbb0272efb5f70b8af975a351e))
* enhance typing for doamin entities ([9d7c516](https://github.com/PrivateAIM/hub/commit/9d7c51644b66c9361e5436e2c43f463f4f219f90))
* redesign analysis file upload ([#956](https://github.com/PrivateAIM/hub/issues/956)) ([2e8cb38](https://github.com/PrivateAIM/hub/commit/2e8cb38ac0c34ac8059362f2316e588e938243e2))
* refactoring of master-image workflow ([#845](https://github.com/PrivateAIM/hub/issues/845)) ([7d2b866](https://github.com/PrivateAIM/hub/commit/7d2b8662b24dcf411d3ae8232152fecf53167382))


### Bug Fixes

* **deps:** bump @authup/core-kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#896](https://github.com/PrivateAIM/hub/issues/896)) ([e0dcfed](https://github.com/PrivateAIM/hub/commit/e0dcfed47320bd53fadbca11a05ca677ed0ef7ff))
* **deps:** bump @authup/kit from 1.0.0-beta.22 to 1.0.0-beta.23 ([#901](https://github.com/PrivateAIM/hub/issues/901)) ([00a447c](https://github.com/PrivateAIM/hub/commit/00a447ce40ab17b67b0809b41c4233e424303a7c))
* **deps:** bump authup to v1.0.0-beta.24 ([#963](https://github.com/PrivateAIM/hub/issues/963)) ([90c40c0](https://github.com/PrivateAIM/hub/commit/90c40c0d55018557ee8bb381aad7e3cfbcd29b83))
* **deps:** bump the minorandpatch group across 1 directory with 10 updates ([#962](https://github.com/PrivateAIM/hub/issues/962)) ([caf2001](https://github.com/PrivateAIM/hub/commit/caf2001c0e4dad30f24e4d66ce51ca8c89aba818))
* **deps:** bump the minorandpatch group across 1 directory with 31 updates ([#945](https://github.com/PrivateAIM/hub/issues/945)) ([448e9b8](https://github.com/PrivateAIM/hub/commit/448e9b86bf80f83c4aa8bb32ee0a75190a1d5cb8))
* **deps:** bump the minorandpatch group across 1 directory with 9 updates ([#954](https://github.com/PrivateAIM/hub/issues/954)) ([aa26580](https://github.com/PrivateAIM/hub/commit/aa2658002e869c736ba7079018b198b324b927e7))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/core-http-kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/storage-kit bumped from ^0.8.4 to ^0.8.5
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.4 to ^0.8.5
    * @privateaim/storage-kit bumped from ^0.8.4 to ^0.8.5

## [0.8.4](https://github.com/PrivateAIM/hub/compare/v0.8.3...v0.8.4) (2024-10-24)


### Features

* bump authup & implement async policy & permission evaluation ([#807](https://github.com/PrivateAIM/hub/issues/807)) ([d065562](https://github.com/PrivateAIM/hub/commit/d065562585076e26553ad5a39f4a5789f7e18f24))
* bump authup & vuecs packages + refactored navigation ([c4db8d5](https://github.com/PrivateAIM/hub/commit/c4db8d51588b3d701815e2ba2f9b80e594f3663f))


### Bug Fixes

* bump nuxt + vue & defining enum based component properties ([bdb65d2](https://github.com/PrivateAIM/hub/commit/bdb65d26fc95f7b61f3a7319d9e903ad316e315c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/core-http-kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/storage-kit bumped from ^0.8.3 to ^0.8.4
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.3 to ^0.8.4
    * @privateaim/storage-kit bumped from ^0.8.3 to ^0.8.4

## [0.8.3](https://github.com/PrivateAIM/hub/compare/v0.8.2...v0.8.3) (2024-09-19)


### Features

* align node robot view to default robot view ([#762](https://github.com/PrivateAIM/hub/issues/762)) ([54c5d92](https://github.com/PrivateAIM/hub/commit/54c5d9262797f8bb42aaf12fd887300d6f2a2df0))
* refactored analysis-node status variants ([a28a5a0](https://github.com/PrivateAIM/hub/commit/a28a5a0ed24496d246f837ba987e508727c04549))
* replaced finishing status with running status ([4c68b89](https://github.com/PrivateAIM/hub/commit/4c68b89b05ac2f8fd25ca580be6162303359558b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/core-http-kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/storage-kit bumped from ^0.8.2 to ^0.8.3
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.2 to ^0.8.3
    * @privateaim/storage-kit bumped from ^0.8.2 to ^0.8.3

## [0.8.2](https://github.com/PrivateAIM/hub/compare/v0.8.1...v0.8.2) (2024-08-28)


### Bug Fixes

* code inspection/download button ([#684](https://github.com/PrivateAIM/hub/issues/684)) ([4a987a5](https://github.com/PrivateAIM/hub/commit/4a987a5ed88c734e6ee58d311303052d88119bb1))
* master-image-picker - switching between groups ([#687](https://github.com/PrivateAIM/hub/issues/687)) ([e14df50](https://github.com/PrivateAIM/hub/commit/e14df508d6c366f30ae5257e3b95915d67c35d9d))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/core-http-kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/storage-kit bumped from ^0.8.1 to ^0.8.2
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.1 to ^0.8.2
    * @privateaim/storage-kit bumped from ^0.8.1 to ^0.8.2

## [0.8.1](https://github.com/PrivateAIM/hub/compare/v0.8.0...v0.8.1) (2024-08-19)


### Features

* add description column to analysis entity ([438297b](https://github.com/PrivateAIM/hub/commit/438297beacbb264d3a8034f5a4a79fef7dff1d33))
* add project form description field ([66f2aff](https://github.com/PrivateAIM/hub/commit/66f2affa8bae402618d75fad3225ed0e49bf970a))
* allow specifying branch for syncing master-images ([#587](https://github.com/PrivateAIM/hub/issues/587)) ([b6ff9a5](https://github.com/PrivateAIM/hub/commit/b6ff9a54e8b42fcf7dfd2c1cf0e318973c0e13ec))
* enable recheck in analysis-wizard if storage bucket is not yet available ([cc88e5f](https://github.com/PrivateAIM/hub/commit/cc88e5f5f43cee3e3baf6aadbc6843027af89d5c))
* initial refactoring of analysis incoming view ([10425af](https://github.com/PrivateAIM/hub/commit/10425af18fcaedf9569876590bd7f4fc1fcf2a92))
* initial refactoring of projects incoming view ([c524618](https://github.com/PrivateAIM/hub/commit/c5246185847c3f8d83d9ac22cfecd62f7351392b))
* master image workflow to sync, build & push image/groups ([#574](https://github.com/PrivateAIM/hub/issues/574)) ([146e66f](https://github.com/PrivateAIM/hub/commit/146e66f2408ddd1363e1077a0bd189b87d5b411e))
* refactored analyses & projects list view ([#639](https://github.com/PrivateAIM/hub/issues/639)) ([ee7a6e7](https://github.com/PrivateAIM/hub/commit/ee7a6e7a1f5d3d12c0726d543337c728d4fb0138))
* set nocache options for docker build ([bff52ad](https://github.com/PrivateAIM/hub/commit/bff52ada573cd1ecd8efff722f1164d842dfe145))


### Bug Fixes

* bump nuxt to v3.12.3 and fix corrseponding issues ([312420b](https://github.com/PrivateAIM/hub/commit/312420bce1620b032cb4e752011058dd21a1dcbd))
* master images synchronization process ([604a375](https://github.com/PrivateAIM/hub/commit/604a375b525e73d17c208731dd7256ea30412d57))
* minor cleanup in project item card view ([d16fea6](https://github.com/PrivateAIM/hub/commit/d16fea6c9822912b68009e39f885d924bdb87477))
* project list in analysis basic form ([27e7f72](https://github.com/PrivateAIM/hub/commit/27e7f72c10f4a5284ab04cde09a1c68f7b64d7a3))
* temporarily disable registry project manage restriction ([8f8d8dd](https://github.com/PrivateAIM/hub/commit/8f8d8dd88ea917cf3b967232107487170bcdbaf9))
* use non default export for {analysis,project}-node command & status ([ad74cf6](https://github.com/PrivateAIM/hub/commit/ad74cf625143e4f81d45d6894b86e47c725ad52c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/core-http-kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/storage-kit bumped from ^0.8.0 to ^0.8.1
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.8.0 to ^0.8.1
    * @privateaim/storage-kit bumped from ^0.8.0 to ^0.8.1

## [0.8.0](https://github.com/PrivateAIM/hub/compare/v0.7.0...v0.8.0) (2024-07-02)


### Features

* simplified and adjusted permission usage across codespace ([1839f5e](https://github.com/PrivateAIM/hub/commit/1839f5eb768f120e268e57e0a496fef5eb0eca41))


### Bug Fixes

* **deps:** bump authup to v1.0.0.beta-19 ([3410786](https://github.com/PrivateAIM/hub/commit/34107860d7f810cea7b2024b0f303cd70d32a5fe))
* query prop access in entity-manager ([a87f8fe](https://github.com/PrivateAIM/hub/commit/a87f8fec1f0882962e84ad315d0ab297c5d24392))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/core-http-kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/storage-kit bumped from ^0.7.0 to ^0.8.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.7.0 to ^0.8.0
    * @privateaim/storage-kit bumped from ^0.7.0 to ^0.8.0

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/core-http-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0

## [0.6.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.5.0...client-vue-v0.6.0) (2024-06-25)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Bug Fixes

* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/core-http-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/storage-kit bumped from ^0.5.0 to ^0.6.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/storage-kit bumped from ^0.5.0 to ^0.6.0

## [0.5.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.4.0...client-vue-v0.5.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/core-http-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/storage-kit bumped from ^0.4.0 to ^0.5.0
  * peerDependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/storage-kit bumped from ^0.4.0 to ^0.5.0

## [0.4.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.4.0...client-vue-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.3.0...client-vue-v0.4.0) (2024-05-15)


### Features

* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0
    * @privateaim/storage-kit bumped from ^0.3.0 to ^0.4.0
  * peerDependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0
    * @privateaim/storage-kit bumped from ^0.3.0 to ^0.4.0

## [0.3.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.2.0...client-vue-v0.3.0) (2024-03-11)


### Features

* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0
    * @privateaim/storage-kit bumped from ^0.2.0 to ^0.3.0
  * peerDependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0
    * @privateaim/storage-kit bumped from ^0.2.0 to ^0.3.0

## [0.2.0](https://github.com/PrivateAIM/hub/compare/client-vue-v0.1.0...client-vue-v0.2.0) (2024-02-28)


### Features

* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0
  * peerDependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0

## 0.1.0 (2024-02-19)


### Features

* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
  * peerDependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
