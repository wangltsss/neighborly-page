import { useState, useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontSize, AppColors, Shadow, Layout } from '@/constants/Theme';
import { signIn } from '@/services/authService';
import { validateEmail } from '@/utils/validation';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Track if component is mounted to prevent state updates after unmount
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
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSignIn = async () => {
    setError(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (result.success) {
        // TODO: Navigate to home screen after successful login
        // TODO: Store auth state in context/global state
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

  const handleSignUp = () => {
    router.push('/signup');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
        {/* Header */}
        <Text style={styles.title}>Neighborly</Text>
        <Text style={styles.subtitle}>Connect with your community</Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          autoComplete="password"
          editable={!isLoading}
          error={!!fieldErrors.password}
          errorMessage={fieldErrors.password}
        />

        {/* Sign In Button */}
        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleSignIn}
          disabled={isLoading || !email || !password}
        />

        {/* Sign Up Link */}
        <View style={styles.footer} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={handleSignUp} disabled={isLoading}>
            <Text style={styles.link}>Sign Up</Text>
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
