<p align="center">
    <a href="https://privateaim.de"><img src="./.github/assets/hero.svg" alt="FLAME Hub" width="128" height="128" /></a>
</p>

<h1 align="center">FLAME Hub</h1>

<p align="center">
    <b>Federated analytics across institutions. The data never moves.</b><br>
    A FLAME analysis is a container that travels to the data. Hub builds the analysis image,<br>
    ships it to the nodes that joined a project, and collects the results, without ever seeing a row.
</p>

<p align="center">
    <a href="https://github.com/PrivateAIM/hub/actions/workflows/main.yml"><img src="https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="https://github.com/PrivateAIM/hub/actions/workflows/codeql.yml"><img src="https://github.com/PrivateAIM/hub/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" /></a>
    <img src="https://img.shields.io/badge/node-24-3c873a?logo=node.js&logoColor=fff" alt="node 24" />
    <a href="https://doi.org/10.5281/zenodo.20701036"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.20701036.svg" alt="DOI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="license" /></a>
</p>

<p align="center">
    <a href="https://hub.docs.privateaim.net"><b>Documentation</b></a>
    ·
    <a href="#quick-start">Quick start</a>
    ·
    <a href="#services">Services</a>
    ·
    <a href="#packages">Packages</a>
    ·
    <a href="./CONTRIBUTING.md">Contributing</a>
</p>

