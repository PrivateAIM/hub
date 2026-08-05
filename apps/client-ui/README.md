<p align="center">
  <a href="https://github.com/PrivateAIM/hub" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/PrivateAIM/hub/master/.github/assets/logo.svg" alt="FLAME Hub" height="100">
  </a>
</p>

<h1 align="center">@privateaim/client-ui 🖥️</h1>

<p align="center">
  <b>The web frontend of FLAME Hub.</b><br>
  A Nuxt 4 application for projects, analyses, nodes &amp; administration.
</p>

<p align="center">
  <a href="https://github.com/PrivateAIM/hub/actions/workflows/main.yml"><img src="https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A522-3c873a?logo=node.js&logoColor=fff" alt="node >=22">
  <a href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.privateaim.net"><b>Documentation</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub">Monorepo</a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md">Contributing</a>
</p>

---

Part of the **[FLAME Hub](https://github.com/PrivateAIM/hub)** monorepo — central services for the [PrivateAIM](https://privateaim.net) platform. Built with [vuecs](https://github.com/tada5hi/vuecs) and [@privateaim/client-vue](https://github.com/PrivateAIM/hub/tree/master/packages/client-vue).

## Usage

```bash
# Development
npm run dev --workspace=apps/client-ui

# Docker
docker run privateaim/hub ui
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CORE_URL` | — | Core API base URL |
| `NUXT_PUBLIC_AUTHUP_URL` | — | Authup URL |
| `NUXT_PUBLIC_AUTHUP_CLIENT_ID` | `admin-console` | OAuth2 client used for the login (authorization-code) flow |
| `NUXT_PUBLIC_ACCOUNT_URL` | `<NUXT_PUBLIC_AUTHUP_URL>/account` | Authup account console, linked from the header's account icon |
| `NUXT_PUBLIC_STORAGE_URL` | — | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | — | Telemetry service URL |
| `NUXT_PUBLIC_MESSENGER_URL` | — | Messenger service URL |

## Account Self-Service

The UI has no settings area of its own. Profile, password, authenticators, sessions and
connected applications live in **Authup's account console**, served by Authup's
server-core on the IdP origin as of `v1.0.0-beta.59`. The header's account icon links
straight at `<NUXT_PUBLIC_ACCOUNT_URL>/?ref=<ui-origin>`; the console renders the `ref`
origin as a back link after validating it against the trusted app origins, which the UI
origin already has to be in for the login callback.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
