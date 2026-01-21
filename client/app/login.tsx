import { useState, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontSize, AppColors, Shadow, Layout } from '@/constants/Theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount (example of lifecycle management)
  useEffect(() => {
    return () => {
      // Cleanup logic here (e.g., cancel pending network requests)
      setIsLoading(false);
    };
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement authentication logic with AWS Cognito
      console.log('Sign in with:', email, password);

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
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