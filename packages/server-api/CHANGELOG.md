# Changelog

## 1.0.0 (2024-02-12)


### Features

* add node type- & online-attribute ([c92a00e](https://github.com/PrivateAIM/hub/commit/c92a00ecce27b57b1ad7834ebe826bce94f3c48b))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* refactor controllers (validations, fields, ...) ([e798174](https://github.com/PrivateAIM/hub/commit/e798174146eb5ccfdd13ce2026fe616e09f09300))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* add node robot_id field as default field ([8d198fc](https://github.com/PrivateAIM/hub/commit/8d198fca8fc9357b8308a2b2363b6b86b6935523))
* aggregators & remove router + extractor handlers ([d58ee95](https://github.com/PrivateAIM/hub/commit/d58ee957064cd1e447533234a6665117ccb67ec9))
* analysis imports in server-api package ([44d05a3](https://github.com/PrivateAIM/hub/commit/44d05a3b85b7ef0938db0192cffaeee0ba5b7f05))
* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* controller validation and buisness logic & adjusted test cases ([4b0041c](https://github.com/PrivateAIM/hub/commit/4b0041c34d33dc1190617e203056e1c966799ef7))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.1 to 1.0.0-beta.3 ([#55](https://github.com/PrivateAIM/hub/issues/55)) ([beb30d2](https://github.com/PrivateAIM/hub/commit/beb30d2ab76139a473ff7245ee7e078e73cd1d57))
* **deps:** bump @routup/swagger from 2.3.3 to 2.3.4 ([#63](https://github.com/PrivateAIM/hub/issues/63)) ([b5fc00a](https://github.com/PrivateAIM/hub/commit/b5fc00a81f5d1228b12c0443104af6a3a4ab135f))
* **deps:** bump locter from 1.3.0 to 2.0.2 ([#42](https://github.com/PrivateAIM/hub/issues/42)) ([9543c57](https://github.com/PrivateAIM/hub/commit/9543c570801787b22b21b3ddfe97f7d3707c86ae))
* **deps:** bump typeorm from 0.3.19 to 0.3.20 ([#36](https://github.com/PrivateAIM/hub/issues/36)) ([e94d079](https://github.com/PrivateAIM/hub/commit/e94d0793a236178370eb423585182e939577d9e1))
* **deps:** bump typeorm-extension from 3.3.0 to 3.4.0 ([#58](https://github.com/PrivateAIM/hub/issues/58)) ([f3917cb](https://github.com/PrivateAIM/hub/commit/f3917cbd2f81b96e0afe2b35c278e6c47d8ee628))
* env variable naming ([6cb361a](https://github.com/PrivateAIM/hub/commit/6cb361a039d8cc708b91753a39ad613f38e45bfa))
* package references in test suites ([fe6deed](https://github.com/PrivateAIM/hub/commit/fe6deed703a55891df43f2fa86092d3aa38c6a0e))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))
* remaining server-api build errors ([96b0fd0](https://github.com/PrivateAIM/hub/commit/96b0fd0aba3b95526fa9c4c1f18a327ef76f251e))
* remove loggig in error middleware ([375a379](https://github.com/PrivateAIM/hub/commit/375a379e783c7e4eaf0aff67c1612d71d4dcb712))
* remove migration files ([c390c21](https://github.com/PrivateAIM/hub/commit/c390c2170ff1db65a467caa2bc4f370253cf46b8))
* test domain utils ([8634408](https://github.com/PrivateAIM/hub/commit/8634408f2141cefd6e466331b3a841afdf8abca9))
* typings of supertest in test-suite ([d50e7a7](https://github.com/PrivateAIM/hub/commit/d50e7a75722ee8fc9813f038109f6f7f131c14ba))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.0.0 to ^1.0.0
    * @privateaim/server-kit bumped from ^0.0.0 to ^1.0.0
    * @privateaim/server-analysis-manager bumped from ^0.0.0 to ^1.0.0
