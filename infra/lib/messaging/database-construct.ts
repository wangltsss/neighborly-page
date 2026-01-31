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
      tableName: `${config.fullResourcePrefix}-channels`,
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
      tableName: `${config.fullResourcePrefix}-messages`,
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
    // COMMENTED OUT: Conflicts with API_KEY authentication
    // API_KEY auth has no userId ($ctx.identity.sub is null)
    // This causes "Type mismatch for Index Key userId" error
    // Uncomment when switching to Cognito User Pool authentication
    // this.messagesTable.addGlobalSecondaryIndex({
    //   indexName: 'UserMessagesIndex',
    //   partitionKey: {
    //     name: 'userId',
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: 'sentTime',
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    // Outputs
    new cdk.CfnOutput(this, 'ChannelsTableName', {
      value: this.channelsTable.tableName,
      description: 'DynamoDB Channels Table Name',
      exportName: `${config.fullResourcePrefix}-channels-table`,
    });

    new cdk.CfnOutput(this, 'MessagesTableName', {
      value: this.messagesTable.tableName,
      description: 'DynamoDB Messages Table Name',
      exportName: `${config.fullResourcePrefix}-messages-table`,
    });
  }
}
