<p align="center">
  <a href="https://github.com/PrivateAIM/hub" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/PrivateAIM/hub/master/.github/assets/logo.svg" alt="FLAME Hub" height="90">
  </a>
</p>

<h1 align="center">@privateaim/client-vue 🎨</h1>

<p align="center">
  <b>Vue 3 component library for FLAME Hub clients.</b><br>
  Forms, lists &amp; detail views for every domain entity.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@privateaim/client-vue"><img src="https://img.shields.io/npm/v/@privateaim/client-vue?logo=npm&logoColor=fff&label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@privateaim/client-vue"><img src="https://img.shields.io/npm/dm/@privateaim/client-vue?color=cb3837&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.privateaim.net"><b>Documentation</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub">Monorepo</a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md">Contributing</a>
</p>

---

Part of the **[FLAME Hub](https://github.com/PrivateAIM/hub)** monorepo — central services for the [PrivateAIM](https://privateaim.net) platform. Built with [vuecs](https://github.com/tada5hi/vuecs).

## Installation

```bash
npm install @privateaim/client-vue
```

## Setup

`install` is **not** self-sufficient: `@authup/client-web-kit`'s auth hook and
store must already be provided on the same app.

```typescript
import { install } from '@privateaim/client-vue';

app.use(install, {
    coreURL, storageURL, telemetryURL,

    // Opt-in: the realtime socket manager needs a live authup store and opens a
    // websocket, so it stays off unless requested.
    realtime: true,
});
```

Each of `coreHTTPClient` / `storageHTTPClient` / `telemetryHTTPClient` accepts a
pre-built client, used instead of constructing one from the matching URL. That
is the seam component tests use to inject a `FakeClient` from
`@privateaim/<kit>/testing`. Prefer it over pre-providing a client: the
installers early-return when one is already provided, so an ordering mistake
fails silently.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
