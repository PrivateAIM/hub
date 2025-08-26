# Changelog

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
