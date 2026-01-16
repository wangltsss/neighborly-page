import { Construct } from 'constructs';
import { NeighborlyConfig } from '../config';
import { BuildingDatabaseConstruct } from './database-construct';
import { BuildingLambdasConstruct } from './lambdas-construct';

/**
 * Props for Building Stack
 */
export interface BuildingStackProps {
  config: NeighborlyConfig;
}

/**
 * Building Stack - Building and Community Discovery Data
 * 
 * Contains:
 * - Buildings table
 * - Lambda functions for building management (placeholder)
 * 
 * Note: API resolvers are created in main entry point to avoid circular dependencies
 */
export class BuildingStack extends Construct {
  public readonly database: BuildingDatabaseConstruct;
  public readonly lambdas: BuildingLambdasConstruct;

  constructor(scope: Construct, id: string, props: BuildingStackProps) {
    super(scope, id);

    const { config } = props;

    // Database tables
    this.database = new BuildingDatabaseConstruct(this, 'Database', {
      config,
    });

    // Lambda functions (placeholder)
    this.lambdas = new BuildingLambdasConstruct(this, 'Lambdas', {});
  }
}
