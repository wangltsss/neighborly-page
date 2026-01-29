# Seed Script Usage

## Quick Start

```bash
cd infra
npm run seed:clear    # Recommended: clears old data first
```

## What Gets Created

- **3 Users** (Cognito + DynamoDB)
  - test-user-1@neighborly.local (Alice)
  - test-user-2@neighborly.local (Bob)
  - test-user-3@neighborly.local (Charlie)
  - Password for all: `Password123!`

- **3 Buildings** (Waterloo area)
  - Waterloo Central Tower (200 University Ave W)
  - Regina Plaza (100 Regina St S)
  - King Street Residences (75 King St S)

- **9 Channels** (3 per building)
  - General, Maintenance, Events

- **~33 Messages** (3-5 per channel)
  - Random users, realistic content

## Available Commands

```bash
# Create complete dataset (clear + create)
npm run seed:clear

# Add data without clearing
npm run seed

# Show detailed logs
npm run seed -- --verbose

# Clear and verbose
npm run seed -- --clear --verbose
```

## Frontend Testing

### Search Page

Search for "Waterloo" to find all 3 buildings

### Chat Page

1. Select any building
2. Browse 3 channels
3. View messages with user info

### Home Page

Users are associated with 1-2 random buildings

## Requirements

- AWS credentials configured
- Stacks deployed (Auth, Building, Messaging)
- `.env` file with `USER_POOL_ID=<Your User pool ID>`

## Troubleshooting

**Error: USER_POOL_ID not found**

- Add to `infra/.env`: `USER_POOL_ID=<Your User pool ID>`

**Permission errors**

- Ensure AWS credentials have Cognito and DynamoDB permissions
