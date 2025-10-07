#!/bin/sh
# Build script for Docker - builds the application before Docker build

set -e

echo "Building Aurora Effect for Docker..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build packages
echo "Building packages..."
npm run build

echo "Build complete! Now run: docker-compose build"
