import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { neighborlyConfig } from './config';
import { AuthStack } from './auth-stack';
import { DatabaseStack } from './database-stack';
import { StorageStack } from './storage-stack';
import { ApiStack } from './api-stack';

export class NeighborlyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authStack = new AuthStack(this, 'Auth', {
      authConfig: neighborlyConfig,
    });

    const databaseStack = new DatabaseStack(this, 'Database', {
      dbConfig: neighborlyConfig,
    });

    const storageStack = new StorageStack(this, 'Storage', {
      storageConfig: neighborlyConfig,
    });

    const apiStack = new ApiStack(this, 'Api', {
      apiConfig: neighborlyConfig,
      userPool: authStack.userPool,
      buildingsTable: databaseStack.buildingsTable,
      channelsTable: databaseStack.channelsTable,
      messagesTable: databaseStack.messagesTable,
      usersTable: databaseStack.usersTable,
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS Region',
    });

    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'CloudFormation Stack Name',
    });
  }
}
