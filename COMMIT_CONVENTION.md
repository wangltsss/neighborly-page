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