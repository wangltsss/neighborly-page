import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';
import { MessagingDatabaseConstruct } from './database-construct';
import { MessagingLambdasConstruct } from './lambdas-construct';

/**
 * Props for Messaging Stack
 */
export interface MessagingStackProps {
  config: NeighborlyConfig;
}

/**
 * Messaging Stack - Chat and Communication Data
 * 
 * Contains:
 * - Messages and Channels tables
 * - Lambda functions for message handling (placeholder)
 * 
 * Note: API resolvers are created in main entry point to avoid circular dependencies
 */
export class MessagingStack extends Construct {
  public readonly database: MessagingDatabaseConstruct;
  public readonly lambdas: MessagingLambdasConstruct;

  constructor(scope: Construct, id: string, props: MessagingStackProps) {
    super(scope, id);

    const { config } = props;

    // Database tables
    this.database = new MessagingDatabaseConstruct(this, 'Database', {
      config,
    });

    // Lambda functions (placeholder)
    this.lambdas = new MessagingLambdasConstruct(this, 'Lambdas', {});
  }
}
