#!/bin/bash
# deploy-messaging-prod.sh
# Deploys Messaging Stack for Production

set -e
cd "$(dirname "$0")"

echo "→ Deploying Messaging Stack (PROD)..."
./deploy-prod.sh MessagingStack "$@"
