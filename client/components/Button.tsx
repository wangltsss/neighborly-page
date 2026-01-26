import { Pressable, StyleSheet, PressableProps } from 'react-native';
import { Text } from '@/components/Themed';
import { Spacing, BorderRadius, FontSize, AppColors } from '@/constants/Theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

/**
 * Reusable themed button component.
 * Supports primary and secondary variants with press feedback.
 */
export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.buttonPressed,
        style,
      ]}
      {...props}
    >
      <Text style={[
        styles.buttonText,
        variant === 'primary' ? styles.primaryText : styles.secondaryText,
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  primaryText: {
    color: AppColors.white,
  },
  secondaryText: {
    color: AppColors.primary,
  },
});