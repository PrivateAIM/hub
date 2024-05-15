# Changelog

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
