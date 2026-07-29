<p align="center">
  <a href="https://github.com/PrivateAIM/hub" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/PrivateAIM/hub/master/.github/assets/logo.svg" alt="FLAME Hub" height="90">
  </a>
</p>

<h1 align="center">@privateaim/core-http-kit 🔗</h1>

<p align="center">
  <b>Typed HTTP client for the FLAME Hub core API.</b><br>
  Built on <a href="https://github.com/tada5hi/hapic">Hapic</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@privateaim/core-http-kit"><img src="https://img.shields.io/npm/v/@privateaim/core-http-kit?logo=npm&logoColor=fff&label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@privateaim/core-http-kit"><img src="https://img.shields.io/npm/dm/@privateaim/core-http-kit?color=cb3837&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.privateaim.net"><b>Documentation</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub">Monorepo</a> &nbsp;·&nbsp;
  <a href="https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md">Contributing</a>
</p>

---

Part of the **[FLAME Hub](https://github.com/PrivateAIM/hub)** monorepo — central services for the [PrivateAIM](https://privateaim.net) platform.

## Installation

```bash
npm install @privateaim/core-http-kit
```

## Testing

The `Client` class implements `ICoreClient`, so consumers can depend on the
contract rather than the class. `@privateaim/core-http-kit/testing` ships a
`FakeClient` — a real `Client` on an in-memory transport, so the request pipeline
(header merge, decode, hooks, retry) runs unchanged and no network is touched:

```typescript
import { createFakeClient } from '@privateaim/core-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /projects/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
    },
});

const { data: project } = await client.project.getOne('abc');

// Every dispatched request is recorded, normalized.
console.log(client.requests);
```

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
