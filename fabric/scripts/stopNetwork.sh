#!/bin/bash
# Stop the Blood Bank Fabric Network

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/../network"

echo "Stopping Fabric network..."

cd "$NETWORK_DIR"

docker-compose down --volumes --remove-orphans

# Remove chaincode containers
docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true

# Remove chaincode images
docker rmi -f $(docker images -q "dev-peer*") 2>/dev/null || true

echo "Network stopped."
