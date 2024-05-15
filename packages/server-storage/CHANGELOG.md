# Changelog

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-storage-v0.3.0...server-storage-v0.4.0) (2024-05-15)


### Features

* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* integrated vault client in server-storage package ([c82c4e8](https://github.com/PrivateAIM/hub/commit/c82c4e8c1cb99d19091fd8baf0326438d46ae9f8))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))


### Bug Fixes

* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump minio from 7.1.3 to 8.0.0 ([#338](https://github.com/PrivateAIM/hub/issues/338)) ([f0916a3](https://github.com/PrivateAIM/hub/commit/f0916a3557a4226358e1f2436a70fed1b8f27b29))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0
    * @privateaim/server-kit bumped from ^0.3.0 to ^0.4.0
    * @privateaim/storage-kit bumped from ^0.3.0 to ^0.4.0

## [0.3.0](https://github.com/PrivateAIM/hub/compare/server-storage-v0.2.0...server-storage-v0.3.0) (2024-03-11)


### Features

* identify bucket by id or name via http controller endpoint ([45d03c0](https://github.com/PrivateAIM/hub/commit/45d03c0ea3352ece4d24f708d7d83a1e140e7199))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* only mount swagger middleware in production/development ([d3707e3](https://github.com/PrivateAIM/hub/commit/d3707e3ecd51fdab070553d90c111fdc1d7aa6c0))
* query result return type comparision ([4da80b9](https://github.com/PrivateAIM/hub/commit/4da80b9e599d77e406921d865cf97e45748409a1))
* remove logging error in console ([006560a](https://github.com/PrivateAIM/hub/commit/006560a59eb8e2203751b0b0e287c171b9afd176))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0
    * @privateaim/storage-kit bumped from ^0.2.0 to ^0.3.0

## 0.2.0 (2024-02-28)


### Features

* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bucket-file stream route handler & updated test suite ([9b4cfa0](https://github.com/PrivateAIM/hub/commit/9b4cfa006a830f070b16991ef5730394f7fe19cc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* don't tar pack single bucket-file ([e0d3c17](https://github.com/PrivateAIM/hub/commit/e0d3c17e56eab4225e590cde17d85ccd70663c24))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* initial test setup ([#117](https://github.com/PrivateAIM/hub/issues/117)) ([d90c326](https://github.com/PrivateAIM/hub/commit/d90c326248c2a87a2b3dbd423232ad22321f824d))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))
* minio client management (env, singleton, ...) ([#115](https://github.com/PrivateAIM/hub/issues/115)) ([f9689b8](https://github.com/PrivateAIM/hub/commit/f9689b8bcff2cc9570830d817903bcae222521d2))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* restrict update/delete operator by bucket(-file) owner ([07ec40a](https://github.com/PrivateAIM/hub/commit/07ec40ae24cfa68184e865c006e9745b973cf34c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0
    * @privateaim/storage-kit bumped from ^0.0.0 to ^0.2.0
