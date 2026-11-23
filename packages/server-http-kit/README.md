<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-http-kit 🌍</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-http-kit)](https://www.npmjs.com/package/@privateaim/server-http-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Routup middleware and request helpers for FLAME Hub services: Authup and capability auth, rate limits, errors, health.**

One `mountMiddlewares()` call gives a service the same authentication, rate limiting, error mapping and probes as every other Hub
service. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Authentication](#authentication) · [Request helpers](#request-helpers) · [Rate limiting](#rate-limiting) · [Errors](#errors) · [API](#api) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/shared/server-http-kit.html)

---

## Why server-http-kit?

A Hub service could mount [routup](https://www.npmjs.com/package/routup)'s plugins and Authup's server adapter itself. The Hub
services share rules on top of them that are easy to get subtly wrong per service:

| Concern | Plugins mounted by hand | server-http-kit |
|---|---|---|
| **Malformed bearers** | Forwarded to introspection | Refused (401) before introspection by a compact-JWS guard |
| **Authup outage** | Reported as `invalid_token` (401), which signs users out | Answered 502 (`upstream_error`) or 504 (`upstream_timeout`) |
| **Capability tokens** | Not distinguished from access tokens | Verified separately, accepted only from the trusted exchanging client, never turned into an identity |
| **Rate limits** | One budget per address | Per principal after authentication, failed authentications per address before it |
| **Errors** | Each library's own error shape | One `{ statusCode, code, message, issues }` body |

## Installation

```bash
npm install @privateaim/server-http-kit routup
```

ESM only, Node.js `>=26.0.0`. `routup`, `redis-extension` and `typeorm-extension` are peer dependencies.

## Usage

```typescript
import { createAuthupTokenVerifier, mountErrorMiddleware, mountHealthRoutes, mountMiddlewares } from '@privateaim/server-http-kit';
import { App } from 'routup';

const app = new App({ options: { trustProxy: config.trustProxy ?? true } });

// probes first: neither authenticated, rate limited nor counted
mountHealthRoutes(app, health);

mountMiddlewares(app, {
    basic: true,
    cors: true,
    prometheus: true,
    rateLimit: { trustProxy: config.trustProxy },
    authorization: {
        authupClient,
        cookiePrefix: config.cookiePrefix,
        tokenVerifier: createAuthupTokenVerifier({
            baseURL: config.authupURL,
            client: { id: config.clientId, secret: config.clientSecret, realm: config.realm },
            redisClient,
        }),
    },
    swagger: { baseURL: config.publicURL },
    decorators: { controllers },
});

// last: renders every error thrown above
mountErrorMiddleware(app, { logger });
```

`mountMiddlewares` mounts what its options enable, in this order:

| Option | Mounts |
|---|---|
| `prometheus` | Request metrics at `GET /metrics`; first, so rejected requests are measured too. Unrouted requests share the path label `/{unmatched}` |
| `cors` | CORS for any origin with credentials, exposing the rate-limit, `etag`, `content-disposition`, `location` and similar headers |
| `basic` | JSON body (no size limit), cookie and query parsing. Form bodies stay unparsed |
| `rateLimit` | The failed-authentication limiter (before authorization), when the address cannot be forged |
| `authorization` | Token verification (see [Authentication](#authentication)) |
| `rateLimit` | The per-principal limiter (after authorization) |
| `swagger` | Swagger UI at `/docs` for `swagger.json` from `cwd`, or `writable/swagger.json` in the working directory |
| `decorators` | The [`@routup/decorators`](https://www.npmjs.com/package/@routup/decorators) controllers |

`mountHealthRoutes(app, health)` answers `GET` (and `HEAD`) `/livez` and `/readyz` with the `Health` report from
[`@privateaim/server-kit`](https://www.npmjs.com/package/@privateaim/server-kit): 200 or 503, `Cache-Control: no-store`.

## Authentication

```typescript
import { createAuthupCapabilityTokenVerifier, createAuthupTokenVerifier } from '@privateaim/server-http-kit';

const authorization = {
    authupClient,
    tokenVerifier: createAuthupTokenVerifier({
        baseURL: config.authupURL,
        client: { id: config.clientId, secret: config.clientSecret, realm: config.realm },
        redisClient,
    }),
    capability: {
        verifier: createAuthupCapabilityTokenVerifier({
            baseURL: config.authupURL,
            audience: 'storage',
            trustedClientId: async () => coreClientId,
        }),
    },
};
```

- **Credential precedence:** the `Authorization` header, then (only with `capability`) the query capability token (`?dt=`), then
  the `<cookiePrefix>access_token` cookie. Exactly one credential is verified per request.
- **Access tokens** are introspected as the given `client` (client credentials). Results are cached until the token's `exp`, in
  Redis with `redisClient` or in process memory, namespaced per introspecting client. A malformed bearer is refused before
  introspection. An Authup failure answers 502, a timeout 504; only a token Authup judged answers 401.
- **Identity requests** get the identity, scopes, the raw token and an `IPermissionEvaluator`, built from one authorization
  catalog read. A token without the `global` scope keeps its identity but has no grants.
- **Capability tokens** are verified locally against Authup's `/jwks` (`aud`, `kind`, `exp`) and accepted only when the trusted
  client exchanged them (`act.sub`). A capability request gets `capability` and nothing else: no identity, no permission
  evaluator, no token. A query capability token may live at most 60 s, and only one may be passed.
- **Without `authupClient`** the middleware attaches nothing, so every guarded route answers 401 (fail closed). Without an Authup
  URL both verifier factories return a verifier that refuses every token.

### Route guards

| Guard | Passes |
|---|---|
| `ForceLoggedInMiddleware` | An identity |
| `ForceIdentityOrCapabilityMiddleware` | An identity, or a capability token from the `Authorization` header |
| `ForceIdentityOrStreamCapabilityMiddleware` | An identity, or a capability token from any source, the query included (download routes) |

```typescript
import { DController, DGet } from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';

@DController('/nodes')
export class NodeController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(): Promise<unknown> {
        return [];
    }
}
```

A capability guard only checks that a capability exists; the route must still check that it covers the resource.

## Request helpers

```typescript
import { buildActorContext, useRequestCapability, useRequestIdentityOrFail } from '@privateaim/server-http-kit';

const actor = buildActorContext(event); // ActorContext for a core service
const identity = useRequestIdentityOrFail(event); // throws 401 without one
const capability = useRequestCapability(event); // undefined unless a capability request
```

- `buildActorContext(event)` is the one bridge from a request to the `ActorContext` services take: permission evaluator, realm,
  identity and the audit `metadata` (path, method, user agent and the client IP, which follows the app's `trustProxy`).
- `useRequestPermissionEvaluator(event)` throws a 400 when no evaluator was attached; check `useRequestIdentity(event)` first on
  routes that also serve anonymous or capability requests.
- `useRequestIdentityRealm`, `useRequestToken`, `useRequestEnv` / `setRequestEnv` read and write the rest of the request state.

## Rate limiting

| Stage | Key | Budget per minute |
|---|---|---|
| Failed authentications, before authorization | Source address | `RATE_LIMIT_FAILED_AUTHENTICATION_MAX` = 300 |
| Requests, after authorization | User, client or the capability's subject; the address when anonymous | `RATE_LIMIT_BUDGETS`: anonymous 1 200, user 6 000, client 60 000 |

- The first stage counts a 401 for a sent credential, except an expired or inactive token; it runs only when `trustProxy` is set and
  does not trust every hop (`isAddressKeyTrusted`), since blocking a forgeable `X-Forwarded-For` value would let anyone lock out
  any address.
- A client whose grants reach every realm for every Hub permission (a Hub service client) is never throttled.
- Counters live per replica, in fixed windows.

## Errors

`mountErrorMiddleware(app, { logger })` turns every thrown error into a `HubError` and answers

```json
{ "statusCode": 400, "code": "bad_request", "message": "...", "issues": [] }
```

- Authup errors keep Authup's code and status; rapiq parse errors and validup issues become 400 with `issues`; an outbound hapic
  timeout becomes 504 `upstream_timeout`; a unique-constraint violation becomes 409 `entity_conflict`; anything unrecognised becomes 500.
- 5xx errors are logged through `logger` with the route pattern, never the concrete path, unless the caller aborted the request.
  For other errors the keys of the error's `data` object are merged into the body.

See [error responses](https://hub.docs.privateaim.net/guide/development/api.html#error-responses) for the codes clients see.

## API

| Export | Kind | Purpose |
|---|---|---|
| `mountMiddlewares`, `MiddlewareMountOptions` | function | Mounts the enabled middleware in order |
| `mountErrorMiddleware` | function | Error-to-response mapping; mount last |
| `mountHealthRoutes` | function | `/livez` and `/readyz` |
| `mountAuthorizationMiddleware`, `createAuthupTokenVerifier`, `createAuthupCapabilityTokenVerifier` | functions | Authentication |
| `IntrospectableTokenVerifier`, `CapabilityTokenVerifier`, `TrustedActorTokenVerifier` | classes | The verifiers the factories build |
| `ForceLoggedInMiddleware`, `ForceIdentityOrCapabilityMiddleware`, `ForceIdentityOrStreamCapabilityMiddleware` | classes | Route guards |
| `mountBasicMiddleware`, `mountCorsMiddleware`, `mountPrometheusMiddleware`, `mountSwaggerMiddleware`, `mountDecoratorsMiddleware` | functions | Single middleware |
| `mountAuthenticationRateLimiterMiddleware`, `mountRateLimiterMiddleware`, `isAddressKeyTrusted`, `RATE_LIMIT_BUDGETS`, `RATE_LIMIT_FAILED_AUTHENTICATION_MAX` | functions, constants | Rate limiting |
| `buildActorContext`, `useRequestIdentity`, `useRequestIdentityOrFail`, `useRequestIdentityRealm`, `useRequestPermissionEvaluator`, `useRequestCapability`, `useRequestToken`, `useRequestEnv`, `setRequestEnv` | functions | Request state |
| `RequestIdentity`, `RequestCapability`, `RequestEnv` | types | Request state shapes |
| `HTTPHandlerOperation` | enum | `create` / `update` |

## Notes

- **Mount the health routes before every middleware.** Mounted later, a probe is authenticated, rate limited and counted.
- **The failed-authentication limiter is off with the default `TRUST_PROXY`.** Unset or `true` trusts every hop, so the address is
  client-chosen; set `TRUST_PROXY` to your proxy hops or addresses to enable it.
- **JSON bodies have no size limit.** Nodes push large payloads; bound request size at the proxy if you need a limit.
- **A capability request is not logged in.** Routes behind `ForceLoggedInMiddleware` answer a capability token 401.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
