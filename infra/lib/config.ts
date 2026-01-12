import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Configuration interface for type safety
 */
export interface NeighborlyConfig {
  awsAccountId: string;
  awsRegion: string;
  resourcePrefix: string;
  developerName?: string;
}

/**
 * Validates that required environment variables are set
 */
function validateConfig(): void {
  const required = ['AWS_ACCOUNT_ID', 'AWS_REGION'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please copy .env.template to .env and fill in your values.'
    );
  }

  // Validate AWS Account ID format (should be 12 digits)
  const accountId = process.env.AWS_ACCOUNT_ID!;
  if (!/^\d{12}$/.test(accountId)) {
    throw new Error(
      `Invalid AWS_ACCOUNT_ID: ${accountId}\n` +
      'AWS Account ID should be a 12-digit number.'
    );
  }
}

// Validate on module load
validateConfig();

/**
 * Exported configuration object
 * Reads from environment variables with sensible defaults
 */
export const neighborlyConfig: NeighborlyConfig = {
  awsAccountId: process.env.AWS_ACCOUNT_ID!,
  awsRegion: process.env.AWS_REGION!,
  resourcePrefix: process.env.RESOURCE_PREFIX || 'neighborly',
  developerName: process.env.DEVELOPER_NAME,
};
