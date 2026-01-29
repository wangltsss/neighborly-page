#!/bin/bash
# deploy-dev.sh
# Usage: ./scripts/deploy-dev.sh <StackSuffix> [options]

set -e
if [ -z "$1" ]; then
    echo "Usage: $0 <StackSuffix>"
    exit 1
fi
STACK_SUFFIX=$1
shift

cd "$(dirname "$0")/../infra"

# Read Config
DEV_NAME=$(grep "^DEVELOPER_NAME=" .env 2>/dev/null | cut -d= -f2-)
RES_PREFIX=$(grep "^RESOURCE_PREFIX=" .env 2>/dev/null | cut -d= -f2-)

if [ -z "$DEV_NAME" ] || [ -z "$RES_PREFIX" ]; then
    echo "Error: DEVELOPER_NAME or RESOURCE_PREFIX missing in .env"
    echo "Run setup-dev.sh first."
    exit 1
fi

# Logic: {DeveloperName}-{ResourcePrefix}-{StackSuffix}
STACK_NAME="${DEV_NAME}-${RES_PREFIX}-${STACK_SUFFIX}"

echo "Deploying DEV Stack: ${STACK_NAME}"
cdk deploy "${STACK_NAME}" "$@"
