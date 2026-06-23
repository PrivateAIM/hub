<p align="center">
  <a href="https://privateaim.net" target="_blank" rel="noopener noreferrer">
    <img src="./.github/assets/logo.svg" alt="FLAME Hub" height="130">
  </a>
</p>

<h1 align="center">FLAME Hub</h1>

<p align="center">
  <b>Central services for the FLAME platform.</b><br>
  Privacy-preserving, federated analytics across distributed institutions —<br>
  analysis orchestration, object storage, telemetry &amp; real-time messaging.
</p>

<p align="center">
  <a href="https://github.com/PrivateAIM/hub/actions/workflows/main.yml"><img src="https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/PrivateAIM/hub/actions/workflows/codeql.yml"><img src="https://github.com/PrivateAIM/hub/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A522-3c873a?logo=node.js&logoColor=fff" alt="node >=22">
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=fff" alt="Conventional Commits"></a>
  <a href="https://doi.org/10.5281/zenodo.20701036"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.20701036.svg" alt="DOI"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.privateaim.net"><b>Documentation</b></a> &nbsp;·&nbsp;
  <a href="#quick-start">Quick Start</a> &nbsp;·&nbsp;
  <a href="#services">Services</a> &nbsp;·&nbsp;
  <a href="#packages">Packages</a> &nbsp;·&nbsp;
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

---

