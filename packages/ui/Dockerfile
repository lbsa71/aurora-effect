# Production stage - Serve with nginx
FROM nginx:alpine

# Copy pre-built files (run npm run build --workspace=packages/ui before docker build)
COPY packages/ui/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
