# Changelog

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
