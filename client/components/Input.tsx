import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Spacing, BorderRadius, FontSize, AppColors, Layout } from '@/constants/Theme';

interface InputProps extends TextInputProps {
  label: string;
}

/**
 * Reusable themed input component with label.
 * Supports all standard TextInput props.
 */
export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.container} lightColor={AppColors.white} darkColor={AppColors.darkCard}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={AppColors.placeholder}
        {...props}
      />
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
});
