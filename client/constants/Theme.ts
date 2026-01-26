/**
 * Centralized theme constants for consistent styling across the app.
 * Extract magic values here to make them reusable and maintainable.
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const AppColors = {
  primary: '#2f95dc',
  primaryPressed: '#1f75bc',
  border: '#DDD',
  inputBackground: '#FAFAFA',
  placeholder: '#999',
  white: '#FFFFFF',
  black: '#000000',
  darkCard: '#1A1A1A',
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const Layout = {
  maxCardWidth: 400,
  inputHeight: 48,
} as const;
