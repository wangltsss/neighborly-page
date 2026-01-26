import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';

/**
 * Props for Auth Stack
 */
export interface AuthStackProps {
  config: NeighborlyConfig;
}

/**
 * Auth Stack - Authentication and User Profile Management
 * 
 * Contains:
 * - Cognito User Pool (authentication)
 * - User Pool Client (app configuration)
 * - Identity Pool (AWS resource access)
 * - Users DynamoDB table (user profiles)
 * - Post-Confirmation trigger (sync Cognito -> DynamoDB)
 */
export class AuthStack extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id);

    const { config } = props;

    // ============ AUTHENTICATION ============

    // Cognito User Pool - Manages user directory
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${config.resourcePrefix}-user-pool`,
      
      signInAliases: {
        email: true,
        username: false,
      },

      // Allow self-service registration
      selfSignUpEnabled: true,

      // Require email verification after signup
      autoVerify: {
        email: true,
      },

      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },

      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      // Standard attributes collected during signup
      standardAttributes: {
        email: {
          required: true,
          mutable: false, // Email cannot be changed after signup
        },
      },

      // Dev setting: destroy user pool on stack deletion
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Client - Defines how the frontend app interacts
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${config.resourcePrefix}-client`,
      
      // Enable authentication flows
      authFlows: {
        userPassword: true,
        userSrp: true,      // Secure Remote Password (recommended)
      },

      // No client secret (not supported in mobile/web apps)
      generateSecret: false,

      // OAuth disabled for MVP
      oAuth: undefined,

      // Token validity periods
      accessTokenValidity: cdk.Duration.hours(2),
      idTokenValidity: cdk.Duration.hours(2),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // Identity Pool - Converts Cognito users to AWS IAM roles
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `${config.resourcePrefix}-identity-pool`,
      
      allowUnauthenticatedIdentities: false,

      // Link to User Pool
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // ============ USER PROFILE ============

    // Users table - Stores user business data
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `${config.resourcePrefix}-users`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });

    // GSI for querying users by email
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Post-Confirmation trigger - Sync Cognito user to DynamoDB
    const postConfirmationLambda = new lambda.Function(this, 'PostConfirmation', {
      functionName: `${config.resourcePrefix}-post-confirmation`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
        const dynamodb = new DynamoDBClient();
        
        exports.handler = async (event) => {
          console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));
          
          const userId = event.request.userAttributes.sub;
          const email = event.request.userAttributes.email;
          
          try {
            await dynamodb.send(new PutItemCommand({
              TableName: process.env.USERS_TABLE,
              Item: {
                userId: { S: userId },
                email: { S: email },
                joinedBuildings: { L: [] },
                createdTime: { S: new Date().toISOString() }
              }
            }));
            
            console.log('User profile created:', userId);
          } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
          }
          
          return event;
        };
      `),
      environment: {
        USERS_TABLE: this.usersTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Grant Lambda permission to write to Users table
    this.usersTable.grantWriteData(postConfirmationLambda);

    // Attach trigger to User Pool
    this.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmationLambda
    );

    // ============ OUTPUTS ============

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${config.resourcePrefix}-user-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${config.resourcePrefix}-user-pool-client-id`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${config.resourcePrefix}-identity-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'DynamoDB Users Table Name',
      exportName: `${config.resourcePrefix}-users-table`,
    });
  }
}
