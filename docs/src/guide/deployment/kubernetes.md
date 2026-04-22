# Kubernetes (Helm)

PrivateAIM Hub can be deployed to Kubernetes using the official Helm chart. This is the recommended approach for production environments.

::: tip
Deployment manifests, scripts, and step-by-step guides are in the [hub-deployment](https://github.com/PrivateAIM/hub-deployment) repository under `kubernetes/`.
:::

## Prerequisites

- A functioning Kubernetes cluster with ingress capability
- A default storage class configured
- [Helm](https://helm.sh/docs/intro/install/) installed
- Two domain names: one for Hub, one for Harbor (can use `/etc/hosts` for local setups)

## Quick Start

```bash
# Add the Helm repository
helm repo add flame https://PrivateAIM.github.io/helm
helm repo update

# Install with custom values
helm install hub -f values.yaml flame/hub
```

## Kubernetes Distributions

### MicroK8s (Recommended for Production)

```bash
# Automated setup
git clone https://github.com/PrivateAIM/hub-deployment.git
cd hub-deployment
bash scripts/1_microk8s_setup.sh
```

The setup script installs MicroK8s and enables the required addons:
- `dashboard` — Kubernetes dashboard
- `ingress` — Nginx ingress controller
- `hostpath-storage` — local persistent volumes
- `metrics-server` — resource monitoring

Default storage path: `/var/snap/microk8s/common`

### Minikube (Development/Testing)

```bash
minikube start
minikube addons enable ingress
```

For DNS resolution, configure your local hosts file or use the provided `scripts/minikube-dns.ps1` (Windows).

## Configuration

Create a custom values file rather than modifying defaults. Reference the upstream `values.yaml` for all available options.

Example override (`values.yaml`):

```yaml
global:
  flameHub:
    ingress:
      enabled: true
      ssl: true
      hostname: "hub.local"

harbor:
  enabled: true
  externalURL: "https://harbor.hub.local/"
```

### Ingress Options

**Path-based routing (default):** All Hub services are routed via path prefixes under a single hostname. Harbor requires a separate hostname.

**Gateway API with F5 NGINX Gateway Fabric:** Recommended for setups that involve large file uploads (better chunked transfer support).

## Storage Replication (Optional)

For multi-node clusters (3+ nodes), OpenEBS Mayastor provides replicated persistent storage with automatic failover.

### Node Preparation

```bash
# Automated setup (run on each node)
bash scripts/2_prepare_for_mayastor.sh
```

This script:
1. Enables 1024 hugepages (2MB each)
2. Loads the `nvme-tcp` kernel module
3. Labels the node with `openebs.io/engine=mayastor`

### Installation

Follow the [OpenEBS Mayastor guide](https://github.com/PrivateAIM/hub-deployment/blob/master/kubernetes/2_setup_storage_replication.md) in the hub-deployment repository to:

1. Clone the FLAME Helm repository
2. Install the OpenEBS wrapper chart
3. Configure the `mayastor-replicated` storage class in your Hub values

## Further Reading

- [hub-deployment repository](https://github.com/PrivateAIM/hub-deployment) — full deployment guides and scripts
- [FLAME Helm charts](https://github.com/PrivateAIM/helm) — chart source and `values.yaml` reference
