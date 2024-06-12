# Changelog

## [0.5.0](https://github.com/PrivateAIM/hub/compare/server-kit-v0.4.0...server-kit-v0.5.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/kit bumped from ^0.4.0 to ^0.5.0

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-kit-v0.4.0...server-kit-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-kit-v0.3.0...server-kit-v0.4.0) (2024-05-15)


### Features

* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0

## [0.3.0](https://github.com/PrivateAIM/hub/compare/server-kit-v0.2.0...server-kit-v0.3.0) (2024-03-11)


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0

## [0.2.0](https://github.com/PrivateAIM/hub/compare/server-kit-v0.1.0...server-kit-v0.2.0) (2024-02-28)


### Features

* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0

## 0.1.0 (2024-02-19)


### Features

* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
