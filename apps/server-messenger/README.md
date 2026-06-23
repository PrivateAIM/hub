<p align="center">
  <a href="https://github.com/PrivateAIM/hub" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/PrivateAIM/hub/master/.github/assets/logo.svg" alt="FLAME Hub" height="100">
  </a>
</p>

<h1 align="center">@privateaim/server-messenger 💬</h1>

<p align="center">
  <b>The real-time messaging service of FLAME Hub.</b><br>
  Socket.io with a Redis adapter for cross-instance delivery.
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

Part of the **[FLAME Hub](https://github.com/PrivateAIM/hub)** monorepo — central services for the [PrivateAIM](https://privateaim.net) platform.

## Usage

```bash
# Development
npm run dev --workspace=apps/server-messenger

# CLI
npm run cli --workspace=apps/server-messenger -- start

# Docker
docker run privateaim/hub messenger cli start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP/WebSocket server port |
| `AUTHUP_URL` | `http://127.0.0.1:3010/` | Authup identity provider URL |
| `REDIS_CONNECTION_STRING` | `redis://127.0.0.1` | Redis connection (**required**) |

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
