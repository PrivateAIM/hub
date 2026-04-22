# Deployment

This section covers deploying PrivateAIM Hub services to production environments.

::: tip Source Repository
Deployment manifests, scripts, and detailed instructions are maintained in the [hub-deployment](https://github.com/PrivateAIM/hub-deployment) repository.
:::

## Deployment Options

| Option | Best For | Guide |
|--------|----------|-------|
| [Docker Compose](/guide/deployment/docker-compose) | Development, testing, single-machine | Self-contained setup with all services |
| [Kubernetes (Helm)](/guide/deployment/kubernetes) | Production, multi-node, HA | Scalable chart-based deployment |

## Reference

- [Configuration](/guide/deployment/configuration) — environment variables for all services
- [Docker Image](/guide/deployment/docker) — building and running the Hub image
- [Reverse Proxy](/guide/deployment/reverse-proxy) — Nginx routing for all services
