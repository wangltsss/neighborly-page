#!/bin/bash
# deploy-auth-dev.sh
# Deploys Auth Stack for Development

set -e
cd "$(dirname "$0")"

echo "→ Deploying Auth Stack (DEV)..."
./deploy-dev.sh AuthStack "$@"
