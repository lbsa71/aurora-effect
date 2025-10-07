# Production runtime image
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies manually to avoid workspace issues
RUN npm install --no-save express@^4.18.2 socket.io@^4.6.1 cors@^2.8.5 zod@^3.22.4 uuid@^9.0.1

# Copy pre-built dist folders (build should be done before Docker build)
COPY packages/simulator/dist ./packages/simulator/dist
COPY packages/api/dist ./packages/api/dist

# Copy package.json files for metadata
COPY packages/simulator/package.json ./packages/simulator/
COPY packages/api/package.json ./packages/api/

# Set working directory to API
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server (using the actual built structure)
CMD ["node", "dist/api/src/index.js"]
