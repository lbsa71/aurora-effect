# Docker Setup

This directory contains Docker configuration for running the Aurora Effect application in a single container.

## Quick Start

```bash
# Build and start the service with Docker Compose
docker compose up -d

# Access the application at http://localhost:3000
# The UI is served from the same port as the API
```

## Architecture

The Aurora Effect application is now consolidated into a **single Docker container** that serves both the UI and API:

- **UI**: Served as static files from the Node.js/Express server
- **API**: RESTful endpoints under `/api/*`
- **WebSocket**: Real-time updates via Socket.io
- **Port**: Single port 3000 for all services

This architecture makes deployment simpler and enables hosting under a subpath (e.g., `projects.lbsa71.net/projects/aurora-project`).

## Services

### Consolidated Service
- **Image**: Node.js 18 Alpine (multi-stage build)
- **Port**: 3000
- **Health Check**: http://localhost:3000/health
- **Contains**:
  - Express server (API)
  - Socket.io (WebSocket)
  - Static UI files (React/Vite build)
  - Simulator library

## Build Process

The Docker setup uses a **multi-stage build process**:

1. **Stage 1 - UI Builder**: Builds React/Vite UI application
2. **Stage 2 - API Builder**: Builds TypeScript API and simulator
3. **Stage 3 - Runtime**: Combines built artifacts in a minimal production image

This approach:
- Minimizes final image size
- Separates build and runtime dependencies
- Builds everything in a single `docker build` command

## Configuration

### Environment Variables

Edit `docker-compose.yml` or set environment variables:

**Application:**
- `NODE_ENV`: Environment mode (default: production)
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: CORS origin (default: *)
- `MAX_SIMULATIONS`: Max concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS`: Update interval in ms (default: 100)
- `BASE_PATH`: Base path for subpath deployment (default: empty)

**Example for subpath deployment:**
```bash
docker run -p 3000:3000 -e BASE_PATH=/projects/aurora-project aurora-effect
```

### Ports

To change the exposed port, edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # Change 8080 to desired external port
```

## Development

### Building the Docker Image

```bash
# Build with Docker Compose
docker compose build

# Or build directly
docker build -t aurora-effect .
```

### Running the Container

```bash
# With Docker Compose (recommended)
docker compose up -d

# Or run directly
docker run -p 3000:3000 aurora-effect
```

### Rebuilding After Code Changes

```bash
# Rebuild and restart
docker compose up --build

# Or rebuild specific service
docker compose build app
docker compose up -d app
```

### Viewing Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f app
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

1. **Set CORS_ORIGIN**: Configure allowed origins instead of `*`
2. **Use HTTPS**: Put service behind a reverse proxy or load balancer
3. **Set BASE_PATH**: If deploying under a subpath (e.g., `/projects/aurora-project`)
4. **Set resource limits**: Add memory/CPU limits in docker-compose.yml
5. **Enable monitoring**: Add healthcheck endpoints to your monitoring system
6. **Configure logging**: Set up log aggregation (ELK, Loki, etc.)

### Subpath Deployment

To deploy under a subpath like `https://example.com/projects/aurora-project`:

1. Set the `BASE_PATH` environment variable:
   ```yaml
   environment:
     - BASE_PATH=/projects/aurora-project
   ```

2. Configure your reverse proxy to forward requests to the container

3. The application will automatically:
   - Serve UI assets with correct base path
   - Handle API requests at the subpath
   - Configure WebSocket connections correctly

### Example with Nginx Reverse Proxy

```nginx
location /projects/aurora-project/ {
    proxy_pass http://aurora-effect:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Resource Limits

Example resource limits:

```yaml
services:
  app:
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

If Docker build fails:
```bash
# Clean Docker cache
docker builder prune

# Rebuild without cache
docker compose build --no-cache
```

### Container Won't Start

Check logs:
```bash
docker compose logs app
```

Common issues:
- Port 3000 already in use
- Missing environment variables
- Health check failing

### Port Conflicts

If port 3000 is in use:
```bash
# Find what's using the port
lsof -i :3000

# Stop conflicting service or change ports in docker-compose.yml
```

### UI Not Loading

1. Check that the container is running: `docker compose ps`
2. Check logs: `docker compose logs app`
3. Verify UI files were built: `docker exec aurora-effect ls -la /app/packages/ui/dist`
4. Test health endpoint: `curl http://localhost:3000/health`

## Published Images

Pre-built images are published to GitHub Container Registry (GHCR):

- Image: `ghcr.io/lbsa71/aurora-effect`

Tags:
- `latest` - Latest build from main branch
- `<branch-name>` - Builds from specific branches
- `<tag>` - Release tags (e.g., `v1.2.3`)
- `sha-<commit>` - Specific commit builds

### Pull and Run

```bash
# Pull latest image
docker pull ghcr.io/lbsa71/aurora-effect:latest

# Run with Docker
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=* \
  -e MAX_SIMULATIONS=10 \
  -e UPDATE_INTERVAL_MS=100 \
  ghcr.io/lbsa71/aurora-effect:latest

# Or use Docker Compose production file
docker compose -f docker-compose.prod.yml up -d
```

## Architecture Diagram

```
┌─────────────────────────────────────┐
│          Browser                    │
│      (localhost:3000)               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Aurora Effect Container           │
│   (Node.js/Express)                 │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Static UI Files            │  │
│   │  (React/Vite build)         │  │
│   │  Served from /              │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  REST API                   │  │
│   │  /api/*                     │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  WebSocket Server           │  │
│   │  /socket.io/*               │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Simulator Library          │  │
│   │  (Core logic)               │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Files

- `Dockerfile`: Multi-stage build for consolidated container
- `docker-compose.yml`: Development/local orchestration
- `docker-compose.prod.yml`: Production orchestration with GHCR images
- `.dockerignore`: Files excluded from Docker build context
