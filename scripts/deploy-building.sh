#!/bin/bash
# Deploy Building Stack (Buildings table)

set -e
cd "$(dirname "$0")"

./deploy-stack.sh BuildingStack --require-approval never

echo ""
echo "✓ Building stack deployed successfully!"
