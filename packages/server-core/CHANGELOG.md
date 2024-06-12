# Changelog

## [0.5.0](https://github.com/PrivateAIM/hub/compare/server-core-v0.4.0...server-core-v0.5.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-http-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-analysis-manager-kit bumped from ^0.4.0 to ^0.5.0

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-core-v0.4.0...server-core-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-core-v0.3.0...server-core-v0.4.0) (2024-05-15)


### Features

* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* allow referencing custom robot account to node ([a3277a2](https://github.com/PrivateAIM/hub/commit/a3277a2aa7a8ae2cc44db27afd29694a630d5a89))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* auto approval for aggregator nodes ([94b4f30](https://github.com/PrivateAIM/hub/commit/94b4f30464ef48ab34411c3d38eced4845d367a7))
* better restrictions for linking files to an analysis ([45a6d8a](https://github.com/PrivateAIM/hub/commit/45a6d8a8b9699dbf6c5a418dec91a3cfb8b1e3e0))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* enable possibility to unlock analysis configuration ([#245](https://github.com/PrivateAIM/hub/issues/245)) ([1053362](https://github.com/PrivateAIM/hub/commit/105336254714a1e64d340eb66c10ec1681890559))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* lock analysis-node creation after analyis is locked ([e353a27](https://github.com/PrivateAIM/hub/commit/e353a275daaba1f1972c6cd724bb04f1d85d4af5))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* renamed database subscribers ([88405cc](https://github.com/PrivateAIM/hub/commit/88405cceca74218a6485abff0e2fae0b8429e3a1))
* restrict analyis-node management after an analysis has been locked ([#244](https://github.com/PrivateAIM/hub/issues/244)) ([11cc582](https://github.com/PrivateAIM/hub/commit/11cc5824e677368aecac6afe00493886b7a3182b))
* setup default harbor service on startup if defined ([#170](https://github.com/PrivateAIM/hub/issues/170)) ([e9d9d68](https://github.com/PrivateAIM/hub/commit/e9d9d688548fa1b6fa0e68f8ce024b497335a6b9))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* trigger analysis action in controller instead of subscriber ([026c56a](https://github.com/PrivateAIM/hub/commit/026c56acf6950b473dfe3e5b777c70b659e5b0a9))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* change action order of analysis subscriber ([9fbd6fe](https://github.com/PrivateAIM/hub/commit/9fbd6fe72dccdc75b44b542115f170c799beb22b))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump @hapic/vault from 2.3.2 to 2.3.3 ([#213](https://github.com/PrivateAIM/hub/issues/213)) ([94565fc](https://github.com/PrivateAIM/hub/commit/94565fcbd5026ed84cc3c255f1c2ae900c1312cd))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#225](https://github.com/PrivateAIM/hub/issues/225)) ([75ab55e](https://github.com/PrivateAIM/hub/commit/75ab55ef6df1492378c1f80bdc385011deb6c4b4))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#234](https://github.com/PrivateAIM/hub/issues/234)) ([f7da9c9](https://github.com/PrivateAIM/hub/commit/f7da9c98cb2c73a00d588c99d72008d8c97c7719))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump reflect-metadata from 0.2.1 to 0.2.2 ([#217](https://github.com/PrivateAIM/hub/issues/217)) ([66e557d](https://github.com/PrivateAIM/hub/commit/66e557d914c2a50f014c5060fb153f211b2700d6))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump tar from 6.2.0 to 6.2.1 ([#203](https://github.com/PrivateAIM/hub/issues/203)) ([3299460](https://github.com/PrivateAIM/hub/commit/3299460e5a20e2f91094fb24437895d996cfa215))
* **deps:** bump tar from 7.0.1 to 7.1.0 ([#343](https://github.com/PrivateAIM/hub/issues/343)) ([002a7a7](https://github.com/PrivateAIM/hub/commit/002a7a70fc85f0794739a51e9980a64ba8b73946))
* **deps:** bump tar to v7 ([68e4120](https://github.com/PrivateAIM/hub/commit/68e41201e834b25b878c666a27e93b8bc811cb23))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* **deps:** bump zod from 3.22.4 to 3.23.4 ([#318](https://github.com/PrivateAIM/hub/issues/318)) ([d8ac5c9](https://github.com/PrivateAIM/hub/commit/d8ac5c9d51a8a6f603534f755fea0c27e7004cc7))
* **deps:** bump zod from 3.23.4 to 3.23.5 ([#331](https://github.com/PrivateAIM/hub/issues/331)) ([105eb98](https://github.com/PrivateAIM/hub/commit/105eb98011e434e21cdf10330ed4a25949c17809))
* **deps:** bump zod from 3.23.5 to 3.23.7 ([#354](https://github.com/PrivateAIM/hub/issues/354)) ([19400b6](https://github.com/PrivateAIM/hub/commit/19400b6866b4616a5f450be471e37bbe85c0a05c))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* node robot create util ([97c08ba](https://github.com/PrivateAIM/hub/commit/97c08ba3ac3a22df60081796dffebcf881d62340))
* pick random registry for analysis if none is defined ([b519a32](https://github.com/PrivateAIM/hub/commit/b519a321d6999e8764a5211ca6b22d26de72b27c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0
    * @privateaim/server-kit bumped from ^0.3.0 to ^0.4.0
    * @privateaim/server-analysis-manager bumped from ^0.3.0 to ^0.4.0

## [0.3.0](https://github.com/PrivateAIM/hub/compare/server-core-v0.2.0...server-core-v0.3.0) (2024-03-11)


### Features

* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* sync master-images on start up ([#169](https://github.com/PrivateAIM/hub/issues/169)) ([a4a916e](https://github.com/PrivateAIM/hub/commit/a4a916ece8e1022d8c2db3bb3de6b0a6d7df37da))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* don't require node to be associated to a registry ([d62c3df](https://github.com/PrivateAIM/hub/commit/d62c3dfb2fc7749e4ec7d25085f671da6b92674a))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0
    * @privateaim/server-kit bumped from ^0.2.0 to ^0.3.0
    * @privateaim/server-analysis-manager bumped from ^0.2.0 to ^0.3.0

## [0.2.0](https://github.com/PrivateAIM/hub/compare/server-core-v0.1.0...server-core-v0.2.0) (2024-02-28)


### Features

* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* refactor service singleton management ([#131](https://github.com/PrivateAIM/hub/issues/131)) ([7b9195f](https://github.com/PrivateAIM/hub/commit/7b9195fe0c5eca7a3dfcd356edac55b47ba15278))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* remove permission & role presets ([ea679aa](https://github.com/PrivateAIM/hub/commit/ea679aad29bdf773fc445af66637b518287a96f1))


### Bug Fixes

* cleanup analysis controller ([1554ba8](https://github.com/PrivateAIM/hub/commit/1554ba812fa4e809cc9668346ab945e26f784ada))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0
    * @privateaim/server-kit bumped from ^0.1.0 to ^0.2.0
    * @privateaim/server-analysis-manager bumped from ^0.1.0 to ^0.2.0

## 0.1.0 (2024-02-19)


### Features

* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* service health endpoint & docker health check ([aa4ef27](https://github.com/PrivateAIM/hub/commit/aa4ef27a0ec56373204f2cc0c3eccf5011519883))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @routup/swagger from 2.3.4 to 2.3.5 ([#95](https://github.com/PrivateAIM/hub/issues/95)) ([7b38e6f](https://github.com/PrivateAIM/hub/commit/7b38e6f64510a2b3c919ee72791f34c6d180e6f7))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* separate redis instance for publishing events ([bf95ef3](https://github.com/PrivateAIM/hub/commit/bf95ef36901e5bc2d6167b540fd6440a3db10a1b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
    * @privateaim/server-kit bumped from ^0.0.0 to ^0.1.0
    * @privateaim/server-analysis-manager bumped from ^0.0.0 to ^0.1.0
