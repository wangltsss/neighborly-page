/**
 * Authentication Service
 *
 * Handles all Cognito authentication operations.
 * Uses amazon-cognito-identity-js (lightweight, no Amplify dependency).
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { AwsConfig } from '@/constants/AwsConfig';

// Initialize User Pool
const userPool = new CognitoUserPool({
  UserPoolId: AwsConfig.userPoolId,
  ClientId: AwsConfig.userPoolClientId,
});

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
      onFailure: (error) => {
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
      (error, result: ISignUpResult | undefined) => {
        if (error) {
          console.error('Cognito signUp error:', {
            name: error.name,
            message: error.message,
            code: (error as any).code,
            fullError: error,
          });
          resolve({
            success: false,
            message: getErrorMessage(error),
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

    cognitoUser.confirmRegistration(code, true, (error, result) => {
      if (error) {
        resolve({
          success: false,
          message: getErrorMessage(error),
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

    cognitoUser.resendConfirmationCode((error, result) => {
      if (error) {
        resolve({
          success: false,
          message: getErrorMessage(error),
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
function getErrorMessage(error: Error): string {
  const errorMessages: Record<string, string> = {
    UserNotFoundException: 'No account found with this email.',
    NotAuthorizedException: 'Incorrect email or password.',
    UserNotConfirmedException: 'Please verify your email before signing in.',
    UsernameExistsException: 'An account with this email already exists.',
    InvalidPasswordException:
      'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
    CodeMismatchException: 'Invalid verification code.',
    ExpiredCodeException: 'Verification code has expired. Please request a new one.',
    LimitExceededException: 'Too many attempts. Please try again later.',
  };

  const errorName = error.name || '';
  return errorMessages[errorName] || error.message || 'An unexpected error occurred.';
}
