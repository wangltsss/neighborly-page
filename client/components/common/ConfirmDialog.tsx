import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { X, LucideIcon } from 'lucide-react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  confirmText?: string;
  confirmColor?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

/**
 * Reusable confirmation dialog component
 * Can be customized with icons, colors, and custom content
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  icon: Icon,
  iconColor = '#4f46e5',
  iconBgColor = 'bg-indigo-100',
  confirmText = 'Confirm',
  confirmColor = 'bg-indigo-600 active:bg-indigo-700',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Pressable 
        className="flex-1 bg-black/50 items-center justify-center p-6"
        onPress={onCancel}
      >
        {/* Dialog Content */}
        <Pressable 
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                {Icon && (
                  <View className={`${iconBgColor} p-3 rounded-xl`}>
                    <Icon size={24} color={iconColor} />
                  </View>
                )}
                <Text className="text-xl font-semibold text-gray-900">
                  {title}
                </Text>
              </View>
              <Pressable 
                onPress={onCancel}
                className="p-2 rounded-lg active:bg-gray-100"
              >
                <X size={20} color="#6b7280" />
              </Pressable>
            </View>
          </View>

          {/* Body */}
          <View className="px-6 py-6">
            <Text className="text-base text-gray-700 mb-4">
              {message}
            </Text>

            {/* Custom content (optional) */}
            {children}
          </View>

          {/* Footer */}
          <View className="px-6 pb-6 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 active:bg-gray-50"
            >
              <Text className="text-center text-base font-medium text-gray-700">
                {cancelText}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl ${
                loading ? 'bg-gray-400' : confirmColor
              }`}
            >
              <Text className="text-center text-base font-semibold text-white">
                {loading ? 'Loading...' : confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
