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

// Stack name prefix based on configuration
// Dev: {DeveloperName}-{ResourcePrefix}-
// Prod: {ResourcePrefix}-
const stackPrefix = `${neighborlyConfig.fullResourcePrefix}-`;

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
  name: `${neighborlyConfig.fullResourcePrefix}-api`,
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
  bucketName: `${neighborlyConfig.fullResourcePrefix}-media-${neighborlyConfig.awsAccountId}`,
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

usersDataSource.createResolver('GetUsersByIdsResolver', {
  typeName: 'Query',
  fieldName: 'getUsersByIds',
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.getUsersByIds.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.getUsersByIds.res.vtl')
  ),
});

// Building resolvers
buildingsDataSource.createResolver('GetBuildingResolver', {
  typeName: 'Query',
  fieldName: 'getBuilding',
  requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('buildingId', 'buildingId'),
  responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
});

// Search buildings by location
buildingsDataSource.createResolver('SearchBuildingsResolver', {
  typeName: 'Query',
  fieldName: 'searchBuildings',
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.searchBuildings.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Query.searchBuildings.res.vtl')
  ),
});

// Join building mutation - pipeline with 2 functions
// Function 1: GetItem + check duplicates
const joinBuildingCheckFunction = new appsync.AppsyncFunction(authCdkStack, 'JoinBuildingCheckFunction', {
  name: 'joinBuildingCheckFunction',
  api,
  dataSource: usersDataSource,
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.joinBuilding.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.joinBuilding.res.vtl')
  ),
});

// Function 2: Execute UpdateItem
const joinBuildingUpdateFunction = new appsync.AppsyncFunction(authCdkStack, 'JoinBuildingUpdateFunction', {
  name: 'joinBuildingUpdateFunction',
  api,
  dataSource: usersDataSource,
  requestMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.joinBuilding.func2.req.vtl')
  ),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.joinBuilding.func2.res.vtl')
  ),
});

new appsync.Resolver(authCdkStack, 'JoinBuildingResolver', {
  api,
  typeName: 'Mutation',
  fieldName: 'joinBuilding',
  pipelineConfig: [joinBuildingCheckFunction, joinBuildingUpdateFunction],
  requestMappingTemplate: appsync.MappingTemplate.fromString('{}'),
  responseMappingTemplate: appsync.MappingTemplate.fromFile(
    path.join(__dirname, '../lib/graphql/resolvers/Mutation.joinBuilding.after.vtl')
  ),
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
  exportName: `${neighborlyConfig.fullResourcePrefix}-api-url`,
});

new cdk.CfnOutput(authCdkStack, 'ApiId', {
  value: api.apiId,
  description: 'AppSync API ID',
});

new cdk.CfnOutput(authCdkStack, 'ApiKey', {
  value: api.apiKey || 'N/A',
  description: 'AppSync API Key (for testing)',
  exportName: `${neighborlyConfig.fullResourcePrefix}-api-key`,
});

new cdk.CfnOutput(authCdkStack, 'MediaBucketName', {
  value: mediaBucket.bucketName,
  description: 'S3 Media Bucket Name',
  exportName: `${neighborlyConfig.fullResourcePrefix}-media-bucket`,
});

app.synth();
