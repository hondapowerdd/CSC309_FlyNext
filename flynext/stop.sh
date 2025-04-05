#!/bin/bash

# Check if the container exists
if [ "$(docker ps -aq -f name=nextjs-app)" ]; then
    echo "Stopping container..."
    docker stop nextjs-app

    echo "Removing container..."
    docker rm nextjs-app
else
    echo "No container named 'nextjs-app' is running."
fi

# Optional: Remove image (uncomment if needed)
# echo "Removing image..."
# docker rmi flynext-web
