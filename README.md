# Neighborly Monorepo

A community-building platform for apartment residents to connect and communicate.

## Project Structure

```
Neighborly/
├── infra/              # AWS CDK infrastructure (TypeScript)
│   ├── bin/            # CDK app entry point
│   ├── lib/            # Stack and construct definitions
│   │   ├── auth/       # Authentication stack (Cognito + Users)
│   │   ├── messaging/  # Messaging stack (Messages + Channels)
│   │   ├── building/   # Building stack (Buildings table)
│   │   └── graphql/    # GraphQL schema
│   └── scripts/        # Deployment scripts
├── backend/            # Lambda functions (Java 17) - TODO
├── client/             # React frontend - TODO
└── .context/           # Design documents
```

## Infrastructure Architecture

**Feature-Based CDK Stacks:**

- **AuthStack** - Cognito User Pool + Users DynamoDB table + AppSync API + S3 bucket
- **MessagingStack** - Messages and Channels DynamoDB tables
- **BuildingStack** - Buildings DynamoDB table

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS Account with CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`

### Initial Setup

1. **Configure environment:**

   ```bash
   cd infra
   cp .env.template .env
   # Edit .env with your AWS credentials
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Bootstrap CDK (one-time):**

   ```bash
   cdk bootstrap aws://YOUR-ACCOUNT-ID/us-east-1
   ```

4. **Deploy infrastructure:**
   ```bash
   cd ../scripts
   ./deploy-all.sh
   ```

## Documentation

- **[Infrastructure User Manual](infra/USER_MANUAL.md)** - Detailed AWS/CDK setup guide
- **[Design Document](.context/ECE651 - Neighborly.md)** - Technical architecture and specifications
- **[Commit Convention](COMMIT_CONVENTION.md)** - Git commit guidelines

## Development

### Build Infrastructure

```bash
cd infra
npm run build     # Compile TypeScript
cdk synth         # Generate CloudFormation templates
cdk diff          # Preview changes
```

### Deploy

```bash
cd scripts
./deploy-all.sh              # Deploy all stacks
./deploy-auth.sh             # Deploy auth only
./deploy-messaging.sh        # Deploy messaging only
./deploy-building.sh         # Deploy building only
```

### Clean Up

```bash
cd infra
cdk destroy --all
```

## Cost

All services are within AWS Free Tier limits:

- AppSync: 250k requests/month
- DynamoDB: 25 GB storage
- S3: 5 GB storage
- Lambda: 1M requests/month
- Cognito: 50k MAU

**Expected development cost: $0/month**

## Tech Stack

- **Infrastructure**: AWS CDK (TypeScript)
- **API**: AWS AppSync (GraphQL)
- **Database**: DynamoDB
- **Authentication**: Cognito
- **Storage**: S3
- **Backend**: AWS Lambda (Java 17) - Planned
- **Frontend**: React - Planned

## Contributing

1. Create feature branch from `main`
2. Follow commit conventions in `COMMIT_CONVENTION.md`
3. Update documentation for infrastructure changes
4. Ensure `npm run build` and `cdk synth` pass
5. Deploy infrastructure changes
6. Write tests (unit tests + end-to-end tests)
7. Push feature branch to GitHub
8. Create Pull Request
