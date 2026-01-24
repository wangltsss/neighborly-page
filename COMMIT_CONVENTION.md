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

## Rename Branches

- **wip/**: Work in progress
- **draft/**: Draft branch
- **feat/**: Feature branch (merged to main)
- **fix/**: Fix branch (merged to main)
- **refactor/**: Refactor branch (merged to main)

### Rename Instructions

If you want to rename a branch, then you should run the following commands:

- Prerequisite: execute `git checkout <branch-name>` to switch to the branch that you want to rename, for example `draft/feature1`

```bash
# Rename local branch
git branch -m <new-branch-name>

# Push new branch to remote
git push -u origin <new-branch-name>

# Delete old branch from remote
git push origin --delete <old-branch-name>

# set upstream branch
git branch --set-upstream origin <new-branch-name>
```

OR, if you are not on the current branch that you want to rename, you can use the following commands:

```bash
git branch -m <old-branch-name> <new-branch-name>
git push -u origin <new-branch-name>
git push origin --delete <old-branch-name>
git branch --set-upstream origin <new-branch-name>
```
