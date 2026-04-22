# Reverse Proxy

Hub services are typically exposed behind an Nginx reverse proxy that routes requests by path prefix. The [hub-deployment](https://github.com/PrivateAIM/hub-deployment) repository includes a ready-to-use `nginx.conf`.

## Routing

All services are accessible on a single port (default: `3000`):

| Path | Service | WebSocket |
|------|---------|-----------|
| `/` | UI (frontend) | No |
| `/core/` | Core API | Yes (Socket.io) |
| `/auth/` | Authup | No |
| `/storage/` | Storage | No |
| `/telemetry/` | Telemetry | No |
| `/messenger/` | Messenger | Yes (Socket.io) |

## Nginx Configuration

```nginx
worker_processes 1;
events { worker_connections 1024; }

http {
    sendfile on;
    client_max_body_size 0;        # Unlimited upload size
    chunked_transfer_encoding on;

    server {
        listen 3000;

        # Frontend
        location / {
            proxy_pass http://ui:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Core API with WebSocket support
        location /core/ {
            rewrite ^/core/(.*) /$1 break;
            proxy_pass http://core:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Authentication
        location /auth/ {
            rewrite ^/auth/(.*) /$1 break;
            proxy_pass http://authup:3000;
            proxy_set_header Host $host;
        }

        # Storage
        location /storage/ {
            rewrite ^/storage/(.*) /$1 break;
            proxy_pass http://storage:3000;
            proxy_set_header Host $host;
        }

        # Telemetry
        location /telemetry/ {
            rewrite ^/telemetry/(.*) /$1 break;
            proxy_pass http://telemetry:3000;
            proxy_set_header Host $host;
        }

        # Messenger with WebSocket support
        location /messenger/ {
            rewrite ^/messenger/(.*) /$1 break;
            proxy_pass http://messenger:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

::: tip
For production, add SSL termination, rate limiting, and appropriate `proxy_read_timeout` values for long-running WebSocket connections.
:::
