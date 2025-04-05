#!/bin/bash

set -e

cd "$(dirname "$0")/flynext"

chmod +x start.sh

./start.sh

echo "FlyNext start script executed successfully!"
