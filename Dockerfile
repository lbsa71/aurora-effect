# Multi-stage Dockerfile for Aurora Effect
# Consolidates UI and API into a single container
# Note: Run 'npm install' and 'npm run build' before building this Docker image

# Stage 1: Collect UI build
FROM node:20-alpine AS ui-collector

WORKDIR /app

# Copy pre-built UI
COPY packages/ui/dist ./packages/ui/dist

# Stage 2: Production runtime
FROM node:20-alpine

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

# Copy production node_modules (from build context)
COPY node_modules ./node_modules

# Create a proper package for the simulator in node_modules if not exists
RUN if [ ! -d "./node_modules/@aurora-effect/simulator" ]; then \
      mkdir -p ./node_modules/@aurora-effect/simulator && \
      cp -r ./packages/simulator/dist/* ./node_modules/@aurora-effect/simulator/ && \
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
