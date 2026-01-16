#!/bin/bash
# Deploy Messaging Stack (Messages + Channels tables)

set -e
cd "$(dirname "$0")"

./deploy-stack.sh MessagingStack --require-approval never

echo ""
echo "✓ Messaging stack deployed successfully!"
