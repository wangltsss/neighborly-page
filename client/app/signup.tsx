import { useState, useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontSize, AppColors, Shadow, Layout } from '@/constants/Theme';
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/authService';
import { validateEmail, validatePassword } from '@/utils/validation';

type SignupStep = 'register' | 'verify';

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [step, setStep] = useState<SignupStep>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    // Validate email
    if (!email) {
      errors.email = 'Email is required.';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        const missing: string[] = [];
        if (!passwordValidation.hasMinLength) missing.push('8+ characters');
        if (!passwordValidation.hasUppercase) missing.push('uppercase letter');
        if (!passwordValidation.hasLowercase) missing.push('lowercase letter');
        if (!passwordValidation.hasNumber) missing.push('number');
        if (!passwordValidation.hasSpecialChar) missing.push('special symbol');
        errors.password = `Password needs: ${missing.join(', ')}.`;
        isValid = false;
      }
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password);

      if (!isMountedRef.current) return;

      if (result.success) {
        setMessage('Verification code sent to your email.');
        setStep('verify');
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const result = await confirmSignUp(email, verificationCode);

      if (!isMountedRef.current) return;

      if (result.success) {
        setMessage('Email verified! Redirecting to login...');
        // Navigate to login after short delay
        setTimeout(() => {
          if (isMountedRef.current) {
            router.replace('/login');
          }
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('An unexpected error occurred. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const result = await resendConfirmationCode(email);

      if (!isMountedRef.current) return;

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Failed to resend code. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
        {/* Header */}
        <Text style={styles.title}>
          {step === 'register' ? 'Create Account' : 'Verify Email'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'register'
            ? 'Join your neighborhood community'
            : `Enter the code sent to ${email}`}
        </Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {message && (
          <View style={styles.messageContainer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {step === 'register' ? (
          <>
            {/* Email Input */}
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
              error={!!fieldErrors.email}
              errorMessage={fieldErrors.email}
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
              error={!!fieldErrors.password}
              errorMessage={fieldErrors.password}
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementsList}>
                <Text style={[styles.requirementText, passwordValidation.hasMinLength ? styles.requirementMet : styles.requirementUnmet]}>
                  {passwordValidation.hasMinLength ? '✓' : '○'} At least 8 characters
                </Text>
                <Text style={[styles.requirementText, passwordValidation.hasUppercase ? styles.requirementMet : styles.requirementUnmet]}>
                  {passwordValidation.hasUppercase ? '✓' : '○'} 1 uppercase letter (A-Z)
                </Text>
                <Text style={[styles.requirementText, passwordValidation.hasLowercase ? styles.requirementMet : styles.requirementUnmet]}>
                  {passwordValidation.hasLowercase ? '✓' : '○'} 1 lowercase letter (a-z)
                </Text>
                <Text style={[styles.requirementText, passwordValidation.hasNumber ? styles.requirementMet : styles.requirementUnmet]}>
                  {passwordValidation.hasNumber ? '✓' : '○'} 1 number (0-9)
                </Text>
                <Text style={[styles.requirementText, passwordValidation.hasSpecialChar ? styles.requirementMet : styles.requirementUnmet]}>
                  {passwordValidation.hasSpecialChar ? '✓' : '○'} 1 special character (!@#$%^&*)
                </Text>
              </View>
            </View>

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
              error={!!fieldErrors.confirmPassword}
              errorMessage={fieldErrors.confirmPassword}
            />

            {/* Sign Up Button */}
            <Button
              title={isLoading ? 'Creating Account...' : 'Sign Up'}
              onPress={handleSignUp}
              disabled={isLoading || !email || !password || !confirmPassword}
            />
          </>
        ) : (
          <>
            {/* Verification Code Input */}
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              editable={!isLoading}
            />

            {/* Verify Button */}
            <Button
              title={isLoading ? 'Verifying...' : 'Verify Email'}
              onPress={handleVerify}
              disabled={isLoading || !verificationCode}
            />

            {/* Resend Code Link */}
            <Pressable
              onPress={handleResendCode}
              disabled={isLoading}
              style={styles.resendButton}
            >
              <Text style={styles.link}>Resend verification code</Text>
            </Pressable>
          </>
        )}

        {/* Back to Login Link */}
        <View style={styles.footer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={handleBackToLogin} disabled={isLoading}>
            <Text style={styles.link}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: Layout.maxCardWidth,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.card,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: '#DC2626',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#DCFCE7',
    borderRadius: BorderRadius.md,
  },
  messageText: {
    color: '#16A34A',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  requirementsContainer: {
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
  },
  requirementsTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  requirementsList: {
    gap: Spacing.xs,
  },
  requirementText: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  requirementMet: {
    color: '#16A34A',
  },
  requirementUnmet: {
    color: '#6B7280',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.sm,
  },
  link: {
    fontSize: FontSize.sm,
    color: AppColors.primary,
    fontWeight: '600',
  },
});
