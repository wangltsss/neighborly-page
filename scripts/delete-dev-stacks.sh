#!/bin/bash
# delete-dev-stacks.sh

set -e
cd "$(dirname "$0")/../infra"

DEV_NAME=$(grep "^DEVELOPER_NAME=" .env 2>/dev/null | cut -d= -f2-)
RES_PREFIX=$(grep "^RESOURCE_PREFIX=" .env 2>/dev/null | cut -d= -f2-)

if [ -z "$DEV_NAME" ] || [ -z "$RES_PREFIX" ]; then
    echo "Error: Missing config in .env. Run setup-dev.sh first."
    exit 1
fi

PREFIX="${DEV_NAME}-${RES_PREFIX}-"

echo "=========================================="
echo "DELETE DEV STACKS"
echo "=========================================="
echo "Prefix: ${PREFIX}"
echo "Stacks:"
echo "  - ${PREFIX}AuthStack"
echo "  - ${PREFIX}MessagingStack"
echo "  - ${PREFIX}BuildingStack"
echo ""

read -p "Type 'delete' to confirm: " CONFIRM
if [ "$CONFIRM" != "delete" ]; then echo "Cancelled."; exit 0; fi

cdk destroy "${PREFIX}AuthStack" --force 2>/dev/null || echo "AuthStack not found"
cdk destroy "${PREFIX}MessagingStack" --force 2>/dev/null || echo "MessagingStack not found"
cdk destroy "${PREFIX}BuildingStack" --force 2>/dev/null || echo "BuildingStack not found"
echo "Done."
