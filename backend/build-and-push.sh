#!/bin/bash

set -e

# Get Docker Hub username from argument or use default
DOCKERHUB_USERNAME=${1:-navnitan}
IMAGE_NAME=${2:-petrol_bunk_manager}
TAG=${3:-cali_app}

echo "Building Docker image for linux/amd64 platform..."
docker buildx build --platform linux/amd64 -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG} --push .

echo "Image built and pushed successfully!"
echo "Image: ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"

