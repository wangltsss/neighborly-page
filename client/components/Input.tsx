import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Spacing, BorderRadius, FontSize, AppColors, Layout } from '@/constants/Theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: boolean;
  errorMessage?: string;
}

/**
 * Reusable themed input component with label.
 * Supports all standard TextInput props.
 * Supports error state with red border and error message.
 */
export function Input({ label, style, error, errorMessage, ...props }: InputProps) {
  return (
    <View style={styles.container} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={AppColors.placeholder}
        {...props}
      />
      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    backgroundColor: AppColors.inputBackground,
    height: Layout.inputHeight,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
