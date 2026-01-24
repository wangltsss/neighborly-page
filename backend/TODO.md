# Backend Lambda Functions - Implementation Plan

## Current Status: NOT YET NEEDED ✅

**Architecture**: AppSync + VTL handles all operations
**Cost**: $0/month (no Lambda yet)
**Performance**: Excellent (no cold starts)

---

## 🎯 When Lambda is Required

### Priority 1: Media Upload 🔴 MUST HAVE

**Trigger**: User requests image/file upload in chat
**Why Lambda**: VTL cannot generate S3 pre-signed URLs (requires cryptographic signing)
**Estimated Time**: 4 hours

**Implementation**:

```bash
# 1. Initialize Gradle project
cd backend/message-handler
gradle init --type java-application

# 2. Configure build.gradle
# See setup instructions below

# 3. Implement MediaUploadHandler.java
# 4. Update CDK to deploy Lambda
# 5. Deploy
```

**GraphQL Schema**:

```graphql
type Mutation {
  generateUploadUrl(fileType: String!): UploadUrl! @aws_cognito_user_pools
}

type UploadUrl {
  uploadUrl: String!
  key: String!
  expiresAt: AWSDateTime!
}
```

---

### Priority 2: Security Hardening ⚠️ RECOMMENDED

**Trigger**: Before production launch
**Why Lambda**: Complex authorization logic + audit logging
**Estimated Time**: 3 hours

**Functions**:

- `MembershipValidator`: Enforce building access control
- `AuditLogger`: Track security events

---

### Priority 3: Advanced Features 🟢 NICE TO HAVE

**Trigger**: User requests

**Functions**:

- Push Notifications (FCM/APNs integration)
- Complex Read State Logic
- Background Jobs (cleanup old messages)
- Email Notifications

---

## 🔧 Setup Instructions (Gradle)

### Step 1: Initialize Project

```bash
cd backend
mkdir message-handler
cd message-handler

# Initialize Gradle with Java
gradle init \
  --type java-application \
  --dsl kotlin \
  --test-framework junit-jupiter \
  --project-name message-handler \
  --package com.neighborly
```

### Step 2: Configure build.gradle.kts

```kotlin
plugins {
    java
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

group = "com.neighborly"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // AWS Lambda
    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation("com.amazonaws:aws-lambda-java-events:3.11.4")

    // AWS SDK v2
    implementation(platform("software.amazon.awssdk:bom:2.21.0"))
    implementation("software.amazon.awssdk:s3")
    implementation("software.amazon.awssdk:dynamodb")
    implementation("software.amazon.awssdk:sns")

    // JSON
    implementation("com.google.code.gson:gson:2.10.1")

    // Logging
    implementation("org.slf4j:slf4j-api:2.0.9")
    implementation("org.slf4j:slf4j-simple:2.0.9")

    // Testing
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
}

tasks.test {
    useJUnitPlatform()
}

// Build fat JAR for Lambda
tasks.shadowJar {
    manifest {
        attributes["Main-Class"] = "com.neighborly.App"
    }
    archiveBaseName.set("message-handler")
    archiveClassifier.set("")
}
```

### Step 3: Project Structure

```
backend/message-handler/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
│   └── wrapper/
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/neighborly/
    │   │       ├── handlers/
    │   │       │   ├── MediaUploadHandler.java
    │   │       │   └── MembershipValidator.java
    │   │       ├── models/
    │   │       │   ├── UploadRequest.java
    │   │       │   └── UploadResponse.java
    │   │       └── utils/
    │   │           └── S3Helper.java
    │   └── resources/
    │       └── log4j2.xml
    └── test/
        └── java/
            └── com/neighborly/
                └── handlers/
                    └── MediaUploadHandlerTest.java
```

### Step 4: Build & Test

```bash
# Build
gradle build

# Run tests
gradle test

# Create deployment JAR
gradle shadowJar
# Output: build/libs/message-handler-1.0.0.jar
```

---

## 📦 CDK Integration

### infra/lib/messaging/lambda-constructs.ts

```typescript
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class MessageLambdas extends Construct {
  public readonly mediaUploadHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    // Media Upload Handler
    this.mediaUploadHandler = new lambda.Function(this, "MediaUploadHandler", {
      runtime: lambda.Runtime.JAVA_17,
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          "../../../backend/message-handler/build/libs/message-handler-1.0.0.jar"
        )
      ),
      handler: "com.neighborly.handlers.MediaUploadHandler::handleRequest",
      memorySize: 512,
      timeout: Duration.seconds(10),
      environment: {
        MEDIA_BUCKET: props.mediaBucket.bucketName,
        REGION: Stack.of(this).region,
      },
    });

    // Grant S3 permissions
    props.mediaBucket.grantPut(this.mediaUploadHandler);
  }
}
```

### Connect to AppSync

```typescript
// In AuthStack
const mediaUploadDataSource = api.addLambdaDataSource(
  "MediaUploadDataSource",
  lambdas.mediaUploadHandler
);

mediaUploadDataSource.createResolver("GenerateUploadUrlResolver", {
  typeName: "Mutation",
  fieldName: "generateUploadUrl",
});
```

---

## 🚀 Deployment Workflow

### Local Development

```bash
# 1. Make code changes
# 2. Build
cd backend/message-handler
gradle shadowJar

# 3. Deploy infra (includes Lambda)
cd ../../scripts
./deploy-auth.sh
```

### CI/CD (Future)

```yaml
# .github/workflows/deploy-backend.yml
- name: Build Lambda
  run: |
    cd backend/message-handler
    gradle shadowJar

- name: Deploy CloudFormation
  run: |
    cd infra
    npx cdk deploy AuthStack
```

---

## 📊 Cost Estimation (With Lambda)

| Service   | Free Tier         | Expected Usage | Cost         |
| --------- | ----------------- | -------------- | ------------ |
| Lambda    | 1M requests/month | ~10k/month     | $0           |
| Lambda    | 400k GB-seconds   | ~5k GB-sec     | $0           |
| S3        | 5 GB              | ~1 GB          | $0           |
| **Total** |                   |                | **$0/month** |

---

## 🔍 Testing Lambda Locally

### AWS SAM CLI

```bash
# Install SAM CLI
brew install aws-sam-cli

# Test locally
sam local invoke MediaUploadHandler \
  --event events/upload-request.json

# API Gateway simulation
sam local start-api
```

### JUnit Tests

```java
@Test
void testGenerateUploadUrl() {
    MediaUploadHandler handler = new MediaUploadHandler();

    UploadRequest request = UploadRequest.builder()
        .userId("test-user")
        .fileType("image/jpeg")
        .build();

    UploadResponse response = handler.handleRequest(request, mockContext);

    assertNotNull(response.getUploadUrl());
    assertTrue(response.getUploadUrl().contains("X-Amz-Signature"));
}
```

---

## 📝 Next Steps

1. ✅ Keep this TODO updated as requirements emerge
2. ⏸️ Wait for user to request image upload
3. 🚀 When needed, follow setup instructions above
4. 📦 Integrate with existing CDK infrastructure

**No action needed now - focus on chat PR!** 🎯
