/**
 * Seed script for creating test data in Cognito and DynamoDB
 * 
 * Usage:
 *   npm run seed                    - Create complete test dataset
 *   npm run seed -- --clear         - Clear existing data first
 *   npm run seed -- --verbose       - Show detailed logs
 * 
 * Requirements:
 *   - AWS credentials configured
 *   - Stacks deployed (Auth, Building, Messaging)
 *   - .env file with AWS_REGION, RESOURCE_PREFIX, and USER_POOL_ID
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

//============================================================================
// CONFIGURATION
//============================================================================

dotenv.config({ path: path.join(__dirname, '.env') });

const CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  resourcePrefix: process.env.RESOURCE_PREFIX || 'neighborly',
  developerName: process.env.DEVELOPER_NAME,
  userPoolId: process.env.USER_POOL_ID || '',
  
  // Computed helpers
  get fullPrefix() {
    return this.developerName 
      ? `${this.developerName}-${this.resourcePrefix}` 
      : this.resourcePrefix;
  },
  
  get tables() {
    const p = this.fullPrefix;
    return {
      users: `${p}-users`,
      buildings: `${p}-buildings`,
      channels: `${p}-channels`,
      messages: `${p}-messages`,
    };
  }
};

// Command line args
const args = process.argv.slice(2);
const FLAGS = {
  clear: args.includes('--clear'),
  verbose: args.includes('--verbose'),
};

// AWS clients
const cognitoClient = new CognitoIdentityProviderClient({ region: CONFIG.region });
const dynamoClient = new DynamoDBClient({ region: CONFIG.region });

//============================================================================
// TEST DATA DEFINITIONS
//============================================================================

const TEST_DATA = {
  users: [
    {
      userId: 'a468c4e8-90b1-7002-d22e-bd1fae4cf1d6',
      email: 'alice@neighborly.app',
      username: 'alice',
    },
    {
      userId: '34088438-d031-702e-5120-02d8612c2284',
      email: 'bob@neighborly.app',
      username: 'bob',
    },
    {
      userId: '74c8e4e8-3091-7033-59db-88f6d9bc4f6d',
      email: 'charlie@neighborly.app',
      username: 'charlie',
    },
    // Test user for API Key mode development
    {
      userId: 'test-user-api-key',
      email: 'test@neighborly.app',
      username: 'test-user',
    },
  ],
  
  buildings: [
    {
      country: 'Canada',
      state: 'ON',
      city: 'Waterloo',
      address: '200 University Ave W, Waterloo, ON',
      name: 'Waterloo Central Tower',
    },
    {
      country: 'Canada',
      state: 'ON',
      city: 'Waterloo',
      address: '100 Regina St S, Waterloo, ON',
      name: 'Regina Plaza',
    },
    {
      country: 'Canada',
      state: 'ON',
      city: 'Waterloo',
      address: '75 King St S, Waterloo, ON',
      name: 'King Street Residences',
    },
    {
      country: 'Canada',
      state: 'ON',
      city: 'Toronto',
      address: '200 Queens Quay W, Toronto, ON',
      name: 'The Harbourfront Lofts',
    },
    {
      country: 'Canada',
      state: 'ON',
      city: 'Toronto',
      address: '80 East Liberty St, Toronto, ON',
      name: 'Liberty Village Condos',
    },
  ],
  
  channelTemplates: [
    { name: 'General', description: 'General building discussions' },
    { name: 'Maintenance', description: 'Maintenance requests and updates' },
    { name: 'Events', description: 'Community events and gatherings' },
  ],
  
  messageTemplates: [
    'Welcome to the building!',
    'Anyone interested in a community BBQ this weekend?',
    'The elevator on the west side will be under maintenance tomorrow.',
    'Thank you to everyone who attended the community meeting!',
    'Reminder: please keep the common areas clean.',
    'New bike storage area is now available in the basement.',
    'Does anyone have recommendations for a good plumber?',
    'The rooftop garden is looking great this season!',
    'Lost and found box is located in the lobby.',
    'Package delivery notice: Please check with concierge.',
  ],
  
  password: 'Password123!',
};

//============================================================================
// UTILITY FUNCTIONS
//============================================================================

function log(message: string) {
  if (FLAGS.verbose) {
    console.log(`[VERBOSE] ${message}`);
  }
}

function section(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
}

//============================================================================
// COGNITO OPERATIONS
//============================================================================

async function createCognitoUser(email: string): Promise<string> {
  const createResult = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: CONFIG.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
      MessageAction: 'SUPPRESS',
    })
  );

  const userId = createResult.User?.Attributes?.find(
    (attr: { Name?: string; Value?: string }) => attr.Name === 'sub'
  )?.Value;

  if (!userId) {
    throw new Error(`Failed to get userId for ${email}`);
  }

  // Set permanent password
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: CONFIG.userPoolId,
      Username: email,
      Password: TEST_DATA.password,
      Permanent: true,
    })
  );

  log(`Created Cognito user: ${email} (${userId.substring(0, 8)}...)`);
  return userId;
}

async function deleteCognitoUser(email: string): Promise<void> {
  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: CONFIG.userPoolId,
        Username: email,
      })
    );
    log(`Deleted Cognito user: ${email}`);
  } catch (error: any) {
    if (error.name !== 'UserNotFoundException') {
      console.warn(`Warning: Could not delete ${email}:`, error.message);
    }
  }
}

//============================================================================
// DYNAMODB OPERATIONS
//============================================================================

async function clearTable(tableName: string): Promise<void> {
  log(`Scanning ${tableName}...`);
  const scanResult = await dynamoClient.send(
    new ScanCommand({ TableName: tableName })
  );

  if (!scanResult.Items || scanResult.Items.length === 0) {
    log(`${tableName} is already empty`);
    return;
  }

  log(`Deleting ${scanResult.Items.length} items from ${tableName}...`);
  
  for (const item of scanResult.Items) {
    const unmarshalled = unmarshall(item);
    const key: any = {};
    
    // Determine keys based on table
    if (tableName.includes('users')) {
      key.userId = unmarshalled.userId;
    } else if (tableName.includes('buildings')) {
      key.buildingId = unmarshalled.buildingId;
    } else if (tableName.includes('channels')) {
      key.buildingId = unmarshalled.buildingId;
      key.channelId = unmarshalled.channelId;
    } else if (tableName.includes('messages')) {
      key.channelId = unmarshalled.channelId;
      key.sentTime = unmarshalled.sentTime;
    }
    
    await dynamoClient.send(
      new DeleteItemCommand({
        TableName: tableName,
        Key: marshall(key),
      })
    );
  }
  
  log(`Cleared ${tableName}`);
}

//============================================================================
// DATA CREATION FUNCTIONS
//============================================================================

interface UserData {
  userId: string;
  email: string;
  username: string;
}

async function createUsers(): Promise<UserData[]> {
  section('CREATING USERS');
  const users: UserData[] = [];

  for (const userData of TEST_DATA.users) {
    // Use custom userId if provided (for API key test user), otherwise create Cognito user
    const userId = userData.userId || await createCognitoUser(userData.email);

    await dynamoClient.send(
      new PutItemCommand({
        TableName: CONFIG.tables.users,
        Item: marshall({
          userId,
          email: userData.email,
          username: userData.username,
          joinedBuildings: [],
          createdTime: new Date().toISOString(),
        }),
      })
    );

    users.push({ userId, email: userData.email, username: userData.username });
    console.log(`Created user: ${userData.username} (${userData.email})`);
  }

  return users;
}

interface BuildingData {
  buildingId: string;
  country: string;
  state: string;
  city: string;
  address: string;
  name: string;
}

async function createBuildings(): Promise<BuildingData[]> {
  section('CREATING BUILDINGS');
  const buildings: BuildingData[] = [];

  for (const buildingData of TEST_DATA.buildings) {
    const buildingId = `building-${randomUUID()}`;

    await dynamoClient.send(
      new PutItemCommand({
        TableName: CONFIG.tables.buildings,
        Item: marshall({
          buildingId,
          country: buildingData.country,
          state: buildingData.state,
          city: buildingData.city,
          address: buildingData.address,
          name: buildingData.name,
          memberCount: 0,
          createdTime: new Date().toISOString(),
        }),
      })
    );

    buildings.push({ 
      buildingId, 
      country: buildingData.country,
      state: buildingData.state,
      city: buildingData.city,
      address: buildingData.address, 
      name: buildingData.name 
    });
    console.log(`Created building: ${buildingData.name}`);
  }

  return buildings;
}

interface ChannelData {
  channelId: string;
  buildingId: string;
  name: string;
}

async function createChannels(buildings: BuildingData[]): Promise<ChannelData[]> {
  section('CREATING CHANNELS');
  const channels: ChannelData[] = [];

  for (const building of buildings) {
    for (const channelTemplate of TEST_DATA.channelTemplates) {
      const channelId = `channel-${randomUUID()}`;

      await dynamoClient.send(
        new PutItemCommand({
          TableName: CONFIG.tables.channels,
          Item: marshall({
            buildingId: building.buildingId,
            channelId,
            name: channelTemplate.name,
            description: channelTemplate.description,
            createdTime: new Date().toISOString(),
          }),
        })
      );

      channels.push({ channelId, buildingId: building.buildingId, name: channelTemplate.name });
      console.log(`Created channel: ${channelTemplate.name} in ${building.name}`);
    }
  }

  return channels;
}

async function createMessages(channels: ChannelData[], users: UserData[]): Promise<void> {
  section('CREATING MESSAGES');
  let totalMessages = 0;

  for (const channel of channels) {
    // Create 3-5 messages per channel
    const messageCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < messageCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const content = TEST_DATA.messageTemplates[Math.floor(Math.random() * TEST_DATA.messageTemplates.length)];
      
      // Stagger message times
      const messageDate = new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000);

      await dynamoClient.send(
        new PutItemCommand({
          TableName: CONFIG.tables.messages,
          Item: marshall({
            messageId: `msg-${randomUUID()}`,
            channelId: channel.channelId,
            userId: user.userId,
            content,
            sentTime: messageDate.toISOString(),
          }),
        })
      );

      totalMessages++;
      log(`Created message in ${channel.name}: "${content.substring(0, 30)}..."`);
    }
  }

  console.log(`Created ${totalMessages} messages across ${channels.length} channels`);
}

async function updateUserBuildings(users: UserData[], buildings: BuildingData[]): Promise<void> {
  section('ASSOCIATING USERS WITH BUILDINGS');

  // Each user joins 1-2 buildings
  for (const user of users) {
    const buildingCount = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...buildings].sort(() => Math.random() - 0.5);
    const joinedBuildings = shuffled.slice(0, buildingCount).map(b => b.buildingId);

    await dynamoClient.send(
      new PutItemCommand({
        TableName: CONFIG.tables.users,
        Item: marshall({
          userId: user.userId,
          email: user.email,
          username: user.username,
          // JavaScript Set is automatically converted to DynamoDB StringSet by marshall
          joinedBuildings: new Set(joinedBuildings),
          createdTime: new Date().toISOString(),
        }),
      })
    );

    console.log(`${user.username} joined ${joinedBuildings.length} building(s)`);
  }
}

//============================================================================
// CLEANUP FUNCTIONS
//============================================================================

async function clearAllData(): Promise<void> {
  section('CLEARING EXISTING DATA');

  // Clear DynamoDB tables
  await clearTable(CONFIG.tables.messages);
  await clearTable(CONFIG.tables.channels);
  await clearTable(CONFIG.tables.buildings);
  await clearTable(CONFIG.tables.users);

  // Delete Cognito users
  for (const userData of TEST_DATA.users) {
    await deleteCognitoUser(userData.email);
  }

  console.log('All data cleared');
}

//============================================================================
// MAIN EXECUTION
//============================================================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('NEIGHBORLY TEST DATA SEED SCRIPT');
  console.log('='.repeat(60));
  console.log(`Region: ${CONFIG.region}`);
  console.log(`Resource Prefix: ${CONFIG.resourcePrefix}`);
  console.log(`User Pool ID: ${CONFIG.userPoolId}`);
  console.log(`Clear first: ${FLAGS.clear}`);
  console.log(`Verbose: ${FLAGS.verbose}`);

  if (!CONFIG.userPoolId) {
    throw new Error('USER_POOL_ID not found in .env file');
  }

  try {
    // Step 1: Clear if requested
    if (FLAGS.clear) {
      await clearAllData();
    }

    // Step 2: Create all data
    const users = await createUsers();
    const buildings = await createBuildings();
    const channels = await createChannels(buildings);
    await createMessages(channels, users);
    await updateUserBuildings(users, buildings);

    // Summary
    section('SUCCESS');
    console.log(`\nCreated test dataset:`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Buildings: ${buildings.length}`);
    console.log(`  Channels: ${channels.length}`);
    console.log(`  Messages: ~${channels.length * 4} (3-5 per channel)`);
    console.log(`\nTest user credentials:`);
    for (const userData of TEST_DATA.users) {
      console.log(`  ${userData.email}`);
      console.log(`    Password: ${TEST_DATA.password}`);
    }
    console.log(`\nFrontend testing:`);
    console.log(`  - Search: Try "Waterloo" to find buildings`);
    console.log(`  - Chat: Select any building to see channels and messages`);
    console.log(`  - Home: Users are associated with buildings`);

  } catch (error: any) {
    section('ERROR');
    console.error(error.message);
    if (FLAGS.verbose && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
