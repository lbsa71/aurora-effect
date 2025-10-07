# Production runtime image  
FROM node:18-alpine

WORKDIR /app

# Copy workspace package.json files for module resolution
COPY package.json ./
COPY packages/simulator/package.json ./packages/simulator/
COPY packages/api/package.json ./packages/api/

# Copy pre-built code and dependencies (run ./docker-build.sh before docker build)
COPY packages/simulator/dist ./packages/simulator/dist
COPY packages/api/dist ./packages/api/dist
COPY node_modules ./node_modules

# Set working directory
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/api/src/index.js"]
