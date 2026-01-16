#!/bin/bash
# Quick migration script: Delete old stacks and deploy new ones
# USE WITH CAUTION: This will delete existing AWS resources!

set -e

echo "=========================================="
echo "Neighborly Stack Migration"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Delete old stacks (ApiStack, StorageStack, DatabaseStack)"
echo "  2. Deploy new stacks (AuthStack, MessagingStack, BuildingStack)"
echo ""
echo "⚠️  WARNING: This will DELETE existing AWS resources!"
echo ""

# Confirm operation
read -p "Continue? (type 'yes' to proceed): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

cd "$(dirname "$0")/../infra"

echo ""
echo "=========================================="
echo "Step 1: Destroying old stacks..."
echo "=========================================="

# Get developer name
DEVELOPER_NAME=$(grep DEVELOPER_NAME .env | cut -d'=' -f2)

if [ -z "$DEVELOPER_NAME" ]; then
    echo "Error: DEVELOPER_NAME not found in .env"
    exit 1
fi

echo "Developer: $DEVELOPER_NAME"
echo ""

# Destroy in reverse dependency order
echo "→ Destroying ${DEVELOPER_NAME}-ApiStack..."
cdk destroy "${DEVELOPER_NAME}-ApiStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo "→ Destroying ${DEVELOPER_NAME}-StorageStack..."
cdk destroy "${DEVELOPER_NAME}-StorageStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo "→ Destroying ${DEVELOPER_NAME}-DatabaseStack..."
cdk destroy "${DEVELOPER_NAME}-DatabaseStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo ""
echo "✓ Old stacks destroyed"

# echo ""
# echo "=========================================="
# echo "Step 2: Building new infrastructure..."
# echo "=========================================="
# npm run build

# echo ""
# echo "=========================================="
# echo "Step 3: Deploying new stacks..."
# echo "=========================================="

# cd ../scripts
# ./deploy-all.sh

# echo ""
# echo "=========================================="
# echo "✅ Migration Complete!"
# echo "=========================================="
# echo ""
# echo "New stacks deployed:"
# echo "  - ${DEVELOPER_NAME}-AuthStack (Cognito + Users + API + S3)"
# echo "  - ${DEVELOPER_NAME}-MessagingStack (Messages + Channels)"
# echo "  - ${DEVELOPER_NAME}-BuildingStack (Buildings)"
# echo ""
# echo "Verify deployment:"
# echo "  cd infra && cdk list"
