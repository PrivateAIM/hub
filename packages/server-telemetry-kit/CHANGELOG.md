# Changelog

## [0.8.17](https://github.com/PrivateAIM/hub/compare/v0.8.16...v0.8.17) (2025-09-01)


### Features

* refactor domain event publisher & register amqp ([0f98ecf](https://github.com/PrivateAIM/hub/commit/0f98ecf3c24239d9050fd4a7c2e0bd6843cb3dc8))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/telemetry-kit bumped from ^0.8.16 to ^0.8.17
  * peerDependencies
    * @privateaim/kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/server-kit bumped from ^0.8.16 to ^0.8.17
    * @privateaim/telemetry-kit bumped from ^0.8.16 to ^0.8.17

## [0.8.16](https://github.com/PrivateAIM/hub/compare/v0.8.15...v0.8.16) (2025-08-26)


### Features

* event components ([b4529ee](https://github.com/PrivateAIM/hub/commit/b4529eec406d03ac83c9843f06997c3e4abc4eff))
* initial server-telemetry-kit package ([bdb9678](https://github.com/PrivateAIM/hub/commit/bdb9678f7a05bb70fcefdb632a3e9fc2eb541f97))
* merge server-core & server-core-realtime package ([5298c48](https://github.com/PrivateAIM/hub/commit/5298c48705aa3cc9a2a7ff9e452a8ae1b26e57d8))
* move log-store, loki setup etc. to telemetry service ([#1151](https://github.com/PrivateAIM/hub/issues/1151)) ([8b38b0e](https://github.com/PrivateAIM/hub/commit/8b38b0ee0fafafb121eb4efb0aaf548c27edcde4))


### Bug Fixes

* don't write debug level messages ([1a71201](https://github.com/PrivateAIM/hub/commit/1a71201e91ad9f94c316bcf9345b8a37a1a9cc50))
* transmitting logs ([bc6855c](https://github.com/PrivateAIM/hub/commit/bc6855c1dc99e0b831d94f1d6d469cdb3b78a64f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/server-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/telemetry-kit bumped from ^0.8.15 to ^0.8.16
  * peerDependencies
    * @privateaim/server-kit bumped from ^0.8.15 to ^0.8.16
    * @privateaim/telemetry-kit bumped from ^0.8.15 to ^0.8.16
