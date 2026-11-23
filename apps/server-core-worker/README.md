<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-core-worker 🏭</h1>

</div>

[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Background worker of FLAME Hub that builds and distributes analysis and master images with Docker.**

It consumes build and distribution commands from server-core over RabbitMQ, runs them against a Docker daemon, and reports progress back as events. It has no database.
Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo; a private workspace that is not published to npm.

[Usage](#usage) · [Components](#components) · [Configuration](#configuration) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/worker/)

---

## Usage

The worker needs Node.js `>=26.0.0`, RabbitMQ, Authup, server-core, server-storage and access to a Docker daemon.

```bash
# From the repository root: install and build every workspace
npm ci
npm run build

# Start the worker
npm run start --workspace=apps/server-core-worker
```

The worker has no CLI: `start` runs `node dist/index.mjs`, which loads a `.env` file from the working directory.

### Docker

The worker ships in the shared `ghcr.io/privateaim/hub` image. It talks to the Docker daemon through the default socket (or `DOCKER_HOST`), so mount the socket:

```bash
docker run \
    -e AUTHUP_URL=http://authup:3000/ \
    -e CORE_URL=http://core:3000/ \
    -e STORAGE_URL=http://storage:3000/ \
    -e RABBITMQ_CONNECTION_STRING=amqp://user:secret@rabbitmq \
    -v /var/run/docker.sock:/var/run/docker.sock \
    ghcr.io/privateaim/hub core-worker start
```

## Components

| Component | Purpose |
|-----------|---------|
| Analysis builder | Builds the analysis image from its master image and the code bucket |
| Analysis distributor | Pushes the built image to the registries of the analysis nodes |
| Master image builder | Builds a master image from the master images repository |
| Master image synchronizer | Synchronizes the master image catalog |

- A failure that can go away on its own (connection errors, a 5xx or 429 from an HTTP API, an unreachable Docker daemon) is thrown back to the message bus, which retries the command with backoff.
- Every other failure, and a retryable one on the last attempt, is reported as the matching `*_FAILED` event.
- While a build or push runs, the worker sends progress events and a heartbeat every 5 minutes, so server-core does not treat the analysis as stuck. The heartbeat stops after 2 hours without progress from a single step.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development`, `production` or `test` |
| `PORT` | `3000` | Port of the health endpoints `/`, `/livez` and `/readyz` |
| `AUTHUP_URL` | none (**required**) | Authup identity provider URL |
| `CORE_URL` | none (**required**) | server-core base URL |
| `STORAGE_URL` | none (**required**) | server-storage base URL |
| `RABBITMQ_CONNECTION_STRING` | `amqp://root:start123@127.0.0.1` | RabbitMQ connection |
| `REALM` | `master` | Authup realm of the worker client |
| `CLIENT_ID` | `system` | Authup client the worker authenticates as against core and storage |
| `CLIENT_SECRET` | `start123` | Secret of that client |

## Notes

- **A missing URL stops the start.** `AUTHUP_URL`, `CORE_URL` and `STORAGE_URL` are read as required; each must be a valid URL.
- **`SHUTDOWN_DELAY` does not apply.** The worker ignores it and starts its teardown on the first stop signal.
- **A hung step blocks its queue.** With one worker, a check waits behind a hung build in the same queue; recovery needs a worker restart, a second replica or RabbitMQ's `consumer_timeout`.
- **Roll out the worker before server-core.** server-core may send commands that only the new worker understands.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
