import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';

/**
 * Props for User Lambdas construct
 */
export interface UserLambdasConstructProps {
  usersTable: dynamodb.ITable;
}

/**
 * User Lambda Functions Construct
 *
 * Provides Lambda handlers for user profile operations:
 * - GetUserHandler: Fetch user profile by ID
 * - UpdateUserHandler: Update user profile (username)
 */
export class UserLambdasConstruct extends Construct {
  public readonly getUserHandler: lambda.Function;
  public readonly updateUserHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: UserLambdasConstructProps) {
    super(scope, id);

    const { usersTable } = props;

    // Path to the built JAR file
    const jarPath = path.join(
      __dirname,
      '../../../backend/user-handler/build/libs/user-handler.jar'
    );

    // GetUser Lambda Handler
    this.getUserHandler = new lambda.Function(this, 'GetUserHandler', {
      runtime: lambda.Runtime.JAVA_17,
      code: lambda.Code.fromAsset(jarPath),
      handler: 'com.neighborly.handlers.GetUserHandler::handleRequest',
      memorySize: 512,
      timeout: Duration.seconds(10),
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
      description: 'Handles getUser GraphQL query',
    });

    // UpdateUser Lambda Handler
    this.updateUserHandler = new lambda.Function(this, 'UpdateUserHandler', {
      runtime: lambda.Runtime.JAVA_17,
      code: lambda.Code.fromAsset(jarPath),
      handler: 'com.neighborly.handlers.UpdateUserHandler::handleRequest',
      memorySize: 512,
      timeout: Duration.seconds(10),
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
      description: 'Handles updateUser GraphQL mutation',
    });

    // Grant DynamoDB permissions
    usersTable.grantReadData(this.getUserHandler);
    usersTable.grantReadWriteData(this.updateUserHandler);
  }
}
