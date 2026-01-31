#!/bin/bash
# deploy-auth-prod.sh
# Deploys Auth Stack for Production

set -e
cd "$(dirname "$0")"

echo "→ Deploying Auth Stack (PROD)..."
./deploy-prod.sh AuthStack "$@"
