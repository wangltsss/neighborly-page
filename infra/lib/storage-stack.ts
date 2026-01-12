import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NeighborlyConfig } from './config';

export interface StorageStackProps {
  storageConfig: NeighborlyConfig;
}

export class StorageStack extends Construct {
  public readonly mediaBucket: s3.Bucket;

  constructor(scope: Construct, id: string, storageProps: StorageStackProps) {
    super(scope, id);

    const { storageConfig } = storageProps;

    this.mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `${storageConfig.resourcePrefix}-media-${storageConfig.awsAccountId}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteOldFiles',
          enabled: false,
          expiration: cdk.Duration.days(365),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucket.bucketName,
      description: 'S3 Media Bucket Name',
      exportName: `${storageConfig.resourcePrefix}-media-bucket`,
    });

    new cdk.CfnOutput(this, 'MediaBucketArn', {
      value: this.mediaBucket.bucketArn,
      description: 'S3 Media Bucket ARN',
    });
  }
}
