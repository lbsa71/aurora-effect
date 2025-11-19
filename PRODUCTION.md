# Production Environment Setup

## Docker Deployment

Aurora Effect is packaged as a **single consolidated Docker container** that includes both the UI and API. This makes deployment simple and enables hosting under subpaths.

### Quick Start

```bash
# Pull and run the latest image
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=* \
  ghcr.io/lbsa71/aurora-effect:latest
```

Access the application at `http://localhost:3000`

## Environment Variables

### Required Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (default: production)

### Optional Variables

- `CORS_ORIGIN`: CORS allowed origins (default: `*`)
  - For production, set to your domain: `https://example.com`
  - For multiple origins: `https://example.com,https://www.example.com`
- `MAX_SIMULATIONS`: Maximum concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS`: Update interval in milliseconds (default: 100)
- `BASE_PATH`: Base path for subpath deployment (default: empty)
  - Example: `/projects/aurora-project`

### Cloudflare Tunnel (Optional)

If using Cloudflare Tunnel, set:

- `CLOUDFLARE_TUNNEL_TOKEN`: Your Cloudflare tunnel token
  - Get from: https://one.dash.cloudflare.com/

## Deployment Methods

### Method 1: Docker Compose (Recommended)

Create a `.env.prod` file:

```bash
# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
MAX_SIMULATIONS=10
UPDATE_INTERVAL_MS=100

# Optional: Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=your_token_here

# Optional: Subpath deployment
BASE_PATH=/projects/aurora-project
```

Deploy with Docker Compose:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Method 2: Direct Docker Run

```bash
docker run -d \
  --name aurora-effect \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://your-domain.com \
  -e MAX_SIMULATIONS=10 \
  -e UPDATE_INTERVAL_MS=100 \
  --restart unless-stopped \
  ghcr.io/lbsa71/aurora-effect:latest
```

### Method 3: Kubernetes

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aurora-effect
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aurora-effect
  template:
    metadata:
      labels:
        app: aurora-effect
    spec:
      containers:
      - name: aurora-effect
        image: ghcr.io/lbsa71/aurora-effect:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: CORS_ORIGIN
          value: "https://your-domain.com"
        - name: MAX_SIMULATIONS
          value: "10"
        - name: UPDATE_INTERVAL_MS
          value: "100"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 40
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: aurora-effect
spec:
  selector:
    app: aurora-effect
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Subpath Deployment

To deploy under a subpath (e.g., `https://example.com/projects/aurora-project`):

### 1. Set BASE_PATH Environment Variable

```bash
-e BASE_PATH=/projects/aurora-project
```

### 2. Configure Reverse Proxy

#### Nginx

```nginx
location /projects/aurora-project/ {
    # Remove trailing slash and proxy to root
    rewrite ^/projects/aurora-project/(.*) /$1 break;
    
    proxy_pass http://aurora-effect:3000;
    proxy_http_version 1.1;
    
    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Prefix /projects/aurora-project;
}
```

#### Apache

```apache
<Location /projects/aurora-project>
    ProxyPass http://aurora-effect:3000
    ProxyPassReverse http://aurora-effect:3000
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://aurora-effect:3000/$1" [P,L]
    
    # Headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Prefix "/projects/aurora-project"
</Location>
```

#### Traefik

```yaml
http:
  routers:
    aurora-effect:
      rule: "PathPrefix(`/projects/aurora-project`)"
      middlewares:
        - aurora-stripprefix
      service: aurora-effect
      
  middlewares:
    aurora-stripprefix:
      stripPrefix:
        prefixes:
          - "/projects/aurora-project"
          
  services:
    aurora-effect:
      loadBalancer:
        servers:
          - url: "http://aurora-effect:3000"
```

## SSL/TLS Configuration

The container does not include SSL/TLS termination. Use a reverse proxy or load balancer:

### Option 1: Nginx with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Nginx will be auto-configured
```

### Option 2: Cloudflare Tunnel

Cloudflare Tunnel provides automatic HTTPS. See docker-compose.prod.yml for configuration.

### Option 3: Load Balancer

Use your cloud provider's load balancer with SSL termination:
- AWS: Application Load Balancer (ALB) with ACM certificate
- GCP: Google Cloud Load Balancing with SSL certificate
- Azure: Application Gateway with SSL certificate

## Monitoring and Health Checks

### Health Endpoint

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T11:20:00.000Z"
}
```

### Docker Health Check

Built into the container:
```bash
docker inspect aurora-effect | grep Health -A 10
```

### Prometheus Metrics (Future)

_Not yet implemented. Coming in Phase 5._

## Logging

### View Container Logs

```bash
# Follow logs
docker logs -f aurora-effect

# Last 100 lines
docker logs --tail 100 aurora-effect

# With Docker Compose
docker compose logs -f app
```

### Log Aggregation

#### Example: Loki + Promtail + Grafana

```yaml
# docker-compose.logging.yml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service,environment"
        
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

## Scaling

### Horizontal Scaling

The application supports horizontal scaling with some considerations:

1. **WebSocket Sticky Sessions**: Use sticky sessions in your load balancer
2. **Shared State**: Currently, simulation state is in-memory (not shared across instances)
3. **Future**: Redis adapter for Socket.io will enable multi-instance deployments

### Example: Multiple Replicas with Nginx

```nginx
upstream aurora-backend {
    ip_hash;  # Sticky sessions for WebSocket
    server aurora-1:3000;
    server aurora-2:3000;
    server aurora-3:3000;
}

server {
    location / {
        proxy_pass http://aurora-backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Backup and Recovery

### Configuration Backup

Simulation configurations are ephemeral. To persist:

1. Export configurations via API: `GET /api/simulations/:id/config`
2. Store in version control or database
3. Recreate on new instance: `POST /api/simulations`

### Container State

The container is stateless. No backup needed for the container itself.

## Security Notes

1. **Never commit secrets**: Keep `.env.prod` out of version control
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Restrict CORS**: Set `CORS_ORIGIN` to specific domains, not `*`
4. **Keep updated**: Regularly pull latest images for security patches
5. **Resource limits**: Set CPU and memory limits to prevent resource exhaustion
6. **Network isolation**: Use Docker networks or Kubernetes network policies

### Example .gitignore

```
.env.prod
.cloudflared/
*.pem
*.key
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker logs aurora-effect`
2. Verify environment variables: `docker inspect aurora-effect`
3. Check port availability: `netstat -tulpn | grep 3000`
4. Test health: `curl http://localhost:3000/health`

### WebSocket Connection Issues

1. Verify WebSocket proxy configuration
2. Check `Upgrade` and `Connection` headers
3. Ensure no intermediate proxies are stripping WebSocket headers
4. Test with: `wscat -c ws://localhost:3000/socket.io/`

### Performance Issues

1. Check resource usage: `docker stats aurora-effect`
2. Review simulation limits: `MAX_SIMULATIONS` and `UPDATE_INTERVAL_MS`
3. Monitor memory: Simulations with many systems use more RAM
4. Scale horizontally if needed (with sticky sessions)

## Support

- **Issues**: [GitHub Issues](https://github.com/lbsa71/aurora-effect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lbsa71/aurora-effect/discussions)
- **Documentation**: [README.md](README.md), [DOCKER.md](DOCKER.md)
