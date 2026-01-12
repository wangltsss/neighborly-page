# Git Commit Message Convention

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

Must be one of the following:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or correcting tests
- **chore**: Changes to build process or auxiliary tools

## Scope

The scope specifies the location of the change:

- **infra**: AWS CDK infrastructure code
- **backend**: Java/Lambda backend code
- **client**: React Native frontend code
- **db**: Database schema or migrations
- **api**: GraphQL API schema or resolvers

## Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

## Body (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 72 characters

## Footer (Optional)

- Reference GitHub issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: <description>`

## Examples

### Simple feature

```
feat(infra): add Cognito authentication stack

- User pool with email-based login
- Identity pool for AWS resource access
- MFA support for production
```

### Bug fix

```
fix(api): correct message timestamp format

Changed from ISO string to epoch milliseconds to match
DynamoDB sort key requirements.
```

### Breaking change

```
feat(api): migrate to AppSync v2 schema

BREAKING CHANGE: GraphQL queries now require authentication.
Update client code to include Cognito tokens in all requests.
```

### Documentation

```
docs(infra): add AWS setup guide

Include step-by-step instructions for:
- Creating IAM users
- Configuring AWS CLI
- Deploying to personal account
```

### Multiple files

```
feat(infra): implement core infrastructure stacks

Core components:
- AuthStack: Cognito authentication
- DatabaseStack: DynamoDB tables
- StorageStack: S3 media bucket
- ApiStack: AppSync GraphQL API

All stacks follow single-account-per-developer pattern
for isolated development environments.
```

## Rules

1. **One logical change per commit**
2. **Commits should be atomic** (can be reverted independently)
3. **Subject line is mandatory**
4. **Body and footer are optional** but recommended for complex changes
5. **Test before committing** (`npm run build`, `cdk synth`, etc.)
6. **No merge commits on feature branches** (use rebase)

## Workflow

```bash
# Make changes
# ...

# Stage files
git add <files>

# Commit with proper message
git commit -m "feat(infra): add S3 storage stack"

# If body is needed, use editor
git commit
```

## Verification

Before pushing:

```bash
# Verify commit message format
git log --oneline -1

# Ensure tests pass
npm run build
npm test
```
