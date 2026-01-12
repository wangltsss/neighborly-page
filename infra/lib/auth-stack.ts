import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { NeighborlyConfig } from './config';

/**
 * Props for AuthStack construction
 */
export interface AuthStackProps {
  authConfig: NeighborlyConfig;
}

/**
 * Authentication infrastructure using AWS Cognito
 * 
 * Responsibilities:
 * - User Pool: Store and manage user accounts (email/password)
 * - User Pool Client: Configuration for React Native app authentication
 * - Identity Pool: Map Cognito users to AWS IAM roles for resource access
 * 
 * Design decisions:
 * - Email-based login (no username)
 * - Self-service signup enabled
 * - Email verification required (prevents spam accounts)
 * - SRP authentication flow (passwords never transmitted in plaintext)
 */
export class AuthStack extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, authProps: AuthStackProps) {
    super(scope, id);

    // equals to const authConfig = props.authConfig;
    const { authConfig } = authProps;

    // Cognito User Pool - Manages user directory
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${authConfig.resourcePrefix}-user-pool`,
      
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
        requireSymbols: false,
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
      // NOTE: Production should use RETAIN to preserve user data
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // defines how the frontend app interacts with the user pool
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${authConfig.resourcePrefix}-client`,
      
      // Enable authentication flows
      authFlows: {
        userPassword: true,
        userSrp: true,      // Secure Remote Password (recommended)
      },

      // No client secret (not supported in mobile/web apps)
      generateSecret: false,

      // Disable OAuth for MVP (can add social login later)
      oAuth: undefined,

      // token for aws resources
      accessTokenValidity: cdk.Duration.hours(2),
      // token for user info
      idTokenValidity: cdk.Duration.hours(2),
      // token for refreshing access token
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // converts Cognito users to AWS IAM roles
    // allows authenticated access to AWS services (S3, AppSync, etc.)
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `${authConfig.resourcePrefix}-identity-pool`,
      
      allowUnauthenticatedIdentities: false,

      // Link to User Pool
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // outputs values for client application configuration
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${authConfig.resourcePrefix}-user-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${authConfig.resourcePrefix}-user-pool-client-id`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${authConfig.resourcePrefix}-identity-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
    });
  }
}
