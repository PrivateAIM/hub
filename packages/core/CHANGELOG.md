# Changelog

## [0.4.0](https://github.com/PrivateAIM/hub/compare/core-v0.3.0...core-v0.4.0) (2024-05-15)


### Features

* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* transform service ids to lower case ([484ebb6](https://github.com/PrivateAIM/hub/commit/484ebb650f9e2ab0efc38771332a84bd4c578988))

## [0.3.0](https://github.com/PrivateAIM/hub/compare/core-v0.2.0...core-v0.3.0) (2024-03-11)


### Features

* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))

## [0.2.0](https://github.com/PrivateAIM/hub/compare/core-v0.1.0...core-v0.2.0) (2024-02-28)


### Features

* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))


### Bug Fixes

* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))

## 0.1.0 (2024-02-19)


### Features

* add node type- & online-attribute ([c92a00e](https://github.com/PrivateAIM/hub/commit/c92a00ecce27b57b1ad7834ebe826bce94f3c48b))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial version of analysis service ([f420cd1](https://github.com/PrivateAIM/hub/commit/f420cd185441ed2e9e4ef8e12992add68a90dd4f))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
