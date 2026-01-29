#!/bin/bash
# deploy-building-prod.sh
# Deploys Building Stack for Production

set -e
cd "$(dirname "$0")"

echo "→ Deploying Building Stack (PROD)..."
./deploy-prod.sh BuildingStack "$@"
