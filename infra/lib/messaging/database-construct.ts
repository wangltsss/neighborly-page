import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';

/**
 * Props for Messaging Database construct
 */
export interface MessagingDatabaseConstructProps {
  config: NeighborlyConfig;
}

/**
 * Messaging Database Construct
 * 
 * Contains:
 * - Messages table (chat messages)
 * - Channels table (discussion topics within buildings)
 */
export class MessagingDatabaseConstruct extends Construct {
  public readonly messagesTable: dynamodb.Table;
  public readonly channelsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: MessagingDatabaseConstructProps) {
    super(scope, id);

    const { config } = props;

    // Channels table - stores channels within each building
    this.channelsTable = new dynamodb.Table(this, 'ChannelsTable', {
      tableName: `${config.resourcePrefix}-channels`,
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
      tableName: `${config.resourcePrefix}-messages`,
      partitionKey: {
        name: 'channelId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sentTime',
        type: dynamodb.AttributeType.STRING,
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
        name: 'sentTime',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ChannelsTableName', {
      value: this.channelsTable.tableName,
      description: 'DynamoDB Channels Table Name',
      exportName: `${config.resourcePrefix}-channels-table`,
    });

    new cdk.CfnOutput(this, 'MessagesTableName', {
      value: this.messagesTable.tableName,
      description: 'DynamoDB Messages Table Name',
      exportName: `${config.resourcePrefix}-messages-table`,
    });
  }
}
