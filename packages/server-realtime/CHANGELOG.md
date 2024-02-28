# Changelog

## [0.2.0](https://github.com/PrivateAIM/hub/compare/server-realtime-v0.1.0...server-realtime-v0.2.0) (2024-02-28)


### Features

* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))


### Bug Fixes

* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0

## 0.1.0 (2024-02-19)


### Features

* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* implemented health check endpoint for realtime-service ([64c0d12](https://github.com/PrivateAIM/hub/commit/64c0d1224e66407246d9bf8c7db8e603a00723d3))
* initial cleanup of realtime service ([d167ed4](https://github.com/PrivateAIM/hub/commit/d167ed4b5fea1038fe4112b662a26ca7a19a564d))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.1 to 1.0.0-beta.3 ([#55](https://github.com/PrivateAIM/hub/issues/55)) ([beb30d2](https://github.com/PrivateAIM/hub/commit/beb30d2ab76139a473ff7245ee7e078e73cd1d57))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump socket.io from 4.7.3 to 4.7.4 ([#12](https://github.com/PrivateAIM/hub/issues/12)) ([51ae449](https://github.com/PrivateAIM/hub/commit/51ae449c91f69b42e5b4962da7185ab992ea5989))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
