import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/login';
import * as authService from '../services/authService';

// Mock expo-router - provides navigation functionality
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock authService - simulates Cognito authentication without actual network calls
jest.mock('../services/authService', () => ({
  signIn: jest.fn(),
}));

// Mock Toast component - prevents actual toast rendering during tests
const mockShowToast = jest.fn();
jest.mock('../components/Toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Helper function to fill login form - reduces repetitive code
const fillLoginForm = (
  { getByPlaceholderText }: ReturnType<typeof render>,
  email: string,
  password: string
) => {
  fireEvent.changeText(getByPlaceholderText('you@example.com'), email);
  fireEvent.changeText(getByPlaceholderText('Enter your password'), password);
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('Neighborly')).toBeTruthy();
    expect(getByText('Connect with your community')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('updates email input when typing', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('you@example.com');

    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates password input when typing', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls signIn with email and password on form submission', async () => {
    const mockSignIn = authService.signIn as jest.Mock;
    mockSignIn.mockResolvedValue({ success: true, userId: 'user-123' });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message on failed sign in', async () => {
    const mockSignIn = authService.signIn as jest.Mock;
    mockSignIn.mockResolvedValue({
      success: false,
      message: 'Incorrect email or password.',
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Incorrect email or password.')).toBeTruthy();
    });
  });

  it('shows loading state while signing in', async () => {
    const mockSignIn = authService.signIn as jest.Mock;
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Signing In...')).toBeTruthy();
    });
  });

  it('handles unexpected errors gracefully', async () => {
    const mockSignIn = authService.signIn as jest.Mock;
    mockSignIn.mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('shows error when email is empty', async () => {
      const renderResult = render(<LoginScreen />);

      fillLoginForm(renderResult, '', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign In'));

      await waitFor(() => {
        expect(renderResult.getByText('Email is required.')).toBeTruthy();
      });
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('shows error when password is empty', async () => {
      const renderResult = render(<LoginScreen />);

      fillLoginForm(renderResult, 'test@example.com', '');
      fireEvent.press(renderResult.getByText('Sign In'));

      await waitFor(() => {
        expect(renderResult.getByText('Password is required.')).toBeTruthy();
      });
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('shows error when email format is invalid', async () => {
      const renderResult = render(<LoginScreen />);

      fillLoginForm(renderResult, 'invalid-email', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign In'));

      await waitFor(() => {
        expect(renderResult.getByText('Please enter a valid email address.')).toBeTruthy();
      });
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('prevents multiple rapid submissions while loading', async () => {
      const mockSignIn = authService.signIn as jest.Mock;
      // Simulate slow network request
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
      );

      const renderResult = render(<LoginScreen />);
      fillLoginForm(renderResult, 'test@example.com', 'Password123!');

      // Press sign in multiple times rapidly
      fireEvent.press(renderResult.getByText('Sign In'));
      fireEvent.press(renderResult.getByText('Signing In...'));
      fireEvent.press(renderResult.getByText('Signing In...'));

      await waitFor(() => {
        // Should only be called once despite multiple presses
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });

    it('shows toast and redirects on successful login', async () => {
      const mockSignIn = authService.signIn as jest.Mock;
      mockSignIn.mockResolvedValue({ success: true, userId: 'user-123' });

      const renderResult = render(<LoginScreen />);
      fillLoginForm(renderResult, 'test@example.com', 'Password123!');
      fireEvent.press(renderResult.getByText('Sign In'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Login successful! Redirecting...', 'success');
      });
    });

    it('navigates to signup when Sign Up link is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Sign Up'));
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });
});
