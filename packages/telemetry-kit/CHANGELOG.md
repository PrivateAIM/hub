# Changelog

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)


### Features

* add log flags ref_type + ref_id & support loki distributor url reading ([e34f7bf](https://github.com/PrivateAIM/hub/commit/e34f7bf6ed24347ba46a439f5382db6b0c89a9df))


### Bug Fixes

* add missing attributes for analysis-node-log submission ([b0ddabd](https://github.com/PrivateAIM/hub/commit/b0ddabd4fd8a744ad15cac877454988958319261))
* **deps:** bump the minorandpatch group across 1 directory with 6 updates ([#1173](https://github.com/PrivateAIM/hub/issues/1173)) ([47fa968](https://github.com/PrivateAIM/hub/commit/47fa968c35135638d3c55a6e58cd94ca8a0079b9))
* logging max length message ([b5d7286](https://github.com/PrivateAIM/hub/commit/b5d72865376658df2501f78444d44906de1d5eb6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* initial telemetry-kit package ([92d1aea](https://github.com/PrivateAIM/hub/commit/92d1aea1e56ef88dd1d652425845666217ebe27e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* log rendering component(s) ([424ee0d](https://github.com/PrivateAIM/hub/commit/424ee0d003de17d02770a5b2bed6fe4a1e968773))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1167](https://github.com/PrivateAIM/hub/issues/1167)) ([9f12a16](https://github.com/PrivateAIM/hub/commit/9f12a16ccb268989579e0a6464c3e9c189bf042f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.15 to ^0.8.16
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.15 to ^0.8.16
