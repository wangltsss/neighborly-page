import { useState, useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontSize, AppColors, Shadow, Layout } from '@/constants/Theme';
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/authService';

type SignupStep = 'register' | 'verify';

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

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
      console.error('Verification error:', err);
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
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
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