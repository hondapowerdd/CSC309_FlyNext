#!/bin/bash

set -e

cd "$(dirname "$0")/flynext"

chmod +x stop.sh

./stop.sh

echo "FlyNext stop script executed successfully!"
