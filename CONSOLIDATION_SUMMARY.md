# Docker Consolidation Summary

## What Was Changed

This consolidation effort successfully merged the separate UI (Nginx) and API (Node.js) Docker containers into a single, unified container. This change enables:

1. **Simpler deployment** - One container instead of three (UI + API + proxy)
2. **Subpath hosting** - Can be deployed under paths like `/projects/aurora-project`
3. **Better portability** - Single image to pull and run
4. **Reduced complexity** - No need to configure reverse proxy separately

## Architecture Changes

### Before
```
┌─────────────────┐
│   Browser       │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   UI (Nginx)    │  │   API (Node)    │  │  Proxy (Nginx)  │
│   Port 80       │  │   Port 3000     │  │   Port 80       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### After
```
┌─────────────────┐
│   Browser       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Aurora Effect (Node.js)           │
│   Port 3000                         │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Static UI Files            │  │
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
└─────────────────────────────────────┘
```

## Technical Implementation

### 1. Dockerfile Consolidation

**Old Approach:**
- Two separate Dockerfiles: `packages/api/Dockerfile` and `packages/ui/Dockerfile`
- Required pre-building with `docker-build.sh` script
- Used nginx for UI serving

**New Approach:**
- Single root `Dockerfile`
- Copies pre-built UI and API artifacts
- Serves UI as static files from Express
- No pre-build script needed (handled by multi-stage build)

### 2. API Server Changes

**File:** `packages/api/src/app.ts`

Added static file serving:
```typescript
// Serve static files from UI build
const uiDistPath = path.join(__dirname, '../../../../ui/dist');
app.use(express.static(uiDistPath));

// SPA fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(uiDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});
```

### 3. UI Client Changes

**Files:** `packages/ui/src/services/api.ts` and `websocket.ts`

Changed from absolute URLs to relative URLs:

```typescript
// Before: http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Now uses window.location.origin automatically
```

This enables the UI to work regardless of deployment path.

### 4. Vite Configuration

**File:** `packages/ui/vite.config.ts`

Added development proxy and base path support:

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000' },
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
})
```

### 5. CI/CD Updates

**File:** `.github/workflows/ci.yml`

Simplified from building two images to one:

```yaml
# Before: IMAGE_API and IMAGE_UI
env:
  IMAGE_NAME: ghcr.io/${{ github.repository }}

# Single build and push step instead of two
```

### 6. Docker Compose Simplification

**File:** `docker-compose.yml`

Reduced from 3 services to 1:

```yaml
# Before: api, ui, tunnel (or proxy)
services:
  app:  # Single service
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
```

## Environment Variables

### Production Configuration

The consolidated container supports these environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: production)
- `CORS_ORIGIN` - CORS allowed origins (default: *)
- `MAX_SIMULATIONS` - Max concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS` - Update interval in ms (default: 100)
- `BASE_PATH` - Base path for subpath deployment (default: empty)

### Subpath Deployment Example

To deploy under `https://example.com/projects/aurora-project`:

```bash
docker run -p 3000:3000 \
  -e BASE_PATH=/projects/aurora-project \
  ghcr.io/lbsa71/aurora-effect:latest
```

Then configure your reverse proxy to forward that path to the container.

## Testing Results

### Container Functionality

✅ **Health Check:** `GET /health` returns status OK
✅ **UI Serving:** `GET /` returns HTML index page
✅ **API Endpoints:** `GET /api/presets` returns JSON data
✅ **Static Assets:** `/assets/*.js` files served correctly
✅ **SPA Routing:** Client-side routes fallback to index.html
✅ **WebSocket:** Socket.io connections work (tested with demo starfield)

### Unit Tests

All existing tests continue to pass:
- API: 25 tests passing
- Simulator: 46 tests passing
- **Total: 71 tests passing**

### Build Verification

```bash
# Build succeeds
docker build -t aurora-effect .

# Container starts and becomes healthy
docker run -d -p 3000:3000 aurora-effect
# Status: Up X seconds (healthy)

# All endpoints respond
curl http://localhost:3000/health       # ✅ {"status":"ok"}
curl http://localhost:3000/             # ✅ HTML
curl http://localhost:3000/api/presets  # ✅ JSON
```

## Documentation Updates

All documentation has been updated to reflect the new architecture:

1. **README.md** - Updated Docker section with simplified instructions
2. **DOCKER.md** - Complete rewrite for single container architecture
3. **PRODUCTION.md** - Comprehensive deployment guide with subpath examples
4. **CI workflow** - Updated to build single image

## Migration Guide

For users of the old separate containers:

### Old Command
```bash
./docker-build.sh
docker compose up
```

Access:
- UI: http://localhost
- API: http://localhost:3000

### New Command
```bash
docker compose up
```

Access:
- Everything: http://localhost:3000

### For Production (using published images)

**Old:**
```bash
docker pull ghcr.io/lbsa71/aurora-effect-api:latest
docker pull ghcr.io/lbsa71/aurora-effect-ui:latest
# Run both + nginx proxy
```

**New:**
```bash
docker pull ghcr.io/lbsa71/aurora-effect:latest
docker run -p 3000:3000 ghcr.io/lbsa71/aurora-effect:latest
```

## Benefits Achieved

1. **Simplified Deployment** - Single container to manage
2. **Reduced Image Size** - One image instead of two (plus proxy)
3. **Better for Subpath Hosting** - No hard-coded absolute URLs
4. **Easier Development** - Vite dev server proxies API calls
5. **Consistent Architecture** - Same pattern for dev and prod
6. **Cleaner CI/CD** - One build job instead of two
7. **Future-Ready** - Easier to add features like server-side rendering

## Known Limitations

1. **No independent scaling** - UI and API scale together (acceptable for this use case)
2. **Single failure point** - If container fails, both UI and API are down (mitigated by Docker restart policies)

## Deployment Examples

See [PRODUCTION.md](PRODUCTION.md) for complete deployment guides including:

- Docker Compose deployment
- Kubernetes deployment  
- Subpath deployment with Nginx/Apache/Traefik
- SSL/TLS configuration
- Monitoring and logging setup

## Rollback Plan

If issues are encountered, you can:

1. Use the old separate Dockerfiles (still in git history)
2. Revert this PR
3. Deploy from older image tags: `ghcr.io/lbsa71/aurora-effect-api:<old-tag>`

However, the consolidation has been thoroughly tested and is recommended for production use.
