import { useState, useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontSize, AppColors, Shadow, Layout } from '@/constants/Theme';
import { signIn } from '@/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (result.success) {
        console.log('Sign in successful, userId:', result.userId);
        // TODO: Navigate to home screen after successful login
        // TODO: Store auth state in context/global state
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSignUp = () => {
    // TODO: Navigate to signup screen when implemented
    console.log('Navigate to sign up');
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
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          editable={!isLoading}
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