:robot: I have created a release *beep* *boop*
---


<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/core-realtime-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-realtime-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* allow referencing custom robot account to node ([a3277a2](https://github.com/PrivateAIM/hub/commit/a3277a2aa7a8ae2cc44db27afd29694a630d5a89))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* auto approval for aggregator nodes ([94b4f30](https://github.com/PrivateAIM/hub/commit/94b4f30464ef48ab34411c3d38eced4845d367a7))
* better restrictions for linking files to an analysis ([45a6d8a](https://github.com/PrivateAIM/hub/commit/45a6d8a8b9699dbf6c5a418dec91a3cfb8b1e3e0))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* enable possibility to unlock analysis configuration ([#245](https://github.com/PrivateAIM/hub/issues/245)) ([1053362](https://github.com/PrivateAIM/hub/commit/105336254714a1e64d340eb66c10ec1681890559))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial analysis-permission implementation ([#502](https://github.com/PrivateAIM/hub/issues/502)) ([63cfdbe](https://github.com/PrivateAIM/hub/commit/63cfdbe4c97302dd37b9e2ce22da2592ffb8edbd))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* lock analysis-node creation after analyis is locked ([e353a27](https://github.com/PrivateAIM/hub/commit/e353a275daaba1f1972c6cd724bb04f1d85d4af5))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactor service singleton management ([#131](https://github.com/PrivateAIM/hub/issues/131)) ([7b9195f](https://github.com/PrivateAIM/hub/commit/7b9195fe0c5eca7a3dfcd356edac55b47ba15278))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* remove permission & role presets ([ea679aa](https://github.com/PrivateAIM/hub/commit/ea679aad29bdf773fc445af66637b518287a96f1))
* renamed database subscribers ([88405cc](https://github.com/PrivateAIM/hub/commit/88405cceca74218a6485abff0e2fae0b8429e3a1))
* restrict analyis-node management after an analysis has been locked ([#244](https://github.com/PrivateAIM/hub/issues/244)) ([11cc582](https://github.com/PrivateAIM/hub/commit/11cc5824e677368aecac6afe00493886b7a3182b))
* run tests in parallel ([#506](https://github.com/PrivateAIM/hub/issues/506)) ([5739ce4](https://github.com/PrivateAIM/hub/commit/5739ce4133693ced649b1412dfd6f535a6a0e1fa))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* service health endpoint & docker health check ([aa4ef27](https://github.com/PrivateAIM/hub/commit/aa4ef27a0ec56373204f2cc0c3eccf5011519883))
* setup default harbor service on startup if defined ([#170](https://github.com/PrivateAIM/hub/issues/170)) ([e9d9d68](https://github.com/PrivateAIM/hub/commit/e9d9d688548fa1b6fa0e68f8ce024b497335a6b9))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* simplified test suite class + http client for server-storage tests ([94a9537](https://github.com/PrivateAIM/hub/commit/94a953774617e196d86af6f5b781bf862fa991b2))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* sync master-images on start up ([#169](https://github.com/PrivateAIM/hub/issues/169)) ([a4a916e](https://github.com/PrivateAIM/hub/commit/a4a916ece8e1022d8c2db3bb3de6b0a6d7df37da))
* tar use new onReadEntry in favor of deprecated onentry fn ([9294bc0](https://github.com/PrivateAIM/hub/commit/9294bc01db06c194a112e6ac51df4defc94363f7))
* trigger analysis action in controller instead of subscriber ([026c56a](https://github.com/PrivateAIM/hub/commit/026c56acf6950b473dfe3e5b777c70b659e5b0a9))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* use http-client for test-suites ([#508](https://github.com/PrivateAIM/hub/issues/508)) ([83fb96b](https://github.com/PrivateAIM/hub/commit/83fb96bbec6cddc5b8030048a60c5a80153a0d0a))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* change action order of analysis subscriber ([9fbd6fe](https://github.com/PrivateAIM/hub/commit/9fbd6fe72dccdc75b44b542115f170c799beb22b))
* cleanup analysis controller ([1554ba8](https://github.com/PrivateAIM/hub/commit/1554ba812fa4e809cc9668346ab945e26f784ada))
* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump @hapic/vault from 2.3.2 to 2.3.3 ([#213](https://github.com/PrivateAIM/hub/issues/213)) ([94565fc](https://github.com/PrivateAIM/hub/commit/94565fcbd5026ed84cc3c255f1c2ae900c1312cd))
* **deps:** bump @routup/swagger from 2.3.4 to 2.3.5 ([#95](https://github.com/PrivateAIM/hub/issues/95)) ([7b38e6f](https://github.com/PrivateAIM/hub/commit/7b38e6f64510a2b3c919ee72791f34c6d180e6f7))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#225](https://github.com/PrivateAIM/hub/issues/225)) ([75ab55e](https://github.com/PrivateAIM/hub/commit/75ab55ef6df1492378c1f80bdc385011deb6c4b4))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#234](https://github.com/PrivateAIM/hub/issues/234)) ([f7da9c9](https://github.com/PrivateAIM/hub/commit/f7da9c98cb2c73a00d588c99d72008d8c97c7719))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump reflect-metadata from 0.2.1 to 0.2.2 ([#217](https://github.com/PrivateAIM/hub/issues/217)) ([66e557d](https://github.com/PrivateAIM/hub/commit/66e557d914c2a50f014c5060fb153f211b2700d6))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump tar from 6.2.0 to 6.2.1 ([#203](https://github.com/PrivateAIM/hub/issues/203)) ([3299460](https://github.com/PrivateAIM/hub/commit/3299460e5a20e2f91094fb24437895d996cfa215))
* **deps:** bump tar from 7.0.1 to 7.1.0 ([#343](https://github.com/PrivateAIM/hub/issues/343)) ([002a7a7](https://github.com/PrivateAIM/hub/commit/002a7a70fc85f0794739a51e9980a64ba8b73946))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))
* **deps:** bump tar from 7.2.0 to 7.4.0 ([#471](https://github.com/PrivateAIM/hub/issues/471)) ([c2ca2e6](https://github.com/PrivateAIM/hub/commit/c2ca2e6877d5230efeba311d4b4de8e97bbadadf))
* **deps:** bump tar to v7 ([68e4120](https://github.com/PrivateAIM/hub/commit/68e41201e834b25b878c666a27e93b8bc811cb23))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* **deps:** bump zod from 3.22.4 to 3.23.4 ([#318](https://github.com/PrivateAIM/hub/issues/318)) ([d8ac5c9](https://github.com/PrivateAIM/hub/commit/d8ac5c9d51a8a6f603534f755fea0c27e7004cc7))
* **deps:** bump zod from 3.23.4 to 3.23.5 ([#331](https://github.com/PrivateAIM/hub/issues/331)) ([105eb98](https://github.com/PrivateAIM/hub/commit/105eb98011e434e21cdf10330ed4a25949c17809))
* **deps:** bump zod from 3.23.5 to 3.23.7 ([#354](https://github.com/PrivateAIM/hub/issues/354)) ([19400b6](https://github.com/PrivateAIM/hub/commit/19400b6866b4616a5f450be471e37bbe85c0a05c))
* don't require node to be associated to a registry ([d62c3df](https://github.com/PrivateAIM/hub/commit/d62c3dfb2fc7749e4ec7d25085f671da6b92674a))
* http node read handler ([19c41b7](https://github.com/PrivateAIM/hub/commit/19c41b7184460b4bf9c30652fa0944fb4431deea))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* node robot create util ([97c08ba](https://github.com/PrivateAIM/hub/commit/97c08ba3ac3a22df60081796dffebcf881d62340))
* pick random registry for analysis if none is defined ([b519a32](https://github.com/PrivateAIM/hub/commit/b519a321d6999e8764a5211ca6b22d26de72b27c))
* project-node read endpoint ([6c46153](https://github.com/PrivateAIM/hub/commit/6c46153114eec1f6aaa9e9fd1dae0bc69519ef89))
* reenable authup robot aggregator ([a684e57](https://github.com/PrivateAIM/hub/commit/a684e5764bb6e483211968a63b655b09070dacb1))
* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* restriction for analysis-node collection endpoint ([73412f9](https://github.com/PrivateAIM/hub/commit/73412f95d1b13ccacf45bfa4e99dcdcc1ea4dfef))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))
* separate redis instance for publishing events ([bf95ef3](https://github.com/PrivateAIM/hub/commit/bf95ef36901e5bc2d6167b540fd6440a3db10a1b))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-core-realtime bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-http-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-analysis-manager-kit bumped from ^0.6.0 to ^0.7.0
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* add ui package to docker-compose ([75f6bfc](https://github.com/PrivateAIM/hub/commit/75f6bfc56eeb8b58c8f120209583d81d03605a95))
* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* updated bootstrap-vue-next & adjusted usage ([ca76f9f](https://github.com/PrivateAIM/hub/commit/ca76f9f41a250aa23717ccbb55127bbd092c032b))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor fix in auth middleware ([f6dc1cd](https://github.com/PrivateAIM/hub/commit/f6dc1cd7bcff4cf01aa8c8adda0a8391da29c3b3))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/client-vue bumped from ^0.6.0 to ^0.7.0
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/core-http-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* initial analysis-permission implementation ([#502](https://github.com/PrivateAIM/hub/issues/502)) ([63cfdbe](https://github.com/PrivateAIM/hub/commit/63cfdbe4c97302dd37b9e2ce22da2592ffb8edbd))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* use http-client for test-suites ([#508](https://github.com/PrivateAIM/hub/issues/508)) ([83fb96b](https://github.com/PrivateAIM/hub/commit/83fb96bbec6cddc5b8030048a60c5a80153a0d0a))


### Bug Fixes

* api routes analysis-bucket-file api client ([d0a9e73](https://github.com/PrivateAIM/hub/commit/d0a9e73271acb7d4b403500097a5cc3e3a30b599))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* initial analysis-permission implementation ([#502](https://github.com/PrivateAIM/hub/issues/502)) ([63cfdbe](https://github.com/PrivateAIM/hub/commit/63cfdbe4c97302dd37b9e2ce22da2592ffb8edbd))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* add node type- & online-attribute ([c92a00e](https://github.com/PrivateAIM/hub/commit/c92a00ecce27b57b1ad7834ebe826bce94f3c48b))
* add ui package to docker-compose ([75f6bfc](https://github.com/PrivateAIM/hub/commit/75f6bfc56eeb8b58c8f120209583d81d03605a95))
* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* adjusted permission names ([3f5e863](https://github.com/PrivateAIM/hub/commit/3f5e8637937f52c73280fe911dd5c150d446da4f))
* adjusted usage of terms and uris of train, station & proposal ([eef58f3](https://github.com/PrivateAIM/hub/commit/eef58f32901150ba0e19a29c5685c92c73188f3f))
* allow referencing custom robot account to node ([a3277a2](https://github.com/PrivateAIM/hub/commit/a3277a2aa7a8ae2cc44db27afd29694a630d5a89))
* allow specifying node type ([#242](https://github.com/PrivateAIM/hub/issues/242)) ([29e14fa](https://github.com/PrivateAIM/hub/commit/29e14fad131825abeebde769c863b9bd4c92c843))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* auto approval for aggregator nodes ([94b4f30](https://github.com/PrivateAIM/hub/commit/94b4f30464ef48ab34411c3d38eced4845d367a7))
* better analysis buckets naming strategy ([afc3bbd](https://github.com/PrivateAIM/hub/commit/afc3bbd67c90dd40009091a1fd87a2ab0f01703d))
* better restrictions for linking files to an analysis ([45a6d8a](https://github.com/PrivateAIM/hub/commit/45a6d8a8b9699dbf6c5a418dec91a3cfb8b1e3e0))
* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bucket-file stream route handler & updated test suite ([9b4cfa0](https://github.com/PrivateAIM/hub/commit/9b4cfa006a830f070b16991ef5730394f7fe19cc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* don't tar pack single bucket-file ([e0d3c17](https://github.com/PrivateAIM/hub/commit/e0d3c17e56eab4225e590cde17d85ccd70663c24))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* enable possibility to unlock analysis configuration ([#245](https://github.com/PrivateAIM/hub/issues/245)) ([1053362](https://github.com/PrivateAIM/hub/commit/105336254714a1e64d340eb66c10ec1681890559))
* enhance configure and socket-server creation ([05e69dd](https://github.com/PrivateAIM/hub/commit/05e69dd7a5eb67ee4c72f66836750e91715250d4))
* enhanced analysis comamnd component + build commands view ([15f48d9](https://github.com/PrivateAIM/hub/commit/15f48d91d1fa283784d85a70549b9db63f4f4f3c))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* http server and implement health endpoint ([acab9a7](https://github.com/PrivateAIM/hub/commit/acab9a72ef46524a6bc4d20c5c03dea6c55abcfd))
* identify bucket by id or name via http controller endpoint ([45d03c0](https://github.com/PrivateAIM/hub/commit/45d03c0ea3352ece4d24f708d7d83a1e140e7199))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* implemented custom node socket events (connect,disconnect,message,...) ([083a3e2](https://github.com/PrivateAIM/hub/commit/083a3e2d81e08829147ac2b72d1fd029896d55bb))
* implemented health check endpoint for realtime-service ([64c0d12](https://github.com/PrivateAIM/hub/commit/64c0d1224e66407246d9bf8c7db8e603a00723d3))
* initial analysis-permission implementation ([#502](https://github.com/PrivateAIM/hub/issues/502)) ([63cfdbe](https://github.com/PrivateAIM/hub/commit/63cfdbe4c97302dd37b9e2ce22da2592ffb8edbd))
* initial cleanup of realtime service ([d167ed4](https://github.com/PrivateAIM/hub/commit/d167ed4b5fea1038fe4112b662a26ca7a19a564d))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial implementation of server-realtime-kit package ([#380](https://github.com/PrivateAIM/hub/issues/380)) ([3963b66](https://github.com/PrivateAIM/hub/commit/3963b66d27dcb857041eefed824297f35a32d1b6))
* initial refactor of server api domains ([5cb5eb8](https://github.com/PrivateAIM/hub/commit/5cb5eb8b649cad3691945bba4a3e1bc759ff0a75))
* initial test setup ([#117](https://github.com/PrivateAIM/hub/issues/117)) ([d90c326](https://github.com/PrivateAIM/hub/commit/d90c326248c2a87a2b3dbd423232ad22321f824d))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* initial version of analysis service ([f420cd1](https://github.com/PrivateAIM/hub/commit/f420cd185441ed2e9e4ef8e12992add68a90dd4f))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* integrated vault client in server-storage package ([c82c4e8](https://github.com/PrivateAIM/hub/commit/c82c4e8c1cb99d19091fd8baf0326438d46ae9f8))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* lock analysis-node creation after analyis is locked ([e353a27](https://github.com/PrivateAIM/hub/commit/e353a275daaba1f1972c6cd724bb04f1d85d4af5))
* log analysis buckets configuration/destroying-process ([537d650](https://github.com/PrivateAIM/hub/commit/537d65081dee96b3a37cf413a481a6d9447806ba))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minio client management (env, singleton, ...) ([#115](https://github.com/PrivateAIM/hub/issues/115)) ([f9689b8](https://github.com/PrivateAIM/hub/commit/f9689b8bcff2cc9570830d817903bcae222521d2))
* minor cleanup in vue components ([8753567](https://github.com/PrivateAIM/hub/commit/8753567023992d2b4bbf6efcc2468ee06fd31604))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* refactor analysis file management ([#176](https://github.com/PrivateAIM/hub/issues/176)) ([0ea979a](https://github.com/PrivateAIM/hub/commit/0ea979a2eed3cb557e82c6c96f83b367b0f89f0f))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactor controllers (validations, fields, ...) ([e798174](https://github.com/PrivateAIM/hub/commit/e798174146eb5ccfdd13ce2026fe616e09f09300))
* refactor service singleton management ([#131](https://github.com/PrivateAIM/hub/issues/131)) ([7b9195f](https://github.com/PrivateAIM/hub/commit/7b9195fe0c5eca7a3dfcd356edac55b47ba15278))
* refactor third-party configuration ([#26](https://github.com/PrivateAIM/hub/issues/26)) ([c5e929c](https://github.com/PrivateAIM/hub/commit/c5e929cd8fc2741436001c59a983a64da3f427c6))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* refactored and adjusted vue components ([#143](https://github.com/PrivateAIM/hub/issues/143)) ([ee98e72](https://github.com/PrivateAIM/hub/commit/ee98e7210848c9da8ff64bb6235b6cda34654446))
* reference robot on node + socket handlers for socket (un-)registration ([d382e66](https://github.com/PrivateAIM/hub/commit/d382e662ab0e558b4abdc1d8a59794e936644a54))
* reimplemented client socket management + adjusted vue plugin ([c040ee4](https://github.com/PrivateAIM/hub/commit/c040ee46a4822330835a2d36be348c937de96660))
* remove ecosystem buisness logic & intial controller renaming ([650dfde](https://github.com/PrivateAIM/hub/commit/650dfdec81a8611f5011dd18861fab30771c5289))
* remove permission & role presets ([ea679aa](https://github.com/PrivateAIM/hub/commit/ea679aad29bdf773fc445af66637b518287a96f1))
* remove station-registry buisness logic ([859ccd7](https://github.com/PrivateAIM/hub/commit/859ccd774983dbc2983b57f2dc9e1eab6924c727))
* renamed database subscribers ([88405cc](https://github.com/PrivateAIM/hub/commit/88405cceca74218a6485abff0e2fae0b8429e3a1))
* restrict analyis-node management after an analysis has been locked ([#244](https://github.com/PrivateAIM/hub/issues/244)) ([11cc582](https://github.com/PrivateAIM/hub/commit/11cc5824e677368aecac6afe00493886b7a3182b))
* restrict update/delete operator by bucket(-file) owner ([07ec40a](https://github.com/PrivateAIM/hub/commit/07ec40ae24cfa68184e865c006e9745b973cf34c))
* run tests in parallel ([#506](https://github.com/PrivateAIM/hub/issues/506)) ([5739ce4](https://github.com/PrivateAIM/hub/commit/5739ce4133693ced649b1412dfd6f535a6a0e1fa))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* service health endpoint & docker health check ([aa4ef27](https://github.com/PrivateAIM/hub/commit/aa4ef27a0ec56373204f2cc0c3eccf5011519883))
* setup default harbor service on startup if defined ([#170](https://github.com/PrivateAIM/hub/issues/170)) ([e9d9d68](https://github.com/PrivateAIM/hub/commit/e9d9d688548fa1b6fa0e68f8ce024b497335a6b9))
* simplified and refactored client-vue installation & integration ([0532d16](https://github.com/PrivateAIM/hub/commit/0532d16c5bd329f3fc82239c5b06327923b6c56b))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* simplified test suite class + http client for server-storage tests ([94a9537](https://github.com/PrivateAIM/hub/commit/94a953774617e196d86af6f5b781bf862fa991b2))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* sync master-images on start up ([#169](https://github.com/PrivateAIM/hub/issues/169)) ([a4a916e](https://github.com/PrivateAIM/hub/commit/a4a916ece8e1022d8c2db3bb3de6b0a6d7df37da))
* tar use new onReadEntry in favor of deprecated onentry fn ([9294bc0](https://github.com/PrivateAIM/hub/commit/9294bc01db06c194a112e6ac51df4defc94363f7))
* trigger analysis action in controller instead of subscriber ([026c56a](https://github.com/PrivateAIM/hub/commit/026c56acf6950b473dfe3e5b777c70b659e5b0a9))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* updated bootstrap-vue-next & adjusted usage ([ca76f9f](https://github.com/PrivateAIM/hub/commit/ca76f9f41a250aa23717ccbb55127bbd092c032b))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))
* use http-client for test-suites ([#508](https://github.com/PrivateAIM/hub/issues/508)) ([83fb96b](https://github.com/PrivateAIM/hub/commit/83fb96bbec6cddc5b8030048a60c5a80153a0d0a))
* use kit package for singleton management of the logger ([61bbe21](https://github.com/PrivateAIM/hub/commit/61bbe215202ba1366d0b44bdd81a6b9b24a4a531))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* add missing name attribute for linking analysis-file ([c19a56c](https://github.com/PrivateAIM/hub/commit/c19a56c0b4a1f927c245793827f24ef981105cd3))
* add node robot_id field as default field ([8d198fc](https://github.com/PrivateAIM/hub/commit/8d198fca8fc9357b8308a2b2363b6b86b6935523))
* adjust rabbitmq version in docker-compose ([1b3ccc8](https://github.com/PrivateAIM/hub/commit/1b3ccc836352a8a3fddf081be0b1fee076b8e28e))
* admin node robot & registry view ([a4c5239](https://github.com/PrivateAIM/hub/commit/a4c5239b34df2c9a4210994b9ec7531932615576))
* aggregators & remove router + extractor handlers ([d58ee95](https://github.com/PrivateAIM/hub/commit/d58ee957064cd1e447533234a6665117ccb67ec9))
* analysis build command execution ([c793150](https://github.com/PrivateAIM/hub/commit/c7931509d3da05ada66bdc8f547ec961260d63ce))
* analysis entrypoint file selection ([ebf63b8](https://github.com/PrivateAIM/hub/commit/ebf63b8a79f7bcd95d0e61f922f37e7d97aa4582))
* analysis imports in server-api package ([44d05a3](https://github.com/PrivateAIM/hub/commit/44d05a3b85b7ef0938db0192cffaeee0ba5b7f05))
* analysis-bucket-file delete operation & auth plugin nuxt-app access ([86e3a2d](https://github.com/PrivateAIM/hub/commit/86e3a2da2b780c1080c83b761f3b0a189c3580de))
* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* api routes analysis-bucket-file api client ([d0a9e73](https://github.com/PrivateAIM/hub/commit/d0a9e73271acb7d4b403500097a5cc3e3a30b599))
* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* bucket client stream fn usage ([57cc2b0](https://github.com/PrivateAIM/hub/commit/57cc2b09a3086d40e22c8bbac9ad26f75615d0f1))
* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* change action order of analysis subscriber ([9fbd6fe](https://github.com/PrivateAIM/hub/commit/9fbd6fe72dccdc75b44b542115f170c799beb22b))
* cleanup analysis controller ([1554ba8](https://github.com/PrivateAIM/hub/commit/1554ba812fa4e809cc9668346ab945e26f784ada))
* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* controller validation and buisness logic & adjusted test cases ([4b0041c](https://github.com/PrivateAIM/hub/commit/4b0041c34d33dc1190617e203056e1c966799ef7))
* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump [@socket](https://github.com/socket).io/redis-adapter from 8.2.1 to 8.3.0 ([#180](https://github.com/PrivateAIM/hub/issues/180)) ([665d86f](https://github.com/PrivateAIM/hub/commit/665d86fa563af1a28a15c4d77c19dee5c6843aa6))
* **deps:** bump @authup/core from 1.0.0-beta.1 to 1.0.0-beta.3 ([#53](https://github.com/PrivateAIM/hub/issues/53)) ([95df3be](https://github.com/PrivateAIM/hub/commit/95df3be641bed869a10f69bcb3065eb36ada178e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.1 to 1.0.0-beta.3 ([#55](https://github.com/PrivateAIM/hub/issues/55)) ([beb30d2](https://github.com/PrivateAIM/hub/commit/beb30d2ab76139a473ff7245ee7e078e73cd1d57))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump @hapic/vault from 2.3.2 to 2.3.3 ([#213](https://github.com/PrivateAIM/hub/issues/213)) ([94565fc](https://github.com/PrivateAIM/hub/commit/94565fcbd5026ed84cc3c255f1c2ae900c1312cd))
* **deps:** bump @routup/swagger from 2.3.3 to 2.3.4 ([#63](https://github.com/PrivateAIM/hub/issues/63)) ([b5fc00a](https://github.com/PrivateAIM/hub/commit/b5fc00a81f5d1228b12c0443104af6a3a4ab135f))
* **deps:** bump @routup/swagger from 2.3.4 to 2.3.5 ([#95](https://github.com/PrivateAIM/hub/issues/95)) ([7b38e6f](https://github.com/PrivateAIM/hub/commit/7b38e6f64510a2b3c919ee72791f34c6d180e6f7))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 1.3.0 to 2.0.2 ([#42](https://github.com/PrivateAIM/hub/issues/42)) ([9543c57](https://github.com/PrivateAIM/hub/commit/9543c570801787b22b21b3ddfe97f7d3707c86ae))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump minio from 7.1.3 to 8.0.0 ([#338](https://github.com/PrivateAIM/hub/issues/338)) ([f0916a3](https://github.com/PrivateAIM/hub/commit/f0916a3557a4226358e1f2436a70fed1b8f27b29))
* **deps:** bump minio from 8.0.0 to 8.0.1 ([#478](https://github.com/PrivateAIM/hub/issues/478)) ([4df786b](https://github.com/PrivateAIM/hub/commit/4df786b10b385504e0ee1a384699541fcb0954b5))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#225](https://github.com/PrivateAIM/hub/issues/225)) ([75ab55e](https://github.com/PrivateAIM/hub/commit/75ab55ef6df1492378c1f80bdc385011deb6c4b4))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#234](https://github.com/PrivateAIM/hub/issues/234)) ([f7da9c9](https://github.com/PrivateAIM/hub/commit/f7da9c98cb2c73a00d588c99d72008d8c97c7719))
* **deps:** bump pg from 8.11.5 to 8.12.0 ([#424](https://github.com/PrivateAIM/hub/issues/424)) ([37dca53](https://github.com/PrivateAIM/hub/commit/37dca53caef6e7ccb06d621bd540390dd8c1f017))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump reflect-metadata from 0.2.1 to 0.2.2 ([#217](https://github.com/PrivateAIM/hub/issues/217)) ([66e557d](https://github.com/PrivateAIM/hub/commit/66e557d914c2a50f014c5060fb153f211b2700d6))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump socket.io from 4.7.3 to 4.7.4 ([#12](https://github.com/PrivateAIM/hub/issues/12)) ([51ae449](https://github.com/PrivateAIM/hub/commit/51ae449c91f69b42e5b4962da7185ab992ea5989))
* **deps:** bump socket.io from 4.7.4 to 4.7.5 ([#183](https://github.com/PrivateAIM/hub/issues/183)) ([7424606](https://github.com/PrivateAIM/hub/commit/74246064f95283eb3f14536d0833e3e1a5da4677))
* **deps:** bump tar from 6.2.0 to 6.2.1 ([#203](https://github.com/PrivateAIM/hub/issues/203)) ([3299460](https://github.com/PrivateAIM/hub/commit/3299460e5a20e2f91094fb24437895d996cfa215))
* **deps:** bump tar from 7.0.1 to 7.1.0 ([#343](https://github.com/PrivateAIM/hub/issues/343)) ([002a7a7](https://github.com/PrivateAIM/hub/commit/002a7a70fc85f0794739a51e9980a64ba8b73946))
* **deps:** bump tar from 7.1.0 to 7.2.0 ([#407](https://github.com/PrivateAIM/hub/issues/407)) ([38c3c9b](https://github.com/PrivateAIM/hub/commit/38c3c9bbcf2861af557abc3808d0afaa4866c626))
* **deps:** bump tar from 7.2.0 to 7.4.0 ([#471](https://github.com/PrivateAIM/hub/issues/471)) ([c2ca2e6](https://github.com/PrivateAIM/hub/commit/c2ca2e6877d5230efeba311d4b4de8e97bbadadf))
* **deps:** bump tar to v7 ([68e4120](https://github.com/PrivateAIM/hub/commit/68e41201e834b25b878c666a27e93b8bc811cb23))
* **deps:** bump typeorm from 0.3.19 to 0.3.20 ([#36](https://github.com/PrivateAIM/hub/issues/36)) ([e94d079](https://github.com/PrivateAIM/hub/commit/e94d0793a236178370eb423585182e939577d9e1))
* **deps:** bump typeorm-extension from 3.3.0 to 3.4.0 ([#58](https://github.com/PrivateAIM/hub/issues/58)) ([f3917cb](https://github.com/PrivateAIM/hub/commit/f3917cbd2f81b96e0afe2b35c278e6c47d8ee628))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* **deps:** bump zod from 3.22.4 to 3.23.4 ([#318](https://github.com/PrivateAIM/hub/issues/318)) ([d8ac5c9](https://github.com/PrivateAIM/hub/commit/d8ac5c9d51a8a6f603534f755fea0c27e7004cc7))
* **deps:** bump zod from 3.23.4 to 3.23.5 ([#331](https://github.com/PrivateAIM/hub/issues/331)) ([105eb98](https://github.com/PrivateAIM/hub/commit/105eb98011e434e21cdf10330ed4a25949c17809))
* **deps:** bump zod from 3.23.5 to 3.23.7 ([#354](https://github.com/PrivateAIM/hub/issues/354)) ([19400b6](https://github.com/PrivateAIM/hub/commit/19400b6866b4616a5f450be471e37bbe85c0a05c))
* don't require node to be associated to a registry ([d62c3df](https://github.com/PrivateAIM/hub/commit/d62c3dfb2fc7749e4ec7d25085f671da6b92674a))
* entity created handler for socket subscription ([b65b9b1](https://github.com/PrivateAIM/hub/commit/b65b9b1aa17bd88b2bd0c29cca19adfa8f4a2b1e))
* entity delete component ([1d691ca](https://github.com/PrivateAIM/hub/commit/1d691cabd1adbf9f7c70a06f01f4886cebf4c0c7))
* env file creation in Dockerfile ([3d488f4](https://github.com/PrivateAIM/hub/commit/3d488f4457ac5c5ea3a3c0f4918785e271ffdd59))
* env variable naming ([6cb361a](https://github.com/PrivateAIM/hub/commit/6cb361a039d8cc708b91753a39ad613f38e45bfa))
* http node read handler ([19c41b7](https://github.com/PrivateAIM/hub/commit/19c41b7184460b4bf9c30652fa0944fb4431deea))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* log when command execution pipeline fails ([333c641](https://github.com/PrivateAIM/hub/commit/333c6410ea78437164384ec213e967a0219dcfd8))
* middlewares in realtime service & connection handlers ([7e6b04d](https://github.com/PrivateAIM/hub/commit/7e6b04d3825fe5a2ff785da7c93ca0034b80af0b))
* minor adjustments in analysis wizard ([d6098a7](https://github.com/PrivateAIM/hub/commit/d6098a70f5d282028964fda3c3fd41e1314daac6))
* minor enhancement for node related components ([7c0ea49](https://github.com/PrivateAIM/hub/commit/7c0ea49d79cdc417941532421e7d68d6c4f43998))
* minor environment variable naming issues ([0418c1a](https://github.com/PrivateAIM/hub/commit/0418c1ac69d40f79300f4be1f7b96b31bdf41460))
* minor fix in auth middleware ([f6dc1cd](https://github.com/PrivateAIM/hub/commit/f6dc1cd7bcff4cf01aa8c8adda0a8391da29c3b3))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* minor restructuring of source code ([6f504f6](https://github.com/PrivateAIM/hub/commit/6f504f60d07ea8e43f24b9762b2bc8a650525477))
* node assign action for projects & analysis ([d6eff55](https://github.com/PrivateAIM/hub/commit/d6eff55addb47c5fd14798f2bd3e0b6cc8e4b2da))
* node robot create util ([97c08ba](https://github.com/PrivateAIM/hub/commit/97c08ba3ac3a22df60081796dffebcf881d62340))
* only mount swagger middleware in production/development ([d3707e3](https://github.com/PrivateAIM/hub/commit/d3707e3ecd51fdab070553d90c111fdc1d7aa6c0))
* only throw error on bucket creation if status code is not equal to 404/409 ([66fbbf4](https://github.com/PrivateAIM/hub/commit/66fbbf4fdf3de4e2cfccf4f1db8cb314993bfc1b))
* package references in test suites ([fe6deed](https://github.com/PrivateAIM/hub/commit/fe6deed703a55891df43f2fa86092d3aa38c6a0e))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))
* pick random registry for analysis if none is defined ([b519a32](https://github.com/PrivateAIM/hub/commit/b519a321d6999e8764a5211ca6b22d26de72b27c))
* project-node read endpoint ([6c46153](https://github.com/PrivateAIM/hub/commit/6c46153114eec1f6aaa9e9fd1dae0bc69519ef89))
* query result return type comparision ([4da80b9](https://github.com/PrivateAIM/hub/commit/4da80b9e599d77e406921d865cf97e45748409a1))
* realtime socket connection ([6f6102c](https://github.com/PrivateAIM/hub/commit/6f6102cd7508d10ffc0a18a44d5e1241f1c5a444))
* reenable authup robot aggregator ([a684e57](https://github.com/PrivateAIM/hub/commit/a684e5764bb6e483211968a63b655b09070dacb1))
* remaining server-api build errors ([96b0fd0](https://github.com/PrivateAIM/hub/commit/96b0fd0aba3b95526fa9c4c1f18a327ef76f251e))
* remove loggig in error middleware ([375a379](https://github.com/PrivateAIM/hub/commit/375a379e783c7e4eaf0aff67c1612d71d4dcb712))
* remove logging error in console ([006560a](https://github.com/PrivateAIM/hub/commit/006560a59eb8e2203751b0b0e287c171b9afd176))
* remove migration files ([c390c21](https://github.com/PrivateAIM/hub/commit/c390c2170ff1db65a467caa2bc4f370253cf46b8))
* remove minio driver from core service ([affb432](https://github.com/PrivateAIM/hub/commit/affb4326e407d185d98575c5aa9d8b6ec8bce172))
* remove node email attribute ([66ee923](https://github.com/PrivateAIM/hub/commit/66ee923c424468e79eba39766ce5fd8443d79811))
* remove registry project check for pushing analysis container to registry ([3135e08](https://github.com/PrivateAIM/hub/commit/3135e08c625a0b23284b7ca4678a3bd20be5d759))
* renamed remaining http sub client properties ([001242b](https://github.com/PrivateAIM/hub/commit/001242b19d9a3df725711dba7c81f19f6a803495))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* restriction for analysis-node collection endpoint ([73412f9](https://github.com/PrivateAIM/hub/commit/73412f95d1b13ccacf45bfa4e99dcdcc1ea4dfef))
* sanitize root property of analysis-file ([d7989fd](https://github.com/PrivateAIM/hub/commit/d7989fd435ec08ed7e0de2ce862111b31b448206))
* separate redis instance for publishing events ([bf95ef3](https://github.com/PrivateAIM/hub/commit/bf95ef36901e5bc2d6167b540fd6440a3db10a1b))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))
* spelling in container-pack fn ([bb8df2b](https://github.com/PrivateAIM/hub/commit/bb8df2bd205dde0eb031b3ee96bf9097e25faef9))
* **storage:** add missing logger configuration + enhanced db queries ([5fd1515](https://github.com/PrivateAIM/hub/commit/5fd15156cb6aaae254a2710bb832a58ce789c20d))
* **storage:** use primary key as minio bucket name + persist minio storage in docker-compose ([cfc4cbb](https://github.com/PrivateAIM/hub/commit/cfc4cbbb3df1cfe1a6c56cae7fc1efffd44971d9))
* test domain utils ([8634408](https://github.com/PrivateAIM/hub/commit/8634408f2141cefd6e466331b3a841afdf8abca9))
* transform service ids to lower case ([484ebb6](https://github.com/PrivateAIM/hub/commit/484ebb650f9e2ab0efc38771332a84bd4c578988))
* typings of supertest in test-suite ([d50e7a7](https://github.com/PrivateAIM/hub/commit/d50e7a75722ee8fc9813f038109f6f7f131c14ba))
* uri in project-node api client & fixed docker-compose ([5fe5091](https://github.com/PrivateAIM/hub/commit/5fe509118ece00fd2b4ffccd7493a7400ca615f1))
* use build analysis bucket file name for streaming files ([93e6af1](https://github.com/PrivateAIM/hub/commit/93e6af19ce3b041fecf1ed73b33db771a2043751))
* use correct env variable for core client initialization ([6880afd](https://github.com/PrivateAIM/hub/commit/6880afda0d415156f2b35e13deda805442fffb94))
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* better analysis buckets naming strategy ([afc3bbd](https://github.com/PrivateAIM/hub/commit/afc3bbd67c90dd40009091a1fd87a2ab0f01703d))
* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* http server and implement health endpoint ([acab9a7](https://github.com/PrivateAIM/hub/commit/acab9a72ef46524a6bc4d20c5c03dea6c55abcfd))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* log analysis buckets configuration/destroying-process ([537d650](https://github.com/PrivateAIM/hub/commit/537d65081dee96b3a37cf413a481a6d9447806ba))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* bucket client stream fn usage ([57cc2b0](https://github.com/PrivateAIM/hub/commit/57cc2b09a3086d40e22c8bbac9ad26f75615d0f1))
* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* log when command execution pipeline fails ([333c641](https://github.com/PrivateAIM/hub/commit/333c6410ea78437164384ec213e967a0219dcfd8))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* only throw error on bucket creation if status code is not equal to 404/409 ([66fbbf4](https://github.com/PrivateAIM/hub/commit/66fbbf4fdf3de4e2cfccf4f1db8cb314993bfc1b))
* remove registry project check for pushing analysis container to registry ([3135e08](https://github.com/PrivateAIM/hub/commit/3135e08c625a0b23284b7ca4678a3bd20be5d759))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* spelling in container-pack fn ([bb8df2b](https://github.com/PrivateAIM/hub/commit/bb8df2bd205dde0eb031b3ee96bf9097e25faef9))
* use build analysis bucket file name for streaming files ([93e6af1](https://github.com/PrivateAIM/hub/commit/93e6af19ce3b041fecf1ed73b33db771a2043751))
* use correct env variable for core client initialization ([6880afd](https://github.com/PrivateAIM/hub/commit/6880afda0d415156f2b35e13deda805442fffb94))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/core-http-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-analysis-manager-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))


### Bug Fixes

* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* events for receiving user/robot connection count ([25e60d7](https://github.com/PrivateAIM/hub/commit/25e60d77ab0b3a6b4d598363b6563563e1dab7e6))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* move http request validation logic to kit package ([#104](https://github.com/PrivateAIM/hub/issues/104)) ([5c26e44](https://github.com/PrivateAIM/hub/commit/5c26e44fdd1df48c5c35756495df08423481770d))
* move redis singleton management to kit package ([285b073](https://github.com/PrivateAIM/hub/commit/285b073eede72ea342f1f4e75e5f00593c51fafd))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* namespace separation + socket connection management (ink. subscription etc.) ([1dcb083](https://github.com/PrivateAIM/hub/commit/1dcb083962ace1b021b20855c45304e1be40c051))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* consuming and publishing with queue-router ([1a461e7](https://github.com/PrivateAIM/hub/commit/1a461e7ce539cf19f5866783f3a58319318de137))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* pass redis client for publishing domain events ([5fb7417](https://github.com/PrivateAIM/hub/commit/5fb7417071e5864d460069de96d91a78424ebaa1))
* setting type on queue message publish + logging on publish/consume ([5430305](https://github.com/PrivateAIM/hub/commit/54303053ec0596217db0cce3c98871b7779fa65c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* enhance configure and socket-server creation ([05e69dd](https://github.com/PrivateAIM/hub/commit/05e69dd7a5eb67ee4c72f66836750e91715250d4))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/messenger-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-realtime-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* initial implementation & usage refactoring ([#426](https://github.com/PrivateAIM/hub/issues/426)) ([85ff83f](https://github.com/PrivateAIM/hub/commit/85ff83f40dc129f7f1e28b41f445f60bb6d6fcfe))
* initial implementation of server-realtime-kit package ([#380](https://github.com/PrivateAIM/hub/issues/380)) ([3963b66](https://github.com/PrivateAIM/hub/commit/3963b66d27dcb857041eefed824297f35a32d1b6))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* realtime library/service split ([#474](https://github.com/PrivateAIM/hub/issues/474)) ([43c2dfa](https://github.com/PrivateAIM/hub/commit/43c2dfad654cc61ca9784914cbad56c684434088))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bucket-file stream route handler & updated test suite ([9b4cfa0](https://github.com/PrivateAIM/hub/commit/9b4cfa006a830f070b16991ef5730394f7fe19cc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* don't tar pack single bucket-file ([e0d3c17](https://github.com/PrivateAIM/hub/commit/e0d3c17e56eab4225e590cde17d85ccd70663c24))
* enable mysql8 usage ([78d9e0b](https://github.com/PrivateAIM/hub/commit/78d9e0bdbad2fc389676af675a7fdd2b61f5e388))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* identify bucket by id or name via http controller endpoint ([45d03c0](https://github.com/PrivateAIM/hub/commit/45d03c0ea3352ece4d24f708d7d83a1e140e7199))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* initial test setup ([#117](https://github.com/PrivateAIM/hub/issues/117)) ([d90c326](https://github.com/PrivateAIM/hub/commit/d90c326248c2a87a2b3dbd423232ad22321f824d))
* initialize storage service (database, config, entities, controllers) ([#97](https://github.com/PrivateAIM/hub/issues/97)) ([7c19d31](https://github.com/PrivateAIM/hub/commit/7c19d3126a4c5ff2acfa007226aba8104d380a14))
* integrated authup middleware in server-kit package ([#259](https://github.com/PrivateAIM/hub/issues/259)) ([a4b6871](https://github.com/PrivateAIM/hub/commit/a4b6871ffa7f43f49cceac3044b41bf622aa75d3))
* integrated vault client in server-storage package ([c82c4e8](https://github.com/PrivateAIM/hub/commit/c82c4e8c1cb99d19091fd8baf0326438d46ae9f8))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* minio client management (env, singleton, ...) ([#115](https://github.com/PrivateAIM/hub/issues/115)) ([f9689b8](https://github.com/PrivateAIM/hub/commit/f9689b8bcff2cc9570830d817903bcae222521d2))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))
* restrict update/delete operator by bucket(-file) owner ([07ec40a](https://github.com/PrivateAIM/hub/commit/07ec40ae24cfa68184e865c006e9745b973cf34c))
* server-http-kit package with validation, authup & request utils/helpers ([#375](https://github.com/PrivateAIM/hub/issues/375)) ([7762a2f](https://github.com/PrivateAIM/hub/commit/7762a2f81ea8dfcd77fc8c7f8d64bb91ad2bcd4f))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* simplified test suite class + http client for server-storage tests ([94a9537](https://github.com/PrivateAIM/hub/commit/94a953774617e196d86af6f5b781bf862fa991b2))
* swagger docs generation & serving for storage service ([2a2a582](https://github.com/PrivateAIM/hub/commit/2a2a582f5afb2c706b08d5da537778587070020f))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))


### Bug Fixes

* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @routup/swagger from 2.3.5 to 2.3.6 ([#248](https://github.com/PrivateAIM/hub/issues/248)) ([6699b8e](https://github.com/PrivateAIM/hub/commit/6699b8ee14b4939f0cc1a0a1dd41e6e106da948b))
* **deps:** bump express-validator from 7.0.1 to 7.1.0 ([#384](https://github.com/PrivateAIM/hub/issues/384)) ([572a429](https://github.com/PrivateAIM/hub/commit/572a42981fb9dcfcaed8fa784c18afa1a897eddc))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump locter from 2.0.2 to 2.1.0 ([#229](https://github.com/PrivateAIM/hub/issues/229)) ([bca1800](https://github.com/PrivateAIM/hub/commit/bca18001da52146e80452d3d4fc286c26f03b9b3))
* **deps:** bump minio from 7.1.3 to 8.0.0 ([#338](https://github.com/PrivateAIM/hub/issues/338)) ([f0916a3](https://github.com/PrivateAIM/hub/commit/f0916a3557a4226358e1f2436a70fed1b8f27b29))
* **deps:** bump minio from 8.0.0 to 8.0.1 ([#478](https://github.com/PrivateAIM/hub/issues/478)) ([4df786b](https://github.com/PrivateAIM/hub/commit/4df786b10b385504e0ee1a384699541fcb0954b5))
* **deps:** bump mysql2 from 3.9.3 to 3.9.4 ([#268](https://github.com/PrivateAIM/hub/issues/268)) ([c1b16a3](https://github.com/PrivateAIM/hub/commit/c1b16a3ebd6af2ebcd462988c1b9b74df12ebe14))
* **deps:** bump mysql2 from 3.9.4 to 3.9.7 ([#309](https://github.com/PrivateAIM/hub/issues/309)) ([6f4dd4e](https://github.com/PrivateAIM/hub/commit/6f4dd4e7ec1696f034ecbe34edb09609ec54d501))
* **deps:** bump mysql2 from 3.9.8 to 3.10.0 ([#411](https://github.com/PrivateAIM/hub/issues/411)) ([b44e278](https://github.com/PrivateAIM/hub/commit/b44e2782e338fd1d7164d43f1bc5414d29178e61))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump routup from 3.2.0 to 3.3.0 ([#226](https://github.com/PrivateAIM/hub/issues/226)) ([9fbe635](https://github.com/PrivateAIM/hub/commit/9fbe635a7464074bebce9ada07afebde1655ed39))
* **deps:** bump typeorm-extension from 3.5.0 to 3.5.1 ([#271](https://github.com/PrivateAIM/hub/issues/271)) ([f4be3b9](https://github.com/PrivateAIM/hub/commit/f4be3b90b316e530306d16d8aee79a22c2955f7c))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* imports of ability manager ([d46fd8b](https://github.com/PrivateAIM/hub/commit/d46fd8b04d2b30224322aaaba391dbc075ac3089))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* only mount swagger middleware in production/development ([d3707e3](https://github.com/PrivateAIM/hub/commit/d3707e3ecd51fdab070553d90c111fdc1d7aa6c0))
* query result return type comparision ([4da80b9](https://github.com/PrivateAIM/hub/commit/4da80b9e599d77e406921d865cf97e45748409a1))
* remove logging error in console ([006560a](https://github.com/PrivateAIM/hub/commit/006560a59eb8e2203751b0b0e287c171b9afd176))
* **storage:** add missing logger configuration + enhanced db queries ([5fd1515](https://github.com/PrivateAIM/hub/commit/5fd15156cb6aaae254a2710bb832a58ce789c20d))
* **storage:** use primary key as minio bucket name + persist minio storage in docker-compose ([cfc4cbb](https://github.com/PrivateAIM/hub/commit/cfc4cbbb3df1cfe1a6c56cae7fc1efffd44971d9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/server-http-kit bumped from ^0.6.0 to ^0.7.0
    * @privateaim/storage-kit bumped from ^0.6.0 to ^0.7.0
</details>

<details><summary>0.7.0</summary>

## [0.7.0](https://github.com/PrivateAIM/hub/compare/v0.6.0...v0.7.0) (2024-06-26)


### Features

* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* implement sdk for storage service ([#127](https://github.com/PrivateAIM/hub/issues/127)) ([1db162a](https://github.com/PrivateAIM/hub/commit/1db162aef6d2af8686bd49820f26be03f8e3dbc1))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))
* refactor analysis configuration ([#200](https://github.com/PrivateAIM/hub/issues/200)) ([e7bfc3f](https://github.com/PrivateAIM/hub/commit/e7bfc3f23d5b9ce6fc6d9e8d0a144fe54ea03335))
* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))
* view for downloading results + refactored entities/types ([#188](https://github.com/PrivateAIM/hub/issues/188)) ([084040e](https://github.com/PrivateAIM/hub/commit/084040eec1e74b10ec40c577d5f8e3a5fcedf250))


### Bug Fixes

* api client for uploading bucket file ([e584f9f](https://github.com/PrivateAIM/hub/commit/e584f9fd6549b7f4974604d8059d88b2ed448c2b))
* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.6.0 to ^0.7.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).