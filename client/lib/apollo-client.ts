import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getCurrentSession } from '@/services/authService';

/**
 * Apollo Client configuration for AppSync
 *
 * Auth strategy:
 * - When user is signed in: uses Cognito JWT (Authorization header)
 *   so that Lambda resolvers can access the user's identity.
 * - When user is not signed in: falls back to API key auth
 *   for public/unauthenticated queries.
 *
 * TODO: Move to environment variables
 * - Create .env file: EXPO_PUBLIC_APPSYNC_URL, EXPO_PUBLIC_API_KEY
 * - Use: process.env.EXPO_PUBLIC_APPSYNC_URL
 */

// AppSync endpoint (from CDK output: ApiUrl)
const APPSYNC_URL =
  process.env.EXPO_PUBLIC_APPSYNC_URL ||
  'https://xvbaiijzl5dtfmsmmcf5m45wfi.appsync-api.us-east-1.amazonaws.com/graphql';

// API Key for unauthenticated access (from CDK output: ApiKey)
// WARNING: This will be visible in bundled code
const API_KEY =
  process.env.EXPO_PUBLIC_API_KEY ||
  'da2-e4csdmypfjgslokrfmwcvm6b4u';

// HTTP connection to AppSync API
const httpLink = createHttpLink({
  uri: APPSYNC_URL,
});

// Use Cognito JWT when authenticated, API key otherwise
const authLink = setContext(async (_, { headers }) => {
  const session = await getCurrentSession();

  if (session) {
    return {
      headers: {
        ...headers,
        Authorization: session.getIdToken().getJwtToken(),
      },
    };
  }

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
      fetchPolicy: 'cache-and-network',
    },
  },
});
