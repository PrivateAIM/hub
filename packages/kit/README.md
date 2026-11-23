<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/kit 🧱</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/kit)](https://www.npmjs.com/package/@privateaim/kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Shared building blocks of FLAME Hub: message sealing, capabilities, permission names, validators and utilities.**

The leaf package every other Hub package imports, so services, clients and nodes agree on the same permission names,
wire formats and crypto. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Message sealing](#message-sealing) · [Capabilities](#capabilities) · [Validation](#validation) · [Domain events](#domain-events) · [Utilities](#utilities) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/shared/kit.html)

---

## Installation

```bash
npm install @privateaim/kit --save
```

ESM only, Node.js `>=26.0.0`. Runtime dependencies are `nanoid`, `validup` and `pathtrace`. The package declares
`@authup/kit` and `@authup/core-kit` as peer dependencies. The crypto helpers use the Web Crypto API
(`globalThis.crypto`), so they also run in the browser.

## Usage

```typescript
import { PermissionName, ProcessStatus, generateName, getMinProcessStatus } from '@privateaim/kit';

generateName(); // e.g. 'brave-otter-1a2b3c'

getMinProcessStatus([ProcessStatus.EXECUTED, ProcessStatus.STARTED, null]); // 'started'

console.log(PermissionName.ANALYSIS_APPROVE); // 'analysis_approve'
```

## Message sealing

`sealMessage()` encrypts a payload for one recipient: ECDH between the sender's private and the recipient's public
key, a fresh AES-256-GCM key per message through HKDF (SHA-256) with a random 32-byte salt, and a 12-byte IV.
`openMessage()` reverses it.

```typescript
import {
    AsymmetricCryptoAlgorithmName,
    importAsymmetricPrivateKey,
    importAsymmetricPublicKey,
    openMessage,
    sealMessage,
} from '@privateaim/kit';

declare const senderPrivatePem: string;
declare const recipientPublicPem: string;
declare const recipientPrivatePem: string;
declare const senderPublicPem: string;

const params = { name: AsymmetricCryptoAlgorithmName.ECDH, namedCurve: 'P-256' };

const payload = await sealMessage({
    privateKey: await importAsymmetricPrivateKey(senderPrivatePem, params),
    publicKey: await importAsymmetricPublicKey(recipientPublicPem, params),
    data: JSON.stringify({ round: 1 }),
    info: 'message-id:analysis-id',
});

const plaintext = await openMessage({
    privateKey: await importAsymmetricPrivateKey(recipientPrivatePem, params),
    publicKey: await importAsymmetricPublicKey(senderPublicPem, params),
    payload,
    info: 'message-id:analysis-id',
});

new TextDecoder().decode(plaintext); // '{"round":1}'
```

- The result is `base64(salt ‖ iv ‖ ciphertext ‖ tag)`. Hub stores it as opaque message data and never decrypts it.
- `info` binds context (for example message id plus analysis id) into the key derivation. The opener must pass the
  identical value, or `openMessage()` rejects.
- `openMessage()` throws on a frame shorter than salt plus IV and rejects when authentication fails.
- `data` and `info` accept a `string`, an `ArrayBuffer` or an `ArrayBufferView`.

### Keys

| Export | Purpose |
|---|---|
| `CryptoAsymmetricAlgorithm` | `new CryptoAsymmetricAlgorithm({ name, ... }).generateKeyPair()` for `RSA-OAEP` (encrypt/decrypt) or `ECDH` (derive), always extractable |
| `exportAsymmetricPublicKey` / `exportAsymmetricPrivateKey` | Export a `CryptoKey` as an SPKI or PKCS#8 PEM string |
| `importAsymmetricPublicKey(pem, algorithm, usages = [])` | Import an SPKI PEM public key |
| `importAsymmetricPrivateKey(pem, algorithm, usages = ['deriveBits', 'deriveKey'], extractable = false)` | Import a PKCS#8 PEM private key |
| `AsymmetricCryptoAlgorithmName` | `RSA_OAEP` (`'RSA-OAEP'`), `ECDH` |
| `MESSAGE_SEAL_*` | Salt length, IV length, key length and HKDF hash used by sealing |

## Capabilities

A capability entry has the wire format `type:id:action[,action]`.

```typescript
import { formatCapabilityEntry, parseCapabilityEntries } from '@privateaim/kit';

const entries = parseCapabilityEntries(['bucket:4f2a:read,write']);
// [{ type: 'bucket', id: '4f2a', actions: ['read', 'write'] }]

formatCapabilityEntry(entries[0]); // 'bucket:4f2a:read,write'
```

- `parseCapabilityEntry(value)` throws a `TypeError` on a wrong segment count, an invalid type, id or action, or a
  duplicate action.
- `parseCapabilityEntries(values)` also enforces at most `CAPABILITY_MAX_ENTRIES` (32) entries, at most
  `CAPABILITY_MAX_BYTES` (4096) bytes for the space-joined list, and no duplicate entries.
- The segment patterns are exported as `CAPABILITY_TYPE_PATTERN`, `CAPABILITY_ID_PATTERN` and
  `CAPABILITY_ACTION_PATTERN`.

## Permissions

`PermissionName` is the enum of every permission Hub services check, for example `analysis_create`,
`analysis_approve`, `node_update`, `bucket_create`, `log_read`, `master_image_manage` and `service_manage`. The values
are the names provisioned in Authup.

## Validation

`TypedContainer` is validup's `Container` with the `mount()` key escape hatch closed. validup types the key as
`Path<T> | (string & {})`, so any string compiles: a stale or misspelled key silently stops validating that field,
the value is dropped from the write, and the request still returns `200`.

Extend `TypedContainer<T>` rather than `Container<T>` in every validator:

```typescript
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import { z } from 'zod';

type Registry = { name: string, accountSecret: string | null };

export class RegistryValidator extends TypedContainer<Registry> {
    protected override initialize() {
        super.initialize();

        this.mount('name', { group: ValidatorGroup.CREATE }, createValidator(z.string().min(3)));
        this.mount('accountSecret', { optional: true }, createValidator(z.string().nullable()));

        // Compile error: 'account_secret' is not a property of Registry.
        // this.mount('account_secret', { optional: true }, createValidator(z.string()));
    }
}
```

- Nested and wildcard keys still work (`registry.accountSecret`, `registry.*`).
- A container whose `T` really has snake_case properties (a third-party webhook body, say) keeps its keys.
- `ValidatorGroup` holds the `create` and `update` groups Hub's entity validators mount under.
- `ITypedContainer` is the narrowed `mount()` contract; `TypedContainer` changes types only, no runtime behaviour.

## Domain events

```typescript
import {
    DomainEventName,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainNamespaceName,
} from '@privateaim/kit';

buildDomainEventFullName('analysis', DomainEventName.UPDATED); // 'analysisUpdated'
buildDomainChannelName('analysis', 'b3c0f6f4'); // 'analysis:b3c0f6f4'
buildDomainNamespaceName('realm-id'); // '/resources:realm-id'
```

- `DomainEventName` is `created`, `updated`, `deleted`; `DomainEventNamespace` is `'resources'`.
- `DomainEventRecord<DOMAIN, EVENT, DATA>` is the `{ type, event, data }` shape, `DomainEventFullName` the template
  literal type `buildDomainEventFullName` returns.

## Utilities

| Export | Purpose |
|---|---|
| `ProcessStatus`, `ProcessStatusRank`, `getMinProcessStatus` | Process states and the least advanced one of a list: `failed` if any failed, else the lowest rank, `null` entries skipped |
| `EnvironmentName` | `test`, `development`, `production` |
| `MINUTE_IN_MS`, `HOUR_IN_MS`, `DAY_IN_MS`, `WEEK_IN_MS`, `MONTH_IN_MS` | Durations in milliseconds |
| `createNanoID(alphabet?, len?)` | Random id; default alphabet `0-9a-z`, default length 21 |
| `generateName()` | `adjective-noun-hex6` slug, at most 128 characters |
| `slugify(value)` | Lower-case `[a-z0-9-]` slug without leading or trailing hyphens |
| `humanFileSize(bytes, si = false, dp = 1)` | `1.5 KiB` style label; accepts `number`, `bigint` or a numeric string, `''` for missing input |
| `nanoSeconds()` | Wall-clock timestamp in nanoseconds as `bigint` |
| `wait(ms)` | Promise that resolves after `ms` |
| `parseProxyConnectionString`, `detectProxyConnectionConfig` | Proxy settings from a URL or from `HTTPS_PROXY` / `HTTP_PROXY` (either case) |
| `getHostNameFromString` | Host name of an `http(s)://` URL, other input unchanged |
| `isObject`, `isError`, `extractErrorMessage`, `hasOwnProperty`, `isPropertySet` | Type guards |
| `isBool`, `isBoolTrue`, `isBoolFalse`, `isHex`, `hexToUTF8` | Value checks and conversion |
| `nullifyEmptyObjectProperties`, `deleteUndefinedObjectProperties` | In-place cleanup of `''` and `undefined` values |
| `alphaNumHyphenUnderscoreRegex`, `registryRobotSecretRegex` | Shared patterns |
| `ObjectLiteral`, `ObjectLiteralKeys`, `ObjectDiff`, `ToTuple` | Type helpers |

## Notes

- **ECDH key pairs from `CryptoAsymmetricAlgorithm` cannot seal directly.** `generateKeyPair()` grants only the
  `deriveKey` usage, while `sealMessage()` and `openMessage()` call `deriveBits` and reject with
  `baseKey does not have deriveBits usage`. Export the private key with `exportAsymmetricPrivateKey()` and import it
  with `importAsymmetricPrivateKey()`, whose default usages include `deriveBits`.
- **`detectProxyConnectionConfig()` needs a full URL.** It returns `undefined` unless the proxy URL carries protocol,
  user name, password and port.
- **`MONTH_IN_MS` is four weeks**, not a calendar month.
- **`isError()` is a shape check.** Any non-array object with an own `message` property passes.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
