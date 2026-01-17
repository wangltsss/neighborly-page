import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';

/**
 * Props for Building Database construct
 */
export interface BuildingDatabaseConstructProps {
  config: NeighborlyConfig;
}

/**
 * Building Database Construct
 * 
 * Contains:
 * - Buildings table (building metadata and member lists)
 */
export class BuildingDatabaseConstruct extends Construct {
  public readonly buildingsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: BuildingDatabaseConstructProps) {
    super(scope, id);

    const { config } = props;

    // Buildings table - stores building metadata
    this.buildingsTable = new dynamodb.Table(this, 'BuildingsTable', {
      tableName: `${config.resourcePrefix}-buildings`,
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

    // Outputs
    new cdk.CfnOutput(this, 'BuildingsTableName', {
      value: this.buildingsTable.tableName,
      description: 'DynamoDB Buildings Table Name',
      exportName: `${config.resourcePrefix}-buildings-table`,
    });
  }
}
