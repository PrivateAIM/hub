<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/errors 🚨</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/errors)](https://www.npmjs.com/package/@privateaim/errors)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Hub error codes, a root HubError class, typed subclasses, a code-to-HTTP-status table and guards.**

You throw a semantic code instead of an HTTP status, and you recognise the error again after it crossed a
module copy or a JSON round trip. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Error codes](#error-codes) · [Built-in errors](#built-in-errors) · [Guards](#guards) · [HTTP status](#http-status) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/guide/development/api.html#error-responses)

---

## Why @privateaim/errors?

Every Hub service answers failures with the same flat `{ statusCode, code, message, issues }` object. Without a
shared vocabulary each service picks its own codes and statuses, and an `instanceof` check fails as soon as two
copies of a class are loaded or the error arrives as JSON.

| Concern | Without it | With @privateaim/errors |
|---|---|---|
| **Codes** | Free-form strings or bare HTTP statuses per service | One `ErrorCode` enum shared by every service and client |
| **HTTP status** | Each throw site picks a number | Derived from the code (`httpStatusFromCode`), overridable per error with `status` |
| **Recognising an error** | `instanceof`, which fails across module copies and after `JSON.parse` | `isHubError()` / `isEntityNotFoundError()` read the `@instanceof` marker chain (and the code) |
| **Extra response fields** | Hand-built per handler | `data` is spread into the serialized error |
| **Foreign errors** | Map statuses ad hoc | `codeFromHttpStatus()` turns a foreign status into a Hub code |

## Installation

```bash
npm install @privateaim/errors --save
```

ESM only, Node.js `>=26.0.0`. The one runtime dependency is [`@ebec/core`](https://www.npmjs.com/package/@ebec/core),
whose `BaseError` `HubError` extends.

## Usage

```typescript
import {
    EntityNotFoundError,
    httpStatusFromCode,
    isEntityNotFoundError,
} from '@privateaim/errors';

try {
    throw new EntityNotFoundError({ entity: 'analysis' });
} catch (e) {
    if (isEntityNotFoundError(e)) {
        console.log(e.code); // 'entity_not_found'
        console.log(e.message); // 'The analysis was not found.'
        console.log(e.status ?? httpStatusFromCode(e.code)); // 404
    }
}
```

## HubError

`HubError` extends `@ebec/core`'s `BaseError`. Pass a message string or an options object:

```typescript
import { ErrorCode, HubError } from '@privateaim/errors';

throw new HubError({
    code: ErrorCode.ANALYSIS_REGISTRY_UNCONFIGURED,
    message: 'The analysis has no registry.',
    data: { analysisId: 'b3c0f6f4-...' },
});
```

| Option | Type | Description |
|---|---|---|
| `code` | `string` | The semantic code, usually an `ErrorCode` value |
| `message` | `string` | Human-readable text |
| `status` | `number` | HTTP status to answer, for a code the status table does not know (e.g. an Authup code). Without it the status is derived from the code |
| `data` | `Record<string, any>` | Extra fields; `toJSON()` spreads them over the payload |
| `issues` | `Issue[]` | Structured validation failures (`@ebec/core` issue tree) |
| `cause`, `stack` | | As on `@ebec/core`'s `BaseError` |

`toJSON()` returns `name`, `message`, `code`, the `data` keys and the `@instanceof` marker chain. The chain is
written last, so a `data` key of that name cannot overwrite it.

## Error codes

`ErrorCode` is a string enum:

| Group | Codes |
|---|---|
| Generic | `bad_request`, `internal_error` |
| Identity | `identity_unauthorized`, `invalid_token`, `inactive_token`, `expired_token` |
| Entity | `entity_not_found`, `entity_conflict`, `entity_relation_invalid` |
| Permission | `permission_denied`, `permission_evaluation_failed`, `permission_not_found` |
| Upstream | `upstream_timeout` |
| Rate limit | `throttled` |
| Storage | `storage_insufficient` |
| Analysis | `analysis_registry_unconfigured`, `analysis_node_registry_unassigned` |

The token codes, `permission_evaluation_failed`, `permission_not_found` and `upstream_timeout` use Authup's
spelling verbatim, so an Authup error keeps its code when it crosses into Hub.

## Built-in errors

Each subclass fixes its code and accepts a message string or the same options as `HubError`. The entity errors also
take `entity`, which fills the default message.

| Class | Code | Default message |
|---|---|---|
| `BadRequestError` | `bad_request` | `An error occurred` (from `@ebec/core`) |
| `UnauthorizedError` | `identity_unauthorized` | `Authentication required.` |
| `PermissionDeniedError` | `permission_denied` | `Permission denied.` |
| `EntityNotFoundError` | `entity_not_found` | `The <entity> was not found.` / `Entity not found.` |
| `EntityConflictError` | `entity_conflict` | `The <entity> already exists.` / `Entity already exists.` |
| `EntityRelationInvalidError` | `entity_relation_invalid` | `Entity relation is invalid.` |
| `StorageInsufficientError` | `storage_insufficient` | `Insufficient storage.` |
| `InternalError` | `internal_error` | `An internal error occurred.` |

```typescript
import { EntityConflictError, PermissionDeniedError } from '@privateaim/errors';

throw new EntityConflictError({ entity: 'project' }); // 'The project already exists.'
throw new PermissionDeniedError('Only the owner may approve.');
```

## Guards

```typescript
import { isHubError, isPermissionDeniedError } from '@privateaim/errors';

declare const error: unknown;

if (isPermissionDeniedError(error)) {
    // answer 403
} else if (isHubError(error)) {
    // any other Hub error, subclasses included
}
```

- `isHubError(input)` matches when the `@privateaim/errors/HubError` marker is in the input's `@instanceof` chain,
  as the native symbol (in process) or its serialized string (after `JSON.parse`). Every subclass carries it.
- A foreign `@ebec/core` error (rapiq's `ParseError`, for example) does not match, although it has the same shape.
- Input without a chain never matches.
- Each subclass guard (`isBadRequestError`, `isUnauthorizedError`, `isPermissionDeniedError`,
  `isEntityNotFoundError`, `isEntityConflictError`, `isEntityRelationInvalidError`, `isStorageInsufficientError`,
  `isInternalError`) matches the subclass marker, or any `HubError` whose `code` is the subclass's code. A plain
  `new HubError({ code: ErrorCode.BAD_REQUEST })` passes `isBadRequestError`.

## HTTP status

```typescript
import { codeFromHttpStatus, httpStatusFromCode } from '@privateaim/errors';

httpStatusFromCode('entity_conflict'); // 409
httpStatusFromCode('analysis_registry_unconfigured'); // 400 (fallback)
httpStatusFromCode('unknown', 500); // 500

codeFromHttpStatus(502); // 'internal_error'
```

`ERROR_CODE_TO_STATUS` is the table `httpStatusFromCode` reads; a code not in it gets the `fallback` (default `400`).

| Status | Codes |
|---|---|
| 401 | `identity_unauthorized`, `invalid_token`, `inactive_token`, `expired_token` |
| 403 | `permission_denied`, `permission_evaluation_failed`, `permission_not_found` |
| 404 | `entity_not_found` |
| 409 | `entity_conflict` |
| 429 | `throttled` |
| 500 | `internal_error` |
| 504 | `upstream_timeout` |
| 507 | `storage_insufficient` |

`codeFromHttpStatus(status)` goes the other way, for a foreign error (an `@ebec/http` `HTTPError`, another service's
answer): 401, 403, 404, 409 and 507 map to their code, any other 5xx to `internal_error`, anything else to
`bad_request`.

In Hub's services the error middleware of `@privateaim/server-http-kit` normalizes every thrown value to a `HubError`
and answers `error.status ?? httpStatusFromCode(error.code)`. The response format is described under
[error responses](https://hub.docs.privateaim.net/guide/development/api.html#error-responses).

## Notes

- **`entity_relation_invalid` and the analysis codes answer 400.** They are not in `ERROR_CODE_TO_STATUS` and take the
  fallback.
- **A `HubError` without a `code` gets `@ebec/core`'s default code**, derived from the class name (`HUB_ERROR`), which
  also maps to 400. Pass a code.
- **`status` is not set by the subclasses.** It stays `undefined` unless you pass it; read the status through
  `httpStatusFromCode(error.code)` when it is.
- **A logged 5xx answer carries no `data` fields.** Hub's error middleware logs a server error (every Hub service
  mounts it with a logger) and copies `data` into the response only when it does not log.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
