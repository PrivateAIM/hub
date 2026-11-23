<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/client-ui 🖥️</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Nuxt 4 web application of FLAME Hub for projects, analyses, nodes and administration.**

It renders on the server, signs users in through Authup with the authorization-code flow, and talks to the core, storage and telemetry APIs.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.
Built with [vuecs](https://github.com/tada5hi/vuecs) and [@privateaim/client-vue](https://github.com/PrivateAIM/hub/tree/master/packages/client-vue).

[Usage](#usage) · [Configuration](#configuration) · [Account Self-Service](#account-self-service) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/frontend/)

---

## Usage

The application needs Node.js `>=26.0.0`, a running server-core and Authup.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Development server with hot reload
npm run dev --workspace=apps/client-ui

# Production server from the built output
npm run start --workspace=apps/client-ui
```

### Docker

The application ships in the shared `ghcr.io/privateaim/hub` image. The entrypoint serves it on port `3000` of all interfaces:

```bash
docker run \
    -e NUXT_PUBLIC_CORE_URL=https://hub.example.com/core/ \
    -e NUXT_PUBLIC_AUTHUP_URL=https://hub.example.com/auth/ \
    -e NUXT_PUBLIC_STORAGE_URL=https://hub.example.com/storage/ \
    -e NUXT_PUBLIC_TELEMETRY_URL=https://hub.example.com/telemetry/ \
    -p 3000:3000 \
    ghcr.io/privateaim/hub ui start
```

## Configuration

Nuxt runtime variables, read when the server starts. Each one falls back to the unprefixed variable (`CORE_URL`, `AUTHUP_URL`, `COOKIE_DOMAIN`, ...) that was set when the app was built.

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CORE_URL` | none | Core API base URL, used by the browser; realtime updates use its Socket.IO server |
| `NUXT_PUBLIC_AUTHUP_URL` | none | Authup URL, used by the browser and in every rendered link |
| `NUXT_PUBLIC_AUTHUP_CLIENT_ID` | `admin-console` | OAuth2 client used for the login (authorization-code) flow |
| `NUXT_PUBLIC_ACCOUNT_URL` | `<NUXT_PUBLIC_AUTHUP_URL>/console/account` | Authup account console, linked from the header's account icon |
| `NUXT_PUBLIC_STORAGE_URL` | none | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | none | Telemetry service URL |
| `NUXT_PUBLIC_COOKIE_DOMAIN` | host-only | `Domain` attribute of the session cookies; leave empty ([session cookies](https://hub.docs.privateaim.net/reference/frontend/#session-cookies)) |
| `NUXT_PUBLIC_AUTHUP_COOKIE_PREFIX` | none | Prefix of every session cookie name; set it with a widened cookie domain, and set the same value as `COOKIE_PREFIX` on every backend service |
| `NUXT_CORE_URL` | `CORE_URL` at build time | Address the server render calls the core API on (e.g. an in-cluster service) |
| `NUXT_STORAGE_URL` | `STORAGE_URL` at build time | Address the server render and the download proxy call storage on |
| `NUXT_TELEMETRY_URL` | `TELEMETRY_URL` at build time | Address the server render calls telemetry on |
| `NUXT_AUTHUP_URL` | `AUTHUP_URL` at build time | Address the server render calls Authup on; rendered URLs keep `NUXT_PUBLIC_AUTHUP_URL` |

The configured OAuth2 client must register `<ui-origin>/login/callback**` as a redirect URI, with the trailing `**`: the post-login destination travels in the callback query ([authentication](https://hub.docs.privateaim.net/reference/frontend/#authentication)).

## Account Self-Service

The UI has no settings area of its own. Profile, password, authenticators, sessions and connected applications live in **Authup's account console**, served by Authup's server-core on the IdP origin as of `v1.0.0-beta.59` (at `/console/account` since `v1.0.0-beta.64`).
The header's account icon links to `<NUXT_PUBLIC_ACCOUNT_URL>/?ref=<ui-origin>&realmId=<session-realm>`; the console renders the `ref` origin as a back link after validating it against the trusted app origins, which the UI origin already has to be in for the login callback.

`realmId` matters only once the IdP session is gone: the UI session outlives it, so the account icon still renders while the console sees an unauthenticated visitor. The console consumes the hint in exactly that state and starts the authorization-code flow for that realm, rather than presenting a realm chooser; it is ignored while a console session exists.

## Notes

- **Set the server-side addresses together.** The server render uses `NUXT_STORAGE_URL` and `NUXT_TELEMETRY_URL` only when a server-side core URL (`NUXT_CORE_URL` or `CORE_URL` at build time) is set, and otherwise the public ones; with a server-side core URL but no server-side storage URL, the render has no storage address.
- **Downloads go through the UI server.** `/api/download/<type>/<id>` proxies a bucket or file stream from storage (`NUXT_STORAGE_URL`) with `Cache-Control: no-store`. The download stays on the UI's origin, so the host-only `access_token` cookie reaches storage without widening the cookie domain.
- **Never put `swr` or `isr` route rules on authenticated routes.** The server render writes per-user data into the page payload.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
