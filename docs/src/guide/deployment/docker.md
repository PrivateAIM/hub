# Docker

PrivateAIM Hub uses a multi-service `Dockerfile` that builds the entire monorepo. The `entrypoint.sh` script selects which service to start based on environment variables.

## Building the Image

```bash
docker build -t privateaim/hub .
```

This produces a single image containing all services. The service to run is selected at container startup.

## Running a Service

```bash
# Core API
docker run -e SERVICE=server-core \
    -e DB_TYPE=postgres \
    -e DB_HOST=db \
    -e DB_PORT=5432 \
    -e DB_USERNAME=privateaim \
    -e DB_PASSWORD=secret \
    -e DB_DATABASE=hub \
    -e AUTHUP_URL=http://authup:3000 \
    -p 4000:4000 \
    privateaim/hub

# Storage service
docker run -e SERVICE=server-storage \
    -e MINIO_ENDPOINT=minio \
    -e MINIO_ACCESS_KEY=minioadmin \
    -e MINIO_SECRET_KEY=minioadmin \
    -p 4001:4001 \
    privateaim/hub
```

See [Configuration](/guide/deployment/configuration) for the full list of environment variables per service.
