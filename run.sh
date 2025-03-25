#!/bin/bash

set -e

cd "$(dirname "$0")/flynext"

chmod +x run.sh

./run.sh

echo "FlyNext run script executed successfully!"
