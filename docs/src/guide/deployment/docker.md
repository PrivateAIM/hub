# Docker

FLAME Hub uses a multi-service `Dockerfile` that builds the entire monorepo. The `entrypoint.sh` script selects which service to start from the container's arguments.

## Building the Image

```bash
docker build -t privateaim/hub .
```

This produces a single image containing all services. The service to run is selected at container startup.

## Running a Service

The container's arguments select the service and the command to run, the same way as
`entrypoint.sh <service> <command>`. Without arguments the image starts the Core API
(`core cli start`). Every service listens on port 3000 unless `PORT` is set.

| Service | Arguments |
|---------|-----------|
| Core API | `core cli start` |
| Worker | `core-worker start` |
| Storage | `storage cli start` |
| Telemetry | `telemetry cli start` |
| Messenger | `messenger cli start` |
| Frontend | `ui start` |

```bash
# Core API
docker run \
    -e DB_TYPE=postgres \
    -e DB_HOST=db \
    -e DB_PORT=5432 \
    -e DB_USERNAME=privateaim \
    -e DB_PASSWORD=secret \
    -e DB_DATABASE=hub \
    -e AUTHUP_URL=http://authup:3000 \
    -p 3000:3000 \
    ghcr.io/privateaim/hub core cli start

# Storage service
docker run \
    -e MINIO_CONNECTION_STRING=http://minioadmin:minioadmin@minio:9000 \
    -p 3001:3000 \
    ghcr.io/privateaim/hub storage cli start
```

See [Configuration](/guide/deployment/configuration) for the full list of environment variables per service.
