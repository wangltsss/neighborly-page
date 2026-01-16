#!/bin/bash
# Deploy all Neighborly stacks in correct order

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "Deploying all Neighborly stacks..."
echo "=========================================="
echo ""

# Deploy Auth stack first (contains API + S3)
echo "→ Deploying Auth stack..."
./deploy-stack.sh AuthStack --require-approval never
echo ""

# Deploy data stacks (can be parallel but we do sequential for simplicity)
echo "→ Deploying Messaging stack..."
./deploy-stack.sh MessagingStack --require-approval never
echo ""

echo "→ Deploying Building stack..."
./deploy-stack.sh BuildingStack --require-approval never
echo ""

echo "=========================================="
echo "✓ All stacks deployed successfully!"
echo "=========================================="
