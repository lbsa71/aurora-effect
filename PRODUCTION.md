# Production Environment Setup

## Required Environment Variables

Create a `.env.prod` file in the project root with the following variables:

```bash
# Cloudflare Tunnel Configuration
# Get your tunnel token from: https://one.dash.cloudflare.com/
CLOUDFLARE_TUNNEL_TOKEN=your_cloudflare_tunnel_token_here
```

## Usage

1. Copy your Cloudflare tunnel token to the `.env.prod` file
2. Run the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

## Security Notes

- Never commit the `.env.prod` file to version control
- Keep your Cloudflare tunnel token secure
- The token provides access to your Cloudflare account and tunnel configuration
