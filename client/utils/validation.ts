/**
 * Validation utilities for form inputs
 */

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Password requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * Cognito special characters:
 * ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + =
 * Space (non-leading, non-trailing) is also a special character
 */
export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Cognito special characters: ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + = and space
  const hasSpecialChar = /[\^$*.\[\]{}()?\-"!@#%&/\\,><':;|_~`+=\s]/.test(password);

  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

/**
 * Validate email format using standard regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get password requirement messages for display
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters',
    'At least 1 uppercase letter (A-Z)',
    'At least 1 lowercase letter (a-z)',
    'At least 1 number (0-9)',
    'At least 1 special character (e.g. !@#$%^&*)',
  ];
}
