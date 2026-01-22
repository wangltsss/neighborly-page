import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ReactNode } from 'react';
import { actionButtonStyle } from '@/constants/NativeWindStyles';

// Define props interface for the ActionButton
export interface ActionButtonProps {
    label: string;
    icon: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    onPress: () => void;
}

// Helper component for the buttons
export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    icon,
    variant = 'primary',
    disabled = false,
    onPress
}) => {
    // Style configurations mapped from global styles
    const variantStyles = {
        primary: {
            container: actionButtonStyle.primaryContainer,
            text: actionButtonStyle.primaryText,
            icon: actionButtonStyle.primaryIcon
        },
        secondary: {
            container: actionButtonStyle.secondaryContainer,
            text: actionButtonStyle.secondaryText,
            icon: actionButtonStyle.secondaryIcon
        },
        danger: {
            container: actionButtonStyle.dangerContainer,
            text: actionButtonStyle.dangerText,
            icon: actionButtonStyle.dangerIcon
        },
        disabled: {
            container: actionButtonStyle.disabledContainer,
            text: actionButtonStyle.disabledText,
            icon: actionButtonStyle.disabledIcon
        }
    };

    const currentVariant = disabled ? variantStyles.disabled : variantStyles[variant];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`${actionButtonStyle.base} ${currentVariant.container}`}
        >
            <View className={`${actionButtonStyle.iconContainer} ${currentVariant.icon}`}>
                {icon}
            </View>
            <Text className={`${actionButtonStyle.labelText} ${currentVariant.text}`}>
                {label}
            </Text>
        </Pressable>
    );
};
