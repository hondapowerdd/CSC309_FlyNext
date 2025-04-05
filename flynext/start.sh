#!/bin/bash

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=nextjs-app)" ]; then
    echo "Stopping and removing existing container..."
    docker rm -f nextjs-app
fi

# Build Docker image
echo "Building Docker image..."
docker build -t flynext-web .

# Run the container on port 3000
echo "Starting container on port 3000..."
docker run -d -p 3000:3000 --name nextjs-app --env-file .env flynext-web

# Show status
echo "Container started. Use 'docker ps' to check."
