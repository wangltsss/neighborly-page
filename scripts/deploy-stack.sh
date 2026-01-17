#!/bin/bash
# Generic script to deploy a single CDK stack
# Usage: ./scripts/deploy-stack.sh <stack-suffix> [cdk-options]
# Example: ./scripts/deploy-stack.sh AuthStack --require-approval never

set -e

# Check if stack suffix is provided
if [ -z "$1" ]; then
    echo "Error: Stack suffix required"
    echo "Usage: $0 <stack-suffix> [cdk-options]"
    echo "Example: $0 AuthStack --require-approval never"
    exit 1
fi

STACK_SUFFIX=$1
shift  # Remove first argument, remaining args are CDK options

# Change to infra directory
cd "$(dirname "$0")/../infra"

# Read developer name from .env
DEVELOPER_NAME=$(grep DEVELOPER_NAME .env | cut -d'=' -f2)

if [ -z "$DEVELOPER_NAME" ]; then
    echo "Error: DEVELOPER_NAME not found in .env"
    exit 1
fi

STACK_NAME="${DEVELOPER_NAME}-${STACK_SUFFIX}"

echo "Deploying ${STACK_NAME}..."
cdk deploy "${STACK_NAME}" "$@"
