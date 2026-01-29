#!/bin/bash
# deploy-all-prod.sh
# Deploys ALL stacks for Production in order

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "DEPLOYING ALL STACKS (PROD MODE)"
echo "=========================================="

./deploy-auth-prod.sh --require-approval never
echo ""
./deploy-messaging-prod.sh --require-approval never
echo ""
./deploy-building-prod.sh --require-approval never

echo ""
echo "All PROD stacks deployed successfully!"
