<p align="center">
  <a href="https://github.com/PrivateAIM/hub" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/PrivateAIM/hub/master/.github/assets/logo.svg" alt="FLAME Hub" height="90">
  </a>
</p>

<h1 align="center">@privateaim/messenger-http-kit 📨</h1>

<p align="center">
  <b>HTTP client for the FLAME Hub messenger broker.</b><br>
  Send, pull &amp; ack over the durable mailbox REST API.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@privateaim/messenger-http-kit"><img src="https://img.shields.io/npm/v/@privateaim/messenger-http-kit?logo=npm&logoColor=fff&label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@privateaim/messenger-http-kit"><img src="https://img.shields.io/npm/dm/@privateaim/messenger-http-kit?color=cb3837&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.privateaim.net"><b>Documentation</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub">Monorepo</a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md">Contributing</a>
</p>

---

Part of the **[FLAME Hub](https://github.com/PrivateAIM/hub)** monorepo — central services for the [PrivateAIM](https://privateaim.net) platform.

Built on [Hapic](https://github.com/tada5hi/hapic), this client wraps the broker REST API (send / pull / ack) using the contract types from [`@privateaim/messenger-kit`](https://github.com/PrivateAIM/hub/tree/master/packages/messenger-kit). The FLAME node broker consumes this client to talk to the Hub.

## Installation

```bash
npm install @privateaim/messenger-http-kit
```

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
