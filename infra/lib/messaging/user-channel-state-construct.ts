import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';

/**
 * Props for UserChannelState construct
 */
export interface UserChannelStateConstructProps {
  config: NeighborlyConfig;
}

/**
 * UserChannelState Construct
 * 
 * Manages read state for users in channels.
 * Stores the last read timestamp for each user-channel pair.
 * 
 * Use case: Calculate unread message counts by comparing
 * lastReadTime with message sentTime.
 */
export class UserChannelStateConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: UserChannelStateConstructProps) {
    super(scope, id);

    const { config } = props;

    // UserChannelState table - tracks read state per user per channel
    this.table = new dynamodb.Table(this, 'UserChannelStateTable', {
      tableName: `${config.resourcePrefix}-user-channel-state`,
      
      // Composite primary key: userId_channelId
      // Example: "user-123_channel-456"
      partitionKey: {
        name: 'userChannelId',
        type: dynamodb.AttributeType.STRING,
      },
      
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });

    // GSI for querying all channels for a specific user
    // Commented out for Phase 1 - not needed for basic functionality
    // Uncomment if you need to query "all channels for a user"
    // this.table.addGlobalSecondaryIndex({
    //   indexName: 'UserIndex',
    //   partitionKey: {
    //     name: 'userId',
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: 'lastReadTime',
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    // Output
    new cdk.CfnOutput(this, 'UserChannelStateTableName', {
      value: this.table.tableName,
      description: 'DynamoDB UserChannelState Table Name',
      exportName: `${config.resourcePrefix}-user-channel-state-table`,
    });
  }
}
