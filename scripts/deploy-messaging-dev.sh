#!/bin/bash
# deploy-messaging-dev.sh
# Deploys Messaging Stack for Development

set -e
cd "$(dirname "$0")"

echo "→ Deploying Messaging Stack (DEV)..."
./deploy-dev.sh MessagingStack "$@"
