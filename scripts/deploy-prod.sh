#!/bin/bash
# deploy-prod.sh
# Usage: ./scripts/deploy-prod.sh <StackSuffix> [options]

set -e
if [ -z "$1" ]; then
    echo "Usage: $0 <StackSuffix>"
    exit 1
fi
STACK_SUFFIX=$1
shift

cd "$(dirname "$0")/../infra"

# Read Config
RES_PREFIX=$(grep "^RESOURCE_PREFIX=" .env 2>/dev/null | cut -d= -f2-)

if [ -z "$RES_PREFIX" ]; then
    echo "Error: RESOURCE_PREFIX missing in .env"
    echo "Run setup-prod.sh first."
    exit 1
fi

# Logic: {ResourcePrefix}-{StackSuffix}
STACK_NAME="${RES_PREFIX}-${STACK_SUFFIX}"

echo "Deploying PROD Stack: ${STACK_NAME}"
cdk deploy "${STACK_NAME}" "$@"
