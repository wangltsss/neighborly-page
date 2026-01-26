/**
 * Authentication Service
 *
 * Handles all Cognito authentication operations.
 * Uses amazon-cognito-identity-js (lightweight, no Amplify dependency).
 *
 * Security Note: All communication with Cognito uses HTTPS by default.
 * Passwords are transmitted securely over TLS and are never stored in plaintext.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { AwsConfig } from '@/constants/AwsConfig';

// Initialize User Pool
const userPool = new CognitoUserPool({
  UserPoolId: AwsConfig.userPoolId,
  ClientId: AwsConfig.userPoolClientId,
});

/**
 * Cognito error types for better type safety
 */
type CognitoErrorName =
  | 'UserNotFoundException'
  | 'NotAuthorizedException'
  | 'UserNotConfirmedException'
  | 'UsernameExistsException'
  | 'InvalidPasswordException'
  | 'CodeMismatchException'
  | 'ExpiredCodeException'
  | 'LimitExceededException'
  | 'InvalidParameterException'
  | 'TooManyRequestsException';

interface CognitoError extends Error {
  name: CognitoErrorName;
  code?: string;
}

/**
 * Result types for auth operations
 */
export interface AuthResult {
  success: boolean;
  message: string;
}

export interface SignInResult extends AuthResult {
  session?: CognitoUserSession;
  userId?: string;
}

export interface SignUpResult extends AuthResult {
  userConfirmed?: boolean;
  userSub?: string;
}

/**
 * Sign in with email and password
 */
export function signIn(email: string, password: string): Promise<SignInResult> {
  return new Promise((resolve) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          success: true,
          message: 'Sign in successful',
          session,
          userId: session.getIdToken().payload.sub,
        });
      },
      onFailure: (error: CognitoError) => {
        resolve({
          success: false,
          message: getErrorMessage(error),
        });
      },
      newPasswordRequired: () => {
        resolve({
          success: false,
          message: 'New password required. Please contact support.',
        });
      },
    });
  });
}

/**
 * Sign up a new user with email and password
 */
export function signUp(email: string, password: string): Promise<SignUpResult> {
  return new Promise((resolve) => {
    userPool.signUp(
      email,
      password,
      [], // User attributes (email is auto-included)
      [],
      (error, result) => {
        if (error) {
          resolve({
            success: false,
            message: getErrorMessage(error as CognitoError),
          });
          return;
        }

        resolve({
          success: true,
          message: 'Sign up successful. Please check your email for verification code.',
          userConfirmed: result?.userConfirmed,
          userSub: result?.userSub,
        });
      }
    );
  });
}

/**
 * Confirm sign up with verification code
 */
export function confirmSignUp(email: string, code: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (error) => {
      if (error) {
        resolve({
          success: false,
          message: getErrorMessage(error as CognitoError),
        });
        return;
      }

      resolve({
        success: true,
        message: 'Email confirmed successfully. You can now sign in.',
      });
    });
  });
}

/**
 * Resend verification code
 */
export function resendConfirmationCode(email: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((error) => {
      if (error) {
        resolve({
          success: false,
          message: getErrorMessage(error as CognitoError),
        });
        return;
      }

      resolve({
        success: true,
        message: 'Verification code sent. Please check your email.',
      });
    });
  });
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

/**
 * Get the current authenticated session (if any)
 */
export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession(
      (error: Error | null, session: CognitoUserSession | null) => {
        if (error || !session?.isValid()) {
          resolve(null);
          return;
        }

        resolve(session);
      }
    );
  });
}

/**
 * Get the current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.getIdToken().payload.sub ?? null;
}

/**
 * Convert Cognito errors to user-friendly messages
 */
function getErrorMessage(error: CognitoError): string {
  const errorMessages: Record<CognitoErrorName, string> = {
    UserNotFoundException: 'No account found with this email.',
    NotAuthorizedException: 'Incorrect email or password.',
    UserNotConfirmedException: 'Please verify your email before signing in.',
    UsernameExistsException: 'An account with this email already exists.',
    InvalidPasswordException:
      'Password must be at least 8 characters with uppercase, lowercase, numbers, and special symbols.',
    CodeMismatchException: 'Invalid verification code.',
    ExpiredCodeException: 'Verification code has expired. Please request a new one.',
    LimitExceededException: 'Too many attempts. Please try again later.',
    InvalidParameterException: 'Invalid input. Please check your information.',
    TooManyRequestsException: 'Too many requests. Please wait a moment and try again.',
  };

  const errorName = error.name as CognitoErrorName;
  return errorMessages[errorName] || error.message || 'An unexpected error occurred.';
}
