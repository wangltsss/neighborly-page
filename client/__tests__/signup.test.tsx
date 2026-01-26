import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../app/signup';
import * as authService from '../services/authService';

// Mock expo-router - provides navigation functionality for signup flow
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock authService - simulates Cognito signup/verification without actual network calls
jest.mock('../services/authService', () => ({
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  resendConfirmationCode: jest.fn(),
}));

// Helper function to fill signup form - reduces repetitive code across tests
const fillSignUpForm = (
  { getByPlaceholderText }: ReturnType<typeof render>,
  email: string,
  password: string,
  confirmPassword: string
) => {
  fireEvent.changeText(getByPlaceholderText('you@example.com'), email);
  fireEvent.changeText(getByPlaceholderText('Enter your password'), password);
  fireEvent.changeText(getByPlaceholderText('Re-enter your password'), confirmPassword);
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration Step', () => {
    it('renders correctly with all elements', () => {
      const { getByText, getByPlaceholderText } = render(<SignupScreen />);

      expect(getByText('Create Account')).toBeTruthy();
      expect(getByText('Join your neighborhood community')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
      expect(getByPlaceholderText('you@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByPlaceholderText('Re-enter your password')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('updates email input when typing', () => {
      const { getByPlaceholderText } = render(<SignupScreen />);
      const emailInput = getByPlaceholderText('you@example.com');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('updates password input when typing', () => {
      const { getByPlaceholderText } = render(<SignupScreen />);
      const passwordInput = getByPlaceholderText('Enter your password');

      fireEvent.changeText(passwordInput, 'Password123!');
      expect(passwordInput.props.value).toBe('Password123!');
    });

    it('updates confirm password input when typing', () => {
      const { getByPlaceholderText } = render(<SignupScreen />);
      const confirmInput = getByPlaceholderText('Re-enter your password');

      fireEvent.changeText(confirmInput, 'Password123!');
      expect(confirmInput.props.value).toBe('Password123!');
    });

    it('shows error when passwords do not match', async () => {
      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password456!');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(getByText('Passwords do not match.')).toBeTruthy();
      });
    });

    it('shows error when password does not meet requirements', async () => {
      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Pass1');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Pass1');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(getByText(/Password needs:/)).toBeTruthy();
      });
    });

    it('calls signUp on successful form submission', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockResolvedValue({ success: true });

      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123!');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('transitions to verification step on successful signup', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockResolvedValue({ success: true });

      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123!');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(getByText('Enter the code sent to test@example.com')).toBeTruthy();
        expect(getByPlaceholderText('Enter 6-digit code')).toBeTruthy();
      });
    });

    it('displays error message on failed signup', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockResolvedValue({
        success: false,
        message: 'An account with this email already exists.',
      });

      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'existing@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123!');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(getByText('An account with this email already exists.')).toBeTruthy();
      });
    });

    it('shows loading state while signing up', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123!');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(getByText('Creating Account...')).toBeTruthy();
      });
    });

    it('navigates to login when Sign In link is pressed', () => {
      const { getByText } = render(<SignupScreen />);

      fireEvent.press(getByText('Sign In'));

      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Verification Step', () => {
    const setupVerificationStep = async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockResolvedValue({ success: true });

      const renderResult = render(<SignupScreen />);

      fireEvent.changeText(
        renderResult.getByPlaceholderText('you@example.com'),
        'test@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'Password123!'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Re-enter your password'),
        'Password123!'
      );
      fireEvent.press(renderResult.getByText('Sign Up'));

      await waitFor(() => {
        renderResult.getByPlaceholderText('Enter 6-digit code');
      });

      return renderResult;
    };

    it('renders verification form correctly', async () => {
      const { getByText, getByPlaceholderText } = await setupVerificationStep();

      expect(getByText('Enter the code sent to test@example.com')).toBeTruthy();
      expect(getByText('Verification Code')).toBeTruthy();
      expect(getByPlaceholderText('Enter 6-digit code')).toBeTruthy();
      expect(getByText('Resend verification code')).toBeTruthy();
    });

    it('calls confirmSignUp with email and code', async () => {
      const mockConfirmSignUp = authService.confirmSignUp as jest.Mock;
      mockConfirmSignUp.mockResolvedValue({ success: true });

      const { getByPlaceholderText, getAllByText } = await setupVerificationStep();

      fireEvent.changeText(getByPlaceholderText('Enter 6-digit code'), '123456');
      // Get all "Verify Email" elements - [0] is title, [1] is button
      const verifyElements = getAllByText('Verify Email');
      fireEvent.press(verifyElements[1]);

      await waitFor(() => {
        expect(mockConfirmSignUp).toHaveBeenCalledWith('test@example.com', '123456');
      });
    });

    it('displays error on invalid verification code', async () => {
      const mockConfirmSignUp = authService.confirmSignUp as jest.Mock;
      mockConfirmSignUp.mockResolvedValue({
        success: false,
        message: 'Invalid verification code.',
      });

      const { getByPlaceholderText, getAllByText, getByText } = await setupVerificationStep();

      fireEvent.changeText(getByPlaceholderText('Enter 6-digit code'), '000000');
      // Get all "Verify Email" elements - [0] is title, [1] is button
      const verifyElements = getAllByText('Verify Email');
      fireEvent.press(verifyElements[1]);

      await waitFor(() => {
        expect(getByText('Invalid verification code.')).toBeTruthy();
      });
    });

    it('calls resendConfirmationCode when resend link is pressed', async () => {
      const mockResend = authService.resendConfirmationCode as jest.Mock;
      mockResend.mockResolvedValue({
        success: true,
        message: 'Verification code sent. Please check your email.',
      });

      const { getByText } = await setupVerificationStep();

      fireEvent.press(getByText('Resend verification code'));

      await waitFor(() => {
        expect(mockResend).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Edge Cases', () => {
    it('disables submit button when email is empty', () => {
      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      // Fill password fields but leave email empty
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123!');

      // Button should be disabled - pressing it should not trigger signUp
      fireEvent.press(getByText('Sign Up'));
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('disables submit button when password is empty', () => {
      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      // Password fields left empty

      // Button should be disabled - pressing it should not trigger signUp
      fireEvent.press(getByText('Sign Up'));
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('disables submit button when confirm password is empty', () => {
      const { getByPlaceholderText, getByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
      // Confirm password left empty

      // Button should be disabled - pressing it should not trigger signUp
      fireEvent.press(getByText('Sign Up'));
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('shows error when email format is invalid', async () => {
      const renderResult = render(<SignupScreen />);

      fillSignUpForm(renderResult, 'invalid-email', 'Password123!', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign Up'));

      await waitFor(() => {
        expect(renderResult.getByText('Please enter a valid email address.')).toBeTruthy();
      });
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('prevents multiple rapid submissions while loading', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      // Simulate slow network request
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
      );

      const renderResult = render(<SignupScreen />);
      fillSignUpForm(renderResult, 'test@example.com', 'Password123!', 'Password123!');

      // Press sign up multiple times rapidly
      fireEvent.press(renderResult.getByText('Sign Up'));
      fireEvent.press(renderResult.getByText('Creating Account...'));
      fireEvent.press(renderResult.getByText('Creating Account...'));

      await waitFor(() => {
        // Should only be called once despite multiple presses
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });

    it('handles network failure during signup', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockRejectedValue(new Error('Network error'));

      const renderResult = render(<SignupScreen />);
      fillSignUpForm(renderResult, 'test@example.com', 'Password123!', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign Up'));

      await waitFor(() => {
        expect(renderResult.getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
      });
    });

    it('handles network failure during verification', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      const mockConfirmSignUp = authService.confirmSignUp as jest.Mock;
      mockSignUp.mockResolvedValue({ success: true });
      mockConfirmSignUp.mockRejectedValue(new Error('Network error'));

      const renderResult = render(<SignupScreen />);
      fillSignUpForm(renderResult, 'test@example.com', 'Password123!', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign Up'));

      // Wait for verification step
      await waitFor(() => {
        renderResult.getByPlaceholderText('Enter 6-digit code');
      });

      fireEvent.changeText(renderResult.getByPlaceholderText('Enter 6-digit code'), '123456');
      const verifyElements = renderResult.getAllByText('Verify Email');
      fireEvent.press(verifyElements[1]);

      await waitFor(() => {
        expect(renderResult.getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
      });
    });

    it('redirects to login after successful verification', async () => {
      jest.useFakeTimers();
      const mockSignUp = authService.signUp as jest.Mock;
      const mockConfirmSignUp = authService.confirmSignUp as jest.Mock;
      mockSignUp.mockResolvedValue({ success: true });
      mockConfirmSignUp.mockResolvedValue({ success: true });

      const renderResult = render(<SignupScreen />);
      fillSignUpForm(renderResult, 'test@example.com', 'Password123!', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign Up'));

      // Wait for verification step
      await waitFor(() => {
        renderResult.getByPlaceholderText('Enter 6-digit code');
      });

      fireEvent.changeText(renderResult.getByPlaceholderText('Enter 6-digit code'), '123456');
      const verifyElements = renderResult.getAllByText('Verify Email');
      fireEvent.press(verifyElements[1]);

      await waitFor(() => {
        expect(renderResult.getByText('Email verified! Redirecting to login...')).toBeTruthy();
      });

      // Fast-forward timer for redirect
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      });

      jest.useRealTimers();
    });
  });
});
