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

# Create a proper package for the simulator in node_modules
RUN mkdir -p ./node_modules/@aurora-effect/simulator && \
    cp -r ./packages/simulator/dist/* ./node_modules/@aurora-effect/simulator/ && \
    cp ./packages/simulator/package.json ./node_modules/@aurora-effect/simulator/

# Set working directory
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', res => { \
    res.on('data', ()=>{}); \
    res.on('end', ()=>process.exit(res.statusCode === 200 ? 0 : 1)); \
  }).on('error', ()=>process.exit(1))"

# Start the runtime server
CMD ["node", "dist/api/src/index.js"]
