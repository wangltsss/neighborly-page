# Neighborly Infrastructure User Manual

## Development Philosophy

### Documentation-Driven Development

This project follows documentation-driven development (DDD):

1. **Write documentation first**: If using AI to implement features, first document the architecture and API contracts
2. **Documentation as specification**: Documentation serves as the guidelines for AI. Humans ensures the AI output aligns with the demand with their judgement.
3. **Keep docs synchronized**: When documentation/code changes, update the other accordingly.
4. **Review documentation**: PRs must include documentation updates for new features

Best practices:

- Refer to `.context/ECE651 - Neighborly.md` for technical design decisions. However, they are not rigid. Use your judgement to make changes.
- Define API schemas before implementation
- Update architecture diagrams when infrastructure changes
- Document configuration options

### Code Standards

- **TypeScript strict mode**: All code must pass strict type checking
- **No magic values**: Use environment variables for environment-specific values, and never upload sensitive information to version control.
- **Explicit error handling**: Validate inputs and provide clear error messages
- **Comments for context**: Explain why, not what (code should be self-documenting)

## AWS Initial Setup

### 1. Create AWS Account

If you don't have an AWS account:

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow signup process (requires credit card, but won't charge for free tier usage)
4. Complete email verification

### 2. Create IAM User (Do NOT use root account)

Root account has unlimited permissions. Create an IAM user for development:

1. Log in to AWS Console with root account: https://console.aws.amazon.com/
2. Search for "IAM" in top search bar, click IAM service
3. Left menu: Click **Users** → **Create user**
4. User name: `your-name-dev` (e.g., `jiahao-dev`)
5. Check **"Provide user access to the AWS Management Console"**
6. Select **"I want to create an IAM user"**
7. Set password (custom or auto-generated)
8. Uncheck "Users must create a new password at next sign-in" (optional)
9. Click **Next**

### 3. Attach Permissions to IAM User

1. Select **"Attach policies directly"**
2. Search and check **`AdministratorAccess`**
3. Click **Next** → **Create user**

### 4. Create Access Keys for CLI

1. In Users list, click your newly created user
2. Select **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select use case: **"Command Line Interface (CLI)"**
6. Check confirmation box at bottom
7. Click **Next** → **Create access key**
8. **IMPORTANT**: Copy both values immediately:
   - Access Key ID
   - Secret Access Key (shown only once)
9. Click **Download .csv file** to save credentials

### 5. Get Your AWS Account ID

In AWS Console, click your username in top-right corner. Your 12-digit Account ID is displayed.

Example: `123456789012`

### 6. Install AWS CLI

```bash
# macOS
brew install awscli

# Verify installation
aws --version
```

### 7. Configure AWS CLI

```bash
aws configure
```

Enter values when prompted:

```
AWS Access Key ID [None]: <paste your Access Key ID>
AWS Secret Access Key [None]: <paste your Secret Access Key>
Default region name [None]: us-east-1
Default output format [None]: <press Enter>
```

### 8. Verify AWS Configuration

```bash
aws sts get-caller-identity
```

Output should show your IAM user (not root):

```json
{
  "UserId": "AIDAXXXXXXXXX",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/<your-user-name>"
}
```

### 9. (Optional) Secure Root Account

After creating IAM user, secure your root account:

1. AWS Console → Top-right username → Security credentials
2. Under **Multi-factor authentication (MFA)**, click **Activate MFA**
3. Select **Virtual MFA device** (use Google Authenticator or Authy)
4. Follow setup instructions

## CDK Setup

### 1. Install Project Dependencies

```bash
cd infra
npm install
```

### 2. Install CDK CLI Globally

```bash
npm install -g aws-cdk

# Verify
cdk --version
```

### 3. Configure Environment Variables

```bash
cd infra
cp .env.template .env
```

Edit `.env` with your values:

```bash
AWS_ACCOUNT_ID=123456789012  # Your 12-digit Account ID
AWS_REGION=us-east-1
RESOURCE_PREFIX=
DEVELOPER_NAME=<your-name>
```

**DO NOT commit `.env` to version control** (already in .gitignore).

### 4. Verify Configuration

```bash
npm run build
cdk synth
```

## Build

### Compile TypeScript

```bash
npm run build
```

### Validate CDK Code

```bash
cdk synth
```

Generates CloudFormation templates in `cdk.out/` directory (local only, no AWS deployment).

### Check What Will Change

```bash
cdk diff
```

Shows changes before deploying.

## Deployment

### 1. Per-Developer Isolation

Each developer deploys to their own AWS account:

- Complete resource isolation
- Individual cost tracking
- No naming conflicts
- Free tier benefits per account

### 2. Bootstrap CDK (One-Time only)

Before first deployment, bootstrap your AWS account:

```bash
cdk bootstrap aws://YOUR-ACCOUNT-ID/<your-region>
```

This creates:

- S3 bucket for CDK assets
- IAM roles for CloudFormation
- Only needs to run once per account/region

### 3. Deploy Infrastructure

```bash
cdk deploy --all
```

CDK will:

1. Show summary of changes
2. Ask for confirmation (type `y`)
3. Create resources in AWS
4. Display outputs (API endpoints, etc.)

First deployment takes 5-10 minutes.

### 4. Update Infrastructure

After modifying CDK code:

```bash
npm run build
cdk diff        # Review changes
cdk deploy --all
```

## AWS CLI Reference

### Identity and Credentials

Check AWS CLI version:

```bash
aws --version
```

Configure AWS credentials:

```bash
aws configure
```

Get current identity and account information:

```bash
aws sts get-caller-identity
```

Get account ID only:

```bash
aws sts get-caller-identity --query Account --output text
```

### IAM Operations

List access keys for a user:

```bash
aws iam list-access-keys --user-name <username>
```

Create new access key:

```bash
aws iam create-access-key --user-name <username>
```

Delete access key:

```bash
aws iam delete-access-key --user-name <username> --access-key-id <KEY-ID>
```

### CloudFormation Operations

Check if CDK is bootstrapped:

```bash
aws cloudformation describe-stacks --stack-name CDKToolkit
```

List all CloudFormation stacks:

```bash
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

Describe a specific stack:

```bash
aws cloudformation describe-stacks --stack-name <stack-name>
```

### Resource Cleanup

Delete all objects in S3 bucket (required before destroying stack with S3):

```bash
aws s3 rm s3://<bucket-name> --recursive
```

Destroy CDK stack:

```bash
cdk destroy --all
```

## Configuration Reference

### Environment Variables (.env)

| Variable          | Required | Description                                     |
| ----------------- | -------- | ----------------------------------------------- |
| `AWS_ACCOUNT_ID`  | Yes      | Your 12-digit AWS Account ID                    |
| `AWS_REGION`      | Yes      | AWS region (e.g., us-east-1)                    |
| `RESOURCE_PREFIX` | No       | Prefix for resource names (default: neighborly) |
| `DEVELOPER_NAME`  | No       | Your identifier for tagging                     |

### CDK Commands

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `cdk synth`         | Generate CloudFormation templates (local only) |
| `cdk diff`          | Show what will change on next deploy           |
| `cdk deploy --all`  | Deploy all stacks to AWS                       |
| `cdk destroy --all` | Remove all AWS resources                       |
| `cdk bootstrap`     | One-time CDK setup in AWS account              |

## Cost Management

All services covered by AWS Free Tier:

- AppSync: 250k requests/month
- DynamoDB: 25 GB storage + 25 WCU/RCU
- S3: 5 GB storage + 20k GET requests
- Lambda: 1M requests/month + 400k GB-seconds
- Cognito: 50k MAU

Expected development cost: **$0/month**

Monitor usage:

- AWS Console → Billing Dashboard → Free Tier
- Set billing alerts for $1, $5, $10

Clean up when not developing:

```bash
cdk destroy --all
```

## Security Best Practices

1. **Never use root account** for daily operations
2. **Enable MFA** on root account
3. **Use IAM user** with AdministratorAccess for development
4. **Never commit** `.env` or credentials to version control
5. **Rotate Access Keys** every 90 days
6. **Monitor IAM usage** in Security credentials tab

## Additional Resources

- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/
- Technical Design: `.context/ECE651 - Neighborly.md`
- Project README: `../README.md`
