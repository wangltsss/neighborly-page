# Backend

Lambda functions for Neighborly API.

## Technology Stack

- Runtime: Java 17
- Build: Gradle (Kotlin DSL)
- Deployment: AWS Lambda via CDK

## Structure

```
backend/
├── user-handler/        # User profile Lambda functions
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/
│       ├── main/java/com/neighborly/
│       │   ├── handlers/
│       │   │   ├── GetUserHandler.java
│       │   │   └── UpdateUserHandler.java
│       │   └── models/
│       │       ├── User.java
│       │       └── AppSyncEvent.java
│       └── test/java/com/neighborly/handlers/
│           └── UpdateUserHandlerTest.java
├── message-handler/     # (Future) Messaging Lambda functions
├── building-handler/    # (Future) Building management functions
└── README.md
```

## Current Handlers

### user-handler

Handles user profile operations:

| Handler | GraphQL Operation | Description |
|---------|------------------|-------------|
| `GetUserHandler` | `Query.getUser` | Fetch user profile by ID |
| `UpdateUserHandler` | `Mutation.updateUser` | Update user's username |

## Development

### Prerequisites

- Java 17 (OpenJDK or Oracle)
- Gradle 8.5+ (wrapper included)

### Build

```bash
cd backend/user-handler

# Build JAR
./gradlew shadowJar

# Run tests
./gradlew test

# Output: build/libs/user-handler.jar
```

### Deploy

After building, deploy via CDK:

```bash
cd infra
npx cdk deploy shawn-AuthStack
```

## Adding New Handlers

1. Create new directory: `backend/<domain>-handler/`
2. Copy `build.gradle.kts` and `settings.gradle.kts` from `user-handler`
3. Implement handler extending `RequestHandler<AppSyncEvent, T>`
4. Create CDK construct in `infra/lib/<domain>/`
5. Add Lambda data source and resolver in `neighborly.ts`

See [TODO.md](TODO.md) for planned features.
