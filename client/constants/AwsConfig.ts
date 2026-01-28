/**
 * AWS Configuration for Neighborly Client
 *
 * Reads from environment variables set in .env file.
 * EXPO_PUBLIC_ prefix makes these available in the client bundle.
 *
 * IMPORTANT: Use direct static access (process.env.EXPO_PUBLIC_X) not dynamic
 * access (process.env[key]) - Metro bundler can only replace static references.
 *
 * Setup:
 * 1. Copy .env.template to .env
 * 2. Fill in values from AWS Console or CDK outputs
 * 3. Restart the dev server after changes
 */

export const AwsConfig = {
  userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID ?? '',
  userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID ?? '',
  region: process.env.EXPO_PUBLIC_AWS_REGION ?? '',
} as const;

/**
 * Validates that all required AWS config values are present.
 * Call this on app startup to catch missing config early.
 */
export function validateAwsConfig(): { isValid: boolean; missingKeys: string[] } {
  const requiredKeys = [
    'userPoolId',
    'userPoolClientId',
    'region',
  ] as const;

  const missingKeys = requiredKeys.filter((key) => !AwsConfig[key]);

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
