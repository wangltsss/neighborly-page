import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { NeighborlyConfig } from './config';
import * as path from 'path';

export interface ApiStackProps {
  apiConfig: NeighborlyConfig;
  userPool: cognito.UserPool;
  buildingsTable: dynamodb.Table;
  channelsTable: dynamodb.Table;
  messagesTable: dynamodb.Table;
  usersTable: dynamodb.Table;
}

export class ApiStack extends Construct {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, apiProps: ApiStackProps) {
    super(scope, id);

    const { apiConfig, userPool, buildingsTable, channelsTable, messagesTable, usersTable } = apiProps;

    this.api = new appsync.GraphqlApi(this, 'Api', {
      name: `${apiConfig.resourcePrefix}-api`,
      schema: appsync.SchemaFile.fromAsset(
        path.join(__dirname, 'graphql', 'schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
      },
      xrayEnabled: true,
    });

    const buildingsDataSource = this.api.addDynamoDbDataSource(
      'BuildingsDataSource',
      buildingsTable
    );

    const channelsDataSource = this.api.addDynamoDbDataSource(
      'ChannelsDataSource',
      channelsTable
    );

    const messagesDataSource = this.api.addDynamoDbDataSource(
      'MessagesDataSource',
      messagesTable
    );

    const usersDataSource = this.api.addDynamoDbDataSource(
      'UsersDataSource',
      usersTable
    );

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

    messagesDataSource.createResolver('ListMessagesResolver', {
      typeName: 'Query',
      fieldName: 'listMessages',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbQuery(
        appsync.KeyCondition.eq('channelId', 'channelId')
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    usersDataSource.createResolver('GetUserResolver', {
      typeName: 'Query',
      fieldName: 'getUser',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('userId', 'userId'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    messagesDataSource.createResolver('CreateMessageResolver', {
      typeName: 'Mutation',
      fieldName: 'createMessage',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "PutItem",
          "key": {
            "channelId": $util.dynamodb.toDynamoDBJson($ctx.args.channelId),
            "timestamp": $util.dynamodb.toDynamoDBJson($util.time.nowEpochMilliSeconds())
          },
          "attributeValues": {
            "messageId": $util.dynamodb.toDynamoDBJson($util.autoId()),
            "userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
            "content": $util.dynamodb.toDynamoDBJson($ctx.args.content),
            "mediaUrl": $util.dynamodb.toDynamoDBJson($ctx.args.mediaUrl)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.graphqlUrl,
      description: 'AppSync GraphQL API URL',
      exportName: `${apiConfig.resourcePrefix}-api-url`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.apiId,
      description: 'AppSync API ID',
    });
  }
}
