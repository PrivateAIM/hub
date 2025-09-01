# Changelog

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)


### Features

* add log flags ref_type + ref_id & support loki distributor url reading ([e34f7bf](https://github.com/PrivateAIM/hub/commit/e34f7bf6ed24347ba46a439f5382db6b0c89a9df))
* enhance logger abstraction ([d3fdca6](https://github.com/PrivateAIM/hub/commit/d3fdca6c1c18daffb76cc053be2420560999ce52))
* refactor domain event publisher & register amqp ([0f98ecf](https://github.com/PrivateAIM/hub/commit/0f98ecf3c24239d9050fd4a7c2e0bd6843cb3dc8))


### Bug Fixes

* add missing attributes for analysis-node-log submission ([b0ddabd](https://github.com/PrivateAIM/hub/commit/b0ddabd4fd8a744ad15cac877454988958319261))
* database base subscriber types ([f30c44e](https://github.com/PrivateAIM/hub/commit/f30c44eb7f891400de96104c2ea95b6d8fc5a438))
* logging max length message ([b5d7286](https://github.com/PrivateAIM/hub/commit/b5d72865376658df2501f78444d44906de1d5eb6))
* **server-telemetry:** configure domain envent publisher ([b12f240](https://github.com/PrivateAIM/hub/commit/b12f240387e8add51233c0de685eb5a65466d708))
* setting compactor & querier url ([00953b2](https://github.com/PrivateAIM/hub/commit/00953b262ecd73c1ddca2704e62c927dcf799c40))
* use alternative alias for event db query ([a07e45e](https://github.com/PrivateAIM/hub/commit/a07e45eced809ba4be8b8b356038fb88b9712a53))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-db-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-http-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/telemetry-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-telemetry-kit bumped from ^0.8.16 to ^0.8.17

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* authenticate hook for telemetry client ([2d1a04c](https://github.com/PrivateAIM/hub/commit/2d1a04cc0c74bea22b2187e592bdf761d6fc598a))
* cli and index entrpyoints ([045f3ba](https://github.com/PrivateAIM/hub/commit/045f3ba0bae085d0c1fc20f049193b4bbe91f40b))
* event components ([b4529ee](https://github.com/PrivateAIM/hub/commit/b4529eec406d03ac83c9843f06997c3e4abc4eff))
* initial server-db-kit package & event subscriber ([ab0f7c2](https://github.com/PrivateAIM/hub/commit/ab0f7c2ba4e87b6c3794f941dfd90a08aefd3730))
* initial server-telmetry package with http api & db ([31dbfdc](https://github.com/PrivateAIM/hub/commit/31dbfdcd7c5a0d833aa5021c44da00fb8685e55e))
* integrated telemetry service (kit + service) in server-core package ([2af7e01](https://github.com/PrivateAIM/hub/commit/2af7e0145e89884d3473568e3bbcee2911e2bb73))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* minor subscriber & event publish refactoring ([1ffdd68](https://github.com/PrivateAIM/hub/commit/1ffdd6853283409e83d1d9bb89a67e2964e3cb35))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))
* simplify log-store ([5928dd7](https://github.com/PrivateAIM/hub/commit/5928dd72429d2ee0582da05252c2b5f3f9b3cb28))


### Bug Fixes

* **deps:** bump the minorandpatch group across 1 directory with 11 updates ([#1162](https://github.com/PrivateAIM/hub/issues/1162)) ([2aa8123](https://github.com/PrivateAIM/hub/commit/2aa8123394aafdd3dbc1eb5284a2bdc5fcc659a9))
* **deps:** bump the minorandpatch group across 1 directory with 5 updates ([#1149](https://github.com/PrivateAIM/hub/issues/1149)) ([6ad2f9a](https://github.com/PrivateAIM/hub/commit/6ad2f9aa8f9a9e93e3624ec8d6bf2517c122822a))
* docker file & entrypoint + added amqp config to telemetry service ([2ad782b](https://github.com/PrivateAIM/hub/commit/2ad782bf188ad087d4e4d720eb2812254dcc202e))
* don't write debug level messages ([1a71201](https://github.com/PrivateAIM/hub/commit/1a71201e91ad9f94c316bcf9345b8a37a1a9cc50))
* rendering events table ([4d3c04d](https://github.com/PrivateAIM/hub/commit/4d3c04dedb2a12d3aca5c22e35d9ab3b0bfa4e21))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/server-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/server-db-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/server-http-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/telemetry-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/server-telemetry-kit bumped from ^0.8.15 to ^0.8.16
