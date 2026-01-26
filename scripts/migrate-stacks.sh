#!/bin/bash
# Quick migration script: Delete old stacks and deploy new ones
# USE WITH CAUTION: This will delete existing AWS resources!

set -e

echo "=========================================="
echo "Neighborly Stack Deletion"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Delete old stacks (ApiAuthStackStack, AuthStack, AuthStack)"
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
echo "Destroying old stacks..."
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
echo "→ Destroying ${DEVELOPER_NAME}-AuthStack..."
cdk destroy "${DEVELOPER_NAME}-AuthStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo "→ Destroying ${DEVELOPER_NAME}-MessagingStack..."
cdk destroy "${DEVELOPER_NAME}-MessagingStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo "→ Destroying ${DEVELOPER_NAME}-BuildingStack..."
cdk destroy "${DEVELOPER_NAME}-BuildingStack" --force 2>/dev/null || echo "  (not found or already deleted)"

echo ""
echo "✓ Old stacks destroyed"