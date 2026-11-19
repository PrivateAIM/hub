:robot: I have created a release *beep* *boop*
---


<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1997](https://github.com/PrivateAIM/hub/issues/1997)) ([1dc48f8](https://github.com/PrivateAIM/hub/commit/1dc48f8055bb4449e502882a5832d7f26a66b324))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/client-vue bumped from ^0.19.2 to ^0.20.0
    * @privateaim/client-vue-theme bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1997](https://github.com/PrivateAIM/hub/issues/1997)) ([1dc48f8](https://github.com/PrivateAIM/hub/commit/1dc48f8055bb4449e502882a5832d7f26a66b324))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-realtime-kit bumped from ^0.18.3 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
  * devDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.18.3...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* migrate to esm & replace jest with vitest ([#1368](https://github.com/PrivateAIM/hub/issues/1368)) ([5a4d9d1](https://github.com/PrivateAIM/hub/commit/5a4d9d1ce118f65740aa49caf948208eac299032))


### Bug Fixes

* align core-realtime-kit and messenger kits with release group ([070331d](https://github.com/PrivateAIM/hub/commit/070331dd3acb733d57ff7b3f6bc22d9b06e87f93))
* **build:** replace __dirname with import.meta.dirname and enable tsdown shims ([b08de35](https://github.com/PrivateAIM/hub/commit/b08de35f59d325fda2222a3290b75561936e88e1))
* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))
* socket resources nsp pattern + project master-image requirement ([2d7be7f](https://github.com/PrivateAIM/hub/commit/2d7be7f333e6c06074f2ba9c5489f6685a6ab2ec))
* submit and process socket events ([0240664](https://github.com/PrivateAIM/hub/commit/02406645a5171a235845935b03f189517c0331cb))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add a tag-invalidated read cache for client binding lookups ([#2024](https://github.com/PrivateAIM/hub/issues/2024)) ([cffdfcb](https://github.com/PrivateAIM/hub/commit/cffdfcb717e315aaf89c0159cf7d3ea0c00e552b))
* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.1...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* align core-realtime-kit and messenger kits with release group ([070331d](https://github.com/PrivateAIM/hub/commit/070331dd3acb733d57ff7b3f6bc22d9b06e87f93))
* **deps:** bump minorandpatch group and dev majors except typescript ([#1977](https://github.com/PrivateAIM/hub/issues/1977)) ([17d5922](https://github.com/PrivateAIM/hub/commit/17d5922db81fb29dc46c7b40133eb903e14596aa))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.18.0 to ^0.20.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.18.0 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.18.0...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* align core-realtime-kit and messenger kits with release group ([070331d](https://github.com/PrivateAIM/hub/commit/070331dd3acb733d57ff7b3f6bc22d9b06e87f93))
* **deps:** bump minorandpatch group and dev majors except typescript ([#1977](https://github.com/PrivateAIM/hub/issues/1977)) ([17d5922](https://github.com/PrivateAIM/hub/commit/17d5922db81fb29dc46c7b40133eb903e14596aa))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add a tag-invalidated read cache for client binding lookups ([#2024](https://github.com/PrivateAIM/hub/issues/2024)) ([cffdfcb](https://github.com/PrivateAIM/hub/commit/cffdfcb717e315aaf89c0159cf7d3ea0c00e552b))
* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* align core-realtime-kit and messenger kits with release group ([070331d](https://github.com/PrivateAIM/hub/commit/070331dd3acb733d57ff7b3f6bc22d9b06e87f93))
* **deps-dev:** bump fast-uri from 3.1.6 to 3.1.9 ([#1987](https://github.com/PrivateAIM/hub/issues/1987)) ([08099c6](https://github.com/PrivateAIM/hub/commit/08099c6689b4866e033f9bc0685c2c6c3c1d43b2))
* **deps-dev:** bump serialize-javascript from 7.1.2 to 7.1.4 ([#1985](https://github.com/PrivateAIM/hub/issues/1985)) ([e5fd935](https://github.com/PrivateAIM/hub/commit/e5fd935103fd0d94cd819940ff2a2b72f2076adb))
* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump fast-xml-parser from 5.10.1 to 5.12.0 ([#2018](https://github.com/PrivateAIM/hub/issues/2018)) ([26a1fe5](https://github.com/PrivateAIM/hub/commit/26a1fe5c4360e17a3a9dac256fcd079182aead5a))
* **deps:** bump github/codeql-action from 4.39.1 to 4.39.2 ([#2015](https://github.com/PrivateAIM/hub/issues/2015)) ([f01a0ce](https://github.com/PrivateAIM/hub/commit/f01a0ced38c09a9cf156b549e01de874df2285db))
* **deps:** bump github/codeql-action from 4.39.2 to 4.39.3 ([#2016](https://github.com/PrivateAIM/hub/issues/2016)) ([d796e49](https://github.com/PrivateAIM/hub/commit/d796e49e5ef4a8730b25b016098985003c04648c))
* **deps:** bump tada5hi/monoship from 2.2.0 to 2.2.1 ([#1998](https://github.com/PrivateAIM/hub/issues/1998)) ([128718e](https://github.com/PrivateAIM/hub/commit/128718ecd4cfae427fbee0eef69937ae38a55078))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1997](https://github.com/PrivateAIM/hub/issues/1997)) ([1dc48f8](https://github.com/PrivateAIM/hub/commit/1dc48f8055bb4449e502882a5832d7f26a66b324))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* **server-core-worker:** finalize symmetric crypto synchronously ([179beb9](https://github.com/PrivateAIM/hub/commit/179beb9307091596a1e58e6e54719ee46274861c))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add a tag-invalidated read cache for client binding lookups ([#2024](https://github.com/PrivateAIM/hub/issues/2024)) ([cffdfcb](https://github.com/PrivateAIM/hub/commit/cffdfcb717e315aaf89c0159cf7d3ea0c00e552b))
* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-realtime-kit bumped from ^0.18.3 to ^0.20.0
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-core-worker-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-db-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-realtime-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-test-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1997](https://github.com/PrivateAIM/hub/issues/1997)) ([1dc48f8](https://github.com/PrivateAIM/hub/commit/1dc48f8055bb4449e502882a5832d7f26a66b324))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* **server-core-worker:** finalize symmetric crypto synchronously ([179beb9](https://github.com/PrivateAIM/hub/commit/179beb9307091596a1e58e6e54719ee46274861c))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-core-worker-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/core-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add a tag-invalidated read cache for client binding lookups ([#2024](https://github.com/PrivateAIM/hub/issues/2024)) ([cffdfcb](https://github.com/PrivateAIM/hub/commit/cffdfcb717e315aaf89c0159cf7d3ea0c00e552b))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add a tag-invalidated read cache for client binding lookups ([#2024](https://github.com/PrivateAIM/hub/issues/2024)) ([cffdfcb](https://github.com/PrivateAIM/hub/commit/cffdfcb717e315aaf89c0159cf7d3ea0c00e552b))
* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/messenger-kit bumped from ^0.18.0 to ^0.20.0
    * @privateaim/server-db-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-realtime-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * devDependencies
    * @privateaim/messenger-http-kit bumped from ^0.18.0 to ^0.20.0
    * @privateaim/server-test-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group across 1 directory with 20 updates ([#1997](https://github.com/PrivateAIM/hub/issues/1997)) ([1dc48f8](https://github.com/PrivateAIM/hub/commit/1dc48f8055bb4449e502882a5832d7f26a66b324))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-db-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/storage-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))
* trusted proxy hops, two-stage rate limiting, swagger-ui 5 ([#2034](https://github.com/PrivateAIM/hub/issues/2034)) ([cfeace3](https://github.com/PrivateAIM/hub/commit/cfeace3c55898195d1c3026d384c7bb666a7bf93))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))
* **deps:** bump the minorandpatch group with 7 updates ([#2020](https://github.com/PrivateAIM/hub/issues/2020)) ([30a13e4](https://github.com/PrivateAIM/hub/commit/30a13e4ae41d408cab2333bc020a654d6eb9fd1a))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))
* harden node authority, build claims and service shutdown ([#1996](https://github.com/PrivateAIM/hub/issues/1996)) ([027d1a0](https://github.com/PrivateAIM/hub/commit/027d1a0b9c761a119d67a0641b5911d837672ade))
* trust only the core client's capability tokens and fix three audit findings ([#2035](https://github.com/PrivateAIM/hub/issues/2035)) ([7c96e60](https://github.com/PrivateAIM/hub/commit/7c96e60ca83270311c2747a05f6d9ac50d396249))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-db-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-telemetry-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * devDependencies
    * @privateaim/server-test-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/telemetry-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group ([#2032](https://github.com/PrivateAIM/hub/issues/2032)) ([4d18c34](https://github.com/PrivateAIM/hub/commit/4d18c345d40bde4ba22081572fc1c6af6cd877ab))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/core-http-kit bumped from ^0.19.2 to ^0.20.0
    * @privateaim/server-kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* add storage capability tokens for analysis buckets ([#2017](https://github.com/PrivateAIM/hub/issues/2017)) ([55142a8](https://github.com/PrivateAIM/hub/commit/55142a8fe2f4ceb1f732d6364e505d08e52c4632))
* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @privateaim/errors bumped from ^0.19.1 to ^0.20.0
  * devDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
</details>

<details><summary>0.20.0</summary>

## [0.20.0](https://github.com/PrivateAIM/hub/compare/v0.19.2...v0.20.0) (2026-11-19)


###   BREAKING CHANGES

* @privateaim/core-http-kit and @privateaim/messenger-http-kit no longer export isClientError or isClientErrorWithStatusCode; import them from hapic.
* core-http-kit, storage-kit and telemetry-kit no longer export BaseAPIContext; their API classes extend hapic's BaseAPI.
* requires Authup 1.0.0-beta.75. The provisioned token exchange capability value has to list bucketFile; see the deployment configuration guide for the rollout order.
* All workspaces and service deployments now require Node.js >=26.0.0.
* Node.js >=24.0.0 is required. Import forwarded error helpers from @ebec/core, theme helpers from @authup/client-web-kit-theme, and permission evaluator test helpers from @authup/server-test-kit instead of the PrivateAIM barrels.

### Features

* adopt hapic and routup features, keep plugin error statuses, handle aborts ([#2033](https://github.com/PrivateAIM/hub/issues/2033)) ([d702cee](https://github.com/PrivateAIM/hub/commit/d702cee7250ef0aa80f4b9b495e3d38d1e94b8fa))
* authup beta.75, camelCase capability types, per-row post reads ([#2023](https://github.com/PrivateAIM/hub/issues/2023)) ([9dabc2b](https://github.com/PrivateAIM/hub/commit/9dabc2b951b0617194b1b1cecfc9a57826947cb8))
* authup beta.76, outbound timeouts, health probes and one-read post decisions ([#2026](https://github.com/PrivateAIM/hub/issues/2026)) ([3d27fe6](https://github.com/PrivateAIM/hub/commit/3d27fe670dd7c25423ded2c131220a5c64f54ac7))


### Bug Fixes

* **deps:** bump @authup/* to 1.0.0-beta.74 ([e3e3b6f](https://github.com/PrivateAIM/hub/commit/e3e3b6fccb61f34960197835465f8a12f608163c))
* **deps:** bump the minorandpatch group with 9 updates ([#2000](https://github.com/PrivateAIM/hub/issues/2000)) ([f393377](https://github.com/PrivateAIM/hub/commit/f393377ef14004e4d015f480faaabfb465a45d8b))


### Build System

* require Node 26 across workspaces and CI ([3b1989e](https://github.com/PrivateAIM/hub/commit/3b1989eb5bdb44ca91c95092d0de38f8d3700153))
* upgrade eslint config to v3 and require Node 24 ([652d794](https://github.com/PrivateAIM/hub/commit/652d794c872bf59177512a2a8ad10f26bb5545f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
  * peerDependencies
    * @privateaim/kit bumped from ^0.19.2 to ^0.20.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).