Institutions each run a **node** ([PrivateAIM/node](https://github.com/PrivateAIM/node)); Hub is
the centre that decides what runs where. This monorepo is the central half: five backend services,
a Nuxt frontend, 19 shared TypeScript libraries, and the documentation site.

## How it works

1. **Project.** A researcher proposes a project and picks the nodes it should run on. Each node's
   institution approves or rejects taking part.
2. **Analysis.** Within the project, the researcher uploads analysis code and picks a master
   image. Each node approves the analysis again before its configuration is locked.
3. **Build.** The worker builds a container image from the code and the master image and pushes
   it to each node's project in the container registry.
4. **Run.** Each node pulls the image and runs it next to its own data. Only results flow back to
   Hub's storage; the data itself never leaves the institution.

📖 [Projects](https://hub.docs.privateaim.net/guide/user/projects.html) ·
[Analyses](https://hub.docs.privateaim.net/guide/user/analyses.html) ·
[Approval](https://hub.docs.privateaim.net/guide/user/approval.html)

## Quick start

Requires **Node.js ≥24.0.0**, npm, and Docker.

```bash
npm ci          # install
npm run build   # build all packages (Nx, dependency-aware)
npm run test    # run the test matrix
npm run lint    # lint
```

```bash
docker compose up -d                            # MySQL + Postgres only

npm run dev --workspace=apps/server-core        # Core API
npm run dev --workspace=apps/client-ui          # Nuxt frontend
npm run dev --workspace=docs                    # Documentation site
```

The repository's `docker-compose.yml` provides only the databases. The backend services also
need [Authup](https://authup.org) (OAuth2), Redis and RabbitMQ, which you run yourself. For the
complete stack with all services and infrastructure, use
[hub-deployment](https://github.com/PrivateAIM/hub-deployment).

📖 [Local setup](https://hub.docs.privateaim.net/guide/development/) ·
[API reference](https://hub.docs.privateaim.net/guide/development/api.html) ·
[Deployment](https://hub.docs.privateaim.net/guide/deployment/)

## Services

```mermaid
flowchart LR
    subgraph hub [FLAME Hub]
        ui[client-ui]
        core[server-core]
        worker[server-core-worker]
        storage[server-storage]
        telemetry[server-telemetry]
        messenger[server-messenger]
    end

    authup[(Authup)]
    mq{{RabbitMQ}}
    registry[(Container registry)]
    nodes[FLAME nodes 1…N]

    ui --> core & storage & telemetry
    core <--> mq <--> worker
    worker -- push image --> registry
    nodes -- pull image --> registry
    nodes -- status --> core
    nodes -- results --> storage
    nodes <--> messenger
    hub -. tokens .-> authup
```

Each backend service follows the same hexagonal (ports &amp; adapters) architecture. All of them
ship in one Docker image, and the container's arguments pick the service and its command:

```bash
docker run ghcr.io/privateaim/hub core cli start       # Core API
docker run ghcr.io/privateaim/hub storage cli start    # likewise: telemetry, messenger
docker run ghcr.io/privateaim/hub core-worker start    # worker
docker run ghcr.io/privateaim/hub ui start             # frontend
```

Every entity endpoint answers with a `{ data, meta }` envelope, and every query-capable `GET`
publishes the vocabulary it accepts under `meta.schema`, so a client never has to read server
source to build a valid query.

| Service | Responsibility |
|---------|----------------|
| [`server-core`](apps/server-core) | Main REST API — analyses, projects, nodes, registries |
| [`server-core-worker`](apps/server-core-worker) | Background worker — Docker image build &amp; distribution |
| [`server-storage`](apps/server-storage) | File and object storage, on MinIO / S3 or the filesystem |
| [`server-telemetry`](apps/server-telemetry) | Log aggregation and events, backed by VictoriaLogs |
| [`server-messenger`](apps/server-messenger) | Durable store-and-forward message broker |
| [`client-ui`](apps/client-ui) | Nuxt 4 web application |

## Packages

Shared libraries, published to npm as `@privateaim/*`.

### Foundation

| Package | Responsibility | Version |
|---------|----------------|---------|
| [`kit`](packages/kit) | Crypto, domain events, permissions, realms | [![npm][kit-badge]][kit-npm] |
| [`errors`](packages/errors) | `HubError`, typed subclasses, code → HTTP-status mapping | [![npm][errors-badge]][errors-npm] |

### Domain kits

Models, contracts and typed clients, one set per service area.

| Package | Responsibility | Version |
|---------|----------------|---------|
| [`core-kit`](packages/core-kit) | Domain models and types for the core service | [![npm][core-kit-badge]][core-kit-npm] |
| [`core-http-kit`](packages/core-http-kit) | HTTP client for the core API | [![npm][core-http-kit-badge]][core-http-kit-npm] |
| [`core-realtime-kit`](packages/core-realtime-kit) | WebSocket event contracts for the core API | [![npm][core-realtime-kit-badge]][core-realtime-kit-npm] |
| [`storage-kit`](packages/storage-kit) | Storage domain types and HTTP client | [![npm][storage-kit-badge]][storage-kit-npm] |
| [`telemetry-kit`](packages/telemetry-kit) | Telemetry domain types and validators | [![npm][telemetry-kit-badge]][telemetry-kit-npm] |
| [`messenger-kit`](packages/messenger-kit) | Messenger contracts and crypto types | [![npm][messenger-kit-badge]][messenger-kit-npm] |
| [`messenger-http-kit`](packages/messenger-http-kit) | HTTP client for the messenger broker | [![npm][messenger-http-kit-badge]][messenger-http-kit-npm] |

### Server kits

Building blocks shared across the backend services.

| Package | Responsibility | Version |
|---------|----------------|---------|
| [`server-kit`](packages/server-kit) | Logging, auth, AMQP, Redis, dependency injection | [![npm][server-kit-badge]][server-kit-npm] |
| [`server-db-kit`](packages/server-db-kit) | TypeORM utilities and migration support | [![npm][server-db-kit-badge]][server-db-kit-npm] |
| [`server-http-kit`](packages/server-http-kit) | HTTP middleware and OpenAPI generation | [![npm][server-http-kit-badge]][server-http-kit-npm] |
| [`server-realtime-kit`](packages/server-realtime-kit) | Socket.io server helpers | [![npm][server-realtime-kit-badge]][server-realtime-kit-npm] |
| [`server-storage-kit`](packages/server-storage-kit) | Storage service components | [![npm][server-storage-kit-badge]][server-storage-kit-npm] |
| [`server-telemetry-kit`](packages/server-telemetry-kit) | Telemetry components and Winston transport | [![npm][server-telemetry-kit-badge]][server-telemetry-kit-npm] |
| [`server-core-worker-kit`](packages/server-core-worker-kit) | Worker task definitions | [![npm][server-core-worker-kit-badge]][server-core-worker-kit-npm] |
| [`server-test-kit`](packages/server-test-kit) | Shared test fakes and helpers | [![npm][server-test-kit-badge]][server-test-kit-npm] |

### Client

| Package | Responsibility | Version |
|---------|----------------|---------|
| [`client-vue`](packages/client-vue) | Vue 3 component library | [![npm][client-vue-badge]][client-vue-npm] |
| [`client-vue-theme`](packages/client-vue-theme) | vuecs-based theme — design tokens and chrome | [![npm][client-vue-theme-badge]][client-vue-theme-npm] |

## Built with

FLAME Hub runs on a stack of open-source libraries maintained by the same author:
**[Authup](https://authup.org)** (identity and access),
**[Routup](https://github.com/routup/routup)** (HTTP routing),
**[Hapic](https://github.com/tada5hi/hapic)** (HTTP clients),
**[validup](https://github.com/tada5hi/validup)** (validation),
**[ilingo](https://github.com/tada5hi/ilingo)** (i18n), and
**[vuecs](https://github.com/tada5hi/vuecs)** (Vue components and theming).

## Contributing

Before starting work on a pull request, please review the
[contributing guidelines](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md).

## Credits and citation

Created and maintained by [Peter Placzek](https://tada5hi.net) ([@tada5hi](https://github.com/tada5hi)),
with contributions from the [PrivateAIM team](https://github.com/PrivateAIM/hub/graphs/contributors).

If you use FLAME Hub in academic work, please cite it — citation metadata lives in
[`CITATION.cff`](./CITATION.cff), which GitHub renders as a **"Cite this repository"** button.

## License

Made with 💚 · Published under [Apache 2.0](./LICENSE).

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
