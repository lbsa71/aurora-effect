# Multi-stage Dockerfile for Aurora Effect
# Consolidates UI and API into a single container
# Note: API and Simulator packages should be pre-built before building this image
# The UI is built with base / and base path is configured at runtime via BASE_PATH env var

# Stage 1: Build UI (always with base /, runtime base path handled by API)
FROM node:24-alpine AS ui-builder

WORKDIR /app

# Copy workspace files
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/ui/tsconfig*.json ./packages/ui/
COPY packages/ui/vite.config.ts ./packages/ui/
COPY packages/ui/index.html ./packages/ui/
COPY packages/ui/public ./packages/ui/public
COPY packages/ui/src ./packages/ui/src

# Install dependencies
RUN npm ci

# Build UI with base / (no production-specific config baked in)
RUN npm run build --workspace=packages/ui

# Stage 2: Collect UI build
FROM node:24-alpine AS ui-collector

WORKDIR /app

# Copy built UI from builder
COPY --from=ui-builder /app/packages/ui/dist ./packages/ui/dist

# Stage 2: Production runtime
FROM node:24-alpine

WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY packages/simulator/package.json ./packages/simulator/
COPY packages/api/package.json ./packages/api/

# Copy pre-built packages
COPY packages/simulator/dist ./packages/simulator/dist
COPY packages/api/dist ./packages/api/dist

# Copy built UI
COPY --from=ui-collector /app/packages/ui/dist ./packages/ui/dist

# Install production dependencies only (excluding devDependencies)
RUN npm ci --omit=dev

# Ensure simulator dist files are available in node_modules
# npm workspaces creates a symlink, so we just need to copy dist files
RUN if [ -L ./node_modules/@aurora-effect/simulator ]; then \
      rm ./node_modules/@aurora-effect/simulator && \
      mkdir -p ./node_modules/@aurora-effect/simulator; \
    fi && \
    cp -r ./packages/simulator/dist/* ./node_modules/@aurora-effect/simulator/ && \
    if [ ! -f ./node_modules/@aurora-effect/simulator/package.json ]; then \
      cp ./packages/simulator/package.json ./node_modules/@aurora-effect/simulator/; \
    fi

# Set working directory
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', res => { \
    res.on('data', ()=>{}); \
    res.on('end', ()=>process.exit(res.statusCode === 200 ? 0 : 1)); \
  }).on('error', ()=>process.exit(1))"

# Start the server
CMD ["node", "dist/api/src/index.js"]
