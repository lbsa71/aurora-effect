# Docker Setup

This directory contains Docker configuration for running the Aurora Effect application in containers.

## Quick Start

```bash
# 1. Build the application
./docker-build.sh

# 2. Start services with Docker Compose
docker compose up -d

# 3. Access the application
# - UI: http://localhost
# - API: http://localhost:3000
```

## Services

### API Service
- **Image**: Node.js 18 Alpine
- **Port**: 3000
- **Health Check**: http://localhost:3000/health
- **Dependencies**: express, socket.io, cors, zod, uuid

### UI Service  
- **Image**: Nginx Alpine
- **Port**: 80
- **Health Check**: http://localhost/health
- **Serves**: Pre-built Vite/React application

## Build Process

The Docker setup uses a two-step build process:

1. **Local Build** (`./docker-build.sh`): Builds TypeScript code and bundles UI assets
2. **Docker Build**: Copies pre-built artifacts and production dependencies into containers

This approach avoids npm workspace installation issues in Docker environments.

## Configuration

### Environment Variables

Edit `docker-compose.yml` to customize:

**API:**
- `NODE_ENV`: Environment mode (default: production)
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: CORS origin (default: http://localhost)
- `MAX_SIMULATIONS`: Max concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS`: Update interval (default: 100)

**UI:**
- `VITE_API_URL`: API server URL (default: http://localhost:3000)

### Ports

To change exposed ports, edit `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - "3001:3000"  # Change 3001 to desired port
  ui:
    ports:
      - "8080:80"    # Change 8080 to desired port
```

## Development

### Rebuilding After Code Changes

```bash
# 1. Rebuild the application
./docker-build.sh

# 2. Rebuild and restart containers
docker compose up --build

# Or rebuild specific service
docker compose build api
docker compose up -d api
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f ui
```

### Stopping Services

```bash
# Stop containers (keeps volumes)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes
docker compose down -v
```

## Production Deployment

For production deployment:

1. **Update CORS_ORIGIN**: Set to your domain instead of `*`
2. **Use HTTPS**: Put services behind a reverse proxy (nginx, traefik, etc.)
3. **Set resource limits**: Add memory/CPU limits in docker-compose.yml
4. **Enable monitoring**: Add healthcheck endpoints to your monitoring system
5. **Configure logging**: Set up log aggregation (ELK, Loki, etc.)

Example resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### Build Failures

If `./docker-build.sh` fails:
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Container Won't Start

Check logs:
```bash
docker compose logs api
docker compose logs ui
```

### Port Conflicts

If ports 80 or 3000 are in use:
```bash
# Find what's using the port
lsof -i :3000
lsof -i :80

# Stop conflicting service or change ports in docker-compose.yml
```

### Module Not Found Errors

Ensure you ran `./docker-build.sh` before `docker compose build`:
```bash
./docker-build.sh
docker compose build --no-cache
```

## Architecture

```
┌─────────────────┐
│   Browser       │
│  (localhost)    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│   UI (Nginx)    │  │   API (Node)    │
│   Port 80       │  │   Port 3000     │
│                 │  │                 │
│ - React App     │  │ - REST API      │
│ - Static Assets │  │ - WebSocket     │
│                 │  │ - Simulator     │
└─────────────────┘  └─────────────────┘
         │                  │
         └──────────────────┘
                │
                ▼
        Docker Network
        (aurora-network)
```

## Files

- `docker-compose.yml`: Orchestration configuration
- `packages/api/Dockerfile`: API service image
- `packages/ui/Dockerfile`: UI service image
- `packages/ui/nginx.conf`: Nginx configuration for UI
- `.dockerignore`: Files excluded from Docker build context
- `docker-build.sh`: Pre-build script for application code
