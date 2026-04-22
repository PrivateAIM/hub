# @privateaim/client-ui 🖥️

Nuxt 4 web application for PrivateAIM Hub — the user-facing frontend for managing projects, analyses, nodes, and platform administration.

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
| `NUXT_PUBLIC_STORAGE_URL` | — | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | — | Telemetry service URL |
| `NUXT_PUBLIC_MESSENGER_URL` | — | Messenger service URL |

## License

Made with 💚

Published under [Apache 2.0](../../LICENSE).
