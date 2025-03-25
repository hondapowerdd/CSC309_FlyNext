#!/bin/bash

set -e

cd "$(dirname "$0")/flynext"

chmod +x startup.sh
./startup.sh

echo "FlyNext startup script executed successfully!"
