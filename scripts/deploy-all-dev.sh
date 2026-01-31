#!/bin/bash
# deploy-all-dev.sh
# Deploys ALL stacks for Development in order

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "DEPLOYING ALL STACKS (DEV MODE)"
echo "=========================================="

./deploy-auth-dev.sh --require-approval never
echo ""
./deploy-messaging-dev.sh --require-approval never
echo ""
./deploy-building-dev.sh --require-approval never

echo ""
echo "All DEV stacks deployed successfully!"
