# Changelog

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

## [0.6.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.5.0...server-analysis-manager-v0.6.0) (2024-06-25)


### Features

* adjusted code references for core -&gt; core-kit package renaming ([321b8ac](https://github.com/PrivateAIM/hub/commit/321b8acb33e4fdd93252c72da34fac34cc86cd9f))
* initial core -&gt; core-kit package renaming ([9ac9709](https://github.com/PrivateAIM/hub/commit/9ac970999922bc76e3f88381f4d3351a51147a46))
* migrated to authup version v1.0.0-beta.18 ([06928f6](https://github.com/PrivateAIM/hub/commit/06928f681120b423f962a7869f8f6b12708d3047))


### Bug Fixes

* **deps:** bump amqp-extension from 4.0.0-beta.2 to 4.0.0-beta.3 ([#457](https://github.com/PrivateAIM/hub/issues/457)) ([2585ea2](https://github.com/PrivateAIM/hub/commit/2585ea2b22b969c21e82b3b92b2e795198dd5f44))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/core-http-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/server-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/server-analysis-manager-kit bumped from ^0.5.0 to ^0.6.0
    * @privateaim/storage-kit bumped from ^0.5.0 to ^0.6.0

## [0.5.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.4.0...server-analysis-manager-v0.5.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))


### Bug Fixes

* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.4.0 to ^0.5.0
    * @privateaim/kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/core-http-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/server-analysis-manager-kit bumped from ^0.4.0 to ^0.5.0
    * @privateaim/storage-kit bumped from ^0.4.0 to ^0.5.0

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.4.0...server-analysis-manager-v0.4.0) (2024-06-12)


### Features

* analysis-bucket implementation  ([#433](https://github.com/PrivateAIM/hub/issues/433)) ([15329f4](https://github.com/PrivateAIM/hub/commit/15329f42c5f6ebbe4772715ff2e308e41ae9e91a))
* analysis-manager-kit package implementation ([#393](https://github.com/PrivateAIM/hub/issues/393)) ([d9faf4a](https://github.com/PrivateAIM/hub/commit/d9faf4a4580634a62ed58ec994369be1369e33ee))
* cleanup component error handling ([e8869ef](https://github.com/PrivateAIM/hub/commit/e8869efddf658f695fb4c0e6cf8b9596306c123a))
* extract utils and common consts, fns, ... to kit package ([258bbb2](https://github.com/PrivateAIM/hub/commit/258bbb21bfbf671a7cfad3e91740a1737eaf3f71))
* move service factories/singletons to server-kit-package ([#387](https://github.com/PrivateAIM/hub/issues/387)) ([669d352](https://github.com/PrivateAIM/hub/commit/669d3526893c8bc2d2dd8fe78f423783c5d7e317))
* queue-router for components & aggregators ([#396](https://github.com/PrivateAIM/hub/issues/396)) ([0da6066](https://github.com/PrivateAIM/hub/commit/0da6066e378cc97ee8d7b98558e5281dda66cbc9))
* split builder command-exection/event-split ([#412](https://github.com/PrivateAIM/hub/issues/412)) ([13d0d57](https://github.com/PrivateAIM/hub/commit/13d0d575abb45538d79ffef91357e1528c5afb11))
* split core package in core & core-http-kit ([#422](https://github.com/PrivateAIM/hub/issues/422)) ([666a4fe](https://github.com/PrivateAIM/hub/commit/666a4feda4a5491d6752325bcb93155b84747171))


### Bug Fixes

* **deps:** bump amqp-extension from 4.0.0-beta.1 to 4.0.0-beta.2 ([#450](https://github.com/PrivateAIM/hub/issues/450)) ([b65538a](https://github.com/PrivateAIM/hub/commit/b65538ac7e6a0b28ad87b966a01425c8bd86ea3d))
* **deps:** bump uuid from 9.0.1 to 10.0.0 ([#443](https://github.com/PrivateAIM/hub/issues/443)) ([ee047a2](https://github.com/PrivateAIM/hub/commit/ee047a2f049098570ec737adc80ec289790172e3))

## [0.4.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.3.0...server-analysis-manager-v0.4.0) (2024-05-15)


### Features

* simplified authentication & authorization management ([0b19929](https://github.com/PrivateAIM/hub/commit/0b199297766780a4c5cfcd8eda02cefb9f226958))
* simplified logger usage across packages ([39ea90f](https://github.com/PrivateAIM/hub/commit/39ea90ffa6296f91ffb0f89a567036b0054f0135))
* updated authup, vuecs & ilingo ([66a5f7b](https://github.com/PrivateAIM/hub/commit/66a5f7ba1454fc5e432cd687a509ebf3bf4c4ab4))


### Bug Fixes

* auto approve project request for aggregator node ([8a82fe0](https://github.com/PrivateAIM/hub/commit/8a82fe0083683dd90e2c4d23f6f4f68088bbded8))
* creating docker file for analysis ([240c42a](https://github.com/PrivateAIM/hub/commit/240c42af81ebc4f51cf27abb37d62c5d0154d16e))
* **deps:** bump @authup/core from 1.0.0-beta.7 to 1.0.0-beta.8 ([#210](https://github.com/PrivateAIM/hub/issues/210)) ([6e8adf2](https://github.com/PrivateAIM/hub/commit/6e8adf2c80dba69eb66a76250e1fc1acc1bb71dd))
* **deps:** bump @authup/core from 1.0.0-beta.8 to 1.0.0-beta.9 ([#277](https://github.com/PrivateAIM/hub/issues/277)) ([f9a8f59](https://github.com/PrivateAIM/hub/commit/f9a8f59a60990f8ffe6da044c18150a56f2e196c))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.7 to 1.0.0-beta.8 ([#207](https://github.com/PrivateAIM/hub/issues/207)) ([d7133b5](https://github.com/PrivateAIM/hub/commit/d7133b5cba04eef3150535b6860849a9ed6a584a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.8 to 1.0.0-beta.9 ([#274](https://github.com/PrivateAIM/hub/issues/274)) ([ce80e33](https://github.com/PrivateAIM/hub/commit/ce80e331524a0d50632e99909587028c6d18b88a))
* **deps:** bump @hapic/harbor from 2.3.2 to 2.3.3 ([#215](https://github.com/PrivateAIM/hub/issues/215)) ([9c83112](https://github.com/PrivateAIM/hub/commit/9c831124847f8a8ac0244f6cebbd437a231ef690))
* **deps:** bump amqp-extension from 3.2.0 to 3.3.0 ([#196](https://github.com/PrivateAIM/hub/issues/196)) ([5c8d663](https://github.com/PrivateAIM/hub/commit/5c8d663145e0fc55c172242477dfdfb04e4f1472))
* **deps:** bump hapic from 2.5.0 to 2.5.1 ([#214](https://github.com/PrivateAIM/hub/issues/214)) ([eb3e30c](https://github.com/PrivateAIM/hub/commit/eb3e30c6cf3fb81d30ef9b2c802698a5818505a2))
* **deps:** bump redis-extension from 1.3.0 to 1.5.0 ([#293](https://github.com/PrivateAIM/hub/issues/293)) ([0f98e66](https://github.com/PrivateAIM/hub/commit/0f98e66e56df460d40edf640cff15c1094a3fa04))
* **deps:** bump winston from 3.12.0 to 3.13.0 ([#204](https://github.com/PrivateAIM/hub/issues/204)) ([f6d55e9](https://github.com/PrivateAIM/hub/commit/f6d55e957d3330b7c79582fffdc7cd7f345d0a00))
* log when command execution pipeline fails ([333c641](https://github.com/PrivateAIM/hub/commit/333c6410ea78437164384ec213e967a0219dcfd8))
* minor issues in client components & applied linting rules ([b88e168](https://github.com/PrivateAIM/hub/commit/b88e168e0bf3f93e01887f91e9fdff7fe621aafd))
* minor modifications to logging mechanism ([b1a543a](https://github.com/PrivateAIM/hub/commit/b1a543afd20b2438fa6ba7dc09ae05b13638dfb0))
* remove registry project check for pushing analysis container to registry ([3135e08](https://github.com/PrivateAIM/hub/commit/3135e08c625a0b23284b7ca4678a3bd20be5d759))
* rendering analysis command component ([#257](https://github.com/PrivateAIM/hub/issues/257)) ([e3623cc](https://github.com/PrivateAIM/hub/commit/e3623cc7f2b1d952863cfb9f5c8ffb3422b7ba29))
* spelling in container-pack fn ([bb8df2b](https://github.com/PrivateAIM/hub/commit/bb8df2bd205dde0eb031b3ee96bf9097e25faef9))
* use build analysis bucket file name for streaming files ([93e6af1](https://github.com/PrivateAIM/hub/commit/93e6af19ce3b041fecf1ed73b33db771a2043751))
* use correct env variable for core client initialization ([6880afd](https://github.com/PrivateAIM/hub/commit/6880afda0d415156f2b35e13deda805442fffb94))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.3.0 to ^0.4.0
    * @privateaim/server-kit bumped from ^0.3.0 to ^0.4.0
    * @privateaim/storage-kit bumped from ^0.3.0 to ^0.4.0

## [0.3.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.2.0...server-analysis-manager-v0.3.0) (2024-03-11)


### Features

* better analysis buckets naming strategy ([afc3bbd](https://github.com/PrivateAIM/hub/commit/afc3bbd67c90dd40009091a1fd87a2ab0f01703d))
* http server and implement health endpoint ([acab9a7](https://github.com/PrivateAIM/hub/commit/acab9a72ef46524a6bc4d20c5c03dea6c55abcfd))
* initial user interface draft ([#148](https://github.com/PrivateAIM/hub/issues/148)) ([600a3cf](https://github.com/PrivateAIM/hub/commit/600a3cf3ad42ca60a610eb2eb3d1a912c42bd12f))
* log analysis buckets configuration/destroying-process ([537d650](https://github.com/PrivateAIM/hub/commit/537d65081dee96b3a37cf413a481a6d9447806ba))
* refactor analysis-file for new context ([#144](https://github.com/PrivateAIM/hub/issues/144)) ([6a6383c](https://github.com/PrivateAIM/hub/commit/6a6383cf5d920463626f9d6d4798d59597e31d88))


### Bug Fixes

* **deps:** bump @authup/core from 1.0.0-beta.5 to 1.0.0-beta.7 ([#155](https://github.com/PrivateAIM/hub/issues/155)) ([e0da3b4](https://github.com/PrivateAIM/hub/commit/e0da3b4ccabc30e8871cd01f373f3437a0f1928a))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.5 to 1.0.0-beta.7 ([#157](https://github.com/PrivateAIM/hub/issues/157)) ([0aa827b](https://github.com/PrivateAIM/hub/commit/0aa827b7752e3903dad305e5aeb91d754df2d908))
* **deps:** bump amqp-extension from 3.0.0 to 3.1.0 ([#149](https://github.com/PrivateAIM/hub/issues/149)) ([bad4cda](https://github.com/PrivateAIM/hub/commit/bad4cda509d374efcd56242410d5458b52af1415))
* **deps:** bump amqp-extension from 3.1.0 to 3.1.1 ([#158](https://github.com/PrivateAIM/hub/issues/158)) ([d4afe51](https://github.com/PrivateAIM/hub/commit/d4afe51fac465990dacc8760490ffc483b601832))
* **deps:** bump amqp-extension from 3.1.1 to 3.2.0 ([#168](https://github.com/PrivateAIM/hub/issues/168)) ([70ea6ca](https://github.com/PrivateAIM/hub/commit/70ea6ca2cecf63b006906c24e6c28d2b5bbd3aae))
* **deps:** bump winston from 3.11.0 to 3.12.0 ([#138](https://github.com/PrivateAIM/hub/issues/138)) ([b8b5248](https://github.com/PrivateAIM/hub/commit/b8b5248f4f44b859c367822c21638c8ee9cbefa0))
* only throw error on bucket creation if status code is not equal to 404/409 ([66fbbf4](https://github.com/PrivateAIM/hub/commit/66fbbf4fdf3de4e2cfccf4f1db8cb314993bfc1b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.2.0 to ^0.3.0
    * @privateaim/server-kit bumped from ^0.2.0 to ^0.3.0
    * @privateaim/storage-kit bumped from ^0.2.0 to ^0.3.0

## [0.2.0](https://github.com/PrivateAIM/hub/compare/server-analysis-manager-v0.1.0...server-analysis-manager-v0.2.0) (2024-02-28)


### Features

* bucket stream route handler ([84f7de9](https://github.com/PrivateAIM/hub/commit/84f7de90d09dc7a8d95386c52b1242d0df4084dc))
* bump authup to v1.0.0-beta.5 ([13aeab2](https://github.com/PrivateAIM/hub/commit/13aeab2eb8a00069512eee17fc129d56a58309bc))
* integration of storage-sdk in analysis-service ([#129](https://github.com/PrivateAIM/hub/issues/129)) ([2f27f9b](https://github.com/PrivateAIM/hub/commit/2f27f9ba6c533f7e6e13211365d7a0b6a73cab43))
* refactored amqp usage & extended docker-compose file ([4a557dc](https://github.com/PrivateAIM/hub/commit/4a557dc4558e575e7d4f1a9ce317dba417a3ef21))


### Bug Fixes

* bucket client stream fn usage ([57cc2b0](https://github.com/PrivateAIM/hub/commit/57cc2b09a3086d40e22c8bbac9ad26f75615d0f1))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#98](https://github.com/PrivateAIM/hub/issues/98)) ([4588390](https://github.com/PrivateAIM/hub/commit/458839089cdf27c40dde9c65db822463a0ca5f3a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.1.0 to ^0.2.0
    * @privateaim/server-kit bumped from ^0.1.0 to ^0.2.0
    * @privateaim/storage-kit bumped from ^0.0.0 to ^0.2.0

## 0.1.0 (2024-02-19)


### Features

* use envix for environment variable interaction ([cceb6f4](https://github.com/PrivateAIM/hub/commit/cceb6f4842b937ee02bbd1ba3dcaadb0e3b52131))


### Bug Fixes

* build minio bucket for analysis ([8a74916](https://github.com/PrivateAIM/hub/commit/8a74916cd828b54b0bb1fbbe5cca5c7231924e7d))
* **deps:** bump @authup/core from 1.0.0-beta.3 to 1.0.0-beta.4 ([#92](https://github.com/PrivateAIM/hub/issues/92)) ([b950c83](https://github.com/PrivateAIM/hub/commit/b950c838b0de3e647452145182f906472af2fd12))
* **deps:** bump @authup/server-adapter from 1.0.0-beta.3 to 1.0.0-beta.4 ([#94](https://github.com/PrivateAIM/hub/issues/94)) ([a387911](https://github.com/PrivateAIM/hub/commit/a387911dfb8afe8d2f53a2b82f4c8f6b5f70f9a3))
* **deps:** bump dotenv from 16.3.1 to 16.4.4 ([#78](https://github.com/PrivateAIM/hub/issues/78)) ([c800a59](https://github.com/PrivateAIM/hub/commit/c800a59ce393ff770975b1281180e3c2644949d5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core bumped from ^0.0.0 to ^0.1.0
    * @privateaim/server-kit bumped from ^0.0.0 to ^0.1.0
