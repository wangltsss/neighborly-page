#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { neighborlyConfig } from '../lib/config';
import { AuthStack } from '../lib/auth/auth-stack';
import { MessagingStack } from '../lib/messaging/messaging-stack';
import { BuildingStack } from '../lib/building/building-stack';

const app = new cdk.App();

const env = {
  account: neighborlyConfig.awsAccountId,
  region: neighborlyConfig.awsRegion,
};

// Stack name prefix based on developer name
const stackPrefix = neighborlyConfig.developerName 
  ? `${neighborlyConfig.developerName}-`
  : 'Neighborly-';

// ============================================
// AUTH STACK - Authentication + User Profiles
// ============================================
const authCdkStack = new cdk.Stack(app, `${stackPrefix}AuthStack`, {
  env,
  description: `${neighborlyConfig.developerName || 'Neighborly'} authentication and user profiles (Cognito + Users table)`,
});

const auth = new AuthStack(authCdkStack, 'Auth', {
  config: neighborlyConfig,
});

// ============================================
// MESSAGING STACK - Messages + Channels Tables
// ============================================
const messagingCdkStack = new cdk.Stack(app, `${stackPrefix}MessagingStack`, {
  env,
  description: `${neighborlyConfig.developerName || 'Neighborly'} messaging data (Messages + Channels tables)`,
});

const messaging = new MessagingStack(messagingCdkStack, 'Messaging', {
  config: neighborlyConfig,
});

// ============================================
// BUILDING STACK - Buildings Table
// ============================================
const buildingCdkStack = new cdk.Stack(app, `${stackPrefix}BuildingStack`, {
  env,
  description: `${neighborlyConfig.developerName || 'Neighborly'} building data (Buildings table)`,
});

const building = new BuildingStack(buildingCdkStack, 'Building', {
  config: neighborlyConfig,
});

// ============================================
// API & STORAGE - Created in AuthStack scope
// ============================================
// AppSync API (needs UserPool from AuthStack)
const api = new appsync.GraphqlApi(authCdkStack, 'Api', {
  name: `${neighborlyConfig.resourcePrefix}-api`,
  schema: appsync.SchemaFile.fromAsset(
    path.join(__dirname, '../lib/graphql', 'schema.graphql')
  ),
  authorizationConfig: {
    defaultAuthorization: {
      authorizationType: appsync.AuthorizationType.USER_POOL,
      userPoolConfig: {
        userPool: auth.userPool,
      },
    },
    // Additional auth mode for testing without login
    additionalAuthorizationModes: [
      {
        authorizationType: appsync.AuthorizationType.API_KEY,
        apiKeyConfig: {
          expires: cdk.Expiration.after(cdk.Duration.days(365)),
        },
      },
    ],
  },
  logConfig: {
    fieldLogLevel: appsync.FieldLogLevel.ERROR,
  },
  xrayEnabled: true,
});

// S3 Media Bucket (created in AuthStack for simplicity)
const mediaBucket = new s3.Bucket(authCdkStack, 'MediaBucket', {
  bucketName: `${neighborlyConfig.resourcePrefix}-media-${neighborlyConfig.awsAccountId}`,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  cors: [
    {
      allowedMethods: [
        s3.HttpMethods.GET,
        s3.HttpMethods.PUT,
        s3.HttpMethods.POST,
        s3.HttpMethods.DELETE,
      ],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      exposedHeaders: ['ETag'],
      maxAge: 3000,
    },
  ],
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

// ============================================
// DATA SOURCES (created after all stacks)
// ============================================
const usersDataSource = api.addDynamoDbDataSource(
  'UsersDataSource',
  auth.usersTable
);

const buildingsDataSource = api.addDynamoDbDataSource(
  'BuildingsDataSource',
  building.database.buildingsTable
);

const channelsDataSource = api.addDynamoDbDataSource(
  'ChannelsDataSource',
  messaging.database.channelsTable
);

const messagesDataSource = api.addDynamoDbDataSource(
  'MessagesDataSource',
  messaging.database.messagesTable
);

const userChannelStateDataSource = api.addDynamoDbDataSource(
  'UserChannelStateDataSource',
  messaging.userChannelState.table
);

// ============================================
// RESOLVERS - All created here
// ============================================

// Auth resolvers
usersDataSource.createResolver('GetUserResolver', {
  typeName: 'Query',
  fieldName: 'getUser',
  requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('userId', 'userId'),
  responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
});

// Building resolvers
buildingsDataSource.createResolver('GetBuildingResolver', {
  typeName: 'Query',
  fieldName: 'getBuilding',
  requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('buildingId', 'buildingId'),
  responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
});

channelsDataSource.createResolver('ListChannelsResolver', {
  typeName: 'Query',
  fieldName: 'listChannels',
  requestMappingTemplate: appsync.MappingTemplate.dynamoDbQuery(
    appsync.KeyCondition.eq('buildingId', 'buildingId')
  ),
  responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
});

// Messaging resolvers
messagesDataSource.createResolver('ListMessagesResolver', {
  typeName: 'Query',
  fieldName: 'listMessages',
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.listMessages.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.listMessages.res.vtl')
  ),
});

messagesDataSource.createResolver('CreateMessageResolver', {
  typeName: 'Mutation',
  fieldName: 'createMessage',
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.createMessage.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
});

// Read state resolver
userChannelStateDataSource.createResolver('UpdateLastReadResolver', {
  typeName: 'Mutation',
  fieldName: 'updateLastRead',
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.updateLastRead.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.updateLastRead.res.vtl')
  ),
});

// ============================================
// OUTPUTS
// ============================================
new cdk.CfnOutput(authCdkStack, 'ApiUrl', {
  value: api.graphqlUrl,
  description: 'AppSync GraphQL API URL',
  exportName: `${neighborlyConfig.resourcePrefix}-api-url`,
});

new cdk.CfnOutput(authCdkStack, 'ApiId', {
  value: api.apiId,
  description: 'AppSync API ID',
});

new cdk.CfnOutput(authCdkStack, 'ApiKey', {
  value: api.apiKey || 'N/A',
  description: 'AppSync API Key (for testing)',
  exportName: `${neighborlyConfig.resourcePrefix}-api-key`,
});

new cdk.CfnOutput(authCdkStack, 'MediaBucketName', {
  value: mediaBucket.bucketName,
  description: 'S3 Media Bucket Name',
  exportName: `${neighborlyConfig.resourcePrefix}-media-bucket`,
});

app.synth();
