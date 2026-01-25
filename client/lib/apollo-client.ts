import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * Apollo Client configuration for AppSync
 * 
 * SECURITY NOTE:
 * - API Keys are visible in client-side code (this is expected for AppSync)
 * - Backend controls access via GraphQL @aws_api_key directives
 * - For production: switch to Cognito User Pool authentication
 * 
 * TODO: Move to environment variables
 * - Create .env file: EXPO_PUBLIC_APPSYNC_URL, EXPO_PUBLIC_API_KEY
 * - Use: process.env.EXPO_PUBLIC_APPSYNC_URL
 */

// AppSync endpoint (from CDK output: ApiUrl)
const APPSYNC_URL = 
  process.env.EXPO_PUBLIC_APPSYNC_URL || 
  'https://xvbaiijzl5dtfmsmmcf5m45wfi.appsync-api.us-east-1.amazonaws.com/graphql';

// API Key for development testing (from CDK output: ApiKey)
// WARNING: This will be visible in bundled code
const API_KEY = 
  process.env.EXPO_PUBLIC_API_KEY || 
  'da2-e4csdmypfjgslokrfmwcvm6b4u';

// HTTP connection to AppSync API
const httpLink = createHttpLink({
  uri: APPSYNC_URL,
});

// Add API Key to every request header
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-api-key': API_KEY,
    },
  };
});

// Create and export Apollo Client instance
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Try cache first, then network
    },
  },
});
