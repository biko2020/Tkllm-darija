# NGINX Local Reverse Proxy

Optional local reverse proxy that mirrors the production NGINX Ingress
Controller routing, letting you access all services via clean URLs instead
of raw `localhost:PORT` addresses.

## Files

| File | Purpose |
|---|---|
| `nginx.conf` | Full NGINX config — path + subdomain routing |
| `docker-compose.nginx.yml` | Compose override that adds the nginx service |

## Quick Start

```bash
# Start infra + NGINX overlay
docker compose \
  -f infrastructure/docker/docker-compose.yml \
  -f infrastructure/docker/nginx/docker-compose.nginx.yml \
  --profile apps up -d
```

Or use the npm script (add to root `package.json` scripts):

```bash
npm run infra:up:nginx
```

## /etc/hosts entries

Add to `/etc/hosts` (Linux/macOS) or
`C:\Windows\System32\drivers\etc\hosts` (Windows — run as Administrator):

```
127.0.0.1  app.localhost
127.0.0.1  b2b.localhost
127.0.0.1  api.localhost
127.0.0.1  mlflow.localhost
127.0.0.1  prefect.localhost
127.0.0.1  minio.localhost
127.0.0.1  grafana.localhost
```

## URL Map

| URL | Service | Port |
|---|---|---|
| `http://localhost/` | Contributor web app | 3002 |
| `http://app.localhost/` | Contributor web app | 3002 |
| `http://localhost/b2b/` | B2B enterprise portal | 3003 |
| `http://b2b.localhost/` | B2B enterprise portal | 3003 |
| `http://localhost/api/v1/` | NestJS REST API | 3000 |
| `http://api.localhost/api/v1/` | NestJS REST API | 3000 |
| `http://localhost/graphql` | GraphQL Playground | 3000 |
| `http://localhost/mlflow/` | MLflow UI | 5000 |
| `http://mlflow.localhost/` | MLflow UI | 5000 |
| `http://localhost/prefect/` | Prefect UI | 4200 |
| `http://prefect.localhost/` | Prefect UI | 4200 |
| `http://localhost/minio/` | MinIO Console | 9001 |
| `http://minio.localhost/` | MinIO Console | 9001 |
| `http://localhost/grafana/` | Grafana | 3001 |
| `http://grafana.localhost/` | Grafana | 3001 |

## Audio Upload CORS

The `nginx.conf` passes `client_max_body_size 50M` and
`proxy_request_buffering off` for the MinIO S3 paths, allowing
browser-direct multipart audio uploads up to 50 MB without buffering
the entire file in NGINX memory first.

## Why this is optional

The `docker-compose.yml` already exposes every service on its own port
(`localhost:3002`, `localhost:3000`, etc.), so NGINX is purely a convenience
for local development workflows that require clean URLs or are testing
the reverse-proxy routing logic before deploying to Kubernetes.