#!/bin/bash
# deploy-building-dev.sh
# Deploys Building Stack for Development

set -e
cd "$(dirname "$0")"

echo "→ Deploying Building Stack (DEV)..."
./deploy-dev.sh BuildingStack "$@"
