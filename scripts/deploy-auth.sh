#!/bin/bash
# Deploy Auth Stack (Cognito + Users table + AppSync API + S3)

set -e
cd "$(dirname "$0")"

./deploy-stack.sh AuthStack --require-approval never

echo ""
echo "✓ Auth stack deployed successfully!"
