# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY packages/ui/package*.json ./packages/ui/

# Install dependencies
RUN npm ci --workspace=packages/ui

# Copy source code
COPY packages/ui ./packages/ui

# Build the application
WORKDIR /app/packages/ui
RUN npm run build

# Production stage - Serve with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/packages/ui/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
