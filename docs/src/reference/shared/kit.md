# @privateaim/kit

Core utilities package providing message sealing (crypto), capabilities, permission names, domain events, validators, utilities and shared TypeScript types for the entire PrivateAIM ecosystem.

## Installation

```bash
npm install @privateaim/kit
```

## Usage

### Crypto

`sealMessage()` encrypts a payload for one recipient (ECDH key agreement, a per-message AES-256-GCM key through
HKDF); `openMessage()` reverses it. The result is a base64 string that Hub stores as opaque message data.

```typescript
import {
    AsymmetricCryptoAlgorithmName,
    importAsymmetricPrivateKey,
    importAsymmetricPublicKey,
    sealMessage,
} from '@privateaim/kit';

const params = { name: AsymmetricCryptoAlgorithmName.ECDH, namedCurve: 'P-256' };

const payload = await sealMessage({
    privateKey: await importAsymmetricPrivateKey(senderPrivatePem, params),
    publicKey: await importAsymmetricPublicKey(recipientPublicPem, params),
    data: JSON.stringify({ round: 1 }),
    info: 'message-id:analysis-id',
});
```

### Utilities

```typescript
import { createNanoID } from '@privateaim/kit';

const id = createNanoID(); // default alphabet 0-9a-z, length 21
```

### Domain Events

```typescript
import { DomainEventName } from '@privateaim/kit';
```

### Validation

`TypedContainer` is validup's `Container` with the `mount()` key escape hatch
closed. validup types the key as `Path<T> | (string & {})`, so **any** string
compiles — a stale or misspelled key silently stops validating that field, the
value is dropped from the write, and the request still returns `200`.

**Extend `TypedContainer<T>` rather than `Container<T>` in every validator.**

```typescript
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import { z } from 'zod';

export class RegistryValidator extends TypedContainer<Registry> {
    protected override initialize() {
        super.initialize();

        this.mount('accountSecret', { optional: true }, createValidator(z.string()));

        // Compile error: 'account_secret' is not a property of Registry.
        this.mount('account_secret', { optional: true }, createValidator(z.string()));
    }
}
```

Nested and wildcard keys still work (`registry.accountSecret`, `registry.*`), and
a container whose `T` genuinely has snake_case properties — a third-party webhook
body, say — keeps its keys.

## API

### Exports

| Module | Description |
|--------|-------------|
| `crypto` | Asymmetric key helpers (`CryptoAsymmetricAlgorithm`, PEM import/export) and message sealing (`sealMessage`, `openMessage`) |
| `domains` | `PermissionName`, `DomainEventName`, `DomainEventNamespace` and domain channel/namespace name helpers |
| `domain-event` | `buildDomainEventFullName` and domain event record types |
| `utils` | General utility functions (`createNanoID`, `generateName`, `slugify`, `getMinProcessStatus`, error guards such as `isError`) |
| `constants` | Shared constants |
| `types` | Core TypeScript types |
| `capability` | Capability entry helpers: `parseCapabilityEntry(ies)`, `formatCapabilityEntry` for the `type:id:actions` wire format, with Authup's limits (`CAPABILITY_MAX_ENTRIES` 32, `CAPABILITY_MAX_BYTES` 4096) |
| `validator` | `TypedContainer` / `ITypedContainer` (mount-key-safe validup container), `ValidatorGroup` |

## Dependencies

- `@authup/kit` — Authup base types (peer dependency)
- `@authup/core-kit` — Authup core types (peer dependency)
- `nanoid` — ID generation
- `pathtrace` — `Path<T>` key type behind `TypedContainer`
- `validup` — Validation utilities
