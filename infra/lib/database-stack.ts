import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { NeighborlyConfig } from './config';

/**
 * Props for DatabaseStack construction
 */
export interface DatabaseStackProps {
  dbConfig: NeighborlyConfig;
}

/**
 * Database infrastructure using DynamoDB
 * 
 * Responsibilities:
 * - Buildings table: Store building metadata (address, name, member count)
 * - Channels table: Store channel information per building
 * - Messages table: Store chat messages per channel
 * - Users table: Store user profiles and building memberships
 * 
 * Design decisions:
 * - On-demand billing for cost efficiency (pay per request)
 * - Point-in-time recovery disabled for MVP (can enable in production)
 * - Single-table design avoided for clarity (separate tables easier to understand)
 * - GSI/LSI for efficient querying patterns
 */
export class DatabaseStack extends Construct {
  public readonly buildingsTable: dynamodb.Table;
  public readonly channelsTable: dynamodb.Table;
  public readonly messagesTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, dbProps: DatabaseStackProps) {
    super(scope, id);

    const { dbConfig } = dbProps;

    // Buildings table - stores building metadata
    this.buildingsTable = new dynamodb.Table(this, 'BuildingsTable', {
      tableName: `${dbConfig.resourcePrefix}-buildings`,
      partitionKey: {
        name: 'buildingId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });

    // GSI for searching buildings by address
    this.buildingsTable.addGlobalSecondaryIndex({
      indexName: 'AddressIndex',
      partitionKey: {
        name: 'address',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Channels table - stores channels within each building
    this.channelsTable = new dynamodb.Table(this, 'ChannelsTable', {
      tableName: `${dbConfig.resourcePrefix}-channels`,
      partitionKey: {
        name: 'buildingId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'channelId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });

    // Messages table - stores messages within each channel
    this.messagesTable = new dynamodb.Table(this, 'MessagesTable', {
      tableName: `${dbConfig.resourcePrefix}-messages`,
      partitionKey: {
        name: 'channelId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });

    // GSI for querying messages by user
    this.messagesTable.addGlobalSecondaryIndex({
      indexName: 'UserMessagesIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Users table - stores user profiles
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `${dbConfig.resourcePrefix}-users`,
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

    // outputs table names
    new cdk.CfnOutput(this, 'BuildingsTableName', {
      value: this.buildingsTable.tableName,
      description: 'DynamoDB Buildings Table Name',
      exportName: `${dbConfig.resourcePrefix}-buildings-table`,
    });

    new cdk.CfnOutput(this, 'ChannelsTableName', {
      value: this.channelsTable.tableName,
      description: 'DynamoDB Channels Table Name',
      exportName: `${dbConfig.resourcePrefix}-channels-table`,
    });

    new cdk.CfnOutput(this, 'MessagesTableName', {
      value: this.messagesTable.tableName,
      description: 'DynamoDB Messages Table Name',
      exportName: `${dbConfig.resourcePrefix}-messages-table`,
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'DynamoDB Users Table Name',
      exportName: `${dbConfig.resourcePrefix}-users-table`,
    });
  }
}