FLAME Hub is the home of the central services for **[FLAME](https://privateaim.net)** ([PrivateAIM](https://privateaim.net)) — a privacy-preserving analytics infrastructure that runs distributed computations across institutional boundaries without moving the underlying data. This monorepo bundles the backend services, the web frontend, the shared TypeScript libraries, and the documentation site.

## Architecture

<div align="center">

![Architecture](./.github/assets/architecture.png)

</div>

## Services

Runnable applications. Each backend service follows the same hexagonal (ports &amp; adapters) architecture and ships in the shared `privateaim/hub` Docker image.

| Service | Description |
|---------|-------------|
| **[server-core](apps/server-core)** 🌐 | Main REST API — analyses, projects, nodes, registries |
| **[server-core-worker](apps/server-core-worker)** 🏭 | Background worker — Docker container build &amp; distribution |
| **[server-storage](apps/server-storage)** 📦 | File / object storage (MinIO / S3) |
| **[server-telemetry](apps/server-telemetry)** 📊 | Log aggregation &amp; events (VictoriaLogs) |
| **[server-messenger](apps/server-messenger)** 💬 | Real-time messaging (Socket.io) |
| **[client-ui](apps/client-ui)** 🖥️ | Nuxt 4 web application |
| **[docs](docs)** 📚 | VitePress documentation site |

## Packages

Shared, independently published libraries (`@privateaim/*`).

### Foundation

| Package | Description | |
|---------|-------------|---|
| **[kit](packages/kit)** 🧱 | Core utilities — crypto, domain events, permissions, realms | [![npm][kit-badge]][kit-npm] |
| **[errors](packages/errors)** 🚨 | Shared error vocabulary — `HubError`, typed subclasses, code → HTTP-status mapping | [![npm][errors-badge]][errors-npm] |

### Domain Kits

Domain models, contracts, and typed HTTP / WebSocket clients per service area.

| Package | Description | |
|---------|-------------|---|
| **[core-kit](packages/core-kit)** 🧩 | Domain models &amp; types for the core service | [![npm][core-kit-badge]][core-kit-npm] |
| **[core-http-kit](packages/core-http-kit)** 🔗 | HTTP client for the core API | [![npm][core-http-kit-badge]][core-http-kit-npm] |
| **[core-realtime-kit](packages/core-realtime-kit)** ⚡ | WebSocket event contracts for the core API | [![npm][core-realtime-kit-badge]][core-realtime-kit-npm] |
| **[storage-kit](packages/storage-kit)** 📦 | Storage domain types &amp; HTTP client | [![npm][storage-kit-badge]][storage-kit-npm] |
| **[telemetry-kit](packages/telemetry-kit)** 📊 | Telemetry domain types &amp; validators | [![npm][telemetry-kit-badge]][telemetry-kit-npm] |
| **[messenger-kit](packages/messenger-kit)** 💬 | Messenger contracts &amp; crypto types | [![npm][messenger-kit-badge]][messenger-kit-npm] |
| **[messenger-http-kit](packages/messenger-http-kit)** 📨 | HTTP client for the messenger broker | [![npm][messenger-http-kit-badge]][messenger-http-kit-npm] |

### Server Kits

Server-side building blocks shared across the backend services.

| Package | Description | |
|---------|-------------|---|
| **[server-kit](packages/server-kit)** 🔧 | Server foundation — logging, auth, AMQP, Redis, DI | [![npm][server-kit-badge]][server-kit-npm] |
| **[server-db-kit](packages/server-db-kit)** 🗄️ | TypeORM utilities &amp; migration support | [![npm][server-db-kit-badge]][server-db-kit-npm] |
| **[server-http-kit](packages/server-http-kit)** 🌍 | HTTP middleware &amp; Swagger / OpenAPI | [![npm][server-http-kit-badge]][server-http-kit-npm] |
| **[server-realtime-kit](packages/server-realtime-kit)** ⚡ | Socket.io server helpers | [![npm][server-realtime-kit-badge]][server-realtime-kit-npm] |
| **[server-storage-kit](packages/server-storage-kit)** 📦 | Storage service components | [![npm][server-storage-kit-badge]][server-storage-kit-npm] |
| **[server-telemetry-kit](packages/server-telemetry-kit)** 📊 | Telemetry components &amp; Winston transport | [![npm][server-telemetry-kit-badge]][server-telemetry-kit-npm] |
| **[server-core-worker-kit](packages/server-core-worker-kit)** 🏭 | Worker task definitions | [![npm][server-core-worker-kit-badge]][server-core-worker-kit-npm] |
| **[server-test-kit](packages/server-test-kit)** 🧪 | Shared test fakes &amp; helpers | [![npm][server-test-kit-badge]][server-test-kit-npm] |

### Client

| Package | Description | |
|---------|-------------|---|
| **[client-vue](packages/client-vue)** 🎨 | Vue 3 component library | [![npm][client-vue-badge]][client-vue-npm] |
| **[client-vue-theme](packages/client-vue-theme)** 🌈 | vuecs-based theme — design tokens &amp; chrome | [![npm][client-vue-theme-badge]][client-vue-theme-npm] |

## Quick Start

### Prerequisites

- **Node.js** 22+
- **npm** (workspaces)
- **Docker** (optional) — for MySQL / Postgres test databases

External services (for running the backend locally):
[Authup](https://authup.org) (OAuth2), Redis, RabbitMQ, and MySQL or PostgreSQL.

### Install &amp; Build

```bash
# Install dependencies
npm ci

# Build all packages (Nx, dependency-aware)
npm run build

# Run the test matrix
npm run test

# Lint
npm run lint
```

### Development

```bash
# Start local databases (MySQL + Postgres)
docker-compose up -d

# Dev servers
npm run dev --workspace=apps/client-ui          # Nuxt frontend
npm run dev --workspace=apps/server-core        # Core API
npm run dev --workspace=apps/server-storage     # Storage service
npm run dev --workspace=apps/server-telemetry   # Telemetry service
npm run dev --workspace=apps/server-messenger   # Messenger service
npm run dev --workspace=docs                    # Documentation site
```

## Built With

FLAME Hub is built on a stack of open-source libraries maintained by the same author:
**[Authup](https://authup.org)** (identity &amp; access),
**[Routup](https://github.com/routup/routup)** (HTTP routing),
**[Hapic](https://github.com/tada5hi/hapic)** (HTTP clients),
**[validup](https://github.com/tada5hi/validup)** (validation),
**[ilingo](https://github.com/tada5hi/ilingo)** (i18n), and
**[vuecs](https://github.com/tada5hi/vuecs)** (Vue components &amp; theming).

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## Credits

Created and maintained by [Peter Placzek](https://tada5hi.net) ([@tada5hi](https://github.com/tada5hi)), with contributions from the [PrivateAIM team](https://github.com/PrivateAIM/hub/graphs/contributors). If you have any questions, feel free to reach out.

## Citation

If you use FLAME Hub in academic work, please cite it. Citation metadata is maintained in [`CITATION.cff`](./CITATION.cff) — GitHub renders a **"Cite this repository"** button from it.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20701036.svg)](https://doi.org/10.5281/zenodo.20701036)

## License

Made with 💚

Published under [Apache 2.0](./LICENSE).

[kit-badge]: https://img.shields.io/npm/v/@privateaim/kit?label=
[kit-npm]: https://npmjs.com/package/@privateaim/kit
[errors-badge]: https://img.shields.io/npm/v/@privateaim/errors?label=
[errors-npm]: https://npmjs.com/package/@privateaim/errors
[core-kit-badge]: https://img.shields.io/npm/v/@privateaim/core-kit?label=
[core-kit-npm]: https://npmjs.com/package/@privateaim/core-kit
[core-http-kit-badge]: https://img.shields.io/npm/v/@privateaim/core-http-kit?label=
[core-http-kit-npm]: https://npmjs.com/package/@privateaim/core-http-kit
[core-realtime-kit-badge]: https://img.shields.io/npm/v/@privateaim/core-realtime-kit?label=
[core-realtime-kit-npm]: https://npmjs.com/package/@privateaim/core-realtime-kit
[storage-kit-badge]: https://img.shields.io/npm/v/@privateaim/storage-kit?label=
[storage-kit-npm]: https://npmjs.com/package/@privateaim/storage-kit
[telemetry-kit-badge]: https://img.shields.io/npm/v/@privateaim/telemetry-kit?label=
[telemetry-kit-npm]: https://npmjs.com/package/@privateaim/telemetry-kit
[messenger-kit-badge]: https://img.shields.io/npm/v/@privateaim/messenger-kit?label=
[messenger-kit-npm]: https://npmjs.com/package/@privateaim/messenger-kit
[messenger-http-kit-badge]: https://img.shields.io/npm/v/@privateaim/messenger-http-kit?label=
[messenger-http-kit-npm]: https://npmjs.com/package/@privateaim/messenger-http-kit
[server-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-kit?label=
[server-kit-npm]: https://npmjs.com/package/@privateaim/server-kit
[server-db-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-db-kit?label=
[server-db-kit-npm]: https://npmjs.com/package/@privateaim/server-db-kit
[server-http-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-http-kit?label=
[server-http-kit-npm]: https://npmjs.com/package/@privateaim/server-http-kit
[server-realtime-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-realtime-kit?label=
[server-realtime-kit-npm]: https://npmjs.com/package/@privateaim/server-realtime-kit
[server-storage-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-storage-kit?label=
[server-storage-kit-npm]: https://npmjs.com/package/@privateaim/server-storage-kit
[server-telemetry-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-telemetry-kit?label=
[server-telemetry-kit-npm]: https://npmjs.com/package/@privateaim/server-telemetry-kit
[server-core-worker-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-core-worker-kit?label=
[server-core-worker-kit-npm]: https://npmjs.com/package/@privateaim/server-core-worker-kit
[server-test-kit-badge]: https://img.shields.io/npm/v/@privateaim/server-test-kit?label=
[server-test-kit-npm]: https://npmjs.com/package/@privateaim/server-test-kit
[client-vue-badge]: https://img.shields.io/npm/v/@privateaim/client-vue?label=
[client-vue-npm]: https://npmjs.com/package/@privateaim/client-vue
[client-vue-theme-badge]: https://img.shields.io/npm/v/@privateaim/client-vue-theme?label=
[client-vue-theme-npm]: https://npmjs.com/package/@privateaim/client-vue-theme
