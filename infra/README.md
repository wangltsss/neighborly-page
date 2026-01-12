# Neighborly Infrastructure

AWS CDK infrastructure for the Neighborly community platform.

## Overview

This package contains AWS infrastructure-as-code using AWS CDK (TypeScript) to provision:

- AWS AppSync GraphQL API
- DynamoDB tables for data storage
- S3 buckets for media storage
- Lambda functions for business logic
- Cognito for authentication

## Dependencies

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **AWS CDK**: 2.116.0
- **TypeScript**: 5.3.3

## Installation

```bash
npm install
```

## Configuration

Copy the environment template and fill in your AWS credentials:

```bash
cp .env.template .env
```

Edit `.env` with your AWS Account ID (find it in your AWS Console):

```bash
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
RESOURCE_PREFIX=neighborly
DEVELOPER_NAME=your-name
```

## Build

Compile TypeScript:

```bash
npm run build
```

Watch mode for development:

```bash
npm run watch
```

## Deployment

Synthesize CloudFormation templates (dry run):

```bash
npm run synth
```

Deploy to AWS:

```bash
npm run deploy
```

Show what will change:

```bash
npm run diff
```

Destroy all resources:

```bash
npm run destroy
```

## Project Structure

```
infra/
├── bin/
│   └── neighborly.ts       # CDK app entry point
├── lib/
│   └── config.ts           # Configuration management
├── .env.template           # Environment variable template
├── cdk.json                # CDK configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Next Steps

See `USER_MANUAL.md` for development workflows and best practices.
