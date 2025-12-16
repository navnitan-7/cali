#!/bin/bash

set -e

echo "Building Docker image..."
docker build -t cali-api:latest .

echo "Stopping existing container if running..."
docker stop cali-api || true
docker rm cali-api || true

echo "Starting container..."
docker run -d \
  --name cali-api \
  -p 8000:8000 \
  --env-file .env \
  --restart unless-stopped \
  cali-api:latest

echo "Container started successfully!"
echo "Check logs with: docker logs -f cali-api"
echo "Check status with: docker ps"

