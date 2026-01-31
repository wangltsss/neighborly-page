import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

export interface NeighborlyConfig {
  awsAccountId: string;
  awsRegion: string;
  resourcePrefix: string;
  developerName?: string;
  fullResourcePrefix: string; // Computed: {DeveloperName}-{ResourcePrefix} or {ResourcePrefix}
}

function validateConfig(): void {
  // DEVELOPER_NAME is optional (Prod mode doesn't have it).
  const required = ['AWS_ACCOUNT_ID', 'AWS_REGION', 'RESOURCE_PREFIX'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please run ./scripts/setup-dev.sh or ./scripts/setup-prod.sh to configure your environment.'
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

validateConfig();

const resourcePrefix = process.env.RESOURCE_PREFIX!; // Validated above
const developerName = process.env.DEVELOPER_NAME;

const fullResourcePrefix = developerName
  ? `${developerName}-${resourcePrefix}`
  : resourcePrefix;

export const neighborlyConfig: NeighborlyConfig = {
  awsAccountId: process.env.AWS_ACCOUNT_ID!,
  awsRegion: process.env.AWS_REGION!,
  resourcePrefix: resourcePrefix,
  developerName: developerName,
  fullResourcePrefix: fullResourcePrefix,
};
