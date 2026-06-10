# Nginx config for WealthFlow

This folder contains the `nginx.conf` used by the production `docker-compose.prod.yml` setup.

Quick notes:

- The config proxies `/api/*` to the backend service at `backend:4000` and proxies `/` to the frontend service at `frontend:80`.
- TLS certificates must be mounted at `/etc/nginx/certs` inside the container. Place `fullchain.pem` and `privkey.pem` in `infra/nginx/certs/` on the host.
- For local testing without real certificates, either:
  - start the stack without the `nginx` service (recommended for quick tests), or
  - generate self-signed certs and place them in `infra/nginx/certs/` (not suitable for production).

Example to start services without nginx:

```
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres redis backend frontend
```
