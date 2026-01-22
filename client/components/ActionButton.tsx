import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { actionButtonStyle } from '@/constants/NativeWindStyles';

// Define props interface for the ActionButton
export interface ActionButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    onPress: () => void;
}

// Helper component for the buttons
export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    variant = 'primary',
    disabled = false,
    onPress
}) => {
    // Style configurations mapped from global styles
    const variantStyles = {
        primary: {
            container: actionButtonStyle.primaryContainer,
            text: actionButtonStyle.primaryText
        },
        secondary: {
            container: actionButtonStyle.secondaryContainer,
            text: actionButtonStyle.secondaryText
        },
        danger: {
            container: actionButtonStyle.dangerContainer,
            text: actionButtonStyle.dangerText
        },
        disabled: {
            container: actionButtonStyle.disabledContainer,
            text: actionButtonStyle.disabledText
        }
    };

    const currentVariant = disabled ? variantStyles.disabled : variantStyles[variant];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`${actionButtonStyle.base} ${currentVariant.container}`}
        >
            <Text className={`${actionButtonStyle.labelText} ${currentVariant.text}`}>
                {label}
            </Text>
        </Pressable>
    );
};
