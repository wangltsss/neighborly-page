import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ReactNode } from 'react';

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
    // Base styles
    const baseContainerStyle = "flex-row items-center gap-3 px-6 py-4 rounded-xl w-full sm:w-64 justify-start border";

    // Style configurations
    const variantStyles = {
        primary: {
            container: "bg-indigo-600 border-transparent active:bg-indigo-700",
            text: "text-white",
            icon: "text-white"
        },
        secondary: {
            container: "bg-slate-100 border-transparent active:bg-slate-200",
            text: "text-slate-700",
            icon: "text-slate-700"
        },
        danger: {
            container: "bg-white border-transparent active:bg-red-50",
            text: "text-red-500",
            icon: "text-red-500"
        },
        disabled: {
            container: "bg-slate-100 border-transparent opacity-50",
            text: "text-slate-400",
            icon: "text-slate-400"
        }
    };

    const currentVariant = disabled ? variantStyles.disabled : variantStyles[variant];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`${baseContainerStyle} ${currentVariant.container}`}
        >
            <View className={`w-6 items-center justify-center ${currentVariant.icon}`}>
                {icon}
            </View>
            <Text className={`font-semibold text-base ${currentVariant.text}`}>
                {label}
            </Text>
        </Pressable>
    );
};
